var crypto = require('crypto');
var mongo = require('../models/mongo.js');
var settings = require('../settings.js');
var Admin = mongo.Admin;

var md5 = function() {
    return crypto.createHash('md5');
};

var initAdmin = function(username, password, callback) {
    Admin.count(function(err, count) {
        if (err) {
            console.log('[initAdmin]', err);
            return callback && callback(err);
        }

        if (count) {
            callback && callback(settings.error.adminExists);
        }
        else {
            var admin = new Admin({
                username: username,
                password: md5().update(settings.md5Secret + password).digest('hex')
            });

            admin.save(function(err) {
                if (err) {
                    console.log('[initAdmin]', err);
                    return callback && callback(err);
                }

                callback && callback();
            });
        }
    });
}

var adminLogin = function(username, password, callback) {
    Admin.findOne({
        username: username
    }, function(err, doc) {
        if (err) {
            console.log('[adminLogin]', err);
            return callback && callback(err);
        }

        return callback && callback(null, doc && doc.password
            === md5().update(settings.md5Secret + password).digest('hex'));
    });
};

var resetPassword = function(username, password, callback) {
    Admin.findOneAndUpdate({
        username: username
    }, {
        password: md5().update(settings.md5Secret + password).digest('hex')
    }, function(err, doc) {
        if (err) {
            console.log('[resetPassword]', err);
            return callback && callback(err);
        }

        callback && callback(null, !!doc);
    });
};


module.exports = {
    initAdmin: initAdmin,
    adminLogin: adminLogin,
    resetPassword: resetPassword
};