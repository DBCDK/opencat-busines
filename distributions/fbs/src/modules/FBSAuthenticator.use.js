//-----------------------------------------------------------------------------
use( "DanMarc2Converter" );
use( "Log" );
use( "Marc" );
use( "MarcClasses" );
use( "NoteAndSubjectExtentionsHandler" );
use( "RawRepoClient" );
use( "RecordUtil" );
use( "ResourceBundleFactory" );
use( "UpdateConstants" );
use( "UpdateOwnership" );
use( "ValidateErrors" );

//-----------------------------------------------------------------------------
EXPORTED_SYMBOLS = [ 'FBSAuthenticator' ];

//-----------------------------------------------------------------------------
/**
 * Module to contain entry points for the authenticator API between Java and
 * JavaScript.
 *
 * @namespace
 * @name FBSAuthenticator
 */
var FBSAuthenticator = function() {
    /**
     * Authenticates a record.
     *
     * @param record Record
     * @param userId User id - not used.
     * @param groupId Group id.
     *
     * @returns {Array} Array of authentication errors. We use the same structure
     *                  as for validation errors.
     *
     * @name FBSAuthenticator#authenticateRecord
     */
    function authenticateRecord( record, userId, groupId, settings ) {
        ResourceBundleFactory.init( settings );
        return JSON.stringify( __authenticateRecord( JSON.parse( record ), userId, groupId ) );
    }

    function __authenticateRecord( record, userId, groupId ) {
        Log.trace( "Enter - FBSAuthenticator.__authenticateRecord()" );

        try {
            if( UpdateConstants.FBS_AGENCY_IDS.indexOf( groupId ) === -1 ) {
                Log.warn( "Unknown record/user." );
                Log.warn( "User/group: ", userId, " / ", groupId );
                Log.warn( "Posten:\n", record );

                return [ ValidateErrors.recordError( "", "Ukendt post eller bruger." ) ];
            }

            var marc = DanMarc2Converter.convertToDanMarc2( record );
            var agencyId = marc.getValue( /001/, /b/ );

            if (agencyId === groupId) {
                return [];
            }

            if (agencyId === UpdateConstants.COMMON_AGENCYID ) {
                return __authenticateCommonRecord( marc, groupId );
            }

            var recId = marc.getValue(/001/, /a/);
            return [ValidateErrors.recordError("", StringUtil.sprintf( "Du har ikke ret til at rette posten '%s' da den er ejet af et andet bibliotek.", recId))];
        }
        finally {
            Log.trace( "Exit - FBSAuthenticator.__authenticateRecord()" );
        }
    }

    /**
     * Helper function.
     *
     * Handles the special case then a FBS library updates a common DBC record.
     *
     * @param record Record
     * @param groupId Group id.
     *
     * @returns {Array} Array of authentication errors. We use the same structure
     *                  as for validation errors.
     *
     * @private
     * @name FBSAuthenticator#__authenticateCommonRecord
     */
    function __authenticateCommonRecord( record, groupId ) {
        Log.trace( "Enter - FBSAuthenticator.__authenticateCommonRecord()" );

        try {
            if( NoteAndSubjectExtentionsHandler.isNationalCommonRecord( record ) === true ) {
                return NoteAndSubjectExtentionsHandler.authenticateExtentions( record, groupId );
            }

            var recId = record.getValue(/001/, /a/);
            var agencyId = record.getValue( /001/, /b/ );
            var owner = record.getValue( /996/, /a/ );

            Log.info( "Record agency: ", agencyId );
            Log.info( "New owner: ", owner );

            if( !RawRepoClient.recordExists( recId, UpdateConstants.RAWREPO_COMMON_AGENCYID ) ) {
                Log.debug( "Checking authentication for new common record." );
                if( owner === "" ) {
                    return [ValidateErrors.recordError("", "Du har ikke ret til at oprette en f\xe6llesskabspost")];
                }

                if( owner !== groupId ) {
                    return [ValidateErrors.recordError("", "Du har ikke ret til at oprette en f\xe6llesskabspost for et andet bibliotek.")];
                }

                return [];
            }

            Log.debug( "Checking authentication for updating existing common record." );
            if( owner === "" ) {
                return [ValidateErrors.recordError("", "Du har ikke ret til at opdatere f\xe6llesskabsposten")];
            }

            if( owner !== groupId ) {
                return [ValidateErrors.recordError("", "Du har ikke ret til at opdatere f\xe6llesskabsposten for et andet bibliotek.")];
            }

            var curRecord = RawRepoClient.fetchRecord( recId, UpdateConstants.RAWREPO_COMMON_AGENCYID );
            var curOwner = curRecord.getValue( /996/, /a/ );

            Log.info( "Current owner: ", curOwner );

            if( curOwner === "DBC" ) {
                return [ValidateErrors.recordError("", "Du har ikke ret til at opdatere en f\xe6llesskabspost som er ejet af DBC")];
            }
            if( curOwner !== "RET" && UpdateConstants.FBS_AGENCY_IDS.indexOf( curOwner ) === -1 ) {
                return [ValidateErrors.recordError("", "Du har ikke ret til at opdatere en f\xe6llesskabspost som ikke er ejet af et folkebibliotek.")];
            }

            return [];
        }
        finally {
            Log.trace( "Exit - FBSAuthenticator.__authenticateCommonRecord()" );
        }
    }

    /**
     * Converts a record to the actual records that should be stored in the RawRepo.
     *
     * @param {Record} record The record.
     *
     * @returns {Array} A list of records of type Record.
     */
    function recordDataForRawRepo( record, userId, groupId ) {
        Log.trace( StringUtil.sprintf( "Enter - FBSAuthenticator.recordDataForRawRepo( %s, %s, %s )", record, userId, groupId ) );

        try {
            var result = __recordDataForRawRepo( record, userId, groupId );
            return result;
        }
        finally {
            Log.trace( StringUtil.sprintf( "Enter - FBSAuthenticator.recordDataForRawRepo( %s )", result ) );
        }
    }

    function __recordDataForRawRepo( record, userId, groupId ) {
        Log.trace( "Enter - FBSAuthenticator.__recordDataForRawRepo()" );

        try {
            if( UpdateConstants.FBS_AGENCY_IDS.indexOf( groupId ) == -1 ) {
                Log.warn( "Unknown record/user." );
                Log.warn( "User/group: ", userId, " / ", groupId );
                Log.warn( "Posten:\n", record );
                return [ record ];
            }

            var agencyId = record.getValue( /001/, /b/ );

            if( agencyId === groupId ) {
                return [ record ];
            }

            if (agencyId === UpdateConstants.COMMON_AGENCYID) {
                return __recordDataForRawRepoCommonRecord( record, userId, groupId );
            }
        }
        finally {
            Log.trace( "Exit - FBSAuthenticator.__recordDataForRawRepo()" );
        }
    }

    function __recordDataForRawRepoCommonRecord( record, userId, groupId ) {
        Log.trace( "Enter - FBSAuthenticator.__recordDataForRawRepoCommonRecord" );

        var correctedRecord = null;
        var dbcEnrichmentRecord = null;
        try {
            RecordUtil.addOrReplaceSubfield( record, "001", "b", UpdateConstants.RAWREPO_COMMON_AGENCYID );

            correctedRecord = NoteAndSubjectExtentionsHandler.recordDataForRawRepo( record, userId, groupId );

            var recId = correctedRecord.getValue( /001/, /a/ );
            var agencyId = UpdateConstants.RAWREPO_COMMON_AGENCYID;
            var curRecord;
            if( RawRepoClient.recordExists( recId, agencyId ) ) {
                curRecord = RawRepoClient.fetchRecord( recId, agencyId );
            }
            else {
                curRecord = undefined;
            }
            correctedRecord = UpdateOwnership.mergeRecord( correctedRecord, curRecord );

            var owner = correctedRecord.getValue( /996/, /a/ );
            if( owner === "" ) {
                Log.debug( "No owner in record." );
                return [ correctedRecord ];
            }

            var recId = correctedRecord.getValue( /001/, /a/ );

            if( !RawRepoClient.recordExists( recId, UpdateConstants.RAWREPO_DBC_ENRICHMENT_AGENCY_ID ) ) {
                Log.debug( "DBC enrichment record [", recId, ":", UpdateConstants.DBC_ENRICHMENT_AGENCYID, "] does not exist." );
                dbcEnrichmentRecord = new Record;

                var idField = record.field( "001" ).clone();
                idField.subfield( "b" ).value = UpdateConstants.RAWREPO_DBC_ENRICHMENT_AGENCY_ID;

                dbcEnrichmentRecord.append( idField );
            }
            else {
                Log.debug("DBC enrichment record [", recId, ":", UpdateConstants.RAWREPO_DBC_ENRICHMENT_AGENCY_ID, "found.");
                dbcEnrichmentRecord = RawRepoClient.fetchRecord(recId, UpdateConstants.RAWREPO_DBC_ENRICHMENT_AGENCY_ID);
            }

            Log.debug( "Replace s10 in DBC enrichment record with: ", owner );
            dbcEnrichmentRecord = RecordUtil.addOrReplaceSubfield( dbcEnrichmentRecord, "s10", "a", owner );

            return [ correctedRecord, dbcEnrichmentRecord ];
        }
        finally {
            Log.trace( "  correctedRecord:\n", correctedRecord );
            Log.trace( "  dbcEnrichmentRecord:\n", dbcEnrichmentRecord );
            Log.trace( "Exit - FBSAuthenticator.__recordDataForRawRepoCommonRecord" );
        }
    }

    return {
        'authenticateRecord': authenticateRecord,
        'recordDataForRawRepo': recordDataForRawRepo
    }
}();
