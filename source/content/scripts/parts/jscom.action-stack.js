/* JS ACTION STACK CLASS */
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

/* JS ACTION CLASS */
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