/*
jscom.metro.js
Copyright (C)2012 John Sedlak
http://github.com/jsedlak/jsMetro (Source, Readme & Licensing)
*/
(function ($) {
    if (!$.js) {
        $.js = {
            version: '2.0',
            author: 'John Sedlak (kriscsc@msn.com)',
            authorWebsite: 'http://johnsedlak.com',
            website: 'https://github.com/jsedlak/jsMetro',
        };
    } else {
        $.js.version = '2.0';
    }

    $(document).ready(function () {
        log('[jscom.metro.js] Version: ' + $.js.version);

        window.addEventListener(
            'resize',
            function (event) {
                $.js.respondExecute(window.innerWidth, window.innerHeight);
            },
            false
        );

        $.js.respond(function () { log('respond!'); }, 400, 0);
    });

    // Gets the general purpose stack
    $.js.getStack = function () {
        var $body = $('body'),
            stack = $body.data('actionstack');

        if (!stack) {
            stack = new ActionStack();
            $body.data('actionstack', stack);
        }

        return stack;
    };

    /*
     * Ensures that an element exists, is selectable and returns a length > 0. If it doesn't, the function provides the ability to create it on the fly.
     * Use: $.js.ensureElement([selector:string], [templateCallback:method])
     */
    $.js.ensureElement = function (selector, templateCallback) {
        var $element = $(selector);

        if ($element && $element.length > 0) {
            return $element;
        }

        // Attempt to call the callback
        var cb = templateCallback;
        if (cb) {
            $element = cb();
        }

        return $element;
    };

    $.js.respondExecute = function (width, height) {
        var $that = $(this),
            $body = $('body'),
            callbackCarriers = $body.data('responsiveCallbacks');

        if (callbackCarriers == null) {
            return;
        }

        //log('[jscom.metro.js] width/height = ' + width + '/' + height);

        for (var i = 0; i < callbackCarriers.length; i++) {
            var carrier = callbackCarriers[i];

            //log('[jscom.metro.js] checking carrier: ' + JSON.stringify(carrier));

            if (width < carrier.width || height < carrier.height) {
                carrier.callback(carrier.$target, width, height);
            }
        }
    };

    $.js.respond = function (callback, width, height) {
        var $that = $(this),
            $body = $('body'),
            callbackCarriers = $body.data('responsiveCallbacks');

        if (callbackCarriers == null) {
            callbackCarriers = new Array();
            $body.data('responsiveCallbacks', callbackCarriers);
        }

        callbackCarriers.push({
            callback: callback,
            width: width,
            height: height,
            $target: $that
        });
    };

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

    $.fn.isFullWidth = function () {
        var $this = $(this);

        var $parent = $this.parent();
        var width = parseInt($this.css('width').replace('px', ''), 10) + 1;
        var parentWidth = parseInt($parent.css('width').replace('px', ''), 10);
        var percent = 100 * width / parentWidth;

        return percent >= 100 || $this.css('width') == '100%' || (($this.css('width') == null || $this.css('width') == 'auto') && $this.css('display') == 'block');
    };

    function stickyTemplate($element) {
        var original_offset = $element.offset();
        var original_width = $element.isFullWidth() ? '100%' : $element.width();
        var $parent = $element.parent();

        return function () {
            var scroll = $(window).scrollTop();

            if (original_offset.top < scroll) {
                $element.addClass('fixed').css('width', (original_width == '100%' ? $parent.width() : original_width) + 'px');
            } else {
                $element.removeClass('fixed').css('width', false);
            }
        };
    };

    $.fn.sticky = function () {
        var $this = $(this),
            update = function () {
                $this.each(function () {
                    var $ele = $(this);
                    $ele.data('sticky-function')();
                });
            };

        $this.each(function () {
            var $ele = $(this);
            $ele.data('sticky-function', stickyTemplate($ele));
        });

        $(window).scroll(update).resize(update);

        return $this;
    };

    $.fn.measure = function (propName) {
        return function () {
            var $offscreen = $('<div style="visibility:hidden;" />'),
                $clone = this.clone();

            $clone.appendTo($offscreen);
            $offscreen.appendTo($('body'));

            var measurement = $clone[propName]();

            $offscreen.remove();

            return measurement;
        };
    };

    $.fn.measureHeight = $.fn.measure('height');
    $.fn.measureWidth = $.fn.measure('width');

    /*
     * Moves elements relative to background images / sizes
     */
    $.fn.updateResponsive = function () {
        var $that = $(this);

        var original_width = $that.data('width'),
            original_height = $that.data('height'),
            original_aspect = original_width / original_height;

        var page_width = $that.width(),
            page_height = $that.height(),
            page_aspect = page_width / page_height;

        var current_width = 0.0,
            current_height = 0.0;

        if (original_aspect >= 1) {
            if (page_aspect < original_aspect) {
                current_width = page_width;
                current_height = current_width * original_height / original_width;
            }
            else {
                current_height = page_height;
                current_width = current_height * original_width / original_height;
            }
        }
        else {
            if (page_aspect < original_aspect) {
                current_height = page_height;
                current_width = current_height * original_width / original_height;
            }
            else {
                current_width = page_width;
                current_height = current_width * original_height / original_width;
            }
        }

        var percent_width = current_width / original_width,
            percent_height = current_height / original_height;

        $that.find('[data-position="responsive"]').each(function () {
            var $element = $(this),
                element_left = $element.data('left'),
                element_top = $element.data('top'),
                leftOffset = 0.0,
                topOffset = 0.0;

            if (original_aspect > 1 && current_width < page_width) {
                leftOffset = (page_width - current_width) / 2.0;
            }

            if (original_aspect < 1 && current_height < page_height) {
                topOffset = (page_height - current_height) / 2.0;
            }

            $element
                .css('top', ((percent_height * element_top) + topOffset) + 'px')
                .css('left', ((percent_width * element_left) + leftOffset) + 'px');
        });


        return $that;
    };

    $.fn.resetForm = function () {
        var $this = $(this);

        $this.find('input:not([type="submit"]):not([type="button"])').val('');

        return $this;
    };

    $.fn.bindFormToHtml = function ($parent) {
        var $form = $(this),
            $dataProps = $parent.find('[data-prop]'),
            id = $parent.data('uid');

        if (id) {
            $form.append('<input type="hidden" name="Id" value="' + id + '" />');
        }

        $dataProps.each(function () {
            var $prop = $(this),
                name = $prop.data('prop'),
                value = $prop.is('input') ? $prop.val() : $prop.html();

            var $element = $form.find('input[name="' + name + '"]');

            if ($element.is('input')) { $element.val(value); }
            else { $element.html(value); }
        });

        return $form;
    };
}(jQuery));


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
            this.$element = $(selector);

            return this;
        },

        measureHeight: measureHelper('height'),
        measureWidth: measureHelper('width')
    };

    js.fn.init.prototype = js.fn;
    window.js = js;
})(window);

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

