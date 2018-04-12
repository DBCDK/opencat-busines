use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("TemplateUrl");
use("ValidateErrors");
use("ValueCheck");
use("ValidationUtil");

EXPORTED_SYMBOLS = ['ControlFieldsRepeatable'];

var ControlFieldsRepeatable = function () {
    var BUNDLE_NAME = "validation";

    function validateRecord(record, params) {
        Log.trace("Enter - ControlFieldsRepeatable.validateRecord( ", record, ", ", params, " )");
        var result = [];
        try {
            var bundle = ResourceBundleFactory.getBundle(BUNDLE_NAME);
            ValueCheck.check("params.fields", params.fields).instanceOf(Array);
            Log.debug("Checking fields: ", params.fields);

            return result;
        } finally {
            Log.trace("Exit - ControlFieldsRepeatable.validateRecord: ", result);
        }
    }

    return {
        "validateRecord": validateRecord,
        "__BUNDLE_NAME": BUNDLE_NAME
    };
}();