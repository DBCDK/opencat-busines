use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("ValidateErrors");
use("ValueCheck");

EXPORTED_SYMBOLS = ['ControlField007Validator'];

var ControlField007Validator = function () {
    var BUNDLE_NAME = "validation";

    function validate(record, controlField, params) {
        Log.trace("Enter -- ControlField007Validator.validate");
        try {
            Log.info("ControlField007Validator");
            Log.info("Control field: ", JSON.stringify(controlField));
            Log.info("Params: ", JSON.stringify(params));

            return [];
        } finally {
            Log.trace("Exit -- ControlField007Validator.validate");
        }
    }

    return {
        'BUNDLE_NAME': BUNDLE_NAME,
        'validate': validate
    };
}();
