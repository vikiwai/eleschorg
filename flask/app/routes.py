# -*- coding: utf-8 -*-
from app import app
from flask import render_template
from flask import request
from flask import redirect
from flask import url_for
import json
import pandas as pd
import os

app.debug = True

@app.route('/')
@app.route('/index')
def index():
	username = request.args.get('username')
	if(username == None):
		return redirect(url_for('login'))
	login = request.args.get('login')
	school = request.args.get('school')
	pupil = request.args.get('pupil')
	admin = request.args.get('admin')
	return render_template('index.html',username=username,login=login,school=school,pupil=pupil,admin=admin)
	
@app.route('/login')
def login():
	return render_template('login.html')

@app.route('/get_data', methods=['GET'])
def get_data():
	login = str(request.args.get('login'))
	school = str(request.args.get('school'))
	path =  u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	f = open(path, 'r')
	s = f.read().decode('utf8')
	f.close()
	# u = json.loads(s)

	return s

@app.route('/refresh_data', methods=['POST'])
def refresh_data():
	data = request.form.get('str') # школа логин и ивенты
	s = json.loads(data)
	login = s['login']
	school = s['school']
	events = s['events']
	if(is_director(login)):
		director_data(login,school,events)
		return 'success'
	if(is_teacher(login)):
		teacher_data(login,school,events)
		return 'success'
	path =  u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	f = open(path, 'w')
	f.write(events)
	f.close()
	return 'success'

def director_data(login, school, events):
	path =  u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	f = open(path,'r')
	s = f.read()
	f.close()
	u = json.loads(s)
	u = u['events']
	df = pd.DataFrame(u)
	dfschool = df
	even = events['events']
	df2 = pd.DataFrame(even)
	eschool = df2[df2['filtr']==u'Школа: '+school]
	if(len(df)!=0):
		dfschool = df[df['filtr']==u'Школа: '+school]
	if(len(dfschool)<len(eschool)):
		add_school_event(even[-1], school)
	t = 0
	for i in range(len(df2)):
		if(df2.iloc[i]['filtr'][:7:]==u'Класс: '):
			t+=1
	z = 0
	for i in range(len(df)):
		if(df.iloc[i]['filtr'][:7:]==u'Класс: '):
			z+=1
	if(z < t):
		add_class_event(school,eschool.iloc[len(dfschool)]['filtr'][7::],even[-1])
	
	path =  u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	f = open(path,'w')
	f.write(json.dumps(events))
	f.close()

def teacher_data(login, school,events):
	path =  u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	f = open(path,'r')
	s = f.read()
	f.close()
	u = json.loads(s)
	u = u['events']
	df = pd.DataFrame(u)
	even = events['events']
	df2 = pd.DataFrame(even)
	dfschool = df
	t = 0
	for i in range(len(df2)):
		if(df2.iloc[i]['filtr'][:7:]==u'Класс: '):
			t+=1
	z = 0
	for i in range(len(df)):
		if(df.iloc[i]['filtr'][:7:]==u'Класс: '):
			z+=1
	if(z < t):
		add_class_event(school,eschool.iloc[len(dfschool)]['filtr'][7::],even[-1])
	path =  u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	f = open(path,'w')
	f.write(json.dumps(events))
	f.close()

