/*
jscom.metro.js
Copyright (C)2012 John Sedlak
http://github.com/jsedlak/jsMetro (Source, Readme & Licensing)
*/
//(function ($) {
//    if (!$.js) {
//        $.js = {
//            version: '2.0',
//            author: 'John Sedlak (kriscsc@msn.com)',
//            authorWebsite: 'http://johnsedlak.com',
//            website: 'https://github.com/jsedlak/jsMetro',
//        };
//    } else {
//        $.js.version = '2.0';
//    }

//    $(document).ready(function () {
//        log('[jscom.metro.js] Version: ' + $.js.version);

//        window.addEventListener(
//            'resize',
//            function (event) {
//                $.js.respondExecute(window.innerWidth, window.innerHeight);
//            },
//            false
//        );

//        $.js.respond(function () { log('respond!'); }, 400, 0);
//    });

//    // Gets the general purpose stack
//    $.js.getStack = function () {
//        var $body = $('body'),
//            stack = $body.data('actionstack');

//        if (!stack) {
//            stack = new ActionStack();
//            $body.data('actionstack', stack);
//        }

//        return stack;
//    };

    

//    $.js.respondExecute = function (width, height) {
//        var $that = $(this),
//            $body = $('body'),
//            callbackCarriers = $body.data('responsiveCallbacks');

//        if (callbackCarriers == null) {
//            return;
//        }

//        //log('[jscom.metro.js] width/height = ' + width + '/' + height);

//        for (var i = 0; i < callbackCarriers.length; i++) {
//            var carrier = callbackCarriers[i];

//            //log('[jscom.metro.js] checking carrier: ' + JSON.stringify(carrier));

//            if (width < carrier.width || height < carrier.height) {
//                carrier.callback(carrier.$target, width, height);
//            }
//        }
//    };

//    $.js.respond = function (callback, width, height) {
//        var $that = $(this),
//            $body = $('body'),
//            callbackCarriers = $body.data('responsiveCallbacks');

//        if (callbackCarriers == null) {
//            callbackCarriers = new Array();
//            $body.data('responsiveCallbacks', callbackCarriers);
//        }

//        callbackCarriers.push({
//            callback: callback,
//            width: width,
//            height: height,
//            $target: $that
//        });
//    };

//    $.fn.cloneTo = function (toSelector) {
//        var $this = $(this),
//            $to = $(toSelector);

//        $to.each(function () {
//            var $c = $this.clone(),
//                $toIndividual = $(this);

//            $c.appendTo($toIndividual);
//        });

//        return $this;
//    };

//    $.fn.isFullWidth = function () {
//        var $this = $(this);

//        var $parent = $this.parent();
//        var width = parseInt($this.css('width').replace('px', ''), 10) + 1;
//        var parentWidth = parseInt($parent.css('width').replace('px', ''), 10);
//        var percent = 100 * width / parentWidth;

//        return percent >= 100 || $this.css('width') == '100%' || (($this.css('width') == null || $this.css('width') == 'auto') && $this.css('display') == 'block');
//    };

//    function stickyTemplate($element) {
//        var original_offset = $element.offset();
//        var original_width = $element.isFullWidth() ? '100%' : $element.width();
//        var $parent = $element.parent();

//        return function () {
//            var scroll = $(window).scrollTop();

//            if (original_offset.top < scroll) {
//                $element.addClass('fixed').css('width', (original_width == '100%' ? $parent.width() : original_width) + 'px');
//            } else {
//                $element.removeClass('fixed').css('width', false);
//            }
//        };
//    };

//    $.fn.sticky = function () {
//        var $this = $(this),
//            update = function () {
//                $this.each(function () {
//                    var $ele = $(this);
//                    $ele.data('sticky-function')();
//                });
//            };

//        $this.each(function () {
//            var $ele = $(this);
//            $ele.data('sticky-function', stickyTemplate($ele));
//        });

//        $(window).scroll(update).resize(update);

//        return $this;
//    };

//    $.fn.measure = function (propName) {
//        return function () {
//            var $offscreen = $('<div style="visibility:hidden;" />'),
//                $clone = this.clone();

//            $clone.appendTo($offscreen);
//            $offscreen.appendTo($('body'));

//            var measurement = $clone[propName]();

//            $offscreen.remove();

//            return measurement;
//        };
//    };

//    $.fn.measureHeight = $.fn.measure('height');
//    $.fn.measureWidth = $.fn.measure('width');

//    /*
//     * Moves elements relative to background images / sizes
//     */
//    $.fn.updateResponsive = function () {
//        var $that = $(this);

//        var original_width = $that.data('width'),
//            original_height = $that.data('height'),
//            original_aspect = original_width / original_height;

