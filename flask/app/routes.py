# -*- coding: utf-8 -*-
from app import app
from flask import render_template
from flask import request
from flask import redirect
from flask import url_for
import json

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

@app.route('/correct_reg')
def correct_reg():
	login = str(request.args.get('login'))
	password = str(request.args.get('password'))
	name = request.args.get('name').encode('utf-8')
	school = str(request.args.get('school'))
	classs = request.args.get('class').encode('utf-8')
	f = open('database.json','r')
	s = f.read().decode('utf-8')
	u = json.loads(s)
	for i in u:
		if(i['login'] == login):
			return 'error'

	u.append({"login":login,"password":password,"name":name, "role": "pupil","school":school,"class":classs})
	s = json.dumps(u)
	f.close()
	f = open('database.json','w')
	f.write(s)
	f.close()
	f = open(u'app\\static\\events\\' + login + u'.json','w')
	f.close()
	append_to_class(school, classs, login, name)
	return url_for('index',username=name,login=login)

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