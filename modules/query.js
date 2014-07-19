var grab = require('./grab.js');
var store = require('./store.js');
var settings = require('../settings.js');

var search = function(title, page, callback) {
    store.findInLogs(title, function(err, data) {
        if (err)
            return callback && callback(err);

        if (data && data.count === 0) {  // found but null
            callback && callback(settings.error.bookNotFound);
        }
        else if (data) {  // found and exists
            store.paginate(title, data.collHash, page, function(err, data) {
                callback && callback(err, data);
            });
        }
        else {  // first query
            grab.list(title, function(err, data) {
                // if error occurs, this cb will be called first and only
                if (err) {
                    if (err.flag) {
                        store.saveLog(title, 0);
                    }
                    return callback && callback(err);
                }

                store.saveLog(title, data.length, function(err, log) {
                    if (err)
                        return callback && callback(err);

                    store.save(data, log.collHash, function(err) {
                        if (err)
                            return callback && callback(err);

                        // callback && callback(err, data);
                    });
                });

            }, null, function(err, fastData) {
                // this err is always null
                var i, data = [];

                for (i = 0; i < settings.perPage; i++) {
                    if (!fastData[i])
                        break;

                    data[i] = fastData[i];
                }

                callback && callback(null, data);
            });
        }
    });
};


module.exports = {
    search: search
};