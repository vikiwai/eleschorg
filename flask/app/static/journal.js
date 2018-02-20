$(document).ready(function() {
	var school = '30';
	var cl = '7а';
	var sub = 'Русский язык';
	var arr;
	var classes;
	var k;
	var n;
	var headers = [];
	var key;
	var teacher = 'marie';
	loadClasses();
	setupFields();
	$("body").on('click','#load',function(){
		cl = $('body').find('select[name="cl"]').val();
		sub = $('body').find('select[name="sub"]').val();
		loadMarks();
	});
	$("#journal").on('click', '.mark', function(){
		
		var text = this.id;
		console.log(text);
		var reg = /_/;
		var arrch = text.split(reg);
		
		$('#comment').parent().removeClass("ui-widget-content");
		$("#comment").dialog({

 			 title: "Комментарий",
	         width: 600,
	         close: function() {
	            $("#comment").dialog("destroy");
	            $("#comment").hide();
	         },
	         open: function(){
	         	rex = /.com./;
         		cell = arr[arrch[0]][arrch[1]].split(rex);
         		console.log($('#'+text).html('ghghk'));
         		if(cell.length == 2){
         			com = '<div>Оценка: </div><input type="text" size="1" name="mark" value="'+cell[0]+'"><br>'
         			com += '<div>Комментарий: </div><input type="text" size="40" name="com" value="'+cell[1]+'">'
         			$("#comment").html(com);
         		}
         		else {
         			com = '<div>Оценка: </div><input type="text" size="1" name="mark" value="'+cell[0]+'"><br>'
         			com += '<div>Комментарий: </div><input type="text" size="40" name="com">'
         			$("#comment").html(com);
         		}
			 },
	         buttons: {
	         	save: function() {
	         		save_mark(arrch[0],arrch[1],$("#comment").find("input[name='mark']").val(),$("#comment").find("input[name='com']").val());
	         		$("#comment").dialog("close");
	         	},
	            close : function() {
	               $("#comment").dialog("close");
	            }
 			}
			}).show();

	});
	function save_mark(pos, date, mark, comment) {
		if(comment == '')
			comment = " ";
		if(mark == '')
			mark = " ";
		arr[pos][date] = mark + '.com.' + comment;
		renderJournal();
		str = JSON.stringify({'position': pos, 'date': date, 'msg': arr[pos][date], 'school': school, 'cl':cl, 'sub':sub});
		$.ajax({type: "POST", url:"/save_mark", data:{'str': str}, async:false, success: function( data ){ console.log(data);  }});
	}
	function setupFields() {
		var $dadcl = $('body').find('select[name="cl"]');
		var $dadsub = $('body').find('select[name="sub"]');
		var cla = [];
		var subjects = [];
		for(var i = 0; i < classes.length; ++i) {
			cla.push(classes[i].name);
			subjects.push(classes[i].subject);
		}
		cla = unique(cla);
		subjects = unique(subjects);
		for(var i = 0; i < cla.length; ++i)
			$dadcl.append("<option value=\"" + cla[i] + "\">" + cla[i] +"</option>");
		for(var i = 0; i < subjects.length; ++i)
			$dadsub.append("<option value=\"" + subjects[i] + "\">" + subjects[i] +"</option>");

	}
	function unique(arr) {
		  var obj = {};

		  for (var i = 0; i < arr.length; i++) {
		    var str = arr[i];
		    obj[str] = true;
		  }

		  return Object.keys(obj);
}
	function loadClasses() {
		$.ajax({url:"/get_classes", data:{'school':school, 'teacher': teacher}, async:false, success:function( data ){ classes = JSON.parse(data); }});
	}
	function loadMarks() {
		$.ajax({url:"/get_marks", data:{'school':school, 'class': cl, 'subject': sub}, async:false, success:function( data ){ arr = JSON.parse(data); }});
		k = arr.length;
		for(key in arr[0]) {
			if(key!='pup')
				headers.push(key);
		}
		headers.sort(compareDates);
		n = headers.length;

		renderJournal();
	}

	function renderJournal() {
		$("#journal").html('');
		var html = "<div class='outer'><div class='inner'><table><tr><th class='left'>Ученики</th>";
		for(var i = 0; i < n; ++i)
			html += "<td class=\"heading\" id=\""+headers[i]+"\">"+headers[i]+"</td>";
		html += "</tr>";
		for(var i = 1; i < k; ++i) {
			html += "<tr><th class=\"left\" id=\""+arr[i].pup+"\">"+arr[i].pup+"</th>";
			for(var z = 0; z < n; ++z){
				rex = /.com./;
	         	cell = arr[i][headers[z]].split(rex);
				html += "<td class=\"mark\" id=\""+i+"_"+headers[z]+"\">"+cell[0]+"</td>";
				var str = "#"+i+"_"+headers[z];
			}
			html += "</tr>";
		}
		html += '</div></div>';
		$(html).appendTo($("#journal"));
		var now = new Date();
		day = now.getDate();
		if(day < 10)
			day  = '0'+day;
		month = (now.getMonth()+1);
		if(month < 10)
			month = '0'+month;
		var str = day+'.'+month+'.'+now.getFullYear();
		console.log(str);
		var element = document.getElementById(str);
		element.scrollIntoView();

	}
	function compareDates(a, b) {
		f = a.split(".");
		s = b.split(".");
		r = new Date(f[2],f[1]-1,f[0]);
		t = new Date(s[2],s[1]-1,s[0]);
		return r-t;
	}
});