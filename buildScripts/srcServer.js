import express from 'express';
import path from 'path';
import open from 'open';
import fileUpload from 'express-fileupload';
import webpack from 'webpack';
import config from '../webpack.config.dev';
import uniqueFilename from 'unique-filename';
import request from 'request';
import azure from 'azure-storage';

require('dotenv').config();

/* eslint-disable no-console */
const port = 3001;
const app = express();
const compiler = webpack(config);

app.use(fileUpload());

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

app.get('/computerVisionApiKey', function (req, res) {
    //console.log(process.env.COMPUTER_VISION_API_KEY);
    res.json({ 'key': process.env.COMPUTER_VISION_API_KEY });
});

app.post('/upload', function (req, res) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded');
    }

    let imageToProcess = req.files.imageToProcess;

    let uploadFileName = uniqueFilename(path.join(__dirname, '/uploaded')) + '.jpg';

    imageToProcess.mv(uploadFileName, function (err) {
        if (err) {
            return res.status(500).send(err);
        }
        const retryOperations = new azure.ExponentialRetryPolicyFilter();
        const blobSvc = azure.createBlobService().withFilter(retryOperations);
        const c = process.env.AZURE_STORAGE_CONTAINER;
        const f = path.parse(uploadFileName).base;

        blobSvc.createContainerIfNotExists(c, { publicAccessLevel: 'blob' }, function (error, result, response) {
            if (!error) {
                // Container exists and is private
                blobSvc.createBlockBlobFromLocalFile(c, f, uploadFileName,
                    function (error, result, response) {
                        if (!error) {
                            // file uploaded
                            // console.log(result);
                            // console.log(response);
                            var hostName = `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`;

                            // var blobUrl = blobService.getUrl(c, f, null, hostName);
                            let blobUrl = `${hostName}/${c}/${f}`;
                            console.log(blobUrl);


                            let options = {
                                method: 'POST',
                                url: 'https://westus.api.cognitive.microsoft.com/vision/v1.0/describe',
                                qs: { language: 'en' },
                                headers:
                                {
                                    'ocp-apim-subscription-key': process.env.COMPUTER_VISION_API_KEY,
                                    'content-type': 'application/json'
                                },
                                body: { url: blobUrl },
                                json: true
                            };

                            request(options, function (error, response, body) {

                                blobSvc.deleteBlob(c, f, function (error, response) {
                                    if (!error) {
                                        // Blob has been deleted
                                    }
                                });
                                if (error) throw new Error(error);
                                res.send(body);
                                console.log(body);
                            });

                        }
                    });

            }
        });



        // res.send('File uploaded!');



    })

});

app.listen(port, function (err) {
    if (err) {
        console.log(err);
    } else {
        open('http://localhost:' + port);
    }
})
