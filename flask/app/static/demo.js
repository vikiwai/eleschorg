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
   
   var $calendar = $('#calendar');
   var id = 10;

   $calendar.weekCalendar({
      timeslotsPerHour : 4,
      allowCalEventOverlap : true,
      overlapEventsSeparate: true,
      firstDayOfWeek : 1,
      businessHours :{start: 8, end: 18, limitDisplay: true },
      daysToShow : 7,
      height : function($calendar) {
         return $(window).height() - $("h1").outerHeight() - 1;
      },
      eventRender : function(calEvent, $event) {
         if (calEvent.end.getTime() < new Date().getTime()) {
            $event.css("backgroundColor", "#aaa");
            $event.find(".wc-time").css({
               "backgroundColor" : "#999",
               "border" : "1px solid #888"
            });
         }
      },
      draggable : function(calEvent, $event) {
         return calEvent.readOnly != true;
      },
      resizable : function(calEvent, $event) {
         return calEvent.readOnly != true;
      },
      eventNew : function(calEvent, $event) {

         var $dialogContent = $("#event_edit_container");
         resetForm($dialogContent);
         var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
         var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
         var titleField = $dialogContent.find("input[name='title']");
         var bodyField = $dialogContent.find("textarea[name='body']");
         var filtrField = $dialogContent.find("select[name='filtr']").val(calEvent.filtr);

         $dialogContent.dialog({
            modal: true,
            title: "Новое событие",
            close: function() {
               $dialogContent.dialog("destroy");
               $dialogContent.hide();
               $('#calendar').weekCalendar("removeUnsavedEvents");
            },
            buttons: {
               save : function() {
                  calEvent.id = id;
                  id++;
                  calEvent.start = new Date(startField.val());
                  calEvent.end = new Date(endField.val());
                  calEvent.title = titleField.val();
                  calEvent.body = bodyField.val();
                  calEvent.filtr = $dialogContent.find("select[name='filtr']").val();
                  var person = getEventData();
                  person.events.push(calEvent);
                  var q = JSON.stringify({'login':login,'school':school,'events':person});
                  $.ajax({type: "POST", url:"/refresh_data", data:{'str': q}, async:false});
                  $calendar.weekCalendar("removeUnsavedEvents");
                  $calendar.weekCalendar("updateEvent", calEvent);
                  $dialogContent.dialog("close");
               },
               cancel : function() {
                  $dialogContent.dialog("close");
               }
            }
         }).show();

         $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
         setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
         setupFiltresFields(filtrField,calEvent);
      },
      eventDrop : function(calEvent, $event) {
        
      },
      eventResize : function(calEvent, $event) {
      },
      eventClick : function(calEvent, $event) {

         if (calEvent.readOnly) {
            return;
         }

         var $dialogContent = $("#event_edit_container");
         resetForm($dialogContent);
         var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
         var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
         var titleField = $dialogContent.find("input[name='title']").val(calEvent.title);
         var bodyField = $dialogContent.find("textarea[name='body']");
         bodyField.val(calEvent.body);
         var filtrField = $dialogContent.find("select[name='filtr']").val(calEvent.filtr);

         $dialogContent.dialog({
            modal: true,
            title: "Редактировать - " + calEvent.title,
            close: function() {
               $dialogContent.dialog("destroy");
               $dialogContent.hide();
               $('#calendar').weekCalendar("removeUnsavedEvents");
            },
            buttons: {
               save : function() {

                  calEvent.start = new Date(startField.val());
                  calEvent.end = new Date(endField.val());
                  calEvent.title = titleField.val();
                  calEvent.body = bodyField.val();
                  calEvent.filtr = filtrField.val();

                  $calendar.weekCalendar("updateEvent", calEvent);
                  $dialogContent.dialog("close");
               },
               "delete" : function() {
                  $calendar.weekCalendar("removeEvent", calEvent.id);
                  $dialogContent.dialog("close");
               },
               cancel : function() {
                  $dialogContent.dialog("close");
               }
            }
         }).show();

         var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
         var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
         var filtrField = $dialogContent.find("select[name='filtr']").val(calEvent.filtr);
         $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
         setupStartAndEndTimeFields(startField, endField, calEvent, $calendar.weekCalendar("getTimeslotTimes", calEvent.start));
         
         setupFiltresFields(filtrField, calEvent);
         $(window).resize().resize(); //fixes a bug in modal overlay size ??

      },
      eventMouseover : function(calEvent, $event) {
      },
      eventMouseout : function(calEvent, $event) {
      },
      noEvents : function() {

      },
      data : function(start, end, callback) {
         callback(getEventData());
      }
   });
   var a;
   function sendDirTest(calEVent) {
      var data = {'school':school, 'event': calEVent};
      var str = JSON.stringify(data);
      $.ajax({type: "POST", url:"/add_school_event", data:{'str': str}, async:false, success:function( data ){ console.log(1);}});
   }
   function resetForm($dialogContent) {
      $dialogContent.find("input").val("");
      $dialogContent.find("textarea").val("");
   }

   function getEventData() {
      $.ajax({url:"/get_data", data:{'login': login,'school':school}, async:false, success:function( data ){ a = data; }});
      var arr = JSON.parse(a);
      return arr;
   }


   /*
    * Sets up the start and end time fields in the calendar event
    * form for editing based on the calendar event being edited
    */
   function setupStartAndEndTimeFields($startTimeField, $endTimeField, calEvent, timeslotTimes) {
      for (var i = 0; i < timeslotTimes.length; i++) {
         var startTime = timeslotTimes[i].start;
         var endTime = timeslotTimes[i].end;
         var startSelected = "";
         if (startTime.getTime() === calEvent.start.getTime()) {
            startSelected = "selected=\"selected\"";
         }
         var endSelected = "";
         if (endTime.getTime() === calEvent.end.getTime()) {
            endSelected = "selected=\"selected\"";
         }
         $startTimeField.append("<option value=\"" + startTime + "\" " + startSelected + ">" + timeslotTimes[i].startFormatted + "</option>");
         $endTimeField.append("<option value=\"" + endTime + "\" " + endSelected + ">" + timeslotTimes[i].endFormatted + "</option>");

      }
      $endTimeOptions = $endTimeField.find("option");
      $startTimeField.trigger("change");
   }

   function setupFiltresFields($filtrField, calEvent) {
      var $dialogContent = $("#event_edit_container");
      var $daddy = $dialogContent.find('select[name=\'filtr\']').html('');
      var person = getEventData();
      var filtres = person.filtres;
      for(var i = 0; i < filtres.length; ++i){
         $dialogContent.find('select[name=\'filtr\']').append("<option value=\"" + filtres[i] + "\">" + filtres[i] +"</option>");
      }
      //$dialogContent.find('select[name=\'filtr\']').trigger("change");
   }

   var $endTimeField = $("select[name='end']");
   var $endTimeOptions = $endTimeField.find("option");

   //reduces the end time options to be only after the start time options.
   $("select[name='start']").change(function() {
      var startTime = $(this).find(":selected").val();
      var currentEndTime = $endTimeField.find("option:selected").val();
      $endTimeField.html(
            $endTimeOptions.filter(function() {
               return startTime < $(this).val();
            })
            );

      var endTimeSelected = false;
      $endTimeField.find("option").each(function() {
         if ($(this).val() === currentEndTime) {
            $(this).attr("selected", "selected");
            endTimeSelected = true;
            return false;
         }
      });

      if (!endTimeSelected) {
         //automatically select an end date 2 slots away.
         $endTimeField.find("option:eq(1)").attr("selected", "selected");
      }

   });


   var $filtr_con = $("#addfil");

   $("#add_filtr").click(function() {
      $filtr_con.dialog({
         title: "Добавление фильтра",
         width: 600,
         close: function() {
            $filtr_con.dialog("destroy");
            $filtr_con.hide();
         },
         buttons: {
            save : function() {
                  var name = $filtr_con.find("input[name='filtr_name']").val();
                  var person = getEventData();
                  var t;
                  for(t = 0; t < person.filtres.length; ++t)
                     if(person.filtres[t] == name) {
                        alert("Фильтр с таким названием уже существует");
                        break;
                     }        
                  if(t == person.filtres.length)
                     person.filtres.push(name);
                  
                  var q = JSON.stringify({'login':login,'school':school,'events': person});
                  $.ajax({type: "POST", url: "/refresh_data", async:false, data: {str: q}, success: function( data ){ }});
                  $calendar.weekCalendar("updateCalendar");       
                  $filtr_con.dialog("close");
            },
            close : function() {
               $filtr_con.dialog("close");
            }
         }
      }).show();
   });


});