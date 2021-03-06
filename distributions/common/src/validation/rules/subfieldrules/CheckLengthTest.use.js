//-----------------------------------------------------------------------------
/**
 * This file contains unittests for the SubfieldCannotContainValue module.
 */

//-----------------------------------------------------------------------------
use( "ResourceBundle" );
use( "SafeAssert" );
use( "UnitTest" );
use ( 'GenericSettings' );
use( "CheckLength" );
//-----------------------------------------------------------------------------
UnitTest.addFixture( "CheckLength.validateSubfield", function() {
    var bundle = ResourceBundleFactory.getBundle( CheckLength.__BUNDLE_NAME );

    var record = {};
    var field = {};
    var subfield = {
        'name': "a",
        'value': "42"
    };

    var paramsEqual = {'min': 2, 'max': 2};
    Assert.equalValue("checkLength validates ok", CheckLength.validateSubfield(record, field, subfield, paramsEqual), []);

    var paramsNotEqualOk = {'min': 2, 'max': 40000};
    Assert.equalValue("checkLength validates ok", CheckLength.validateSubfield(record, field, subfield, paramsNotEqualOk), []);

/***************
 * US2139 For now we comment out the exception test
 * a more general solution of these exception asserts should be found
    var paramsWrong = {'min': 3, 'max': 2};
    Assert.exception("checkLength wrong parameters", 'CheckLength.validateSubfield(record, field, subfield, paramsWrong)');

    var paramsNoValues = {};
    Assert.exception("checkLength no parameters", 'CheckLength.validateSubfield(record, field, subfield, noParams)');
 ******/

    var paramsValueTooShort = {'min': 4};
    var errorVal1 = [ValidateErrors.subfieldError( "TODO:fixurl", ResourceBundle.getStringFormat( bundle, "check.length.min.error", "a", 4 ) )];
    Assert.equalValue("length of value to short", CheckLength.validateSubfield(record, field, subfield, paramsValueTooShort), errorVal1);

    var paramsValueTooLong = {'max': 1};
    var errorVal2 = [ValidateErrors.subfieldError( "TODO:fixurl", ResourceBundle.getStringFormat( bundle, "check.length.max.error", "a", 1 ) )];
    Assert.equalValue("length of value to short", CheckLength.validateSubfield(record, field, subfield, paramsValueTooLong), errorVal2);
});

UnitTest.addFixture( "SubfieldRules.__checkLengthMin", function() {
    var subfield = {
        'name': "a",
        'value': "42"
    };

    var bundle = ResourceBundleFactory.getBundle( CheckLength.__BUNDLE_NAME );

    var params1 = {'min': 1};
    Assert.equalValue( "1 SubfieldRules.__checkLengthMin, ok test", CheckLength.__checkLengthMin( subfield, params1 ), [] );

    var params2 = {'min': 42};
    var error2 = [ValidateErrors.subfieldError( "TODO:fixurl", ResourceBundle.getStringFormat( bundle, "check.length.min.error", "a", 42 ) ) ];
    Assert.equalValue( "2 SubfieldRules.__checkLengthMin, error test", CheckLength.__checkLengthMin( subfield, params2 ), error2 );
} );

UnitTest.addFixture( "SubfieldRules.__checkLengthMax", function() {
    var subfield = {
        'name': "a",
        'value': "42"
    };

    var bundle = ResourceBundleFactory.getBundle( CheckLength.__BUNDLE_NAME );

    var params1 = {'max': 42};
    Assert.equalValue( "1 SubfieldRules.__checkLengthMax, ok test", CheckLength.__checkLengthMax( subfield, params1 ), [] );

    var params2 = {'max': 1};
    var error2 = [ValidateErrors.subfieldError( "TODO:fixurl", ResourceBundle.getStringFormat( bundle, "check.length.max.error", "a", 1 ) ) ];
    Assert.equalValue( "2 SubfieldRules.__checkLengthMax, error test", CheckLength.__checkLengthMax( subfield, params2 ), error2 );
} );