//        var page_width = $that.width(),
//            page_height = $that.height(),
//            page_aspect = page_width / page_height;

//        var current_width = 0.0,
//            current_height = 0.0;

//        if (original_aspect >= 1) {
//            if (page_aspect < original_aspect) {
//                current_width = page_width;
//                current_height = current_width * original_height / original_width;
//            }
//            else {
//                current_height = page_height;
//                current_width = current_height * original_width / original_height;
//            }
//        }
//        else {
//            if (page_aspect < original_aspect) {
//                current_height = page_height;
//                current_width = current_height * original_width / original_height;
//            }
//            else {
//                current_width = page_width;
//                current_height = current_width * original_height / original_width;
//            }
//        }

//        var percent_width = current_width / original_width,
//            percent_height = current_height / original_height;

//        $that.find('[data-position="responsive"]').each(function () {
//            var $element = $(this),
//                element_left = $element.data('left'),
//                element_top = $element.data('top'),
//                leftOffset = 0.0,
//                topOffset = 0.0;

//            if (original_aspect > 1 && current_width < page_width) {
//                leftOffset = (page_width - current_width) / 2.0;
//            }

//            if (original_aspect < 1 && current_height < page_height) {
//                topOffset = (page_height - current_height) / 2.0;
//            }

//            $element
//                .css('top', ((percent_height * element_top) + topOffset) + 'px')
//                .css('left', ((percent_width * element_left) + leftOffset) + 'px');
//        });


//        return $that;
//    };

//    $.fn.resetForm = function () {
//        var $this = $(this);

//        $this.find('input:not([type="submit"]):not([type="button"])').val('');

//        return $this;
//    };

//    $.fn.bindFormToHtml = function ($parent) {
//        var $form = $(this),
//            $dataProps = $parent.find('[data-prop]'),
//            id = $parent.data('uid');

//        if (id) {
//            $form.append('<input type="hidden" name="Id" value="' + id + '" />');
//        }

//        $dataProps.each(function () {
//            var $prop = $(this),
//                name = $prop.data('prop'),
//                value = $prop.is('input') ? $prop.val() : $prop.html();

//            var $element = $form.find('input[name="' + name + '"]');

//            if ($element.is('input')) { $element.val(value); }
//            else { $element.html(value); }
//        });

//        return $form;
//    };
//}(jQuery));


(function (window, undefined) {
    // The version of jsMetro
    var version = new Version(2, 0, 0, 0);

    // Defines the js object
    var js = function (selector) {
        return new js.fn.init(selector);
    };

    js.fn = js.prototype = {
        init: function (selector) {
            this.version = version;
            this.author = "John Sedlak (JS)";
            this.authorWebsite = "http://johnsedlak.com";
            this.website = "https://github.com/jsedlak/jsMetro";
            try{
                this.$element = $(selector);
            } catch (ex) {
                this.$element = null;
            }
            this.target = selector;

            return this;
        },

        notify: function () {
            var that = this,
                msg = this.target,
                $body = $('body'),
                taskList = $body.dataEx('notify-task-list', function() { return new TaskList(); });

            if (null != this.$element && this.$element.length == 0) {
                msg = this.$element.html();
            }

            taskList.push(
                function (t) {
                    js().utils.log('notify open');

                    this.$element = $('<div data-role="toast" />');
                    this.$element.html(msg);
                    this.$element.appendTo($('body'));

                    var that = this;
                    setTimeout(
                        function () {
                            that.$element.addClass('active');
                            setTimeout(
                                function () {
                                    that.$element.removeClass('active');
                                    setTimeout(
                                        function () {
                                            that.$element.remove();
                                            t.close();
                                        }, 
                                        1000
                                    );
                                },
                                2500
                            );
                        },
                        100
                    );
                }
            );
        },

        measureHeight: measureHelper('height'),
        measureWidth: measureHelper('width')
    };  

    js.fn.utils = {
        log: function (msg) {
            console && console.log(msg);

            $(window).trigger('log', [msg, 'info']);

            return this;
        },

        error: function(error) {
            console && console.log(error);

            $(window).trigger('log', [error, 'error']);

            return this;
        },

        /*
         * Ensures that an element exists, is selectable and returns a length > 0. If it doesn't, the function provides the ability to create it on the fly.
         * Use: $.js.ensureElement([selector:string], [templateCallback:method])
         */
        ensureElement: function (selector, callback) {
            // Create the jQuery element
            var $element = $(selector);

            // Does it exist? If so, return it!
            if ($element && $element.length > 0) {
                return $element;
            }

            // Attempt to call the callback
            var cb = templateCallback;
            if (cb) {
                $element = cb();
            }

            return $element;
        },
        parsePadding: numberParserHelper(new Array('px', 'em', '%')),
        parseDuration: numberParserHelper(new Array({ input: 's', output: '', modifier: 1000 }, 'ms'))
    };

    /* Measures a property off screen - eg: measureHelper('width') -> function(){...} */
    function measureHelper(propName) {
        return function () {
            var $offscreen = $('<div style="visibility:hidden;" />'),
                $clone = this.$element.clone();

            $clone.appendTo($offscreen);
            $offscreen.appendTo($('body'));

            var measurement = $clone[propName]();

            $offscreen.remove();

            return measurement;
        };
    };

    /* Parses a number from a string, swapping out units (replacements: array) */
    function numberParserHelper(replacements) {
        return function (input) {
            var modifier = 1;
            var output = input;
            for (var i = 0; i < replacements.length; i++) {
                var replacement = replacements[i];

                if (null != replacement.input) {
                    output = output.replace(replacement.input, replacement.output);
                    if (null != replacement.modifier) modifier *= replacement.modifier;
                }
                else output = output.replace(replacement, '');
            }

            return parseFloat(output) * modifier;
        }
    };

    js.fn.init.prototype = js.fn;
    window.js = js;

    /* jQuery Functions */

    $.fn.measureHeight = measureHelper('height');
    $.fn.measureWidth = measureHelper('width');

    $.fn.cloneTo = function (toSelector) {
        var $this = $(this),
            $to = $(toSelector);

        $to.each(function () {
            var $c = $this.clone(),
                $toIndividual = $(this);

            $c.appendTo($toIndividual);
        });

        return $this;
    };

    $.fn.dataEx = function(key, callback){
        var o = this.data(key);

        if(null == o) {
            o = callback();
            this.data(key, o);
        }

        return o;
    };
})(window);

