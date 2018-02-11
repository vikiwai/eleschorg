$(document).ready(function() {
	var school = '30';
	var teachers;
	var invites;
	getInvites();

	$('#get_data').click(function(){
		getData();
		outputInfo();
		
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
	});
	$('#add_per_rel').click(function(){
		hideAll();
		displayInvites();
		$el = $('#add_person');
		$el.css("display","block");
	});
	$('.titi').click(function(){
		$par = $(this).parent();
		res = $($par).find("input[name='tutu']").val();
		console.log(res);
	});
	$("#cur_invites").on("click", ".del_but", function(){
		$par = '#tr' + this.id;
		inv = $($par).find('.inv_inv').html();
		$.ajax({type: "POST", url:"/del_invites", data:{'invite': inv}, async: true, success: function( data ){ console.log(data); }});
		$($par).remove()
		// console.log($par);
		// res = $($par).find(".inv_name").html();
		// console.log(res);
		// res = $($par).find(".inv_inv").html();
		// console.log(res);
	});
	function getInvites() {
		$.ajax({type: "GET", url:"/cur_invites", data:{'school': school}, async:false, success: function( data ){ invites = JSON.parse(data); }});
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
		$subjects = $('#subjects');
		subArr = teachers.subjects;
		teaArr = teachers.teachers;
		var html = "";
		$subjects.html("");
		for(var i = 0; i < subArr.length; ++i)
			html += '<p>'+subArr[i]+'</p>';

		$(html).appendTo($subjects);

		html = "";
		$tea.html("");
		for(var i = 0; i < teaArr.length; ++i){
			html += '<p class="teacher" id ="'+teaArr[i].login+'">' + teaArr[i].name + ':</p>';
			for(var z = 0; z < teaArr[i].classes.length; ++z)
				html += '<p style="margin-left: 20px;">' + teaArr[i].classes[z].name + ': ' + teaArr[i].classes[z].subject + '</p>';
		}		$(html).appendTo($tea);
		$('.teacher').click(function(){
			console.log(teachers.classes);
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
