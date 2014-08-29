
/**
 * Module dependencies.
 */

var cluster = require('cluster');

if (cluster.isMaster) {
    cluster.fork();

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker %d died (%s). restarting...',
            worker.process.pid, signal || code);
        cluster.fork();
    });
}
else {
    var express = require('express');
    var routes = require('./routes');
    var admin = require('./routes/admin');
    // var user = require('./routes/user');
    var http = require('http');
    var path = require('path');
    var store = require('./modules/store');

    var app = express();

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    global.systemLock = true;
    store.initCollections();

    app.put('/admin/init', admin.initAccount);
    app.get('/admin/login', admin.login);
    app.get('/admin/logout', admin.logout);
    app.put('/admin/password', admin.isAdmin, admin.resetPassword);
    app.get('/admin/collections', admin.isAdmin, admin.showCollections);
    app.put('/admin/collection/:hash', admin.isAdmin, admin.addCollection);
    app.delete('/admin/collection/:hash', admin.isAdmin, admin.removeCollection);

    app.get('/query/:title', routes.isLocked, routes.query);

    app.get('/', routes.index);
    app.get('/query', routes.queryIndex);

    http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });
}
