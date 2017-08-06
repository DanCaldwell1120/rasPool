Router.route('/', function() {
  this.render('poolPic');
});

// Allows meteor to route static assests NOT in your file tree.
// You want to keep these pictures outside of meteor to prevent meteor
// from hot code loading and forcing a page refresh. I'm using iron:router
// package. Modify this to suit whatever router package you prefer.
Router.route('/static/:filename', function() {
  var fs = Npm.require('fs');
  var path = '/var/www/meteor/' + this.params.filename;
  var chunk = fs.createReadStream(path);
  var statusCode = 200;
  this.response.writeHead(statusCode);
  chunk.pipe(this.response);
}, {where: 'server'});
