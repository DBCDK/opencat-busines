use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("ValidateErrors");
use("ValueCheck");

EXPORTED_SYMBOLS = ['ControlField001Validator'];

var ControlField001Validator = function () {
    var BUNDLE_NAME = "validation";

    function validate(record, controlField, params) {
        Log.trace("Enter -- ControlField001Validator.validate");
        try {
            return [];
        } finally {
            Log.trace("Exit -- ControlField001Validator.validate");
        }
    }

    return {
        'BUNDLE_NAME': BUNDLE_NAME,
        'validate': validate
    };
}();
