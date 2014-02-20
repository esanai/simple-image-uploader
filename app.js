
/**
 * References:
 * 1. http://tonyspiro.com/uploading-and-resizing-an-image-using-node-js
 * 2. http://howtonode.org/really-simple-file-uploads
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , im = require('imagemagick');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  fs.readdir(__dirname + '/uploads/thumbs/', function(err, files){
    if(err) {
      res.render('index', { title: 'Simple Image Uploader' });
      console.log('Thumbs reading error');
      return;
    }

    res.render('index', { title: 'Simple Image Uploader', thumbs: files });
  });
});
app.post('/upload', function(req, res){
  fs.readFile(req.files.imageFile.path, function (err, data) {
    var imageName = req.files.imageFile.name;
    if(!imageName){
      console.log("Upload error");
      res.redirect("/");
      res.end();
      return;
    }

    var originalPath = __dirname + "/uploads/original/" + imageName;
    var thumbPath = __dirname + "/uploads/thumbs/" + imageName;
    fs.writeFile(originalPath, data, function (err) {
      im.resize({
        srcPath: originalPath,
        dstPath: thumbPath,
        width: 100
      }, function (err, stdout, stderr){
        if (err)
          throw err;
      });
      res.redirect("/images/" + imageName);
    });
  });
});
app.get('/images/:file', function (req, res){
  res.render('images', { imageName: req.params.file });
});
app.get('/uploads/original/:file', function (req, res){
  var file = req.params.file;
  var img = fs.readFileSync(__dirname + '/uploads/original/' + file);
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});
app.get('/uploads/thumbs/:file', function (req, res){
  var file = req.params.file;
  var img = fs.readFileSync(__dirname + '/uploads/thumbs/' + file);
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
