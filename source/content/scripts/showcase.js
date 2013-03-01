(function ($) {
    $(document).ready(function () {
    });

    $.showcase = {
    };

    $.showcase.dialog_simpleSample = function () {
        $.js.dialog(
            '<h3>Confirm Your Eyes Exist</h3><p>Can you read this?</p>' +
            '<div class="pull-right">' +
            '   <a href="#" data-role="button" data-theme="google">No</a>' +
            '   <a href="#" data-role="button" data-theme="green">Yes</a>' +
            '</div>',
            function (dialog, element, event) {
                log('dialog closed: ' + element.html());
            }
        );
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