/* VERSION CLASS */
function Version(major, minor, build, revision) {
    /* Parses an array into an object - eg: "1.2.3.4" -> { major: 1, minor: 2, build: 3, revision: 4 } */
    var parseArray = function(propertyLookup, isValidCallback, parseCallback, splitCharacter) {
        return function (stringArray) {
            var data = stringArray.split(splitCharacter);
            for (var index = 0; index < propertyLookup.length; index++) {
                if (index >= data.length || null == isValidCallback || !isValidCallback(data[index])) {
                    break;
                }

                this[propertyLookup[index]] = parseCallback ? parseCallback(data[index]) : data[index];
            }
        }
    }

    this.major = major;
    this.minor = minor;
    this.build = build;
    this.revision = revision;

    this.toString = function () {
        return this.major.toString() + '.' + this.minor.toString() + '.' + this.build.toString() + '.' + this.revision.toString();
    };

    this.fromString = this.parse = parseArray(
        new Array("major", "minor", "build", "revision"),
        function (obj) {
            return !isNaN(obj);
        },
        function (obj) {
            return parseInt(obj, 10);
        },
        '.'
    );
}

/* TASKLIST CLASS */
function TaskList() {
    this.internalQueue = new Array();
    this.activeTask = null;
    this.fifo = true;
    this.automatic = true;
    this.checkOnNextPush = true;
};

TaskList.prototype = {
    push: function (openCallback) {
        var that = this,
            isTask = (typeof (openCallback).toString().toLowerCase() == 'task' || null != openCallback.openCallback),
            task = isTask ? openCallback : new Task(openCallback,  function (data) { that.onClosed(task, data); });

        that.internalQueue.push(task);

        // Do we check the list and process automatically?
        if (that.automatic || that.checkOnNextPush) {
            that.checkQueue();
        }
    },

    clear: function () {
        this.internalQueue = new Array();
    },

    checkQueue: function () {
        var that = this;

        if (that.activeTask != null) return;
        if (that.internalQueue.length == 0) return;

        if (!that.fifo) {
            that.activeTask = that.internalQueue.pop();
        } else {
            that.activeTask = that.internalQueue[0];
            that.internalQueue.splice(0, 1);
        }

        // Open the task
        if (that.activeTask) that.activeTask.open();
        else {
            // Do we check the list and process automatically?
            if (that.automatic) that.checkQueue();
        }
    },

    onClosed: function (task) {
        var that = this;

        that.activeTask = null;
        that.checkQueue();
    }
};

function Task(openCallback, closeCallback) {
    this.openCallback = openCallback;
    this.closeCallback = closeCallback;
};

Task.prototype = {
    open: function () {
        var that = this,
            cb = that.openCallback;

        if (null == cb) that.close();
        else cb(that);
    },

    close: function () {
        var that = this,
            cb = that.closeCallback;

        if (null != cb)
            cb(that);
    }
};