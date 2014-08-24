(function() {
    var eventHandler = function(event, handler) {
        this.addEventListener(event, handler);
        return this;
    };
    try {
        EventTarget.prototype.on = eventHandler;
    }
    catch (err) {
        Element.prototype.on = eventHandler;
        document.on = eventHandler;
        window.on = eventHandler;
    }
    NodeList.prototype.on = function(event, handler) {
        var i, len = this.length;
        for (i = 0; i < len; i++) {
            this[i].on(event, handler);
        }
        return this;
    };
    Node.prototype.addClass = function(className) {
        this.classList.add(className);
        return this;
    };
    Node.prototype.removeClass = function(className) {
        this.classList.remove(className);
        return this;
    };
    Node.prototype.toggleClass = function(className) {
        this.classList.toggle(className);
        return this;
    };
    Node.prototype.hasClass = function(className) {
        return this.classList.contains(className);
    };
    Node.prototype.show = function() {
        this.removeClass('hide');
        return this;
    };
    Node.prototype.hide = function() {
        this.addClass('hide');
        return this;
    };

    var $ = function(elem) {
        return document.querySelector(elem);
    };
    var $$ = function(elem) {
        return document.querySelectorAll(elem);
    };
    $.ajax = function(options, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.url);
        xhr.onreadystatechange = function() {
            var retVal;
            if (xhr.readyState === 4) {
                try {
                    retVal = JSON.parse(xhr.responseText);
                }
                catch (err) {
                    retVal = xhr.responseText;
                }
                callback && callback(xhr.status, retVal);
            }
        };
        xhr.send(options.data || null);
    };


    var fastLib = function() {
        var queryUrl, bookTitle, nextPage, loading = false;
        var init = function() {
            listen();
        };
        var listen = function() {
            window.on('hashchange', function() {
                var hash = location.hash;
                switch (hash) {
                    case '#!list':
                        $('.search').hide();
                        $('.result').show();
                        $('.input-title').value = '';
                        break;
                    default:
                        $('.search').show();
                        $('.result').hide();
                        // $('.input-header').value = '';
                        break;
                }
            });
            document.on('scroll', function() {
                var clHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
                var scHeight = document.documentElement.scrollHeight;
                var scTop = document.documentElement.scrollTop || window.scrollY;
                /*alert(clHeight);
                alert(scTop);
                alert(scHeight);*/
                if (clHeight + scTop >= scHeight && !loading) {
                    loading = true;
                    $('.js-more').show();
                    loadMore(bookTitle, nextPage);
                }
            });
            $$('.js-query').on('submit', function(e) {
                e.preventDefault();
                var $inTit = $('.input-title');
                var $inHea = $('.input-header');
                var title = $inTit.value.trim() || $inHea.value.trim();
                if (!title) {
                    return;
                }

                queryUrl = this.action;
                $inTit.blur();
                $inHea.blur();
                $('.btn-search p').hide();
                $('.btn-search .loading').show();
                $('.overlay').show();
                $.ajax({
                    method: 'GET',
                    url: queryUrl + title
                }, function(status, data) {
                    if (typeof(data) !== 'object') {
                        return;
                    }

                    location.hash = '!list';
                    // $('.input-title').value = title;
                    $('.input-header').value = title;
                    if (status === 200 || status === 304) {
                        $('.books ol').innerHTML = loadBooks(data);
                        $('.notfound').hide();
                        bookTitle = title;
                        nextPage = 2;
                    }
                    else if (status === 404) {
                        $('.books ol').innerHTML = '';
                        $('.notfound').show();
                    }
                    $('.btn-search p').show();
                    $('.btn-search .loading').hide();
                    $('.overlay').hide();
                    $('.nomore').hide();
                    loading = false;
                });
            });
            $('.input-header').on('focus', function() {
                $('.form-header').addClass('focus');
            });
            $('.input-header').on('blur', function() {
                $('.form-header').removeClass('focus');
            });
        };
        var loadMore = function(title, page) {
            if (!title) {
                loading = false;
                return;
            }
            console.log(title, page);
            $.ajax({
                method: 'GET',
                url: queryUrl + title + '?page=' + page
            }, function(status, data) {
                $('.js-more').hide();
                if (status === 200 || status === 304) {
                    if (!data.length) {
                        $('.nomore').show();
                        return;
                    }
                    else {
                        $('.books ol').innerHTML += loadBooks(data);
                        nextPage++;
                    }
                }
                loading = false;
            });
        };
        var loadBooks = function(data) {
            var i, len = data.length, html = '', book;
            for (i = 0; i < len; i++) {
                book = data[i];
                html += '<li>'
                      + '<article class="col-xs-8">'
                      + '<h3 class="title">' + book.title + '</h3>'
                      + '<p class="author">' + book.author + '</p>'
                      + '<p class="publisher">' + book.publisher + '</p>'
                      + '</article>'
                      + '<aside class="col-xs-4">'
                      + '<p class="callno">' + book.callno + '</p>'
                      + '<p class="doctype">' + book.doctype + '</p>'
                      + '</aside>'
                      + '</li>';
            }
            return html;
        }

        return {
            init: init
        };
    }();
    fastLib.init();
})();