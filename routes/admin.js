var store = require('../modules/store.js');
var admin = require('../modules/admin.js');

exports.addCollection = function(req, res) {
    var hash = req.param('hash');

    store.addCollection(hash, function(err, data) {
        if (err)
            return res.send(500, err);

        res.send(200, data);
    });
};

exports.removeCollection = function(req, res) {
    var hash = req.param('hash');

    store.removeCollection(hash, function(err, data) {
        if (err)
            return res.send(500, err);

        res.send(200, data);
    });
};

exports.showCollections = function(req, res) {
    store.showCollections(function(err, data) {
        if (err)
            return res.send(500, err);

        res.send(200, data);
    });
};

exports.initAccount = function(req, res) {
    var username = req.param('username');
    var password = req.param('password');

    admin.initAdmin(username, password, function(err) {
        if (err) {
            if (err.status)
                return res.send(err.status, {message: err.message});
            else
                return res.send(500);
        }

        res.send(201, {admin: username});
    });
};

exports.resetPassword = function(req, res) {
    var username = req.session['username'];
    var password = req.param('password');

    admin.resetPassword(username, password, function(err, isChanged) {
        if (err)
            return res.send(500, err);

        isChanged ? res.send(200) : res.send(404);
    });
};

exports.login = function(req, res) {
    var username = req.param('username');
    var password = req.param('password');

    admin.adminLogin(username, password, function(err, data) {
        if (err)
            return res.send(500);

        if (data) {
            req.session['auth'] = 'admin';
            req.session['username'] = username;
            res.send(200, {message: 'login success'});
        }
        else {
            res.send(401, {message: 'login failed'});
        }
    });
};

exports.logout = function(req, res) {
    if (req.session['auth']) {
        delete req.session['auth'];
        delete req.session['username'];
    }

    res.send(200, {message: 'logout success'});
};

exports.isAdmin = function(req, res, next) {
    var auth = req.session['auth'];

    if (auth === 'admin') {
        next();
    }
    else {
        res.send(401, {message: 'Please login.'});
    }
}