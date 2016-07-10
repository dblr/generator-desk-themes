function deskEV(v) {v = v.replace(/\./g, '-'); return $('#' + v).html(); }
var currentPage = deskEV('current-page');

$('.widget_button.widget_button_chat_send, .widget_button.widget_button_email_start, .widget_button.widget_button_chat_start').removeClass().addClass('btn btn-primary right');
$('#submit_spinner_email').remove();

