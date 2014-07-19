var mongoose = require('mongoose');
var settings = require('../settings.js');
var db = mongoose.connection;
var Schema = mongoose.Schema;

mongoose.connect('mongodb://' + settings.mongodb.host + '/' + settings.mongodb.db);

db.on('error', console.error.bind(console, '[Mongo]'));

db.once('open', function() {
    console.log('[Mongo] MongoDB connected');
    // cb();
});

var cb = function() {
    var hashingRingSchema = new Schema({
        collHash: String,
        joinTime: Date
    });
    var collectionSchema = new Schema({
        keyword: {
            type: String,
            index: {
                sparse: true
            }
        },
        /*update: Date,*/
        title: String,
        detail: String,
        author: String,
        publisher: String,
        callno: String,
        doctype: String
    });
    var queryLogSchema = new Schema({
        keyword: {
            type: String,
            index: {
                unique: true,
                sparse: true
            }
        },
        hash: String,
        count: Number,
        collHash: String,
        update: Date
    });
    var adminSchema = new Schema({
        username: String,
        password: String
    });

    var HashingRing = mongoose.model('HashingRing', hashingRingSchema);
    //var Collection = mongoose.model('Collection', collectionSchema);
    var CollectionConstructor = function(hash) {
        return mongoose.model('Coll_' + hash, collectionSchema);
    };
    var QueryLog = mongoose.model('QueryLog', queryLogSchema);
    var Admin = mongoose.model('Admin', adminSchema);

    return {
        HashingRing: HashingRing,
        CollectionConstructor: CollectionConstructor,
        QueryLog: QueryLog,
        Admin: Admin
    };
};


module.exports = cb();