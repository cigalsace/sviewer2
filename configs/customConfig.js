/**
 * Default public config object
 */
sv.customConfig = {
    title: 'geOrchestra mobile 1',
    /**
     * force default language, see etc/i18n.js
     */
    // lang: 'fr',

    /**
     * base url of the geOrchetra SDI. Layers coming from this SDI
     * will have enhanced features.
     */
    geOrchestraBaseUrl : 'https://www.cigalsace.org/',

    /**
     * map bounds
     */
    //initialExtent : [-12880000, -1080000, 5890000, 7540000],
    initialExtent: [626783.6319384453, 6021403.340193044, 1018141.2167585477, 6291073.175983146],
    maxExtent : [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
    restrictedExtent : [-20037508.34, -20037508.34, 20037508.34, 20037508.34],

    /**
     * getFeatureInfo control
     */
    maxFeatures : 10,
    nodata : '<!--nodatadetect-->\n<!--nodatadetect-->',

    /**
     * openLS control
     */
    openLSGeocodeUrl : "http://gpp3-wxs.ign.fr/[CLEF GEOPORTAIL]/geoportail/ols?",

    /**
     * background layers (EPSG:3857)
     */
    layersBackground : [
        //new ol.layer.Tile({
        //    preload : 2,
        //    source : new ol.source.OSM()
        //}),
        new ol.layer.Tile({
            preload : 2,
            source : new ol.source.MapQuest({
                layer : 'osm'
            })
        }),
        new ol.layer.Tile({
            preload : 2,
            source : new ol.source.MapQuest({
                layer : 'sat'
            })
        }),
        new ol.layer.Tile({
            preload : 2,
            source: new ol.source.OSM()
        })
    ],

    /**
     * social media links (prefixes)
     */
    socialMedia : {
        'Twitter' : 'https://twitter.com/intent/tweet?text=',
        'Google+' : 'https://plus.google.com/share?url=',
        'Facebook' : 'http://www.facebook.com/sharer/sharer.php?u='
    },
    pluginsPath : './plugins/',
    activePlugins : ['locateBox', 'queryBox', 'parametersBox'],
    inactivePlugins : ['timeSlider']
};
