(function ($) {
    function bindEventTemplate(name) {
        return function (func) {
            var $this = $(this);
            $this.on(name, func);
            return $this;
        }
    };

    function isTemplate(selector) {
        return function () {
            var $this = $(this);
            
            return $this.is(selector);
        };
    };

    $.fn.isPage = isTemplate('[data-role="page"]');
    $.fn.pageLoad = bindEventTemplate('jsapp-pageload');
    $.fn.pageRun = bindEventTemplate('jsapp-pagerun');

    function JsApp() {
        var that = this;

        this.$body = $('body');
        this.$document = $(document);
        this.version = '1.0.0.0';
        this.$currentPage = null;
        this.$lastPage = null;

        this.callbacks = {
            transitionToPage: function ($last, $next) {
                that.transitionToPage($last, $next);
            }
        };

        this.bindEvents();
    };

    JsApp.prototype = {
        changePage: function (selector) {
            var that = this;

            // Bad selector? return!
            if (null == selector) {
                return false;
            }

            var $element = null;

            // If it is a string, find the element!
            if (typeof (selector).toString().toLowerCase() === 'string') {
                $element = $(selector).eq(0);
            }
            else {
                $element = selector.eq(0);
            }

            if (null == $element || $element.length == 0) {
                return false;
            }

            that.$lastPage = that.$currentPage;
            that.$currentPage = $element;

            var isLoaded = that.$currentPage.data('isloaded') == true;
            if (!isLoaded) {
                that.$currentPage.trigger({
                    type: "jsapp-pageload"
                });
                that.$currentPage.data('isloaded', true);
            }

            var href =  '#' + $element.attr('id');
            window.history && window.history.pushState({ href: href }, '', href);

            //that.transitionToPage($element);
            var cb = that.callbacks.transitionToPage;
            cb && cb(that.$lastPage, that.$currentPage, function ($last, $next) { that.transitionToPage($last, $next); });

            that.$currentPage.trigger({
                type: "jsapp-pagerun"
            });

            return true;
        },

        changePageFromHash: function (hash) {
            var $hash = $(hash);

            if (null != $hash && $hash.length > 0) {
                if ($hash.isPage()) {
                    $.js.app.changePage($hash);
                } else {
                    $.js.app.changePage($hash.parents('[data-role="page"]'));
                    window.location.hash = hash;
                }

                return true;
            }

            return false;
        },

        transitionToPage: function ($last, $next) {
            log('[JsApp.transitionToPage] I\'ve been called.');

            var that = this;

            var lastIndex = null == $last ? -1 : $last.index('[data-role="page"]'),
                nextIndex = $next.index('[data-role="page"]');

            // Same page? Then no transition!
            if (lastIndex == nextIndex) {
                return;
            }

            log('[JsApp.transitionToPage] nextIndex = ' + nextIndex);
            log('[JsApp.transitionToPage] lastIndex = ' + lastIndex);

            if (nextIndex > lastIndex) {
                var $last = that.$lastPage;
                that.$lastPage && that.$lastPage.animate({ 'left': '-100%' }, function () { $last.removeClass('active'); });
                that.$currentPage.css('left', '100%').addClass('active');

                setTimeout(function () {
                    that.$currentPage.animate({ 'left': '0px' });
                }, 10);
            }
            else {
                that.$lastPage && that.$lastPage.animate({ 'left': '100%' }, function () { $last.removeClass('active'); });
                that.$currentPage.css('left', '-100%').addClass('active');
                
                setTimeout(function () {
                    that.$currentPage.animate({ 'left': '0px' });
                }, 10);
            }
        },

        bindEvents: function () {
            var that = this;

            window.addEventListener('popstate', function (event) {
                console.log('popstate fired!');

                //updateContent(event.state);
                if (event.state && event.state.href) {
                    that.changePage(event.state.href);
                }
            });


            that.$document.on(
                'click.jsapp', // Namespace = .jsapp
                'a[href^="#"]',
                function foo(event) {
                    var $this = $(this),
                        href = $this.attr('href'),
                        $element = $(href);

                    if (null == $element || $element.length == 0 || $element.eq(0).is('[data-role="page"]') == false) {
                        return;
                    }

                    event.preventDefault();
                    that.changePage(href);
                }
            );
        },

        dispose: function () {
            var that = this;

            // Remove all namespaced events
            that.$document.off('.jsapp');
        }
    };

    if (null == $.js) {
        $.js = {};
    }

    $.js.app = new JsApp();
}(jQuery));