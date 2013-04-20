/* ARRAY HELPERS */
if (!Array.prototype.first) {
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
}

if (!Array.prototype.indexOf) {
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
}

function parseDuration(cssDuration) {
    if (cssDuration == null || (typeof cssDuration === 'string' && cssDuration.length == 0)) {
        return 1000;
    }

    if (cssDuration.indexOf('ms') > 0) {
        return parseFloat(cssDuration.replace('ms'));
    }

    return parseFloat(cssDuration.replace('s')) * 1000;
}

function parsePadding(padding) {
    if (padding == null || (typeof padding === 'string' && padding.length == 0)) {
        return 0;
    }

    return parseFloat(padding.replace('px'));
}