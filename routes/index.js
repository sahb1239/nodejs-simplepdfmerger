var express = require('express');
var router = express.Router();
var tmp = require('tmp');
var path = require('path');
var pdfmerger = require('pdfmerger');
var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
})


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'PDF Merger',
        jsFiles: ['/js/index.js']
    });
});

/* POST upload PDF files */
router.post('/', upload.any(), function(req, res, next) {
    console.log('Got a post. Files: ' + JSON.stringify(req.files));
    console.log('Got a post. Body: ' + JSON.stringify(req.body));

    var outputFileName = req.body.outputName;
    if (outputFileName == null || outputFileName.trim().length < 1) {
        outputFileName = 'output.pdf';
    }

    if (!outputFileName.endsWith('.pdf')) {
        outputFileName = outputFileName + '.pdf';
    }

    var pdfs = [];

    for (var i = 0; i < req.files.length; i++) {
        var file = req.files[i];
        pdfs.push(file.path);
    }

    tmp.dir(function _tempDirCreated(err, dirPath, cleanupCallback) {
        if (err) {
            return next(err);
        };

        console.log("Dir: ", dirPath);

        var filePath = path.join(dirPath, outputFileName);

        try {
            pdfmerger(pdfs, filePath, function(error) {
                if (error) {
                    return next(error);
                }
                res.download(filePath);
            });
        } catch (e) {
            next(e);
        }
    });
});

function sendJsonResponse(status, message, data, res) {
    var j = {
        status: status,
        message: message,
        data: data
    };

    res.send(JSON.stringify(j));
}

module.exports = router;