function deskEV(v) {v = v.replace(/\./g, '-'); return $('#' + v).html(); }
var currentPage = deskEV('current-page');
$(document).foundation();
$('.widget_button.widget_button_chat_send, .widget_button.widget_button_email_start, .widget_button.widget_button_chat_start').removeClass().addClass('button primary small right');
$('#submit_spinner_email').remove();

