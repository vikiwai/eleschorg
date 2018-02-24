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
	var arr;
	var classes;
	var k;
	var n;
	var headers = [];
	var key;
	
	loadMarks();
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
         		if(cell.length == 2){
         			com = '<div>Оценка: '+cell[0]+'</div><br>';
         			com += '<div>Комментарий: '+cell[1]+'</div>';
         			$("#comment").html(com);
         		}
         		else {
         			com = '<div>Оценка: '+cell[0]+'</div><br>';
         			$("#comment").html(com);
         		}
			 },
	         buttons: {
	            close : function() {
	               $("#comment").dialog("close");
	            }
 			}
			}).show();

	});
	function unique(arr) {
		  var obj = {};

		  for (var i = 0; i < arr.length; i++) {
		    var str = arr[i];
		    obj[str] = true;
		  }

		  return Object.keys(obj);
	}
	
	function loadMarks() {
		$.ajax({url:"/get_grades", data:{'school':school, 'login': login, 'name': name}, async:false, success:function( data ){ arr = JSON.parse(data); }});
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
		var html = "<div class='outer'><div class='inner'><table><tr><th class='left'>Предмет</th>";
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