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