var query = require('../modules/query.js');

exports.index = function(req, res) {
    res.redirect('/query');
};

exports.query = function(req, res) {
    var title = req.param('title').trim();
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
    res.render('index', {title: 'fastlib'});
};
