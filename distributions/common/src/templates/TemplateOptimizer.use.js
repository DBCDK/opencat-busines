use("UnitTest");

//subfield rules
use("CheckSubfieldNotUsedInChildrenRecords");
use("LookupValue");
use("SubfieldMandatoryIfSubfieldNotPresentRule");
use("CheckISMN");
use("CheckISSN");
use("CheckISBN10");
use("CheckISBN13");
use("CheckYear");
use("LookUpRecord");
use("CheckValue");
use("MandatorySubfieldInVolumeWorkRule");
use("CheckLength");
use("CheckFaust");
use("CheckDateFormat");
use("SubfieldConditionalMandatoryField");
use("CheckChangedValue");
use("SubfieldCannotContainValue");
use("SubfieldsDemandsOtherSubfields");
use("CheckSubfieldNotUsedInParentRecord");
use("CheckReference");
use("SubfieldValueExcludesField");
use("SubfieldValueMakesFieldsAllowed");
use("SubfieldAllowedIfSubfieldValueInOtherFieldExists");

// Control field rules
use("ControlField001Validator");
use("ControlField003Validator");
use("ControlField005Validator");
use("ControlField006Validator");
use("ControlField007Validator");
use("ControlField008Validator");

//field rules
use("FieldDemandsOtherFieldAndSubfield");
use("SubfieldConditionalMandatory");
use("RepeatableSubfields");
use("ExclusiveSubfield");
use("ExclusiveSubfieldParameterized");
use("SubfieldHasValueDemandsOtherSubfield");
use("FieldsIndicator");
use("SubfieldsMandatory");

//record rules
use("OptionalFields");
use("ConflictingFields");
use("RecordSorted");
use("RepeatableFields");
use("IdFieldExists");
use("ConflictingSubfields");
use("FieldDemandsOtherFields");
use("AllFieldsMandatoryIfOneExist");
use("FieldsMandatory");
use("MustContainOneOfFields");
use("SubfieldsHaveValuesDemandsOtherSubfield");
use("ControlFieldsMandatory");
use("ControlFieldsRepeatable");

EXPORTED_SYMBOLS = ['TemplateOptimizer'];

/**
 * Module to optimize a template.
 *
 * @namespace
 * @name TemplateOptimizer
 *
 */

