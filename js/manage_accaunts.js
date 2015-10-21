$(function() {
	'use strict';

	buildList();

	$('#add_accaunt').on('click', function() {
		var login = $('input[name=login]').val(),
			password = $('input[type=password]').val();

		if(!login.length) {
			$('#err').text('Не верный логин');
			return;
		}

		if(!password.length) {
			$('#err').text('Заполните поле пароля');
			return;
		}

		loginUser(login, password);
	});

	$('#accaunts_list').on('click', '.remove_acc', function() {
		var login = $(this).data('login');
		removeUser(login);
		$(this).parent().remove();
	});


	$('#refresh_captcha').on('click', genCaptcha);

});


// --

function buildList() {
	var list = $('#accaunts_list');
	list.empty();

	_.each(USERS, function(v,k) {
		list.append('<li><b>'+k+'@ex.ua</b> <button class="button-error pure-button remove_acc" data-login="'+k+'">Удалить</button></li>')
	});
}

function loginUser(login, password) {

	var data = {
		login: login,
		password: password,
		captcha_value: $('input[name=captcha_value]').val(),
		captcha_token: $('input[name=captcha_token]').val()
	};

	$.ajax({ 
		url: "https://mail.ex.ua/j_login", 
		type: "post", 
		dataType: "json", 
		data: data, 
		success: function(data) {
			if(data.result) {
				addUser(login, data.token);
				buildList();
				$('#err').text('');
				$('#kp_there').hide();
				$('input[name=login]').val('');
				$('input[type=password]').val('');
			} else {

				if(data.captcha) {
					genCaptcha();
				} else {
					$('#kp_there').hide();
				}

				$('#err').text(getErr(data.err.id));
			}
		}
	});
}

function getErr(id) {
	return errors_glob['ERR_MSG_'+id] || 'Undefined error';
}

function addUser(login, token) {
	USERS[login] = token;
	storage.setItem('users', JSON.stringify(USERS));
	chrome.extension.getBackgroundPage().location.reload();
}

function removeUser(login) {
	delete USERS[login];
	storage.setItem('users', JSON.stringify(USERS));
	chrome.extension.getBackgroundPage().location.reload();
}

function makeToken() {
	var text = "", possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i=0; i<32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

function genCaptcha() {
	var tok = makeToken();
	var $captcha_bl = $('#kp_there');
	$captcha_bl.find('#captcha').attr('src', 'https://mail.ex.ua/captcha?captcha_token='+tok+'&'+Math.random());
	$captcha_bl.find('input[name="captcha_token"]').val(tok);
	$captcha_bl.find('input[name="captcha_value"]').val('');
	$captcha_bl.show();
}