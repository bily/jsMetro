/*
jscom.metro-tools.js
Copyright (C)2012 John Sedlak
http://github.com/jsedlak/jsMetro (Source, Readme & Licensing)
*/
(function ($) {
    "use strict";

    if (!$.js) {
        $.js = {
            version: '1.2.8',
            author: 'John Sedlak (kriscsc@msn.com)',
            authorWebsite: 'http://johnsedlak.com',
            website: 'https://github.com/jsedlak/jsMetro'
        };
    } else {
        $.js.version = '1.2.8';
    }

    $.js.themes = ['magenta', 'purple', 'teal', 'lime', 'brown', 'pink', 'orange', 'blue', 'red', 'green'];

    /*
    * THEME
    * Author: John Sedlak
    * Created: 2012-02-10
    * Use: $.js.theme(themeName)
    */
    $.js.theme = function (themeName) {
        var theme = '',
			bodyElement = $('body'),
			htmlElement = $('html');

        for (var i = 0; i < $.js.themes.length; i++) {
            theme = $.js.themes[i];

            if (bodyElement.hasClass(theme)) {
                bodyElement.removeClass(theme);
                htmlElement.removeClass(theme);
            }
        }

        bodyElement.addClass(themeName);
        htmlElement.addClass(themeName);
    };

    /*
    * POPNOTIFY
    * Author: John Sedlak
    * Created: 2012-08-02
    * Use: $.js.popNotify(message, options)
    */
    $.js.popNotify = function (message, options) {
        var bodyElement = $('body');

        var controller = bodyElement.data('jscom.PopNotifyController');
        if (controller == null) {
            controller = new PopNotifyController();
            bodyElement.data('jscom.PopNotifyController', controller);
        }

        if (message != null && message.length > 0) {
            controller.enqueue(message, options);
        }

        return controller;
    };

    function PopNotifyController() {
        var that = this;

        var internalUpdate = function () {
            if (that.timerId != null) {
                clearTimeout(that.timerId);
                that.timerId = setTimeout(internalUpdate, 100);
            }

            that.update();
        };

        this.messageQueue = new Array();
        this.activeQueue = new Array();
        this.timerId = setTimeout(internalUpdate, 100);
        this.counter = 0;

        // Make sure we close the notifications
        $('.notification .close').live(
            'click',
            function (event) {
                event.preventDefault();
                that.close_clicked(event, $(this), that);
            }
        );
    };

    PopNotifyController.prototype = {
        enqueue: function (message, options) {
            var that = this,
                currentCount = that.counter;

            that.counter += 1;

            // Setup the default settings & options
            var defaults = {
                message: message,
                cssClass: '',
                duration: 5000,
                target: $('<div class="notification" data-uid="' + currentCount + '"><a href="#" class="close cancel lonely white icon"><!--close--></a><p>' + message + '</p></div>')
            };

            // Load the option values ontop of the defaults
            var settings = $.extend(
                {},
                defaults,
                options
            );

            this.messageQueue.push(settings);

            if (this.activeQueue.length < 5) {
                this.dequeue();
            }
        },

        dequeue: function () {
            // Are there no messages to pop?
            if (this.messageQueue.length == 0) {
                return;
            }

            var msg = this.messageQueue.shift();

            this.activeQueue.push(msg);

            var index = this.activeQueue.length - 1;

            msg.target.css('top', 130 * index + 20 * this.activeQueue.length + 'px');

            $('body').append(msg.target);
            
            //msg.target.delay(1250).addClass('active');
            setTimeout(function() { msg.target.addClass('active'); }, 1);
        },

        update: function () {
            var that = this;

            for (var i = that.activeQueue.length - 1; i >= 0; i--) {
                var msg = that.activeQueue[i];
                msg.duration = msg.duration - 100;

                if (msg.duration < 0) {
                    that.removeAt(i);
                }
            }
        },

        removeAt: function (i) {
            var that = this,
                msg = that.activeQueue[i];

            that.activeQueue.splice(i, 1);

            msg.target.fadeOut(250, function () { msg.target.remove(); });
            for (var k = i; k < that.activeQueue.length; k++) {
                that.activeQueue[k].target.css('top', (that.activeQueue[k].target.offset().top - 150) + 'px'); //animate({ top: '-=150' });
            }

            if (that.activeQueue.length < 5) {
                that.dequeue();
            }
        },

        close_clicked: function (event, anchor, controller) {
            event.preventDefault();

            var parent = anchor.parents('.notification');

            controller.removeAt(
                controller.activeQueue.first(function (obj) {
                    return obj.target.data('uid') == parent.data('uid');
                })
            );
        }
    };


    /*
    * DIALOG
    * Author: John Sedlak
    * Created: 2012-02-10
    * Use: $.js.dialog(options)
    */
    $.js.dialog = function (message, options) {
        var bodyElement = $('body');

        var controller = bodyElement.data('jscom.DialogController');
        if (controller == null) {
            controller = new DialogController();
            bodyElement.data('jscom.DialogController', controller);
        }

        if (message != null && message.length > 0) {
            controller.enqueue(message, options);
        }

        return controller;
    };

    function DialogController(options) {
        // Helper elements & variables
        var bodyElement = $('body'),
			that = this;

        var dialogElement = bodyElement.find('#JSDialog');
        if (dialogElement == null || dialogElement.length <= 0) {
            bodyElement.append('<div id="JSDialog"><div class="dialog-panel"><div class="dialog-content"></div><div class="dialog-buttons"></div></div></div>');
        }

        this.dialogElement = bodyElement.find('#JSDialog');
        this.panelElement = $('#JSDialog .dialog-panel');
        this.buttonsElement = $('#JSDialog .dialog-buttons');
        this.contentElement = $('#JSDialog .dialog-content');
        this.messageQueue = new Array();
        this.activeMessage = null;
        this.timerId = null;

        $('#JSDialog .dialog-buttons a').live(
			'click',
			function (event) {
			    event.preventDefault();

			    that.buttonClicked($(this), event);
			}
		);

        $('body').keydown(function (event) {
            // Check for escape key
            if (event.keyCode == 27) {
                that.dialogElement.removeClass('visible');
            }
        });
    };

    DialogController.prototype = {
        enqueue: function (message, options) {
            /* Setup the settings & options */
            var defaults = {
                defaultClassString: 'button ',
                buttons: ['Okay'],
                buttonClasses: [''],
                callbacks: [null],
                html: '',
                message: message
            };

            // Extend with the provided options
            var settings = $.extend(
				{},
				defaults,
				options
			);

            // Build the button HTML
            var html = '';
            for (var i = 0; i < settings.buttons.length; i++) {
                html += '<a href="#" class="' + settings.defaultClassString + settings.buttonClasses[i] + '">' + settings.buttons[i] + '</a>&nbsp;';
            }
            settings.html = html;

            this.messageQueue.push(settings);

            if (this.messageQueue.length == 1 && this.timerId == null && !this.dialogElement.hasClass('visible')) {
                this.dequeue();
            }
        },

        dequeue: function () {
            if (this.timerId != null) {
                clearTimeout(this.timerId);
                this.timerId = null;
            }

            if (this.messageQueue.length == 0) {
                return;
            }

            var settings = this.messageQueue.shift();

            this.activeMessage = settings;
            this.contentElement.html(settings.message);
            this.buttonsElement.html(settings.html);

            this.dialogElement.addClass('visible');

            // Try to focus on the first input element
            var inputElement = this.dialogElement.find('input:eq(0)');
            if (inputElement != null && inputElement.length > 0) {
                inputElement.first().focus();
            }
        },

        buttonClicked: function (button, event) {
            var that = this;

            this.dialogElement.removeClass('visible');

            this.timerId = setTimeout(function () { that.dequeue(); }, 1000);

            var msg = this.activeMessage;

            // TODO: Find a better way to do this.
            // Finds the index of the button and calls the appropriate callback if it exists
            for (var i = 0; i < msg.buttons.length; i++) {
                if (msg.buttons[i] == button.html()) {
                    if (msg.callbacks != null) {
                        var callback = msg.callbacks[i];
                        if (callback != null) {
                            callback(this, button, event);
                        }
                    }

                    break;
                }
            }
        }

    };

    /* SCROLLTO
    * Author: John Sedlak
    * Created: 2012-02-08
    * Use: $(selector).scrollTo()
    */
    $.fn.scrollTo = function (options) {
        var bodyElement = $('body');

        var controller = bodyElement.data('jscom.ScrollToController');
        if (controller == null) {
            controller = new ScrollToController();
            bodyElement.data('jscom.ScrollToController', controller);
        }

        controller.scrollTo(this, options);

        return controller;
    };

    function ScrollToController() {
        this.destination = 0; // The destination
        this.target = null; 	// The element we are scrolling to
        this.timerId = null; // Used to clear the timeout		
        this.last = new Date(); // Storage of last update
        this.time = 5; 		// The limit of the timer
        this.count = 0; 		// The current timer counter
        this.total = 0; 		// The total amount of movement in pixels
        this.original = 0; 	// The scroll position we are coming from
    }

    ScrollToController.prototype = {

        scrollTo: function (element, options) {
            /* Setup the settings & options */
            var defaults = {
                offset: element.offset().top, // - element.height(), 
                extraOffset: 0,
                target: null,
                time: 5
            };

            var settings = $.extend(
				{},
				defaults,
				options
			);


            var that = this;

            // Clear the timer if we haven't yet
            if (this.timerId != null) {
                clearTimeout(this.timerId);
            }

            // Setup the variables
            this.destination = settings.offset + settings.extraOffset;
            this.target = settings.target;
            this.time = settings.time;
            this.original = $(window).scrollTop();
            this.total = this.destination - this.original;
            this.last = new Date();
            this.count = 0;

            /*
            alert(
            'original: ' + this.original
            + '\ntotal: ' + this.total
            + '\ndestination: ' + this.destination
            );
            */

            // Start the scroll
            this.timerId = setTimeout(
				function () {
				    that.update();
				},
				16
			);
        },

        update: function () {
            var newTime = new Date(),
				delta = (newTime - this.last) / 100.0,
				that = this;

            this.last = newTime;
            this.count = this.count + delta;

            var percent = this.count / this.time;
            if (percent > 1) {
                percent = 1;
            }

            //$('body').scrollTop(percent * this.total + this.original);
            $(window).scrollTop(percent * this.total + this.original);

            clearTimeout(this.timerId);

            if (percent < 1) {
                this.timerId = setTimeout(
					function () {
					    that.update();
					},
					16
				);
            }
        }
    };

    $.fn.columnize = function (options) {
        $(this).each(function () {
            var that = $(this);

            var defaults = {
                separator: 'h1, h2, h3, h4, h5, h6, .header',
                gap: 0
            };

            var settings = $.extend(
			    {},
			    defaults,
			    options
		    );

            var count = that.find(settings.separator).length;
            var gapCount = count - 1;
            var width = (that.width() - gapCount * settings.gap) * 1.0 / count;

            var newWrap = $('<div/>');

            that.find(settings.separator).each(function () {
                var sep = $(this),
				all = sep.nextUntil(settings.separator);

                var newCol = $('<div class="column"></div>');
                newCol.append(sep.clone());
                newCol.append(all.clone());

                sep.remove();
                all.remove();

                newWrap.append(newCol);
            });

            that.append(newWrap.html());
            $('head').append('<style>.column { float: left; width: ' + width + 'px; margin-right: ' + settings.gap + 'px; } .column.last { margin-right: 0px; }</style>');
            that.append('<div class="clear"><!--clear--></div>');

            that.find('.column:last').addClass('last');
        });
    };

    /* COLLAPSIBLE
    * Author: John Sedlak
    * Created: 2012-02-07
    * Use: $(selector).collapsible(options)
    */
    $.fn.collapsible = function (options) {
        /* Setup the settings & options */
        var defaults = {
            collapsibleSelector: '.collapsible',
            toggleSelector: '>a',
            hidden: null,
            visible: null,
            time: 250,
            easing: 'linear',
            autoCollapse: true,
            parentSelector: this.selector
        };

        var settings = $.extend(
			{},
			defaults,
			options
		);

        if (settings.autoCollapse) {
            this.find(settings.collapsibleSelector).addClass('collapsed').slideUp(0);
        }

        var handleToggleSwitch = function (element, toggle) {
            var collapsible = element,
				parent = collapsible.parents(settings.parentSelector);

            if (collapsible.hasClass('collapsed')) {
                collapsible.slideUp(
					settings.time,
					settings.easing,
					function () {
					    if (settings.hidden) {
					        settings.hidden(parent, toggle);
					    }
					}
				);
            }
            else {
                collapsible.slideDown(
					settings.time,
					settings.easing,
					function () {
					    if (settings.visible) {
					        settings.visible(parent, toggle);
					    }
					}
				);
            }
        };

        return this.each(function () {
            var that = $(this),
				elements = that.find(settings.toggleSelector);

            that.find(settings.collapsibleSelector).each(function () {
                var collapsible = $(this);
                var toggle = collapsible.parents(settings.parentSelector).find(settings.toggleSelector);

                handleToggleSwitch(collapsible, toggle);
            });

            elements.click(function (event) {
                event.preventDefault();

                var toggle = $(this);
                var collapsibles = toggle.parents(settings.parentSelector).find(settings.collapsibleSelector);

                collapsibles
					.toggleClass('collapsed')
					.each(function () {
					    handleToggleSwitch($(this), toggle);
					});
            });
        });
    };

    /* NOTIFY
    * Author: John Sedlak
    * Created: 2012-02-06
    * Use: $.js.notify(message, options)
    */
    $.js.notify = function (message, options) {

        var bodyElement = $('body');

        var controller = bodyElement.data('jscom.NotifyController');
        if (controller == null) {
            controller = new NotifyController(options);
            bodyElement.data('jscom.NotifyController', controller);
        }

        if (message != null && message.length > 0) {
            controller.notify(message, options);
        }

        return controller;
    };

    function NotifyController(options) {
        // Helper elements & variables
        var bodyElement = $('body'),
			that = this;

        var notificationElement = bodyElement.find('#JSNotification');

        if (notificationElement == null || notificationElement.length <= 0) {
            bodyElement.append('<div id="JSNotification"></div>');
            notificationElement = bodyElement.find('#JSNotification');
            notificationElement.html('<p></p><div class="progress"><!--progress--></div>');
        }

        this.updateSettings(options);

        this.target = notificationElement;
        this.timer = null;
        this.timestamp = 0;

        this.target.hover(
			function () {
			    $(this).addClass('mouse-over');
			},
			function () {
			    $(this).removeClass('mouse-over'); that.onMouseOut();
			}
		);

        this.target.every(1, 0, function () {
            that.update();
        });
    };

    NotifyController.prototype = {

        updateSettings: function (options) {
            /* Setup the settings & options */
            var defaults = {
                timeout: 4000,
                cssClass: 'default'
            };

            var settings = $.extend(
				{},
				defaults,
				options
			);

            this.timeout = settings.timeout;
            this.cssClass = settings.cssClass;
        },

        notify: function (message, options) {
            if (this.timer != null) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.target.attr('class', '');
            this.updateSettings(options);

            var timestamp = new Date();

            this.target.find('p').html(
				'<span class="datestamp">' +
				timestamp.format("h:MM:ss TT").toString() +
				'</span><span class="message">' +
				message +
				'</span>'
			);
            this.timestamp = timestamp;
            this.target.addClass('active').addClass(this.cssClass);


            var that = this;
            this.timer = setTimeout(
				function () {
				    that.close();
				},
				this.timeout
			);
        },

        update: function () {
            if (this.target.hasClass('mouse-over')) {
                this.timestamp = new Date();

                return;
            }

            var time = new Date();
            var delta = time - this.timestamp;

            var percent = (delta / this.timeout * 100).toFixed(0);
            if (percent > 100) {
                percent = 100;
            }

            this.target.find('.progress').css('width', percent.toString() + '%');
        },

        onMouseOut: function () {
            if (this.timer != null) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            var that = this;
            this.timer = setTimeout(
				function () {
				    that.close();
				},
				this.timeout
			);

            this.timestamp = new Date();
        },

        close: function () {
            if (this.target.hasClass('mouse-over')) {
                return;
            }

            this.target.removeClass('active'); //.removeClass(this.cssClass);
        }
    };

    /* EVERY
    * Author: John Sedlak
    * Created: 2012-02-06
    * Use: $(selector).every(interval, pause, callback, [id])
    */
    $.fn.every = function (interval, pauseInterval, callback, id) {
        if (id == null) {
            id = '';
        }

        var controller = this.data('jscom.EveryController-' + id);

        if (controller == null) {
            controller = new EveryController(this, interval, pauseInterval, callback);

            this.data('jscom.EveryController-' + id, controller);
        }

        controller.init();

        return controller;
    };

    function EveryController(element, interval, pauseInterval, callback) {
        this.element = element;
        this.interval = interval;
        this.pauseInterval = pauseInterval;
        this.callback = callback;

        this.timerId = null;
    }

    EveryController.prototype = {
        init: function () {
            this.reset();
        },

        reset: function () {
            // Clear the timer
            clearTimeout(this.timerId);

            var that = this;

            // Wait for a bit...
            this.timerId = setTimeout(function () { that.timeOut(); }, this.interval);
        },

        timeOut: function () {
            // Reset the timer and perform the callback
            clearTimeout(this.timerId);
            if (this.callback) {
                this.callback();
            }

            // Setup the delay (adjust for animation)
            var that = this;
            this.timerId = setTimeout(
				function () {
				    that.reset();
				},
				this.pauseInterval
			);
        }
    };

    /*
    * ARRAY FUNCTIONS
    * Author: John Sedlak
    * Created: 2012-08-02
    */
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

})(jQuery);
