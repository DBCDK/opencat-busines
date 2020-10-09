use("DanMarc2Converter");
use("Log");
use("RawRepoClient");
use("ResourceBundle");
use("ResourceBundleFactory");
use("ValidateErrors");
use("ContextUtil");

EXPORTED_SYMBOLS = ['MandatorySubfieldInVolumeWorkRule'];

var MandatorySubfieldInVolumeWorkRule = function () {
    var __BUNDLE_NAME = "validation";

    function validateField(record, field, params) {
        Log.trace("Enter - MandatorySubfieldInVolumeWorkRule.validateField()");
        try {
            ValueCheck.check("params", params).type("object");
            ValueCheck.check("params.subfield", params.subfield).type("string");

            var marcRecord = DanMarc2Converter.convertToDanMarc2(record);

            if (marcRecord.matchValue(/004/, /a/, /h/)) {
                return __validateHeadRecord(marcRecord, field, params);
            } else if (marcRecord.matchValue(/004/, /a/, /b/)) {
                return __validateVolumeRecord(marcRecord, field, params);
            }
            return [];
        } finally {
            Log.trace("Exit - MandatorySubfieldInVolumeWorkRule.validateField()");
        }
    }

    function __validateHeadRecord(record, field, params) {
        Log.trace("Enter - MandatorySubfieldInVolumeWorkRule.__validateHeadRecord()");

        try {
            var bundle;
            var volumes = __getVolumeRecords(record, params);
            var msg;
            if (volumes.length === 0) {
                if (!__checkSubfieldIsUsed([record], field, params.subfield)) {
                    bundle = ResourceBundleFactory.getBundle(__BUNDLE_NAME);
                    msg = ResourceBundle.getStringFormat(bundle, "volume.work.mandatory.subfield.rule.error", field.name, params.subfield);
                    return [ValidateErrors.subfieldError("", msg)];
                }
            }

            for (var i = 0; i < volumes.length; i++) {
                if (!__checkSubfieldIsUsed([volumes[i], record], field, params.subfield)) {
                    bundle = ResourceBundleFactory.getBundle(__BUNDLE_NAME);
                    msg = ResourceBundle.getStringFormat(bundle, "volume.work.mandatory.subfield.rule.error", field.name, params.subfield);
                    return [ValidateErrors.subfieldError("", msg)];
                }
            }
            return [];
        } finally {
            Log.trace("Exit - MandatorySubfieldInVolumeWorkRule.__validateHeadRecord()");
        }
    }

    function __validateVolumeRecord(record, field, params) {
        Log.trace("Enter - MandatorySubfieldInVolumeWorkRule.__validateVolumeRecord()");
        try {
            var parentId = record.getValue(/014/, /a/);
            var agencyId = record.getValue(/001/, /b/);
            if (!RawRepoClient.recordExists(parentId, agencyId)) {
                return [];
            }

            var headRecord = RawRepoClient.fetchRecord(parentId, agencyId);
            if (!__checkSubfieldIsUsed([headRecord, record], field, params.subfield)) {
                var bundle = ResourceBundleFactory.getBundle(__BUNDLE_NAME);
                var msg = ResourceBundle.getStringFormat(bundle, "volume.work.mandatory.subfield.rule.error", field.name, params.subfield);
                return [ValidateErrors.subfieldError("", msg)];
            }
            return [];
        } finally {
            Log.trace("Exit - MandatorySubfieldInVolumeWorkRule.__validateVolumeRecord()");
        }
    }

    function __checkSubfieldIsUsed(records, field, subfieldName) {
        Log.trace("Enter - MandatorySubfieldInVolumeWorkRule.__checkSubfieldIsUsed()");
        Log.trace("Records:", records.toString());
        try {
            for (var i = 0; i < records.length; i++) {
                var rec = records[i];
                for (var k = 0; k < rec.size(); k++) {
                    if (rec.field(k).name === field.name) {
                        var recField = rec.field(k);
                        for (var j = 0; j < recField.size(); j++) {
                            if (recField.subfield(j).name === subfieldName) {
                                Log.debug(field.name, subfieldName, " found in record: [", rec.getValue(/001/, /a/), ":", rec.getValue(/001/, /b/), "]");
                                return true;
                            }
                        }
                    }
                }
            }
            Log.debug(field.name, subfieldName, " not found in any record.");
            return false;
        } finally {
            Log.trace("Exit - MandatorySubfieldInVolumeWorkRule.__checkSubfieldIsUsed()");
        }
    }

    function __getVolumeRecords(record, params) {
        Log.trace("Enter - MandatorySubfieldInVolumeWorkRule.__getVolumeRecords()");
        try {
            var type = record.getValue(/004/, /a/);
            if (type !== "h") {
                return [];
            }

            var recId = record.getValue(/001/, /a/);
            var context = params.context;

            var children;

            children = ContextUtil.getValue(context, 'getRelationsChildren', recId, libNo);
            if (children === undefined) {
                children = RawRepoClient.getRelationsChildren(recId, libNo);
                ContextUtil.setValue(context, children, 'getRelationsChildren', recId, libNo);
            }

            var result = [];
            for (var i = 0; i < children.length; i++) {
                var childRecord = children[i];
                if (childRecord.matchValue(/004/, /a/, /b/)) {
                    result.push(childRecord);
                }
            }
            return result;
        } finally {
            Log.trace("Exit - MandatorySubfieldInVolumeWorkRule.__getVolumeRecords()");
        }
    }

    return {
        'validateField': validateField,
        '__BUNDLE_NAME': __BUNDLE_NAME
    }
}();
