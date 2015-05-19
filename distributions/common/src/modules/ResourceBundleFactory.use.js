//-----------------------------------------------------------------------------
use( "Locale" );
use( "Log" );
use( "ResourceBundle" );

//-----------------------------------------------------------------------------
EXPORTED_SYMBOLS = [ 'ResourceBundleFactory' ];

//-----------------------------------------------------------------------------
var ResourceBundleFactory = function() {
    var DEFAULT_LOCALE = Locale.DANISH;
    var resourcePaths = [];

    // Cache over loaded bundle. Name --> Bundle
    var bundles = {};

    function init( settings ) {
        setDistributionPaths( settings.get( 'javascript.basedir' ), settings.get( 'javascript.install.name' ) );
    }

    function getBundle( bundleName ) {
        return getBundleByLocale( bundleName, DEFAULT_LOCALE );
    }

    function getBundleByLocale( bundleName, locale ) {
        Log.trace( "Enter - ResourceBundleFactory.getBundleByLocale" );

        var result = null;
        try {
            var filename = __calcResourceFilename( bundleName, locale );
            if( bundles[ filename ] !== undefined ) {
                return bundles[ filename ];
            }

            for each( var path in resourcePaths ) {
                var props = __loadResourceBundle( path, filename );
                if( props !== null ) {
                    result = ResourceBundle.createWithProperties( locale, props );
                    bundles[ filename ] = result;
                    return result;
                }
            }

            throw StringUtil.sprintf( "Unable to load resource bundle %s for locale %s in paths %s", bundleName, Locale.toString( locale ), resourcePaths );
        }
        finally {
            Log.trace( "Exit - ResourceBundleFactory.getBundleByLocale(): ", result );
        }
    }

    function setResourcePaths( paths ) {
        resourcePaths = paths;
    }

    function setDistributionPaths( basedir, distributionName ) {
        var pathFormat = "%s/distributions/%s/resources";

        setResourcePaths( [
            StringUtil.sprintf( pathFormat, basedir, distributionName ),
            StringUtil.sprintf( pathFormat, basedir, "common" )
        ] );
    }

    function __calcResourceFilename( bundleName, locale ) {
        return StringUtil.sprintf( '%s_%s.properties', bundleName, Locale.toString( locale ) )
    }

    function __loadResourceBundle( path, filename ) {
        Log.trace( "Enter - ResourceBundleFactory.__loadResourceBundle" );

        var result = null;
        try {
            result = new Packages.java.util.Properties();
            result.load( new Packages.java.io.FileReader( path + "/" + filename ) );

            return result;
        }
        catch( ex ) {
            Log.trace( "Exception: ", ex );
            return null;
        }
        finally {
            Log.trace( "Exit - ResourceBundleFactory.__loadResourceBundle(): ", result );
        }
    }

    return {
        'init': init,
        'setResourcePaths': setResourcePaths,
        'setDistributionPaths': setDistributionPaths,
        'getBundle': getBundle,
        'getBundleByLocale': getBundleByLocale
    }
}();