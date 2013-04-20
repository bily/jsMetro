(function ($) {
    function AjaxMessageCarrier(settings) {
        var defaultSettings = {
            service: null,
            action: null,
            data: null,
            singleInstanceId: -1,
            completedHandlers: new Array(),
            successHandlers: new Array(),
            errorHandlers: new Array()
        };

        var finalSettings = $.extend({}, defaultSettings, finalSettings);
    };

    function AjaxQueue(settings) {
        var defaultSettings = {
            async: true
        };

        this.settings = $.extend({}, defaultSettings, settings);
        this.error = new Event('ajax-queue-error');
        this.completed = new Event('ajax-queue-completed');
        this.processed = new Event('ajax-queue-processed');
        this.success = new Event('ajax-queue-success');

        this.queue = new Array();
    };

    AjaxQueue.prototype = {
        process: function () {
        },

        _processInternal: function (tempQueue) {
        },

        _processMessage: function (msg, callback) {
        }
    };

    $.js.ajax = function (msgCarrier, enableQueue) {
    };
}(jQuery));