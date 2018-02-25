$(document).ready(function() {
	var school = '30';
	var teachers;
	$('#get_data').click(function(){
		getData();
		outputInfo();
		
	});
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
