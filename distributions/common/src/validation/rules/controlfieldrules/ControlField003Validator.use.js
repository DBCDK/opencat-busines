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
            Log.info("ControlField003Validator");
            Log.info("Control field: ", JSON.stringify(controlField));
            Log.info("Params: ", JSON.stringify(params));

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
