use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("ValidateErrors");
use("ValueCheck");

EXPORTED_SYMBOLS = ['ControlField006Validator'];

var ControlField006Validator = function () {
    var BUNDLE_NAME = "validation";

    function validate(record, controlField, params) {
        Log.trace("Enter -- ControlField006Validator.validate");
        try {
            Log.info("ControlField006Validator");
            Log.info("Control field: ", JSON.stringify(controlField));
            Log.info("Params: ", JSON.stringify(params));

            return [];
        } finally {
            Log.trace("Exit -- ControlField006Validator.validate");
        }
    }

    return {
        'BUNDLE_NAME': BUNDLE_NAME,
        'validate': validate
    };
}();
