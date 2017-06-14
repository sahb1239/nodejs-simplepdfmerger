(function($) {
    // Add more PDFS
    function initAddMore() {
        $('body').on('click', '.btn-add-pdf', function(e) {
            e.preventDefault();
            var lastPdf = $('.pdf:last');
            var nextNum = lastPdf.data('num') + 1;

            var temp = '<div class="form-group pdf" data-num="' + nextNum + '">' +
                '	<label for="file' + nextNum + '" class="col-sm-2 control-label">File ' + nextNum + '</label>' +
                '	<div class="col-sm-10">' +
                '		<input type="file" id="file' + nextNum + '" name="file' + nextNum + '" accept="application/pdf,*.pdf,image/*" />' +
                '	</div>' +
                '</div>';

            lastPdf.after(temp);
        });
    }

    function initReset() {
        $('body').on('click', '.btn-reset', function(e) {
            e.preventDefault();

            var form = $('#pdfForm').trigger('reset');
            var pdfs = $('.pdf').not('[data-num=1]').not('[data-num=2]');
            pdfs.remove();
        });
    }

    // Init Methods
    $(function() {
        initAddMore();
        initReset();
    });
})(jQuery);