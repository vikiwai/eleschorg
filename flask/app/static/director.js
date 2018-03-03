$(document).ready(function() {
	var school = $('#school_info').text();
	var login = $('#login_info').text();
	var admin = $("#admin").text();
	var pupil = $("#pupil").text();
	if(admin=='1')
		$("#admin_panel").css('display','inline');
	if(admin=='0')
		$('#pupil_page').css('display','inline');
	var name = $('#name_info').text();
	var teachers;
	var invites;
	var users;
	getInvites();
	getUsers();
	$('#manage_teachers').click(function(){
		hideAll();
		getData();
		outputInfo();
		$el = $('#teachers');
		$el.css("display","block");
	});
	$('#cal_panel').click(function(){
		data = '/?username='+name+'&login='+login+'&admin='+admin+'&pupil='+pupil+'&school='+school;
		window.location.href = "http://localhost:5000"+data;
	});
	$('#admin_panel').click(function(){
		data = '/director?username='+name+'&login='+login+'&admin='+admin+'&pupil='+pupil+'&school='+school;
		window.location.href = "http://localhost:5000"+data;
	});
	$('#pupil_page').click(function(){
		data = '/journal?username='+name+'&login='+login+'&admin='+admin+'&pupil='+pupil+'&school='+school;
		window.location.href = "http://localhost:5000"+data;
	});
	$('#add_field').click(function(){
		addField();
		
	});
	$('#save_fields').click(function(){
		saveFields();
	});
	
	$('#manage_rel').click(function(){
		hideAll();
		displayUsers();
		$el = $('#manage');
		$el.css("display","block");
	});
	$('#add_per_rel').click(function(){
		hideAll();
		displayInvites();
		$el = $('#add_person');
		$el.css("display","block");
	});
	$("#cur_users").on('click', '.del_user', function(){
		$par = '#' + this.id;
		text = $($par).find('.class').html();
		inv = {'school': school, 'class': text, 'login': this.id};
		str = JSON.stringify(inv);
		console.log(inv)
		$.ajax({type: "POST", url:"/del_user", data:{'str': str}, async: true, success: function( data ){ console.log(data); }});
		for(var i = 0; i < users.length; ++i)
			if(users[i].login == inv){
				users.splice(i, 1);
				break;
			}
		$($par).remove();
	});
	$("#cur_invites").on("click", ".del_but", function(){
		$par = '#tr' + this.id;
		inv = $($par).find('.inv_inv').html();
		$.ajax({type: "POST", url:"/del_invites", data:{'invite': inv}, async: true, success: function( data ){ console.log(data); }});
		for(var i = 0; i < invites.length; ++i)
			if(invites[i].invite == inv){
				invites.splice(i, 1);
				break;
			}
		$($par).remove();
	});

	function getUsers() {
		$.ajax({type: "GET", url:"/get_users", data:{'school': school}, async:false, success: function( data ){ console.log(data); users = JSON.parse(data); }})
	}
	function getInvites() {
		$.ajax({type: "GET", url:"/cur_invites", data:{'school': school}, async:false, success: function( data ){ console.log(data); invites = JSON.parse(data); }});
	}

	function displayInvites() {
		$area = $("#cur_invites");
		var html = "";
		$area.html("");
		
		html += '<tr><td>Имя</td><td>Класс</td><td>Роль</td><td>Пригласительный</td></tr>';
		for(var i = 0; i < invites.length; ++i){
			but = '<td><button class="del_but" id="'+invites[i].invite+'">X</button></td>'
			html += '<tr id="tr'+invites[i].invite+'"><td class="inv_name">'+invites[i].name+'</td><td>'+invites[i].class+'</td><td>'+invites[i].role+'</td><td class="inv_inv">'+invites[i].invite+'</td>' + but + '</tr>';
		}
		$(html).appendTo($area);
	}
	function displayUsers() {
		$area = $("#cur_users");
		var html = "";
		$area.html("");
		
		html += '<tr><td>Имя</td><td>Класс</td><td>Роль</td></tr>';
		for(var i = 0; i < users.length; ++i){
			but = '<td><button class="del_user" id="'+users[i].login+'">X</button></td>'
			html += '<tr id="'+users[i].login+'"><td class="inv_name">'+users[i].name+'</td><td class="class">'+users[i].class+'</td><td>'+users[i].role+'</td>' + but + '</tr>';
		}
		$(html).appendTo($area);
	}

	function hideAll() {
		$arr = $('.hid_bl');
		$arr.each(function(i,elem){
			$(elem).css("display","none");
		});
	}

	function getData() {
		$.ajax({type: "GET", url:"/get_teachers", data:{'school': school}, async:false, success: function( data ){ teachers = JSON.parse(data);  }});
	}
	function outputInfo() {
		$tea = $('#teachers');
		teaArr = teachers.teachers;
		var html = "";
		$tea.html("");
		for(var i = 0; i < teaArr.length; ++i){
			html += '<p class="teacher" id ="'+teaArr[i].login+'">' + teaArr[i].name + ':</p>';
			for(var z = 0; z < teaArr[i].classes.length; ++z)
				html += '<p style="margin-left: 20px;">' + teaArr[i].classes[z].name + ': ' + teaArr[i].classes[z].subject + '</p>';
		}		$(html).appendTo($tea);
		$('.teacher').click(function(){
			addClass(this.id);
		});
	}
	function saveFields() {
		$fields = $('.dirik');
		var arr = [];
		console.log($fields.length);
		$fields.each(function(i,elem){
			name = $(elem).find("input[name='name']").val();
			cl = $(elem).find("input[name='cl']").val();
			role = $(elem).find("select[name='role']").val();
			invite = Math.random().toString(36).substring(2, 12);
			arr.push({"school": school, "name": name, "class": cl, "role": role, "invite": invite});
			invites.push({"school": school, "name": name, "class": cl, "role": role, "invite": invite});
		});
		$.ajax({type: "POST", url:"/invite_save", data:{'str': JSON.stringify(arr)}, async:false, success: function( data ){ console.log(data);  }});
		displayInvites();
	}
	function addField() {
		$area = $("#enter_area");
		select = '<select name="role"><option>Учитель</option><option>Ученик</option></select>'
		html = '<div class="dirik"><input type="text" value="Имя Фамилия" class="dir_add" name="name"><input type="text" value="Класс" class="dir_add" name="cl">'+select;

		$(html).appendTo($area);
		$('.dir_add').click(function(){
			this.value="";
		});
	}
	function addClass(name) {

		var $dialogContent = $('#add_class');
		console.log($dialogContent);
		$dialogContent.find("input[name='sub_enter']").val('');
		setupSubjects();
		setupClasses();
		$dialogContent.dialog({
            modal: true,
            title: "Назначить " + name,
            close: function() {
               $dialogContent.dialog("destroy");
               //$dialogContent.hide();
            },
            buttons: {
               'Сохранить' : function() {
                  var cl = $dialogContent.find("select[name='cl']").val();
         		  var sub = $dialogContent.find("select[name='sub']").val();
         		  var text = $dialogContent.find("input[name='sub_enter']").val();
         		  if(text!='')
         		  	saveClass(cl, text, name);
         		  else
         		  	saveClass(cl, sub, name);
                  $dialogContent.dialog("close");
               },
               'Отмена' : function() {
                  $dialogContent.dialog("close");
               }
            }
         }).show();
	}
	function setupSubjects() {
		var $arr = $('#sel_sub');
		
		sub = teachers.subjects;
		html = "";
		$arr.html("");
		for(var i = 0; i < sub.length; ++i)
			html += '<option value="'+sub[i]+'">' + sub[i] + '</option>';
		console.log(html);
		$(html).appendTo($arr); 
	}
	function setupClasses() {
		var $arr = $('#sel_cl');

		cl = teachers.classes;
		html = "";
		$arr.html("");
		for(var i = 0; i < cl.length; ++i)
			html += '<option value="'+cl[i].name+'">' + cl[i].name + '</option>';
		console.log(html);
		$(html).appendTo($arr);
	}
	function saveClass(cl, subject, login) {
		
		tea = teachers.teachers;
		for(var i = 0; i < tea.length; ++i)
			if(tea[i].login == login) {
				arr = tea[i].classes;
				if(checkExist(cl, subject, arr)) {
					console.log('Уже есть');
					return;
				}
				arr.push({ "name": cl, "subject": subject });
				str = JSON.stringify({'school': school, 'teacher':login, 'class':cl, 'subject':subject});
				$.ajax({type: "POST", url:"/set_teacher", data:{'str': str}, async:false, success: function( data ){ console.log(data);  }});
				outputInfo();
				console.log(arr);
			}
	}
	function checkExist(cl, sub, arr) {
		
		for(var z = 0; z < arr.length; ++z)
			if(arr[z].name == cl)
				if(arr[z].subject == sub)
					return true;
			
		return false;
	}
});
