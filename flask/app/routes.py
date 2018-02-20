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
		redirect(url_for('login'))
	login = request.args.get('login')
	title = u'sss'
	return render_template('index.html', username=username, login=login, title=title)
	
@app.route('/login')
def login():
	return render_template('login.html')

@app.route('/get_data', methods=['GET'])
def get_data():
	s = str(request.args.get('login'))
	f = open('data.json', 'r')
	s = f.read().decode('utf8')
	f.close()
	# u = json.loads(s)

	return s

@app.route('/refresh_data', methods=['POST'])
def refresh_data():
	jsdata = request.form.get('str')
	f = open('data.json', 'w')
	f.write(jsdata.encode('utf8'))
	f.close()
	return 'success'

@app.route('/correct_login', methods=['POST','GET'])
def correct_login():
	login = str(request.args.get('login'))
	password = str(request.args.get('password'))
	f = open('database.json','r')
	s = f.read().decode('utf-8')
	u = json.loads(s)
	for i in u:
		if(i['login'] == login):
			if(i['password'] == password):
				q = i['name'].encode('utf-8')
				r = i['login'].encode('utf-8')
				return url_for('index', username=q, login=r)
		else:
			return 'error'
	return 'error'

@app.route('/registration')
def registration():
	return render_template('registration.html')

# @app.route('/correct_reg')
# def correct_reg():
# 	login = str(request.args.get('login'))
# 	password = str(request.args.get('password'))
# 	name = request.args.get('name').encode('utf-8')
# 	school = str(request.args.get('school'))
# 	classs = request.args.get('class').encode('utf-8')
# 	f = open('database.json','r')
# 	s = f.read().decode('utf-8')
# 	u = json.loads(s)
# 	for i in u:
# 		if(i['login'] == login):
# 			return 'error'

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
	for inv in u2:
		if(inv['invite'] == invite):
			for i in u:
				if(i['login'] == login):
					return 'error'
			u.append({"login":login, "password":password, "name":inv['name'], "role": inv['role'], "school": inv['school'], "class": inv['class']})	
			s = json.dumps(u)
			f = open('database.json','w')
			f.write(s)
			f.close()
			f = open(u'app\\static\\events\\' + login + u'.json','w')
			f.close()
			a = inv['name']
			append_to_class(inv['school'], inv['class'], login, inv['name'])
			u2.remove(inv)
			f = open('waiting_list.json', 'w')
			s = json.dumps(u2)
			f.write(s)
			f.close()
			return url_for('index',username=a,login=login)
	return 'error'
	

	
	
def append_to_class(school, classs, login, name):
	f = open('hierarchy.json','r')
	s = f.read().decode('utf-8')
	u = json.loads(s)
	for sch in u:
		if(sch['name'] == school):
			for cl in sch['classes']:
				if(cl['name'] == classs):
					cl['pupils'].append({"login": login, "name": name})
	f.close()

@app.route('/add_school_event', methods=['POST'])
def add_school_event():
	jsdata = request.form.get('str')
	t = json.loads(jsdata) #внутри название школы и собственно ивент
	f = open('hierarchy.json','r')
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s) 
	for sch in u:
		if(sch['name'] == t['school']):
			for cl in sch['classes']:
				for pup in cl['pupils']:
					q = open(u'app\\static\\events\\' + pup['login'] + u'.json','r')
					w = q.read().decode('utf-8')
					info = json.loads(w)
					q.close()
					q = open(u'app\\static\\events\\' + pup['login'] + u'.json','w')
					info['events'].append(t['event'])
					q.write(json.dumps(info))
					q.close()
					return 'success'
	
	return 'error'

@app.route('/add_class_event', methods=['POST'])
def add_class_event():
	jsdata = request.form.get('str')
	t = json.loads(jsdata) #внутри название школы, класса и собственно ивент
	f = open('hierarchy.json',r)
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s) 
	for sch in u:
		if(sch['name'] == t['school']):
			for cl in sch['classes']:
				if(cl['name'] == t['classs']):
					for pup in cl:
						q = open(u'app\\static\\events\\' + pup['login'] + u'.json','r')
						info = json.loads(q)
						q.close()
						q = open(u'app\\static\\events\\' + pup['login'] + u'.json','w')
						info['events'].append(u['event'])
						q.write(json.dumps(info))
						q.close()
						return 'success'
	
	return 'error'

@app.route('/journal')
def journal():
	return render_template('journal.html')

@app.route('/director')
def director():
	return render_template('director.html')

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
		data.append(i)
	f = open('waiting_list.json','w')
	f.write(json.dumps(data))
	f.close()
	return 'success'

@app.route('/cur_invites', methods=['GET'])
def cur_invites():
	jsdata = request.args.get('school')
	f = open("waiting_list.json", "r")
	s = f.read().decode('utf-8')
	f.close()
	u = json.loads(s)
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
	return 'success'

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
	u = json.loads(s)
	train = pd.DataFrame(u)
	df = pd.read_csv('example.csv')
	base = train[train['school']==school]
	base = base[base['class']==cl]
	for i in range(len(base)):
	    arr = []
	    arr.append(base.iloc[i]['name'])
	    for i in range(len(df.columns)-1):
	        arr.append('')
	    df.loc[len(df)] = arr
	path = u'app\\static\\school\\'+school+'\\'+cl+'\\'+subject+'.csv'
	df.to_csv(path, index_label=False,index=False,encoding='utf-8')

def get_json_journal(school,cl,subject):
	path = u'app\\static\\school\\'+school+'\\'+cl+'\\'+subject+'.csv'
	arr = pd.read_csv(path,encoding = "utf-8")
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
	path = u'app\\static\\school\\'+school+'\\'+cl+'\\'+sub+'.csv'
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
	cl = request.args.get('class')
	name = request.args.get('name').encode('utf-8')
	return grades(name, school, cl)

def grades(name, school, cl):
	path = u'app\\static\\school\\'+school+'\\'+cl+'\\'
	names = os.listdir(path)
	dfpup = pd.read_csv('example.csv')
	s = dfpup.columns
	dfpup.loc[len(dfpup)] = s
	for sub in names:
	    temp = pd.read_csv(path+sub)
	    row = temp[temp['pup'] == name]
	    print(temp)
	    s = sub[:len(sub)-4:]
	    row.iloc[0]['pup'] = s
	    dfpup = pd.concat([dfpup,row])
	dfpup = dfpup.to_dict('records')
	return json.dumps(dfpup)

@app.route('/dnevnik')
def dnevnik():
	return render_template('dnevnik.html')