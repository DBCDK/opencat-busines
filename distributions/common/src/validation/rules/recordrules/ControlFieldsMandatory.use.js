use("Exception");
use("Log");
use("ResourceBundle");
use("ResourceBundleFactory");
use("TemplateUrl");
use("ValidateErrors");
use("ValueCheck");
use("ValidationUtil");

EXPORTED_SYMBOLS = ['ControlFieldsMandatory'];

var ControlFieldsMandatory = function () {
    var BUNDLE_NAME = "validation";

    function validateRecord(record, params) {
        Log.trace("Enter - FieldsMandatory.validateRecord( ", record, ", ", params, " )");
        var result = [];
        try {
            var bundle = ResourceBundleFactory.getBundle(BUNDLE_NAME);
            ValueCheck.check("params.fields", params.fields).instanceOf(Array);
            Log.debug("Checking fields: ", params.fields);
            for (var i = 0; i < params.fields.length; ++i) {
                if (ValidationUtil.recordContainsControlField(record, params.fields[i]) !== true) {
                    Log.debug("Control Field: ", params.fields[i], " was not found in record: ", uneval(record));
                    var url = TemplateUrl.getUrlForField(params.fields[i], params.template);
                    var msg = ResourceBundle.getStringFormat(bundle, "control.field.mandatory.error", params.fields[i]);
                    result.push(ValidateErrors.recordError(url, msg));
                }
            }
            return result;
        } finally {
            Log.trace("Exit - FieldsMandatory.validateRecord: ", result);
        }
    }

    return {
        "validateRecord": validateRecord,
        "__BUNDLE_NAME": BUNDLE_NAME
    };
}();