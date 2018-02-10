
function send() {
	$login = $("#login").val();
	$password = $("#password").val();
	
	if($password.length < 6){
		var $block = $("#password_block");
		if(!$('p').is("#paslen"))
			$block.append("<p id = \"paslen\" align=\"center\" style=\"color: red;\">Длина пароля не может быть меньше 6</p>");
		return;
	}
	check_login($login,$password);

}
function refresh() {
	if($('p').is("#wrong"))
		$('#wrong').remove()
	if($('p').is("#paslen"))
		$('#paslen').remove()
}
function check_login(login, password) {
	var correct_login;
	$.ajax({url:"/correct_login",data:{"login": login, "password": password}, async:false, success:function( data ){  
		if(data == 'error') {
			var $block = $("#textlog");
			if(!$('p').is("#wrong")){
				$block.append("<p id=\"wrong\" align=\"center\" style=\"color: red;\">Некорректный логин или пароль</p>");
			}
			return;
		}
		window.location.href = "http://localhost:5000"+data; 
	}});
	return correct_login;
}