use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("ValidateErrors");
use("ValueCheck");

EXPORTED_SYMBOLS = ['ControlField005Validator'];

var ControlField005Validator = function () {
    var BUNDLE_NAME = "validation";

    function validate(record, controlField, params) {
        Log.trace("Enter -- ControlField005Validator.validate");
        try {
            Log.info("ControlField005Validator");
            Log.info("Control field: ", JSON.stringify(controlField));
            Log.info("Params: ", JSON.stringify(params));

            if (controlField.value.length !== 16) {
                return [ValidateErrors.controlFieldError("TODO:fixurl", "Kontrolfelt 005 skal have en længde på 16 tegn men var kun " + controlField.value.length)];
            }
            return [];
        } finally {
            Log.trace("Exit -- ControlField005Validator.validate");
        }
    }

    return {
        'BUNDLE_NAME': BUNDLE_NAME,
        'validate': validate
    };
}();
