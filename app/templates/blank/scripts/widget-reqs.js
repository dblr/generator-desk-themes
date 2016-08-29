$(function() {
    var attachments = $("#attachments");
    if (attachments.length) {
        var file_upload = attachments.find(".file_upload");
        EmailWidgetHelper.attachFileUploadEvents(attachments, file_upload);
        EmailWidgetHelper.attachFileUploadFields(attachments, file_upload.html()) } else { PortalHelper.attachFileUploadFields();
        PortalHelper.enableMultiAttachments() } });
PortalHelper = {
    enableMultiAttachments: function() {
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
                PortalHelper.attachFileUploadFields();
                return false
            })
        }
    },
    attachFileUploadFields: function() {
        var desk_file_upload = $(".desk_file_upload");
        desk_file_upload.find("input[type=file]").change(function() {
            var fieldVal = this.value.replace("C:\\fakepath\\", "");
            var self = $(this);
            self.next().find("input").val(fieldVal);
            $("a.add_attachment").show() });
        desk_file_upload.find('input[type="button"]').click(function() { $(this).siblings("input[type=file]").trigger("click") }) }
};
EmailWidgetHelper = {
    attachFileUploadEvents: function(attachments, file_upload) {
        attachments.append(file_upload);
        file_upload.find(".remove-case_attachment").click(function() { $(this).closest(".file_upload").remove();
            EmailWidgetHelper.renumberAttachments(attachments) });
        file_upload.find("input[type=file]").change(function() {
            var fieldVal = this.value.replace("C:\\fakepath\\", "");
            $(this).parent().find(".filename-case_attachment").val(fieldVal) });
        file_upload.find('input[type="button"]').click(function() {
            var file_input =
                file_upload.find("input[type=file]");
            file_input.trigger("click")
        });
        file_upload.find('input[type="text"]').click(function() {
            var file_input = file_upload.find("input[type=file]");
            file_input.trigger("click") });
        EmailWidgetHelper.renumberAttachments(attachments)
    },
    renumberAttachments: function(attachments) {
        var file_uploads = attachments.find(".file_upload");
        file_uploads.each(function(index) {
            var file_input = $(this).find("input[type=file]");
            var name = "case_attachment";
            if (index > 0) name += index + 1;
            name += "[attachment]";
            file_input.attr("name", name)
        });
        var max_attachments = $("#max_number_attachments").text() || $("meta[name='max_number_attachments']").attr("content") || "0";
        var current_attachments = attachments.find(".file_upload").length;
        max_attachments = parseInt(max_attachments);
        if (max_attachments > 0 && current_attachments < max_attachments) attachments.find("#add_attachment").show();
        else attachments.find("#add_attachment").hide()
    },
    attachFileUploadFields: function(attachments, file_upload) {
        attachments.find("#add_attachment").click(function() {
            var new_file_upload =
                $('<div class="file_upload">' + file_upload + "</div>");
            EmailWidgetHelper.attachFileUploadEvents(attachments, new_file_upload)
        })
    }
};
