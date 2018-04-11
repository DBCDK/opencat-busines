use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("ValidateErrors");
use("ValueCheck");

EXPORTED_SYMBOLS = ['ControlField008Validator'];

var ControlField008Validator = function () {
    var BUNDLE_NAME = "validation";

    function validate(record, controlField, params) {
        Log.trace("Enter -- ControlField008Validator.validate");
        try {
            if (controlField.value.length !== 16) {
                return [ValidateErrors.controlFieldError("TODO:fixurl", "Kontrolfelt 008 skal have en længde på 40 tegn men var kun " + controlField.value.length)];
            }

            Log.info("Params: ", JSON.stringify(params));


            return [];
        } finally {
            Log.trace("Exit -- ControlField008Validator.validate");
        }
    }

    return {
        'BUNDLE_NAME': BUNDLE_NAME,
        'validate': validate
    };
}();
