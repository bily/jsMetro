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
            $body: null
        };
    } else {
        $.js.version = '2.0';
    }

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
    * Provides theme support for the entire DOM or a single jQuery context
    * Use: $.js.theme([themeName:string])
    * Use: $.js.theme([themeName:string], [context:jQuery Element])
    */
    $.js.theme = function (themeName, context) {
        var theme = '',
			elements = context ? context : $('html, body');

        elements.attr('data-theme', themeName);
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

    /*
     * Ensures that the overlay element exists, if not it is created and added to the DOM
     * Use: $.js.ensureOverlay();
     */
    $.js.ensureOverlay = function () {
        return $.js.ensureElement(
            '[data-role="overlay"]',
            function () {
                var $overlay = $('<div data-role="overlay" class="hidden" style="display:none;" />');
                $('body').append($overlay);

                return $overlay;
            }
        );
    };

    /*
     * Displays or Hides the overlay, calling a method after the transition has completed.
     * Use: $.js.overlay([show:bool], [callback:method])
     */
    $.js.overlay = function (show, callback) {
        var $overlay = $.js.ensureOverlay();

        // Get the duration from CSS if we can... default to 1000ms.
        var duration = parseDuration($overlay.css('transition-duration')),
            stackCount = $overlay.data('stack');

        if (stackCount == null) {
            stackCount = 0;
        }

        log('[jscom.metro.js] overlay duration: ' + duration + 'ms');

        if (show) {
            $overlay
                .fadeIn(0)
                .delay(100)
                .removeClass('hidden')
                .data('stack', stackCount + 1);
        } else {
            stackCount--;

            if (stackCount == 0) {
                $overlay
                    .addClass('hidden')
                    .delay(duration)
                    .fadeOut(0)
                    .data('stack', 0);
            }
        }

        setTimeout(function () {
            if (callback) { callback($overlay); }
        }, duration);
    };

    /*
     * Displays a dialog with some HTML. Calls a method (param: callback) when an anchor element is clicked.
     * Use: $.js.dialog([msg:string/jQuery Element], [callback:method])
     */
    $.js.dialog = function (msg, callback) {
        // Get the stack, we'll have to use it here
        var stack = $.js.getStack();

        // Push an action onto the stack
        stack.push(function (action) {
            // Get the overlay and dialog elements
            var $overlay = $.js.ensureOverlay(),
                $dialog = $.js.ensureElement(
                    '[data-role="overlay"] [data-role="dialog"]',
                    function () { var $dlg = $.js.dialogCreate(); $overlay.append($dlg); return $dlg; }
                );

            // Setup the HTML of the dialog
            var $section = $('<section class="clearfix" />');
            if (typeof msg == 'string') {
                $section.html(msg);
            } else {
                $(msg).appendTo($section);
            }

            $dialog.html('').append($section);

            // Add our custom callback - we want to close off the event
            // and then call the user's callback.
            $dialog.data(
                'dcallback',
                function (dlg, element, event) {
                    action.close();
                    if (callback) { callback(dlg, element, event); }
                }
            );

            // Start the overlay!
            $.js.overlay(
                true,
                function (overlay) {
                    $dialog.fadeIn(0).delay(100).removeClass('hidden');
                }
            );
        });
    };

    $.js.dialogCreate = function () {
        // DEBUG LOG
        log('[jscom.metro.js] creating dialog');

        // Create the jquery element
        var $dialog = $('<div data-role="dialog" class="hidden" style="display:none;" />');

        // Bind the event model
        $(document).on(
            'click',
            '[data-role="dialog"] a',
            function (event) {
                var $this = $(this);

                event.preventDefault();

                var duration = parseDuration($dialog.css('transition-duration'));

                $dialog.addClass('hidden').delay(duration).fadeOut(0);

                setTimeout(
                    function () {
                        // Unstack the overlay once
                        $.js.overlay(false);

                        // Call the callback if it exists
                        var callback = $dialog.data('dcallback');
                        if (callback) {
                            callback($dialog, $this, event);
                        }
                    },
                    duration
                );
            }
        );

        return $dialog;
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

function StackedAction() {
    this.closedEvent = new Event();
};

function log(msg) {
    if (console && console.log) {
        console.log(msg);
    }

    GlobalLog.log(msg);
};

GlobalLog = {
    callbacks: new Array()
};

GlobalLog.log = function (msg) {
    for (var i = 0; i < GlobalLog.callbacks.length; i++) {
        var cb = GlobalLog.callbacks[i];

        if (cb) {
            cb(msg);
        }
    }
};

GlobalLog.add = function (logHandler) {
    GlobalLog.callbacks.push(logHandler);
};

GlobalLog.remove = function (logHandler) {
    var cbData = GlobalLog.callbacks;

    cbData.splice(cbData.indexOf(logHandler), 1)

    GlobalLog.callbacks = cbData;
};

function parseDuration(cssDuration) {
    if (!cssDuration || cssDuration.length == 0) {
        return 1000;
    }

    if (cssDuration.indexOf('ms') > 0) {
        return parseFloat(cssDuration.replace('ms'), 10);
    }

    return parseFloat(cssDuration.replace('s'), 10) * 1000;
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
function ActionStack() {
    this.internalStack = new Array();
    this.activeItem = null;
};

ActionStack.prototype = {
    push: function (openCallback) {
        var that = this,
            qe = new Action(openCallback);

        // Add the event handler for qhen the event has been finished
        qe.closed.addHandler(function (data) { that.onClosed(qe); });

        // Put it on the stack
        this.internalStack.push(qe);

        // See if we can open it...
        this.checkStack();
    },

    checkStack: function () {
        var that = this;

        if (that.activeItem != null) {
            return;
        }

        that.activeItem = that.internalStack.pop();

        // Let's see if there is an item to open...
        if (that.activeItem) {
            that.activeItem.open();
        }
    },

    onClosed: function (stackedEvent) {
        this.activeItem = null;
        this.checkStack();
    }
};

function Action(openCallback) {
    this.openCallback = openCallback;
    this.closed = new Event('Action-closed');
}

Action.prototype = {
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