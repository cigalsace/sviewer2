/**
 * Default public config object
 */
sv.customConfig = {
    lang : 'en',
    title : 'geOrchestra mobile 2',
    layersQueryString : '',
    wmc : '',
    lb : 0,
    geOrchestraBaseUrl : 'http://sdi.georchestra.org/',
    projcode : 'EPSG:3857',
    projection : ol.proj.get('EPSG:3857'),
    initialExtent : [-12880000, -1080000, 5890000, 7540000],
    maxExtent : [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
    restrictedExtent : [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
    maxFeatures : 10,
    nodata : '<!--nodatadetect-->\n<!--nodatadetect-->',
    openLSGeocodeUrl : "http://gpp3-wxs.ign.fr/[CLEF GEOPORTAIL]/geoportail/ols?",
    layersBackground : [new ol.layer.Tile({
        preload : 2,
        source : new ol.source.MapQuest({
            layer : 'osm'
        })
    }), new ol.layer.Tile({
        preload : 2,
        source : new ol.source.MapQuest({
            layer : 'sat'
        })
    })],
    layersQueryable : [],
    socialMedia : {
        'Twitter' : 'https://twitter.com/intent/tweet?text=',
        'Google+' : 'https://plus.google.com/share?url=',
        'Facebook' : 'http://www.facebook.com/sharer/sharer.php?u='
    },
    customConfigDir: '../configs/',
    customConfigFile: 'customConfig.js',
    customConfigPrefix: 'customConfig_',
    pluginsPath : '../plugins/',
    activePlugins : ['parametersBox'],
    inactivePlugins: ['timeSlider']
};

