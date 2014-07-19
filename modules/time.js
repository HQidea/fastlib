module.exports = function() {
    var works = {};

    var start = function(process) {
        works[process] = {
            process: process,
            start: +new Date(),
            end: 'future'
        };
    };

    var stop = function(process) {
        works[process]['end'] = +new Date();
    };

    var log = function(process) {
        var info;
        if (typeof process !== 'undefined') {
            info = works[process];

            console.log('[TIME]', {
                process: info.process,
                start: info.start,
                end: info.end,
                delta: info.end - info.start,
                startF: new Date(info.start),
                endF: new Date(info.end)
            });
        }
        else {
            console.log('[TIME]', works);
        }
    };

    var del = function(process) {
        delete works[process];
    };

    return function() {
        var process = arguments[0];
        var status = arguments[1];

        if (typeof status !== 'undefined') {
            switch (status) {
                case 0:
                    start(process);
                    console.log('[TIME]', process + ' starts');
                    break;
                case 1:
                    stop(process);
                    log(process);
                    break;
                case -1:
                    del(process);
                    break;
            }
        }
        else {
            log(process);
        }
    };
}();