/* Parses an array into an object - eg: "1.2.3.4" -> { major: 1, minor: 2, build: 3, revision: 4 } */
function parseArray(propertyLookup, isValidCallback, parseCallback, splitCharacter) {
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

/* VERSION CLASS */
function Version(major, minor, build, revision) {
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

/* EVENT CLASS */
function Event(name) {
    this.name = name;
    this.handlers = new Array();
}

Event.prototype = {
    /* Adds a callback to the event
        Use: myevent.addHandler(foo);
    */
    addHandler: function (handler) {
        this.handlers.push(handler);
    },

    /* Removes a callback from the event
        Use: myevent.removeHandler(foo);
    */
    removeHandler: function (handler) {
        var data = this.handlers;

        data.splice(data.indexOf(handler), 1);

        this.handlers = data;
    },

    /* Invokes the event
        Use: myevent.invoke(event);
    */
    invoke: function (data) {
        var eventArgs = new EventArgs(data);

        log('' + this.name + '.invoke -> Found ' + this.handlers.length + ' handlers.');

        for (var i = 0; i < this.handlers.length; i++) {
            var handler = this.handlers[i];

            if (handler == null) {
                continue;
            }

            handler(data, eventArgs);

            if (eventArgs.isHandled) {
                break;
            }
        }
    }
}

function EventArgs(data) {
    this.isHandled = false;
    this.data = data;
}