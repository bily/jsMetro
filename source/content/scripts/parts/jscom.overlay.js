(function ($) {
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
}(jQuery));