$(document).ready(function() {
	var arr = load_array();
	//$.ajax({url:"/get_marks", async:false, success:function( data ){ arr = data; }});
	var k = arr.length;
	var n = arr[0].length;
	var html = "<table><tr>";
	for(var i = 0; i < n; ++i)
		html += "<td class=\"heading\" id=\""+arr[0][i].id+"\">"+arr[0][i].name+"</td>";
	html += "</tr>";
	for(var i = 1; i < k; ++i) {
		html += "<tr><td class=\"left\" id=\""+arr[i][0].id+"\">"+arr[i][0].name+"</td>";
		for(var z = 1; z < n; ++z){
			html += "<td class=\"mark\" id=\""+arr[i][z].id+"\">"+arr[i][z].name+"</td>";
			var str = "#"+arr[i][z].id;
			$("#journal").delegate(str, 'click',function() {
				var text = this.id;
				var reg = /a|b/
				var arrch = text.split(reg);
				console.log(arrch);
				$('#comment').parent().removeClass("ui-widget-content");
				// if(status == 0)
				// 	$("#comment").dialog({

	   //       			 title: "Комментарий",
				//          width: 600,
				//          close: function() {
				//             $("#comment").dialog("destroy");
				//             $("#comment").hide();
				//          },
				//          open: function(){
	   //      					$("#comment").html('<input type="text" size="40" id="teachercomment">');
	   //  				 },
				//          buttons: {
				//          	save: function() {
				//          		console.log($("#teachercomment").val());
				//          		$("#comment").dialog("close");
				//          	},
				//             close : function() {
				//                $("#comment").dialog("close");
				//             }
	   //       			}
	   //   			}).show();
				// if(status == 1)
					$("#comment").dialog({

	         			 title: "Комментарий",
				         width: 600,
				         close: function() {
				            $("#comment").dialog("destroy");
				            $("#comment").hide();
				         },
				         open: function(){
	        					$("#comment").html(arr[arrch[1]][arrch[2]].comment);
	    				 },
				         buttons: {
				            close : function() {
				               $("#comment").dialog("close");
				            }
	         			}
	     			}).show();
			});
		}
		html += "</tr>";
	}
	
	$(html).appendTo($("#journal"));


	function load_array() {
		var n = 4, m = 4;
		var mas = [];
		var arr = ['01.01','02.01','03.01'];
		var arr2 = ['Математика','Физика','Химия'];
		for(var i = 0; i < m; ++i)
			mas[i] = [];
		mas[0][0] = {'id':0,'name':'','comment':''};
		for(var i = 1; i < n; ++i)
			mas[0][i] = {'id':i,'name':arr[i-1],'comment':'0'};
		for(var j = 1; j < m; ++j)
			mas[j][0] = {'id':j,'name':arr2[j-1],'comment':'0'};
		for (var i = 1; i < m; i++){
			for (var j = 1; j < n; j++){
				var str = 'a'+j+'b'+i;
				mas[i][j] = {'id':str,'name':5, 'comment': 'Иди-ка ты нахуй'};
			}
		}
		return mas;
	}
});