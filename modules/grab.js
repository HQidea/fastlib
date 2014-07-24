var request = require('request');
var settings = require('../settings.js');
var _time = require('./time.js');
var books = {};

var list = function(title, callback, next, fastCb) {
    var url = 'http://210.32.33.91:8080/opac/openlink.php';
    var query = '?strSearchType=title&match_flag=any&displaypg=100&strText=';
    var queryIntact = '?strSearchType=title&historyCount=1&doctype=ALL&match_flag=any&displaypg=100&sort=CATA_DATE&orderby=desc&showmode=list&dept=ALL&strText=';
    var page = next ? '&page=' + next : '';

    if (!next) {
        if (books[title]) {
            console.log('[list]', settings.error.locked);
            return callback && callback(settings.error.locked);
        }
        else {
            books[title] = [];
        }
    }

    _time('list_request', 0);
    request(url + query + title + page, function(err, res, body) {
        if (!err && res.statusCode === 200) {
            var i/*, time = +new Date()*/;

            _time('list_request', 1);
            _time('list_regex', 0);
            _time('list_regex_2', 0);
            var table = body.match(/<table[\s\S]*?<\/table>/);
            if (!table) {
                _time('list_regex', 1);
                _time('list_regex_2', 1);
                delete books[title];
                return callback && callback(settings.error.bookNotFound);
            }
            var trim = table[0].replace(/\s/g, '');
            var deUnicode = trim.replace(/&#(\w+);/g, function(match, unicode) {
                return String.fromCharCode(0 + unicode);
            });
            var items = deUnicode.match(/<tr><TD.*?<\/TD><\/tr>/g);

            for (i = 0; i < items.length; i++) {
                // regex: (?:<TD.*?>(.*?)<\/TD>)
                var each = items[i].match(/^<tr>(?:<TD.*?>(.*?)<\/TD>)(?:<TD.*?>(.*?)<\/TD>)(?:<TD.*?>(.*?)<\/TD>)(?:<TD.*?>(.*?)<\/TD>)(?:<TD.*?>(.*?)<\/TD>)(?:<TD.*?>(.*?)<\/TD>)<\/tr>$/);
                var split = each[2].match(/^<aclass.*?href="(.*?)">(.*?)<\/a>$/);
                books[title].push({
                    keyword: title,
                    /*update: time,*/
                    title: split[2],
                    detail: split[1],
                    author: each[3],
                    publisher: each[4],
                    callno: each[5],
                    doctype: each[6]
                });
            }
            _time('list_regex', 1);
            fastCb && fastCb(null, books[title]);

            var nextPage = body.match(/页.*?page=(\d+)/);
            _time('list_regex_2', 1);

            if (nextPage) {
                list(title, callback, nextPage[1]);
            }
            else {
                console.log('[LIST] count:', books[title].length);
                callback && callback(null, books[title]);
                delete books[title];
            }
        }
        else {
            console.log('[list] request error:', err || res.statusCode);
            callback && callback(settings.error.badRequest);
        }
    });
};


module.exports = {
    list: list
};