(function ($) {
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
            var $section = $('<section class="clearfix"/>');
            if (typeof msg == 'string') {
                $section.html(msg);
            } else {
                $(msg).appendTo($section);
            }

            $dialog.html('').append($section);

            // Get the height of the dialog, adding in the padding for the section element
            var heightOffset = parsePadding($section.css('padding-top')) + parsePadding($section.css('padding-bottom'));
            var height = $section.measureHeight() + heightOffset + 15;
            if (height > (0.5 * window.innerHeight)) {
                log('[jscom.metro.js] calculated height is too big: ' + height + ' vs. ' + (0.5 * window.innerHeight).toString());
                height = 0.5 * window.innerHeight;
            }

            log('[jscom.metro.js] height of dialog: ' + height);
            log('[jscom.metro.js] height offset: ' + heightOffset);

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
                    //$dialog.fadeIn(0).delay(100);
                    //setTimeout(function () { $dialog.removeClass('hidden'); }, 100);
                    $dialog.fadeIn(0).animate({ marginTop: height / -2, height: height });
                }
            );
        });
    };

    $.js.dialogCreate = function () {
        // DEBUG LOG
        log('[jscom.metro.js] creating dialog');

        // Create the jquery element
        var $dialog = $('<div data-role="dialog" class="hidden" style="display:none;" />');

        var closeCallback = function (event) {
            var $this = $(this);

            event.preventDefault();

            var duration = parseDuration($dialog.css('transition-duration'));

            //$dialog.addClass('hidden'); //.delay(duration).fadeOut(0);
            //setTimeout(function () {
            //    $dialog.fadeOut(0);
            //}, duration);
            $dialog.animate({ marginTop: 0, height: 0 });

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
        };

        // Bind the event model
        $(document).on(
            'click',
            '[data-role="dialog"] a',
            closeCallback
        ).on(
            'keydown',
            '',
            function (event) {
                if (event.keyCode == 27) {
                    closeCallback(event);
                }
            }
        );

        return $dialog;
    };
}(jQuery));