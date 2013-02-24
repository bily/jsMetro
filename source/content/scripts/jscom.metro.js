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
            website: 'https://github.com/jsedlak/jsMetro'
        };
    } else {
        $.js.version = '2.0';
    }

    /*
    * Provides theme support for the entire DOM or a single jQuery context
    * Use: $.js.theme(themeName)
    * Use: $.js.theme(themeName, jQuery)
    */
    $.js.theme = function (themeName, context) {
        var theme = '',
			elements = context ? context : $('html, body');

        elements.attr('data-theme', themeName);
    };

    $.js.ensureElement = function (selector, templateCallback) {
        var $element = $(selector);

        if ($element && $element.length > 0) {
            return $element;
        }

        $element = templateCallback();

        return $element;
    };

    $.js.ensureOverlay = function () {
        return $.js.ensureElement(
            '[data-role="overlay"]',
            function(){
                var $overlay = $('<div data-role="overlay" class="hidden" style="display:none;" />');
                $('body').append($overlay);

                return $overlay;
            }
        );
    };

    $.js.overlay = function (show, callback) {
        var $overlay = $.js.ensureOverlay();

        // Get the duration from CSS if we can... default to 1000ms.
        var duration = parseDuration($overlay.css('transition-duration'));
        log('[jscom.metro.js] overlay duration: ' + duration + 'ms');

        if (show) {
            $overlay
                .fadeIn(0)
                .removeClass('hidden');
        } else {
            $overlay
                .addClass('hidden')
                .delay(duration)
                .fadeOut(0);
        }

        setTimeout(function () {
            if (callback) { callback($overlay); }
        }, duration);
    };

    $.js.dialog = function (msg) {
        var $overlay = $.js.ensureOverlay(),
            $dialog = $.js.ensureElement(
                '[data-role="overlay"] [data-role="dialog"]',
                function () {
                    var $dialog = $('<div data-role="dialog" class="hidden" style="display:none;" />');

                    $overlay.append($dialog);

                    $(document).on(
                        'click',
                        '[data-role="dialog"] a',
                        function (event) {
                            event.preventDefault();

                            var duration = parseDuration($dialog.css('transition-duration'));

                            $dialog
                                .addClass('hidden')
                                .delay(duration)
                                .fadeOut(0);

                            setTimeout(function () { $.js.overlay(false); }, duration);
                        }
                    );

                    return $dialog;
                }
            );

        $dialog.html('<section>' + msg + '</section>');

        $.js.overlay(
            true,
            function (overlay) {
                $dialog.fadeIn(0).removeClass('hidden');
            }
        );
    }
}(jQuery));

function QueuedAction() {
    this.closedEvent = new Event();
};

function log(msg) {
    if (console && console.log) {
        console.log(msg);
    }
};

function parseDuration(cssDuration) {
    if (!cssDuration || cssDuration.length == 0) {
        return 1000;
    }

    if (cssDuration.indexOf('ms') > 0) {
        return parseInt(cssDuration.replace('ms'), 10);
    }

    return parseInt(cssDuration.replace('s'), 10) * 1000;
}

// Theme constants for easy access
var THEMES = {
    MAGENTA: 'magenta',
    PURPLE: 'purple',
    TEAL: 'teal',
    LIME: 'lime',
    BROWN: 'brown',
    PINK: 'pink',
    ORANGE: 'orange',
    BLUE: 'blue',
    RED: 'red',
    GREEN: 'green',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    JSCOM: 'jscom'
};

/* JS QUEUE CLASS */
function JSQueue() {
    this.internalQueue = new Array();
    this.activeItem = null;
};

JSQueue.prototype = {
    push: function (openCallback) {
        var that = this,
            qe = new JSQueuedEvent(openCallback);

        // Add the event handler for qhen the event has been finished
        qe.closed.addHandler(function (data) { that.onClosed(qe); });

        // Put it on the queue
        this.internalQueue.push(qe);

        // See if we can open it...
        this.checkQueue();
    },

    checkQueue: function () {
        var that = this;

        if (that.activeItem != null) {
            return;
        }

        that.activeItem = that.internalQueue.pop();

        // Let's see if there is an item to open...
        if (that.activeItem) {
            that.activeItem.open();
        }
    },

    onClosed: function (queuedEvent) {
        this.activeItem = null;
        this.checkQueue();
    }
};

function JSQueuedEvent(openCallback) {
    this.openCallback = openCallback;
    this.closed = new Event('JSQueuedEvent-closed');
}

JSQueuedEvent.prototype = {
    open: function () {
        var that = this,
            cb = that.openCallback;

        if (!cb) {
            that.close();
        } else {
            cb(that);
        }
    },

    close: function () {
        this.closed.invoke(this);
    }
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

/* ARRAY HELPERS */
Array.prototype.first = function (comparer, start) {
    if (start == null) {
        start = 0;
    }

    for (var i = start; i < this.length; i++) {
        if (comparer(this[i])) {
            return i;
        }
    }

    return -1;
};

Array.prototype.indexOf = function (obj, start) {
    if (obj == null) {
        return -1;
    }

    if (start == null) {
        start = 0;
    }

    for (var i = start; i < this.length; i++) {
        if (this[i] == obj) {
            return i;
        }
    }

    return -1;
};