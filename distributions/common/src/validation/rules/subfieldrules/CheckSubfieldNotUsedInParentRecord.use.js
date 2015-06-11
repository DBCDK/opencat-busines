//-----------------------------------------------------------------------------
use( "Log" );
use( "ResourceBundle" );
use( "ResourceBundleFactory" );
use( "ValidateErrors" );

//-----------------------------------------------------------------------------
EXPORTED_SYMBOLS = ['CheckSubfieldNotUsedInParentRecord'];
//-----------------------------------------------------------------------------
var CheckSubfieldNotUsedInParentRecord = function () {
    var __BUNDLE_NAME = "validation";

    /**
     * Checks if this subfield exists in multivolume work. If it exist
     * a validation error is returned.
     *
     * @param {Object} record A DanMarc2 record as descriped in DanMarc2Converter
     * @param {Object} field A DanMarc2 field as descriped in DanMarc2Converter
     * @param {Object} subfield The DanMarc2 subfield being validated as descriped
     *                 in DanMarc2Converter
     * @param {Object} params Not used.
     * @param {Object} settings Not used.
     * @return {Array} An array of validation errors in case the value of the
     *                 validated subfield results in zero/non-zero hits in solr.
     *
     * @name CheckSubfieldNotUsedInParentRecord.validateSubfield
     * @method
     */
    function validateSubfield ( record, field, subfield, params, settings ) {
        Log.trace( "Enter - CheckSubfieldNotUsedInParentRecord.validateSubfield" );

        try {
            var marcRecord = DanMarc2Converter.convertToDanMarc2( record );

            // If the point does not has a parent, when we are fine.
            if( !marcRecord.existField( /014/ ) ) {
                return [];
            }

            var recId = marcRecord.getValue( /014/, /a/ );
            var libNo = marcRecord.getValue( /001/, /b/ );

            // If parent record does not exist then we are fine.
            if( !RawRepoClient.recordExists( recId, libNo ) ) {
                Log.debug( "Parent record does not exist!" );
                return [];
            }

            // Load parent record and check if this subfield is used.
            var parentRecord = RawRepoClient.fetchRecord( recId, libNo );
            if( parentRecord.existField( new MatchField( RegExp( field.name ), undefined, RegExp( subfield.name ) ) ) ) {
                var bundle = ResourceBundleFactory.getBundle( __BUNDLE_NAME );
                var message = ResourceBundle.getStringFormat( bundle, "subfield.in.parent.record.error", field.name, subfield.name, recId );

                return [ ValidateErrors.subfieldError( "TODO:fixurl", message ) ];
            }

            // Recursively check the parent record for the subfield.
            var parentRec = DanMarc2Converter.convertFromDanMarc2( parentRecord );
            return CheckSubfieldNotUsedInParentRecord.validateSubfield( parentRec, field, subfield, params, settings );
        }
        finally {
            Log.trace( "Exit - CheckSubfieldNotUsedInParentRecord.validateSubfield" );
        }
    }

    return {
        'validateSubfield': validateSubfield,
        '__BUNDLE_NAME': __BUNDLE_NAME
    }
}();