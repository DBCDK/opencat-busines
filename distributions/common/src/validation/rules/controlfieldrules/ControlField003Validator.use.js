use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("ValidateErrors");
use("ValueCheck");

EXPORTED_SYMBOLS = ['ControlField003Validator'];

var ControlField003Validator = function () {
    var BUNDLE_NAME = "validation";

    function validate(record, controlField, params) {
        Log.trace("Enter -- ControlField003Validator.validate");
        try {
            return [];
        } finally {
            Log.trace("Exit -- ControlField003Validator.validate");
        }
    }

    return {
        'BUNDLE_NAME': BUNDLE_NAME,
        'validate': validate
    };
}();
