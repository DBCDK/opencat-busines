use("Log");

EXPORTED_SYMBOLS = ['ValidationUtil'];

var ValidationUtil = function () {

    /**
     * isNumber stolen from this Stackoverflow accepted answer:
     *http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
     * @syntax
     * @param {String} n
     * @return boolean
     * @name isNumber
     * @method
     */
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /**
     *doesFieldContainSubfield
     * @syntax
     * @param {Object} field obj
     * @param {String} subfieldName
     * @return boolean
     * @name doesFieldContainSubfield
     * @method
     */
    function doesFieldContainSubfield(field, subfieldName) {
        Log.trace("RecordRules.__doesFieldContainSubfield");
        for (var i = 0; i < field.subfields.length; ++i) {
            if (field.subfields[i].name === subfieldName) {
                return true;
            }
        }
        return false;
    }

    /**
     * getFields
     * @syntax
     * @param {Object} record obj
     * @param {String} fieldName
     * @return array of fields
     * @name getFields
     * @method
     */
    function getFields(record, fieldName) {
        var ret = [];
        for (var i = 0; i < record.fields.length; ++i) {
            if (record.fields[i].name === fieldName)
                ret.push(record.fields[i]);
        }
        return ret;
    }

    /**
     * getFirstField
     * @syntax
     * @param {Object} record obj
     * @param {String} fieldName
     * @return field or undefined if no field matches the fieldname arg
     * @name getFirstField
     * @method
     */
    function getFirstField(record, fieldName) {
        for (var i = 0; i < record.fields.length; ++i) {
            if (record.fields[i].name === fieldName)
                return record.fields[i];
        }
    }

    /**
     * getFirstSubfieldValue
     * @syntax
     * @param {Array} array of subfields
     * @param {String} subfieldName
     * @return string value of the subfield or undefiend if no match is found
     * @name getFirstSubfieldValue
     * @method
     */
    function getFirstSubfieldValue(subfields, subfieldName) {
        for (var i = 0; i < subfields.length; ++i) {
            if (subfields[i].name === subfieldName) {
                return subfields[i].value;
            }
        }
    }

    /**
     * recordContainsField
     * @syntax
     * @param {Object} record Obj
     * @param {String} fieldName
     * @return boolean
     * @name recordContainsField
     * @method
     */
    function recordContainsField(record, fieldName) {
        Log.trace("RecordRules.__recordContainsField");
        for (var i = 0; i < record.fields.length; ++i) {
            if (record.fields[i].name === fieldName) {
                return true;
            }
        }
        return false;
    }

    function recordContainsControlField(record, controlFieldName) {
        Log.trace("RecordRules.recordContainsControlField");
        for (var i = 0; i < record.control.length; ++i) {
            if (record.control[i].name === fieldName) {
                return true;
            }
        }
        return false;
    }

    /**
     * This function is used to see if a given field/subfield exists in the record.
     *
     * @param {object} record
     * @param {String} fieldName
     * @param {String} subfieldName
     * @returns {boolean} true if the subfield exists otherwise false
     */
    function recordContainsSubfield(record, fieldName, subfieldName) {
        for (var i = 0; i < record.fields.length; ++i) {
            var field = record.fields[i];
            if (field.name === fieldName) {
                for (var j = 0; j < field.subfields.length; j++) {
                    var subfield = field.subfields[j];
                    if (subfield.name === subfieldName) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * getFieldNamesAsKeys
     * @syntax
     * @param {Object} record Obj
     * @return obj with field names as key as with the first found field as value
     * @name getFieldNamesAsKeys
     * @method
     */
    function getFieldNamesAsKeys(record) {
        Log.trace("Enter - ValidationUtil.getFieldNamesAsKeys");
        try {
            var ret = {};
            record.fields.forEach(function (field) {
                if (!ret.hasOwnProperty((field.name))) {
                    Object.defineProperty(ret, field.name, {enumerable: true, value: field});
                }
            });
            return ret;
        } finally {
            Log.trace("Exit - FieldDemandsOtherFields.__getFieldNamesAskeys");
        }
    }

    return {
        "getFieldNamesAsKeys": getFieldNamesAsKeys,
        "getFirstSubfieldValue": getFirstSubfieldValue,
        "getFirstField": getFirstField,
        "isNumber": isNumber,
        "doesFieldContainSubfield": doesFieldContainSubfield,
        "getFields": getFields,
        "recordContainsControlField": recordContainsControlField,
        "recordContainsField": recordContainsField,
        "recordContainsSubfield": recordContainsSubfield
    };
}();