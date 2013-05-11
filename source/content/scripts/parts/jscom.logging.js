function log(msg) {
    if (console && console.log) {
        console.log(msg);
    }

    GlobalLog.log(msg);
};

