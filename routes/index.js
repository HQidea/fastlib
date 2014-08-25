var query = require('../modules/query.js');
var settings = require('../settings.js');

exports.index = function(req, res) {
    res.redirect('/query');
};

exports.query = function(req, res) {
    var title = req.param('title').trim().toLowerCase();
    var page = req.param('page') && req.param('page').trim().match(/^\d+$/) ?
        req.param('page').trim() : 1;

    query.search(title, page, function(err, data) {
        if (err) {
            if (err.status)
                return res.send(err.status, {message: err.message});
            else
                return res.send(500);
        }

        res.send(200, data);
    });
};

exports.queryIndex = function(req, res) {
    res.render('index', {
        title: 'fastlib',
        time: +new Date()
    });
};

exports.isLocked = function(req, res, next) {
    if (global.systemLock) {
        var err = settings.error.systemLocked;
        console.log('[Locked]', err);
        return res.send(err.status, {message: err.message});
    }

    next();
};
