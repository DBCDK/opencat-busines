EXPORTED_SYMBOLS = ['ValidateErrors'];

/**
 * Module to create objects with validate errors for the Validate web service.
 *
 * @namespace
 * @name ValidateErrors
 */
var ValidateErrors = function () {
    /**
     * Creates a validate error for an generel record error.
     *
     * @param {String} url     Url to a description of the error.
     * @param {String} message Error message
     * @return A json with the error type for a record error.
     */
    function recordError(url, message) {
        return __error(url, message);
    }

    /**
     * Creates a validate error for an generel field error.
     *
     * @param {String} url     Url to a description of the error.
     * @param {String} message Error message
     * @return A json with the error type for a field error.
     */
    function fieldError(url, message) {
        return __error(url, message);
    }

    /**
     * Creates a validate error for an generel subfield error.
     *
     * @param {String} url     Url to a description of the error.
     * @param {String} message Error message
     * @param {String} pid     pid
     * @return A json with the error type for a field error.
     */
    function subfieldError(url, message) {
        return __error(url, message);
    }

    function controlFieldError(url, message) {
        return __error(url, message);
    }

    function leaderError(url, message) {
        return __error(url, message);
    }

    function __error(url, message) {
        if (url === undefined) {
            return __errorWoUrl(message);
        } else {
            return __errorWUrl(url, message);
        }
    }

    function __errorWUrl(url, message) {
        return {
            type: "ERROR",
            urlForDocumentation: url,
            message: message
        }
    }

    function __errorWoUrl(message) {
        return {
            type: "ERROR",
            message: message
        }
    }

    return {
        'recordError': recordError,
        'fieldError': fieldError,
        'subfieldError': subfieldError,
        'controlFieldError': controlFieldError,
        'leaderError': leaderError
    };
}();
