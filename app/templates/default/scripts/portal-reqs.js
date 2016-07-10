$.fn.extend({ textarea_maxlength: function() { $(this).keypress(function(event) {
            var key = event.which;
            if (key >= 33 || key == 13) {
                var maxLength = $(this).attr("maxlength");
                var length = this.value.length;
                if (maxLength > 1 && length >= maxLength) event.preventDefault() } }) } });


$.fn.highlight = function(text, o) {
    var safe_text = text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    return this.each(function() {
        var replace = o || '<span class="highlight">$1</span>';
        $(this).html($(this).html().replace(new RegExp("(" + safe_text + '(?![\\w\\s?&.\\/;#~%"=-]*>))', "ig"), replace)) }) };
$.fn.autolink_old = function(target) {
    target = target || "_self";
    return this.each(function() {
        var re = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
        $(this).html($(this).html().replace(re, '<a target="' + target + '" href="$1">$1</a> '))
    })
};
function enableMultiAttachments() {
    var max_attachments = $("#max_number_attachments").text() || $("meta[name='max_number_attachments']").attr("content") || "0";
    var button_text = $("#system-snippets-add_attachment").html() || $("meta[name='system-snippets-add_attachment']").attr("content") || "";
    if (max_attachments.length > 0 && button_text.length > 0 && $(".desk_file_upload").length > 0) {
        $("<a href='javascript::void(0)' id='add_attachment' class='add_attachment' style='display:none;'>" + button_text + "</a>").insertAfter(".desk_file_upload");
        var content = $(".desk_file_upload").html(),
            index = 2;
        $("#add_attachment").click(function() {
            var new_content = content.replace(/case_attachment\[attachment\]/, "case_attachment" + index++ + "[attachment]");
            $(".desk_file_upload").append($("<div style='clear:left;'>" +
                new_content + "</div>"));
            if (index > max_attachments) $("a.add_attachment").remove();
            else $("a.add_attachment").hide();
            attachFileUploadFields();
            return false
        })
    }
}
function attachFileUploadFields() {
    var desk_file_upload = $(".desk_file_upload");
    desk_file_upload.find("input[type=file]").change(function() {
        var fieldVal = this.value.replace("C:\\fakepath\\", "");
        var self = $(this);
        self.next().find("input").val(fieldVal);
        $("a.add_attachment").show()
    });
    desk_file_upload.find('input[type="button"]').click(function() { $(this).siblings("input[type=file]").trigger("click") })
}
$(document).ready(function() {
  enableMultiAttachments();
  attachFileUploadFields();
});