def is_teacher(login):
	f = open('database.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	train = pd.DataFrame(u)
	train = train[train.login == login]
	return len(train.role == u'Учитель')

def is_director(login):
	f = open('database.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	train = pd.DataFrame(u)
	train = train[train.login == login]
	return len(train.role == u'director')
@app.route('/correct_login', methods=['POST','GET'])
def correct_login():
	login = str(request.args.get('login'))
	password = str(request.args.get('password'))
	print(login)
	f = open('database.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	for i in u:
		if(i['login'] == login):
			if(i['password'] == password):
				q = i['name']
				r = i['login']
				s = i['school']
				if(i['role']==u'director'):
					director = '1'
					pupil = '0'
				elif(i['role']==u'Ученик'):
					director='0'
					pupil='1'
				else:
					director='0'
					pupil='0'

				return url_for('index', username=q, login=r, school=s,admin=director,pupil=pupil)
		
	return 'error'

@app.route('/registration')
def registration():
	return render_template('registration.html')

@app.route('/correct_reg')
def correct_reg():
	login = str(request.args.get('login'))
	password = str(request.args.get('password'))
	invite = str(request.args.get('invite'))

	f = open('database.json','r')
	s = f.read().decode('utf-8')
	f.close()
	f = open('waiting_list.json','r')
	s2 = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	u2 = json.loads(s2)
	# переписать с использованием pandas
	for inv in u2:
		if(inv['invite'] == invite):
			for i in u:
				if(i['login'] == login):
					return 'error'
			u.append({"login":login, "password":password, "name":inv['name'], "role": inv['role'], "school": inv['school'], "class": inv['class']})	
			if(inv['role']==u'director'):
				director = '1'
				pupil = '0'
			elif(inv['role']==u'Ученик'):
				director='0'
				pupil='1'
			else:
				director='0'
				pupil='0'
			s = json.dumps(u)
			f = open('database.json','w')
			f.write(s)
			f.close()
			setup_event_file(login, inv['school'], inv['class'])
			a = inv['name']
			b = inv['school']
			append_to_class(inv['school'], inv['class'], login, inv['name'])
			u2.remove(inv)
			f = open('waiting_list.json', 'w')
			s = json.dumps(u2)
			f.write(s)
			f.close()
			return url_for('index', username=a, login=login, school=b,admin=director,pupil=pupil)
	return 'error'
	
def setup_event_file(login, school, cl):
	path = u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	f = open(path,'w')
	example = open(u'eventexample.json','r')
	s = example.read().decode('utf-8')
	example.close()
	u = json.loads(s)
	fil = u['filtres']
	fschool = u'Школа: '+school
	fclass = u'Класс: '+cl
	fil.append(fschool)
	fil.append(fclass)
	eve = u['events']
	arr = get_school_events(school, cl)
	for ev in arr:
		eve.append(ev)
	f.write(json.dumps(u))
	f.close()
	
def get_school_events(school, cl):
	f = open('hierarchy.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	fschool = u'Школа: '+school
	fclass = u'Класс: '+cl
	for sc in u:
		if(sc['name'] == school):
			director = sc['director']
			f = open(u'app\\static\\school\\'+school+'\\events\\' + director + u'.json','r')
			s = f.read().decode('utf-8')
			print(s)
			f.close()
			eve = json.loads(s)
			eve = eve['events']
			print(eve)
			df = pd.DataFrame(eve,columns=['end','filtr','id','start','title'])
			df = pd.concat([df[df.filtr == fschool],df[df.filtr == fclass]])
			df = df.to_dict('records')
			print(df)
			return df
	return

def append_to_class(school, classs, login, name):
	f = open('hierarchy.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	for sch in u:
		if(sch['name'] == school):
			if(classs==''):
				sch['teachers'].append({'login':login,'name':name,'classes':[]})
				f = open('hierarchy.json','w')
				f.write(json.dumps(u))
				f.close()
				return

			for cl in sch['classes']:
				if(cl['name'] == classs):
					cl['pupils'].append({"login": login, "name": name})
					f = open('hierarchy.json','w')
					f.write(json.dumps(u))
					f.close()
					return

			sch['classes'].append({"name": classs, "pupils":[{"login": login, "name": name}]})
			f = open('hierarchy.json','w')
			f.write(json.dumps(u))	
			f.close()
			director = sch['director']
			path = u'app\\static\\school\\'+school+'\\events\\' + director + u'.json'
			f = open(path,'r')
			s = f.read().decode('utf-8')
			f.close()
			u = json.loads(s)
			u['filtres'].append(u'Класс: ' + classs)
			f = open(path,'w')
			f.write(json.dumps(u))
			f.close()
			return
	f.close()

def add_school_event(event, school):
	f = open('hierarchy.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s) 
	for sch in u:
		if(sch['name'] == school):
			for cl in sch['classes']:
				for pup in cl['pupils']:
					print(pup['login'])
					q = open(u'app\\static\\school\\' + school + u'\\events\\'+pup['login']+'.json','r')
					w = q.read().decode('utf-8')
					info = json.loads(w)
					q.close()
					q = open(u'app\\static\\school\\' + school + u'\\events\\'+pup['login']+'.json','w')
					info['events'].append(event)
					q.write(json.dumps(info))
					q.close()
	
	return 'error'

def add_class_event(school,cl,event):
	f = open('hierarchy.json',r)
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s) 
	for sch in u:
		if(sch['name'] == school):
			for cl in sch['classes']:
				if(cl['name'] == cl):
					for pup in cl:
						q = open(u'app\\static\\school\\' + school + u'\\events\\'+pup['login']+'.json','r')
						info = json.loads(q)
						q.close()
						q = open(u'app\\static\\school\\' + school + u'\\events\\'+pup['login']+'.json','w')
						info['events'].append(event)
						q.write(json.dumps(info))
						q.close()
						return
	
	return

@app.route('/journal')
def journal():
	username = request.args.get('username')
	if(username == None):
		return redirect(url_for('login'))
	login = request.args.get('login')
	school = request.args.get('school')
	pupil = request.args.get('pupil')
	admin = request.args.get('admin')
	if(pupil=='1'):
		return redirect(url_for('dnevnik',username=username,login=login,school=school,pupil=pupil,admin=admin))
	else:
		return render_template('journal.html',username=username,login=login,school=school,pupil=pupil,admin=admin)

@app.route('/director')
def director():
	username = request.args.get('username')
	if(username == None):
		return redirect(url_for('login'))
	login = request.args.get('login')
	school = request.args.get('school')
	return render_template('director.html',username=username,login=login,school=school,pupil=0,admin=1)

@app.route('/get_teachers', methods=['GET'])
def get_teachers():
	s = str(request.args.get('school'))
	f = open('hierarchy.json', 'r')
	r = f.read().decode('utf8')
	f.close()
	u = json.loads(r)
	arr = {}
	for i in u:
		if(i['name'] == s):
			arr = {"teachers": i['teachers'], "subjects": i['subjects'], "classes": i['classes']}
			return json.dumps(arr)
	return 'not found'

@app.route('/set_teacher', methods=['POST'])
def set_teacher():
	jsdata = request.form.get('str')
	t = json.loads(jsdata) # внутри название школы, учитель, предмет и класс
	f = open('hierarchy.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s) 
	for sch in u:
		if(sch['name'] == t['school']):
			for tea in sch['teachers']:
				if(tea['login'] == t['teacher']):
					tea['classes'].append({"name": t['class'], "subject": t['subject']})
					q = open('hierarchy.json','w')
					q.write(json.dumps(u))
					q.close()
					create_journal(t['school'],t['class'],t['subject'])
					return 'success'
	return 'success'

@app.route('/invite_save', methods=['POST'])
def invite_save():
	jsdata = request.form.get('str')
	u = json.loads(jsdata)
	f = open('waiting_list.json','r')
	s = f.read().decode('utf-8')
	f.close()
	data = json.loads(s)
	for i in u:
		if(i['role'] != u'Учитель'):
			setup_subject_file(i['school'], i['class'])
		data.append(i)
	f = open('waiting_list.json','w')
	f.write(json.dumps(data))
	f.close()
	return 'success'

def setup_subject_file(school, cl):
	path = u'app\\static\\school\\'+school+'\\class\\'
	data = os.listdir(path)
	for c in data:
		if(c == cl):
			return
	os.mkdir(path+cl)

@app.route('/cur_invites', methods=['GET'])
def cur_invites():
	jsdata = request.args.get('school')
	f = open("waiting_list.json", "r")
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	arr = []
	if(len(u) == 0):
		return json.dumps(arr)
	train = pd.DataFrame(u)
	arr = train[train['school'] == jsdata]
	arr = arr.to_dict('records')
	return json.dumps(arr)

@app.route('/del_invites', methods=['POST'])
def del_invites():
	jsdata = request.form.get('invite')
	f = open("waiting_list.json", "r")
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	train = pd.DataFrame(u)
	arr = train[train['invite'] != jsdata]
	arr = arr.to_dict('records')
	s = json.dumps(arr)
	f = open("waiting_list.json", "w")
	f.write(s)
	f.close()
	return jsdata

@app.route('/get_users', methods=['GET'])
def get_users():
	jsdata = request.args.get('school')
	f = open("database.json", "r")
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	train = pd.DataFrame(u)
	arr = train[train['school'] == jsdata]
	del arr['password']
	arr = arr.to_dict('records')
	return json.dumps(arr)

@app.route('/del_user', methods=['POST'])
def del_user():
	jsdata = request.form.get('str')
	data = json.loads(jsdata)
	del_from_hierarchy(data['school'], data['class'], data['login'])
	del_from_database(data['login'])
	del_user_files(data['school'], data['login'])
	return 'success'

def del_user_files(school, login):
	path = u'app\\static\\school\\'+school+'\\events\\' + login + u'.json'
	os.remove(path)
def del_from_hierarchy(school, cl, login):
	f = open("hierarchy.json", "r")
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	for sc in u:
		if(sc['name'] == school):
			if(cl == ''):
				for tea in sc['teachers']:
					if(tea['login'] == login):
						sc['teachers'].remove(tea)
						f = open("hierarchy.json", "w")
						f.write(json.dumps(u))
						f.close()
						return
			else:
				for cla in sc['classes']:
					if(cla['name'] == cl):
						for pup in cla['pupils']:
							if(pup['login'] == login):
								sc['pupils'].remove(pup)
								f = open("hierarchy.json", "w")
								f.write(json.dumps(u))
								f.close()
								return

def del_from_database(login):
	f = open("database.json", "r")
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
	train = pd.DataFrame(u)
	arr = train[train['login'] != login]
	arr = arr.to_dict('records')
	s = json.dumps(arr)
	f = open("database.json", "w")
	f.write(s)
	f.close()
	return 

def create_journal(school, cl, subject):
	f = open('database.json','r')
	s = f.read()
	f.close()
	u = json.loads(s)

	train = pd.DataFrame(u)
	df = pd.read_csv('example.csv')
	s = df.columns
	df.loc[0] = s
	base = train[train['school']==school]
	base = base[base['class']==cl]
	for i in range(len(base)):
	    arr = []
	    arr.append(base.iloc[i]['name'])
	    for i in range(len(df.columns)-1):
	        arr.append(' ')
	    df.loc[len(df)] = arr
	print(df)
	path = u'app\\static\\school\\'+school+'\\class\\'+cl+'\\'+subject+'.csv'
	df.to_csv(path, index_label=False,index=False,encoding='utf-8')

def get_json_journal(school,cl,subject):
	path = u'app\\static\\school\\'+school+'\\class\\'+cl+'\\'+subject+'.csv'
	arr = pd.read_csv(path, encoding = "utf-8")
	arr = arr.to_dict('records')
	return json.dumps(arr)

@app.route('/get_marks', methods=['GET'])
def get_marks():
	school = request.args.get('school')
	cl = request.args.get('class')
	sub = request.args.get('subject')
	return get_json_journal(school,cl,sub)

@app.route('/save_mark', methods=['POST'])
def save_mark():
	jsdata = request.form.get('str')
	data = json.loads(jsdata)
	pos = int(data['position'])
	date = data['date']
	msg = data['msg']
	school = data['school']
	cl = data['cl']
	sub = data['sub']
	path = u'app\\static\\school\\'+school+'\\class\\'+cl+'\\'+sub+'.csv'
	df = pd.read_csv(path,encoding = "utf-8")
	df.iloc[pos][date] = msg
	df.to_csv(path, index_label=False,index=False,encoding='utf-8')
	return 'success'

@app.route('/get_classes', methods=['GET'])
def get_classes():
	school = request.args.get('school')
	tea = request.args.get('teacher')
	f = open('hierarchy.json','r')
	s = f.read()
	u = json.loads(s)
	for sc in u:
		if(sc['name'] == school):
			for t in sc['teachers']:
				if t['login'] == tea:
					tr = json.dumps(t['classes'])
					f.close()
					return tr
	return 'error'

@app.route('/get_grades', methods=['GET'])
def get_grades():
	school = request.args.get('school')
	login = request.args.get('login')
	name = request.args.get('name').encode('utf-8')
	f = open('database.json','r')
	s = f.read()
	f.close()
	u = json.loads(s)
	train = pd.DataFrame(u)
	train = train[train['login']==login]
	cl = train.iloc[0]['class']
	return grades(name, school, cl)

def grades(name, school, cl):
	path = u'app\\static\\school\\'+school+'\\class\\'+cl+'\\'
	names = os.listdir(path)
	dfpup = pd.read_csv('example.csv')
	s = dfpup.columns
	dfpup.loc[len(dfpup)] = s
	for sub in names:
	    temp = pd.read_csv(path+sub)
	    row = temp[temp['pup'] == name]
	    s = sub[:len(sub)-4:]
	    row.iloc[0]['pup'] = s
	    dfpup = pd.concat([dfpup,row])
	dfpup = dfpup.to_dict('records')
	return json.dumps(dfpup)

@app.route('/dnevnik')
def dnevnik():
	username = request.args.get('username')
	if(username == None):
		return redirect(url_for('login'))
	login = request.args.get('login')
	school = request.args.get('school')
	pupil = request.args.get('pupil')
	admin = request.args.get('admin')
	return render_template('dnevnik.html',username=username,login=login,school=school,pupil=pupil,admin=admin)