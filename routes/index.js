var express = require('express');
var fs = require('fs');
var router = express.Router();
var tmp = require('tmp');
var path = require('path');
var pdfmerger = require('pdfmerger');
var multer = require('multer');
var upload = multer({
    dest: '/tmp/pdfmerger/'
});
var mime = require('mime-types');
var PDFDocument = require('pdfkit');
var imageSize = require('image-size');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'PDF Merger',
        jsFiles: ['/js/index.js']
    });
});

/* POST upload PDF files */
router.post('/', upload.any(), function(req, res, next) {
    var outputFileName = req.body.outputName;
    if (outputFileName == null || outputFileName.trim().length < 1) {
        outputFileName = 'output.pdf';
    }

    if (!outputFileName.endsWith('.pdf')) {
        outputFileName = outputFileName + '.pdf';
    }

    processFile(req.files, 0, res);
});

function processFile(files, index, res, pdfs) {
    console.log(files.length, index);
    if (index >= files.length) {
        // We are finished, Merge the PDFs now
        console.log('We are finished, Merge the PDFs now', pdfs);
        if (pdfs.length == 1) {
            res.download(pdfs[pdfs.length - 1]);
        } else if (pdfs.length > 1) {
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
        } else {
            throw new Error('Please provide at least one file');
        }
    } else {
        if (pdfs == null) {
            pdfs = [];
        }

        // Process the files
        var file = files[index];

        var mimeType = mime.lookup(file.originalname) || 'application/pdf';
        console.log(file.originalname, mimeType);

        if (mimeType.startsWith('image/')) {
            // We need to convert the image to a PDF
            var newPath = file.path + '.pdf';

            console.log(newPath);

            var dimensions = imageSize(file.path);

            var fileReader = fs.createWriteStream(newPath);

            var doc = new PDFDocument({
                autoFirstPage: false
            });
            doc.addPage({
                size: [dimensions.width, dimensions.height],
                margin: 0
            });
            var fileStream = doc.pipe(fileReader);
            doc.image(file.path);
            doc.end();


            fileReader.on('finish', function() {
                // Push new PDF to the array
                pdfs.push(newPath);
                var newIndex = index + 1;
                processFile(files, newIndex, res, pdfs);
            });
        } else {
            // already a PDF, so should be fine
            pdfs.push(file.path);
            var newIndex = index + 1;
            processFile(files, newIndex, res, pdfs);
        }
    }
}

module.exports = router;