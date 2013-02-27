(function ($) {
    $(document).ready(function () {
    });

    $.showcase = {
    };

    $.showcase.actionStack_simpleSample = function () {
        var as = new ActionStack();

        as.push(function (action) {
            log('first action to be entered will fire right away.');

            setTimeout(function () {
                log('timeout finished! time to close the action!');

                action.close();
            }, 5000);

            log('now we\'ll wait 5000ms.');
        });

        as.push(function (action) {
            log('second action - this shouldn\'t fire until the first one has closed.');

            action.close();
        });
    };
}(jQuery));