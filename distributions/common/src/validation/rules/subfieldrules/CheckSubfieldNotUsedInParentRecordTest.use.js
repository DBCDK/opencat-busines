//-----------------------------------------------------------------------------
/**
 * This file contains unittests for the SubfieldCannotContainValue module.
 */

//-----------------------------------------------------------------------------
use( "ResourceBundle" );
use( "SafeAssert" );
use( "UnitTest" );
use ( 'GenericSettings' );
use( "CheckSubfieldNotUsedInParentRecord" );
use ("Marc");
use( "DanMarc2Converter");
use( "RawRepoClient" );
//-----------------------------------------------------------------------------

UnitTest.addFixture( "CheckSubfieldNotUsedInParentRecord.validateSubfield", function() {
    function callRule( record, field, subfield ) {
        return CheckSubfieldNotUsedInParentRecord.validateSubfield( record, field, subfield, undefined, undefined );
    }

    var bundle = ResourceBundleFactory.getBundle( CheckSubfieldNotUsedInParentRecord.__BUNDLE_NAME );

    // Case: No parent record.
    var marcRecord = new Record();
    marcRecord.fromString(
        "001 00 *a 1 234 567 8 *b 870970 *c xxx *d yyy *f a\n" +
        "004 00 *a i\n" +
        "008 00 *t xx"
    );

    var record = DanMarc2Converter.convertFromDanMarc2( marcRecord );
    var field = record.fields[2];
    var subfield = field.subfields[0];
    SafeAssert.equal( "No parent record", callRule( record, field, subfield ), [] );

    // Case: Parent record -> 001b Not-A-Number
    marcRecord = new Record();
    marcRecord.fromString(
        "001 00 *a 2 234 567 8 *b 870qqq *c xxx *d yyy *f a\n" +
        "004 00 *a b\n" +
        "014 00 *a 1 234 567 8\n" +
        "008 00 *t xx"
    );
    record = DanMarc2Converter.convertFromDanMarc2( marcRecord );
    field = record.fields[3];
    subfield = field.subfields[0];
    SafeAssert.equal( "Parent record: 001b Not-A-Number", callRule( record, field, subfield ), [] );

    // Case: Parent record -> Subfield not used.
    marcRecord = new Record();
    marcRecord.fromString(
        "001 00 *a 1 234 567 8 *b 870970 *c xxx *d yyy *f a\n" +
        "004 00 *a h\n"
    );
    RawRepoClientCore.clear();
    RawRepoClientCore.addRecord( marcRecord );

    marcRecord = new Record();
    marcRecord.fromString(
        "001 00 *a 2 234 567 8 *b 870970 *c xxx *d yyy *f a\n" +
        "004 00 *a b\n" +
        "014 00 *a 1 234 567 8\n" +
        "008 00 *t xx"
    );

    record = DanMarc2Converter.convertFromDanMarc2( marcRecord );
    field = record.fields[3];
    subfield = field.subfields[0];
    SafeAssert.equal( "Parent record: Subfield not used", callRule( record, field, subfield ), [] );

    // Case: Parent record -> Subfield is used in parent record.
    marcRecord = new Record();
    marcRecord.fromString(
        "001 00 *a 1 234 567 8 *b 870970 *c xxx *d yyy *f a\n" +
        "004 00 *a h\n" +
        "008 00 *t xx"
    );
    RawRepoClientCore.clear();
    RawRepoClientCore.addRecord( marcRecord );

    marcRecord = new Record();
    marcRecord.fromString(
        "001 00 *a 2 234 567 8 *b 870970 *c xxx *d yyy *f a\n" +
        "004 00 *a b\n" +
        "014 00 *a 1 234 567 8\n" +
        "008 00 *t xx"
    );

    record = DanMarc2Converter.convertFromDanMarc2( marcRecord );
    field = record.fields[3];
    subfield = field.subfields[0];

    var message = ResourceBundle.getStringFormat( bundle, "subfield.in.parent.record.error", "008", "t", "1 234 567 8" );
    SafeAssert.equal( "Parent record: Subfield is used in parent record", callRule( record, field, subfield ), [ ValidateErrors.subfieldError( "TODO:fixurl", message ) ] );
} );