var TemplateOptimizer = function () {
    var __BUNDLE_NAME = "templates";

    var VALID_ERROR_TYPES = [
        "WARNING",
        "ERROR"
    ];

    /**
     * Optimizes a template and returns the result.
     *
     * @param {Object} template The template.
     */
    function optimize(template) {
        Log.trace("Enter -- TemplateOptimizer.optimize()");

        var result = {
            fields: {},
            rules: []
        };

        try {
            if (template.rules !== undefined) {
                result.rules = template.rules;
            }

            var mandatoryNames = [];
            var mandatoryControl = [];
            var repeatableNames = [];
            var repeatableControl = [];

            if (template.hasOwnProperty("leader")) {
                result.leader = template.leader;
            }

            /*
            if (template.hasOwnProperty("control")) {
                result.control = [];
                Log.info("Found control field in template");

                for (var name in template.control) {
                    if (!template.control.hasOwnProperty(name)) {
                        continue;
                    }

                    var controlField = template.control[name];
                    result.control[name] = optimizeControlField(name, controlField, template.defaults.control);

                    var controlIsMandatory = controlField.mandatory;
                    if (controlIsMandatory === undefined) {
                        controlIsMandatory = template.defaults.control.mandatory;
                    }

                    if (controlIsMandatory === true) {
                        mandatoryControl.push(name);
                    }

                    var isRepeatable = controlField.repeatable;
                    if (isRepeatable === undefined) {
                        isRepeatable = template.defaults.control.repeatable;
                    }
                    if (isRepeatable === true) {
                        repeatableControl.push(name);
                    }
                }

                if (mandatoryControl.length > 0) {
                    mandatoryControl.sort();
                    Log.info("Mandatory control fields: " + JSON.stringify(mandatoryControl));
                    result.rules.push({
                        name: "ControlFieldsMandatory.validateRecord",
                        type: ControlFieldsMandatory.validateRecord,
                        params: {
                            fields: mandatoryControl
                        }
                    });
                }

                if (repeatableControl.length > 0) {
                    repeatableControl.sort();
                    Log.info("Repeatable control fields: " + JSON.stringify(repeatableControl));
                    result.rules.push({
                        name: "ControlFieldsRepeatable.validateRecord",
                        type: ControlFieldsRepeatable.validateRecord,
                        params: {
                            fields: repeatableControl
                        }
                    });
                }
            }
*/
            for (name in template.fields) {
                if (!template.fields.hasOwnProperty(name)) {
                    continue;
                }

                var field = template.fields[name];
                result.fields[name] = optimizeField(name, field, template.defaults.field, template.defaults.subfield);

                var isMandatory = field.mandatory;
                if (isMandatory === undefined) {
                    isMandatory = template.defaults.field.mandatory;
                }
                if (isMandatory === true) {
                    mandatoryNames.push(name);
                }

                isRepeatable = field.repeatable;
                if (isRepeatable === undefined) {
                    isRepeatable = template.defaults.field.repeatable;
                }
                if (isRepeatable === true) {
                    repeatableNames.push(name);
                }
            }

            if (mandatoryNames.length > 0) {
                mandatoryNames.sort();
                Log.info("Mandatory data fields: ", JSON.stringify(mandatoryNames));
                result.rules.push({
                    name: "FieldsMandatory.validateRecord",
                    type: FieldsMandatory.validateRecord,
                    params: {
                        fields: mandatoryNames
                    }
                });
            }

            if (repeatableNames.length > 0) {
                repeatableNames.sort();
                Log.info("Repeatable data fields: ", JSON.stringify(repeatableNames));
                result.rules.push({
                    name: "RepeatableFields.validateRecord",
                    type: RepeatableFields.validateRecord,
                    params: {
                        fields: repeatableNames
                    }
                });
            }
            result.rules = convertTypeNameOfAllRules(result.rules);
            return result;
        } finally {
            Log.trace("Exit -- TemplateOptimizer.optimize(): ", result);
        }
    }

    /*
    function optimizeControlField(controlFieldName, controlField, defaultControl) {
        Log.trace("Enter -- TemplateOptimizer.optimizeField()");
        var result = undefined;

        try {
            result = {
                "url": controlField.url,
                "rules": controlField.rules
            };

            if (result.rules === undefined && defaultControl.rules !== undefined) {
                result.rules = JSON.parse(JSON.stringify(defaultControl.rules));
            }

            result.rules = convertTypeNameOfAllRules(result.rules);
            Log.info("Control field rules (", controlFieldName, "): " + __formatRuleNames(result.rules));

            return result;
        } finally {
            Log.trace("Exit -- TemplateOptimizer.optimizeField(): ", result);
        }
    }*/

    // TODO: JSDoc
    function optimizeField(fieldName, field, fieldDefs, subfieldDefs) {
        Log.trace("Enter -- TemplateOptimizer.optimizeField()");
        var result = undefined;
        try {
            result = {
                "url": field.url,
                "rules": field.rules,
                "subfields": {}
            };

            // Setup url.
            if (result.url === undefined) {
                result.url = fieldDefs.url;
            }

            // Optimize each subfield in field
            var mandatoryNames = [];
            var repeatableNames = [];
            for (var name in field.subfields) {
                if (!field.subfields.hasOwnProperty(name)) {
                    continue;
                }

                var sf = field.subfields[name];
                Log.trace("Optimize subfield(", fieldName, " *", name, "): ");
                result.subfields[name] = optimizeSubfield(sf, subfieldDefs);
                Log.trace("Subfield rules (", fieldName, " *", name, "): " + __formatRuleNames(result.subfields[name].rules));

                if (sf.mandatory === true) {
                    Log.trace("Push mandatory");
                    mandatoryNames.push(name);
                }

                if (sf.repeatable === false) {
                    Log.trace("Push repeatable");
                    repeatableNames.push(name);
                }
            }

            // Setup predefined rules in field.
            if (result.rules === undefined && fieldDefs.rules !== undefined) {
                // deep clone the Default field
                result.rules = JSON.parse(JSON.stringify(fieldDefs.rules));
            }

            // Add rule for mandatory subfields.
            if (result.rules === undefined) {
                result.rules = [];
            }
            if (mandatoryNames.length > 0) {
                result.rules.push({
                    name: "SubfieldsMandatory.validateField",
                    type: SubfieldsMandatory.validateField,
                    params: {
                        subfields: mandatoryNames
                    }
                });
            }

            if (repeatableNames.length > 0) {
                result.rules.push({
                    name: "RepeatableSubfields.validateField",
                    type: RepeatableSubfields.validateField,
                    params: {
                        subfields: repeatableNames
                    }
                });
            }

            if (field.sorting !== undefined) {
                result.sorting = field.sorting;
            }
            result.rules = convertTypeNameOfAllRules(result.rules);
            Log.info("Field rules (", fieldName, "): " + __formatRuleNames(result.rules));
            return result;
        } finally {
            Log.trace("Exit -- TemplateOptimizer.optimizeField(): ", result);
        }
    }

    /**
     * Optimizes a sub field according to the properties from the defaults spec and in regard
     * to convert the values property to rules.
     *
     * @param {Object} sf   The object from the template that contains the config for a given subfield.
     * @param {Object} defs The defaults structure for subfields.
     *
     * @return {Array} An array of validation rule objects for the subfield. \
     *
     * TODO: Example of json in and out.
     */
    function optimizeSubfield(sf, defs) {
        Log.trace("Enter -- TemplateOptimizer.optimizeSubfield()");
        var result = [];
        try {
            var values = sf.values;
            var rules = sf.rules;
            if (values === undefined) {
                values = defs.values;
            }
            if (rules === undefined) {
                rules = defs.rules;
            }
            if (rules === undefined) {
                rules = [];
            }
            if (values !== undefined) {
                var obj = {
                    name: "CheckValue.validateSubfield",
                    type: CheckValue.validateSubfield,
                    params: {values: values}
                };
                rules.push(obj);
            }
            result = convertTypeNameOfAllRules(rules);
            Log.trace("  rules: ", __formatRuleNames(rules));
            return result;
        } finally {
            Log.trace("Exit -- TemplateOptimizer.optimizeSubfield()");
        }
    }

    // TODO: JSDoc
    function setTemplatePropertyOnRule(rule, template) {
        Log.trace("Enter -- TemplateOptimizer.setTemplatePropertyOnRule()");
        try {
            if (rule === undefined) {
                return;
            }
            if (rule.params === undefined) {
                rule.params = {template: template};
                return;
            }
            rule.params.template = template;
        } finally {
            Log.trace("Exit -- TemplateOptimizer.setTemplatePropertyOnRule(): ", rule);
        }
    }

    function __formatRuleNames(rules) {
        var names = [];
        if (rules !== undefined) {
            for (var i = 0; i < rules.length; i++) {
                names.push(rules[i].name);
            }
        }
        return names.join(",");
    }

    /**
     *
     *
     * @param {Array} rules
     *
     * @returns {Array}
     */
    function convertTypeNameOfAllRules(rules) {
        Log.trace("Enter -- TemplateOptimizer.convertTypeNameOfAllRules()");
        var res = [];
        try {
            for (var i = 0; i < rules.length; i++) {
                var obj = rules[i];
                if (typeof( rules[i].type ) === "string") {
                    obj.name = rules[i].type;
                    obj.type = convertRuleTypeNameToFunction(rules[i].type);
                    if (obj.type !== null) {
                        __checkRule(rules[i], rules[i].type);
                        Log.trace("Converted rule name: ", obj.name);
                    }
                }
                if (obj.type !== null) {
                    res.push(obj);
                }
            }
            return res;
        } finally {
            Log.trace("Exit -- TemplateOptimizer.convertTypeNameOfAllRules(): ", res);
        }
    }

    function convertRuleTypeNameToFunction(typeName) {
        Log.trace("Enter -- TemplateOptimizer.convertRuleTypeNameToFunction( " + typeName + " )");
        try {
            switch (typeName) {
                case "RecordRules.ControlFieldsMandatory":
                    return ControlFieldsMandatory.validateRecord;
                case "RecordRules.ControlFieldsRepeatable":
                    return ControlFieldsRepeatable.validateRecord;
                case "RecordRules.mustContainOneOfFields":
                    return MustContainOneOfFields.validateRecord;
                case "RecordRules.idFieldExists":
                    return IdFieldExists.validateRecord;
                case "RecordRules.fieldsMandatory":    // intended fall tru
                case "FieldsMandatory.validateRecord":
                    return FieldsMandatory.validateRecord;
                case "RecordRules.repeatableFields":  // intended fall tru
                case "RepeatableFields.validateRecord":
                    return RepeatableFields.validateRecord;
                case "RecordRules.recordSorted":
                    return RecordSorted.validateRecord;
                case "RecordRules.conflictingFields":
                    return ConflictingFields.validateRecord;
                case "RecordRules.conflictingSubfields":
                    return ConflictingSubfields.validateRecord;
                case "RecordRules.allFieldsMandatoryIfOneExist":
                    return AllFieldsMandatoryIfOneExist.validateRecord;
                case "RecordRules.fieldDemandsOtherFields":
                    return FieldDemandsOtherFields.validateRecord;
                case "RecordRules.subfieldsHaveValuesDemandsOtherSubfield":
                    return SubfieldsHaveValuesDemandsOtherSubfield.validateRecord;

                case "ControlFieldRules.001":
                    return ControlField001Validator.validate;
                case "ControlFieldRules.003":
                    return ControlField003Validator.validate;
                case "ControlFieldRules.005":
                    return ControlField005Validator.validate;
                case "ControlFieldRules.006":
                    return ControlField006Validator.validate;
                case "ControlFieldRules.007":
                    return ControlField007Validator.validate;
                case "ControlFieldRules.008":
                    return ControlField008Validator.validate;

                case "FieldRules.fieldsIndicator":
                    return FieldsIndicator.validateField;
                case "FieldRules.subfieldsMandatory":  // intended fall tru
                case "SubfieldsMandatory.validateField":
                    return SubfieldsMandatory.validateField;
                case "FieldRules.subfieldMandatoryIfSubfieldNotPresent":
                    return SubfieldMandatoryIfSubfieldNotPresentRule.validateField;
                case "FieldRules.subfieldConditionalMandatory":
                    return SubfieldConditionalMandatory.validateField;
                case "FieldRules.subfieldHasValueDemandsOtherSubfield":
                    return SubfieldHasValueDemandsOtherSubfield.validateField;
                case "FieldRules.repeatableSubfields":  // intended fall tru
                case "RepeatableSubfields.validateField":
                    return RepeatableSubfields.validateField;
                case "FieldRules.exclusiveSubfield":
                    return ExclusiveSubfield.validateField;
                case "FieldRules.exclusiveSubfieldParameterized":
                    return ExclusiveSubfieldParameterized.validateField;
                case "FieldRules.mandatorySubfieldInVolumeWork":
                    return MandatorySubfieldInVolumeWorkRule.validateField;
                case "FieldRules.fieldDemandsOtherFieldAndSubfields":
                    return FieldDemandsOtherFieldAndSubfield.validateField;

                case "SubfieldRules.subfieldConditionalMandatoryField":
                    return SubfieldConditionalMandatoryField.validateSubfield;
                case "SubfieldRules.subfieldCannotContainValue":
                    return SubfieldCannotContainValue.validateSubfield;
                case "SubfieldRules.subfieldsDemandsOtherSubfields":
                    return SubfieldsDemandsOtherSubfields.validateSubfield;
                case "SubfieldRules.checkReference":
                    return CheckReference.validateSubfield;
                case "SubfieldRules.checkLength":
                    return CheckLength.validateSubfield;
                case "SubfieldRules.checkValue":  // intended fall true
                case "CheckValue.validateSubfield":
                    return CheckValue.validateSubfield;
                case "SubfieldRules.checkDateFormat":
                    return CheckDateFormat.validateSubfield;
                case "SubfieldRules.checkFaust":
                    return CheckFaust.validateSubfield;
                case "SubfieldRules.checkISMN":
                    return CheckISMN.validateSubfield;
                case "SubfieldRules.checkISSN":
                    return CheckISSN.validateSubfield;
                case "SubfieldRules.checkISBN10":
                    return CheckISBN10.validateSubfield;
                case "SubfieldRules.checkISBN13":
                    return CheckISBN13.validateSubfield;
                case "SubfieldRules.checkYear":
                    return CheckYear.validateSubfield;
                case "SubfieldRules.checkChangedValue":
                    return CheckChangedValue.validateSubfield;
                case "SubfieldRules.checkSubfieldNotUsedInParentRecord":
                    return CheckSubfieldNotUsedInParentRecord.validateSubfield;
                case "SubfieldRules.checkSubfieldNotUsedInChildrenRecords":
                    return CheckSubfieldNotUsedInChildrenRecords.validateSubfield;
                case "SubfieldRules.lookupRecord":
                    return LookUpRecord.validateSubfield;
                case "SubfieldRules.subfieldValueExcludesField":
                    return SubfieldValueExcludesField.validateSubfield;
                case "SubfieldRules.subfieldValueMakesFieldsAllowed":
                    return SubfieldValueMakesFieldsAllowed.validateSubfield;
                case "SubfieldRules.subfieldAllowedIfSubfieldValueInOtherFieldExists":
                    return SubfieldAllowedIfSubfieldValueInOtherFieldExists.validateSubfield;

                default: {
                    var bundle = ResourceBundleFactory.getBundle(__BUNDLE_NAME);
                    var logMessage = ResourceBundle.getStringFormat(bundle, "validation.rule.unknown", typeName);
                    logMessage += " function : " + JSON.stringify(typeName);
                    Log.warn(logMessage);
                    return undefined;
                }
            }
        } catch (ex) {
            Log.warn("Unable to find validation function for typename '", JSON.stringify(typeName), "': ", ex);
        } finally {
            Log.trace("Exit -- TemplateOptimizer.convertRuleTypeNameToFunction()");
        }
    }

    function __checkRule(rule, ruleName) {
        Log.trace("Enter -- TemplateOptimizer.__checkRule()");
        try {
            if (rule.hasOwnProperty("errorType") && VALID_ERROR_TYPES.indexOf(rule.errorType) === -1) {
                var bundle = ResourceBundleFactory.getBundle(__BUNDLE_NAME);

                throw ResourceBundle.getStringFormat(bundle, "invalid.validation.error.type", ruleName, rule.errorType, VALID_ERROR_TYPES.join(", "));
            }
        } finally {
            Log.trace("Exit -- TemplateOptimizer.__checkRule()");
        }
    }

    return {
        'optimize': optimize,
        'optimizeField': optimizeField,
        'optimizeSubfield': optimizeSubfield,
        'setTemplatePropertyOnRule': setTemplatePropertyOnRule,
        'convertRuleTypeNameToFunction': convertRuleTypeNameToFunction
    };
}();

