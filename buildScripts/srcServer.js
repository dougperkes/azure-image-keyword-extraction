import express from 'express';
import path from 'path';
import open from 'open';
import fileUpload from 'express-fileupload';
import webpack from 'webpack';
import config from '../webpack.config.dev';
import uniqueFilename from 'unique-filename';

/* eslint-disable no-console */
const port = 3001;
const app = express();
const compiler = webpack(config);

app.use(fileUpload());

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

app.post('/upload', function(req, res) {
  if (!req.files) {
    return res.status(400).send('No files were uploaded');
  }


  let imageToProcess = req.files.imageToProcess;
  let uploadFileName = uniqueFilename(path.join(__dirname, '/uploaded')) + '.jpg';
  imageToProcess.mv(uploadFileName, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.send('File uploaded!');
  })

})

app.listen(port, function(err) {
  if (err) {
    console.log(err);
  } else {
    open('http://localhost:' + port);
  }
})
