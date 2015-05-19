//-----------------------------------------------------------------------------
use( "Log" );
use( "ResourceBundleFactory" );
use( "SafeAssert" );

//-----------------------------------------------------------------------------
UnitTest.addFixture( "ResourceBundleFactory.getBundleByLocale", function() {
    Log.trace( "Enter - Fixture: ResourceBundleFactory.getBundleByLocale" );

    try {
        var bundle = ResourceBundleFactory.getBundle("validation");
        SafeAssert.not("Load known bundle", null, bundle);
        SafeAssert.not("Bundle.locale (null)", null === bundle.locale);
        SafeAssert.not("Bundle.entries (null)", null === bundle.entries);
        SafeAssert.not("Bundle.locale (undefined)", undefined === bundle.locale);
        SafeAssert.not("Bundle.entries (undefined)", undefined === bundle.entries);

        SafeAssert.not("Load known value", ResourceBundle.getString(bundle, "record.execute.error") === "");
    }
    finally {
        Log.trace( "Exit - Fixture: ResourceBundleFactory.getBundleByLocale" );
    }
} );