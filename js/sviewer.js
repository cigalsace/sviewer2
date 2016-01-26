// Main
/**
 * Nouvelle version du sviewer
 *
 * Principe: conserver les technologies initiales: Openlayers 3 et Jquery Mobile
 *
 * Pistes d'amélioraton recherchées:
 *  - Utiliser les thèmes de Jquery Mobile sans modification de code (sauf inclusion des CSS)
 *  - Optimiser le code
 *  - Utilisation d'un espace de nom global (sv)
 *  - Approche modulaire pour ajouter des fonctions sous forme de plugin
 *
 * TODO:
 *  - Rendre shareLink opérationnelle
 *  - Rendre la legend opérationnelle (à afficher uniquement si qs.layers est défini)
 *  - Traiter l'ensemble des query strings
 *  - Plugin queryBox
 *  - Plugin LocateBox
 *  - Plugin timeSlider
 *  - Plugin sldSlider
 *  - Outils de mesure
 *  - Plugin DualViewer
 */

'use strict';

( function(sv, undefined) {

        // Uncomment for production
        sv.config.isVerbose = true;

        // cache for layers capacity
        //sv.cacheLayersCapabilities = [];

        //************************************************************
        // HELPER FUNCTIONS
        //************************************************************

        /**
         * Public function to get parameters array (key and value) from URL query string
         * @returns {Array} Array of key/value list of parameters
         */
        sv.getUrlParams = function(url) {
            var vars = {};
            var parts = url.replace(new RegExp('[\?&]+([^=&]+)=?([^&#]*)', 'gi'), function(m, key, value) {
                vars[key] = decodeURIComponent(value.replace(/\+/g, " "));
            });
            return vars;
        };

        /**
         * Public function to get a specific parameter's value from URL query string
         * @param {String} param - Parameter's name
         * @returns {String} Value of parameter
         */
        sv.getUrlParam = function(url, param) {
            if ( param = (new RegExp('[\?&]+' + encodeURIComponent(param) + '=?([^&]*)', 'i')).exec(url)) {
                return decodeURIComponent(param[1]);
            }
        };

        /**
         * Public function to load a CSS file in index.html
         * @parama {String} path - Full path to CSS file with filename (ex.: '../plugins/plugin1/plugin1.css')
         * @returns {Boolean} True
         */
        sv.loadCssFile = function(path) {
            $("<link/>", {
                rel : "stylesheet",
                type : "text/css",
                href : path
            }).appendTo("head");
            return true;
        };

        /**
         * Load a JS file in index.html
         * @param {String} path - Full path to JS file with filename (ex.: '../plugins/plugin1/plugin1.js')
         * @param {Function} succes_fct - Function to execute if js loading file successed (could be an anonymous function)
         * @param {Function} fail_fct - Function to execute if loading file failed (could be an anonymous function)
         */
        sv.loadScript = function(path, cache) {
            var cache = cache || false;
            return $.ajax({
                type : 'GET',
                url : path,
                dataType : 'script',
                cache : cache
            });
        };

        /**
         * Public function to generate query string from config and map parameters
         * @param {Array} config - array of config data
         * @param {Object} map - object map to get x, y and z params
         * @returns {String} - query string URL
         */
        sv.getQueryString = function(config, map) {
            var querystring;
            var linkParams = {};
            var center = map.get('view').getCenter();
            linkParams.x = encodeURIComponent(Math.round(center[0]));
            linkParams.y = encodeURIComponent(Math.round(center[1]));
            linkParams.z = encodeURIComponent(map.get('view').getZoom());
            linkParams.lb = encodeURIComponent(config.lb);
            if (config.customConfigFile) {
                linkParams.c = config.customConfigName;
            }
            if (config.kmlUrl) {
                linkParams.kml = config.kmlUrl;
            }
            if (config.search) {
                linkParams.s = '1';
            }
            if (config.layersQueryString) {
                linkParams.layers = config.layersQueryString;
            }
            if (config.title && config.wmctitle != config.title) {
                linkParams.title = config.title;
            }
            if (config.wmc) {
                linkParams.wmc = config.wmc;
            }
            /*
            if (config.addPlugins) {
                linkParams.addPlugins = config.addPlugins;
            }
            if (config.delPlugins) {
                linkParams.delPlugins = config.delPlugins;
            }
            */
            if (config.activePlugins) {
                linkParams.onlyPlugins = config.activePlugins.join(',');
            }
            return $.param(linkParams);
        };

        /**
         * Sanitize strings
         * @param {String} string input string
         * @return {String} secured string
         */
        sv.escHTML = function(string) {
            return $('<p/>').text(string).html();
        };

        /**
         * Returns a proxified URL for Ajax XSS
         * @param {String} url
         * @return {String} Ajax url
         */
        sv.ajaxURL = function(url) {
            // relative path
            if (url.indexOf('http') !== 0) {
                return url;
            }
            // same domain
            else if (url.indexOf(location.protocol + '//' + location.host) === 0) {
                return url;
            } else {
                return '/proxy/?url=' + encodeURIComponent(url);
            }
        };

        /**
         * Print the current displayed map
         * Some bug with RAM constated for old versions of Chromium (update it !)
         */
         /*
        sv.printMap = function(map) {
            map.once('postcompose', function(event) {
                var canvas = event.context.canvas;
                $('#prBt').attr('href', canvas.toDataURL('image/png'));
            });
            map.renderSync();
        }
        */
        
        //*********************************************************
        // TRANSLATION FUNCTIONS
        //*********************************************************

        /**
         * Private function to translates strings
         * @param {String} s input string
         * @return {String} translated string
         */
        sv.tr = function(s) {
            if ($.type(sv.i18n[sv.config.lang][s]) === 'string') {
                return sv.i18n[sv.config.lang][s];
            } else {
                return s;
            }
        };

        /**
         * Private function to translate DOM elements i18n
         * @param selector {String} jQuery selector
         * @param propnames {Array} array of property names
         */
        sv.translateDOM = function(selector, propnames) {
            $.each($(selector), function(i, e) {
                // text translation
                $(e).text(sv.tr($(e).text()));
                // properties translation
                $.each(propnames, function(j, p) {
                    if (p == "value") {
                        $(e).val(sv.tr($(e).prop(p)));
                    } else {
                        $(e).prop(p, sv.tr($(e).prop(p)));
                    }
                });
            });
        };

        /**
         * Public function to translate sviewer UI
         */
        sv.translate = function(lang) {
            if (lang !== 'en') {
                sv.translateDOM('.i18n', ['title', 'placeholder', 'value']);
            }
        };

        //************************************************************
        // UI FUNCTIONS
        //************************************************************

        /**
         * Public function to update title
         * @param {String} title - New title
         */
        sv.setTitle = function(title) {
            document.title = title;
            if (title !== '') {
                $('#panelShareBtn').text(title);
            }
            if ($("#setTitle").val() === '') {
                $("#setTitle").val(title);
            }
            sv.config.title = title;
        };

        /**
         * Public function on close panel
         * @param {} event - New title
         */
        sv.onClosePanel = function(event) {
            var id = '#' + $(this).attr('id');
            $.each($('#panelcontrols a'), function() {
                if (id == $(this).attr('href')) {
                    $(this).removeClass('ui-btn-active');
                }
            });
        };

        /**
         * Public function on click panel controls button to open panel
         * @param {} event - Event
         */
        sv.onClickPanelControlsBtn = function(event) {
            event.preventDefault();
            var id = $(this).attr('href');
            $.each($('#panelcontrols a'), function() {
                $($(this).attr('href')).popup('close');
            });
            // setTimeout = bug for FireFox and Jquery Mobile
            setTimeout(function() {
                $(id).popup('open');
            }, 0);
        };

        /**
         * Public function to set permalink and QR Code
         * @param {} event - Event
         */
        sv.setPermalink = function(config, map) {
            // permalink, social links & QR code update only if frame is visible
            var permalinkQuery = window.location.origin + window.location.pathname + "?" + sv.getQueryString(config, map);
            // Add social links
            $('#socialLinks div').empty();
            $.each(sv.config.socialMedia, function(name, socialUrl) {
                // TODO: améliorer traduction
                $('#socialLinks').children('a:first').clone().attr('href', socialUrl + encodeURIComponent(permalinkQuery)).attr('title', sv.tr('share on ') + name).html(name).removeClass('sv-hidden').appendTo('#socialLinks div');
            });
            // Add geOrchestra url
            $('#georchestraForm').attr('action', sv.config.geOrchestraBaseUrl + 'mapfishapp/');
            // Add QR Code
            if ($('#qrcode').is(":visible")) {
                $('#qrcode').empty();
                new QRCode("qrcode", {
                    text : permalinkQuery,
                    width : 130,
                    height : 130,
                    correctLevel : QRCode.CorrectLevel.L
                });
            }
            $('#permalink').prop('href', permalinkQuery);
        };

        
        //************************************************************
        // Class sv.Map
        //************************************************************

        /**
         * Class sv.Map extends ol.map
         * @param {Object} options - Options of map
         */
        sv.Map = function(options) {
            ol.Map.call(this, options);
            //var map = this;
            //map.property1 = test || '';
        };
        sv.Map.prototype = new ol.Map({});

        /**
         * Function to add background layers
         */
        sv.Map.prototype.addLayersBackground = function(layers) {
            var map = this;
            $.each(layers, function(i, layer) {
                layer.isBackground = true;
                layer.level = i;
                map.addLayer(layer);
                layer.setVisible(false);
            });
            map.nb_lb = layers.length;
        };

        /**
         * Function to switch between backgroud layers
         * Iterates over background layers, sets the visibility according to the lb parameter.
         * @param {Integer} lb - layer index, mandatory
         */
        sv.Map.prototype.switchBackground = function(lb) {
            var map = this;
            map.lb = lb % map.nb_lb;
            map.getLayers().forEach(function(layer, i) {
                if (layer.isBackground) {
                    map.getLayers().item(i).setVisible(layer.level == map.lb);
                }
            });
            return map.lb;
        };

        /**
         * Function to zoom in or out (go to zoomLevel)
         * Zoom in = this.get('view').getZoom() + 1
         * Zoom out = this.get('view').getZoom() - 1
         * @param {Integet} zoomLevel - goal level to zoom
         */
        sv.Map.prototype.zoom = function(zoomLevel) {
            var zoom = ol.animation.zoom({
                duration : 500,
                source : this.get('view').getCenter(),
                resolution : this.get('view').getResolution()
            });
            this.beforeRender(zoom);
            this.get('view').setZoom(zoomLevel);
        };

        /**
         * Function to come back to initial zoom and extend of map
         */
        sv.Map.prototype.zoomInit = function(initialExtent) {
            var start = +new Date();
            var pan = ol.animation.pan({
                duration : 500,
                source : this.get('view').getCenter(),
                start : start
            });
            var zoom = ol.animation.zoom({
                duration : 500,
                source : this.get('view').getCenter(),
                resolution : this.get('view').getResolution(),
                start : start
            });
            this.beforeRender(pan, zoom);
            this.get('view').fit(initialExtent, this.getSize());
            this.get('view').setRotation(0);
        };
        
        /**
         * Function to print the current displayed map
         * Some bug with RAM constated for old versions of Chromium (update it !)
         */
        sv.Map.prototype.printMap = function(button) {
            this.once('postcompose', function(event) {
                var canvas = event.context.canvas;
                button.attr('href', canvas.toDataURL('image/png'));
            });
            this.renderSync();
        }

        //************************************************************
        // Class sv.TileLayer
        //************************************************************

        /**
         * Class sv.TileLayer extends ol.layer.Tile
         */
        sv.TileLayer = function(options) {
            ol.layer.Tile.call(this, options);
            this.options = {
                //nslayername : '',
                //layername : '',
                //namespace : '',
                //stylename : '',
                //qcl_filter : '',
                //wmsurl_global : '',
                //wmsurl_ns : '',
                //wmsurl_layer : '',
                sldurl : null,
                format : 'image/png',
                //opacity : 1
                opacity: isNaN(options.opacity) ? 1 : options.opacity
            };
            // layers from query string parameter
            if ($.type(options) === "string") {
                this.parseLayerParam(options);
                //this.options = sv.TileLayer.parseLayerParam(options);
            } else {
                $.extend(this.options, options);
            }
            //ol.layer.Tile.call(this, options);

            // create wms layer
            // ol.source params
            var wms_params = {
                'url' : this.options.wmsurl_ns,
                params : {
                    'LAYERS' : this.options.layername,
                    'FORMAT' : this.options.format,
                    'TRANSPARENT' : true,
                    'STYLES' : this.options.stylename
                },
                extent : sv.config.maxExtent
            };
            if (this.options.cql_filter) {
                wms_params.params.CQL_FILTER = this.options.cql_filter;
            }
            if (this.options.sldurl) {
                wms_params.params.SLD = this.options.sldurl;
            }
            this.options.params = wms_params;
            //this.options.source = new ol.source.TileWMS(wms_params);
            this.setSource(new ol.source.TileWMS(wms_params));
            this.setOpacity(this.options.opacity);
            /*
            self.wmslayer = new ol.layer.Tile({
            //opacity: isNaN(self.options.opacity)?1:self.options.opacity,
            //source: new ol.source.TileWMS(wms_params)
            });
            */

            // Get metadata
            this.setMetadata();
        };
        sv.TileLayer.prototype = new ol.layer.Tile();

        /**
         * Parses a wms layer descriptor, calls the legend, returns the wms layer
         * @param {String} s the querystring describing the layer
         */
        sv.TileLayer.prototype.parseLayerParam = function(s) {
            this.options.nslayername = s.split('*')[0];
            // namespace:layername
            this.options.stylename = (s.indexOf("*") > 0) ? s.split('*',2)[1] : '';
            // stylename
            this.options.cql_filter = (s.indexOf("*") > 1) ? s.split('*',3)[2] : '';
            // qcl_filter
            this.options.namespace = (this.options.nslayername.indexOf(":") > 0) ? this.options.nslayername.split(':',2)[0] : '';
            // namespace
            this.options.layername = (this.options.nslayername.indexOf(':') > 0) ? this.options.nslayername.split(':',2)[1] : '';
            // layername
            this.options.wmsurl_global = sv.config.geOrchestraBaseUrl + 'geoserver/wms';
            // global getcap
            this.options.wmsurl_ns = sv.config.geOrchestraBaseUrl + 'geoserver/' + this.options.namespace + '/wms';
            // virtual getcap namespace
            this.options.wmsurl_layer = sv.config.geOrchestraBaseUrl + 'geoserver/' + this.options.namespace + '/' + this.options.layername + '/wms';
        };

        /**
         * Queries the layer capabilities to display its legend and metadata
         */
        sv.TileLayer.prototype.setMetadata = function() {
            var parser = new ol.format.WMSCapabilities();
            var layer = this;
            layer.capability = {};
            console.log(sv.ajaxURL(layer.options.wmsurl_ns + '?SERVICE=WMS&REQUEST=GetCapabilities'));
            $.ajax({
                url : sv.ajaxURL(layer.options.wmsurl_ns + '?SERVICE=WMS&REQUEST=GetCapabilities'),
                type : 'GET',
                cache : true,
                success : function(response) {
                    //var html = [];
                    //var mdLayer;
                    var capabilities = parser.read(response);
                    // searching for the layer in the capabilities
                    $.each(capabilities.Capability.Layer.Layer, function() {
                        if (this.Name === layer.options.layername) {
                            layer.capability = this;
                        }
                    });
                    if (layer.capability) {
                        // Define legend URL
                        var legendArgs = {
                            'SERVICE' : 'WMS',
                            'VERSION' : capabilities.version,
                            'REQUEST' : 'GetLegendGraphic',
                            'FORMAT' : 'image/png',
                            'LAYER' : layer.capability.Name,
                            'STYLE' : layer.options.stylename
                        };
                        if (layer.options.sldurl) {
                            legendArgs.SLD = layer.options.sldurl;
                        }
                        //legendArgs.SLD = layer.options.sldurl || '';
                        layer.capability.LegendUrl = layer.options.wmsurl_ns + '?' + $.param(legendArgs);
                        /*
                         if (config.search) {
                         config.searchparams.title = layerCapabilities.Title;
                         }
                         */
                    }
                    //console.log(layer.layerCapabilities);
                    layer.setLegend();
                },
                failure : function() {
                    Ol.Console.error.apply(Ol.Console, arguments);
                    layer.capability = false;
                }
            });
        };
        
        sv.TileLayer.prototype.getCapability = function() {
            return this.capability;
        };
        
        /**
         * Public function to set legend
         * @param {} event - Event
         */
        sv.TileLayer.prototype.setLegend = function() {
            // TODO: a reprendre sur la base d'un template dans le HTML
            /*
             <div class="sv-md">
             <span class="sv-md-attrib">source :
             <a target="_blank" href="' + mdLayer.Attribution.OnlineResource + '" >
             <img class="sv-md-logo" src="' + mdLayer.Attribution.LogoURL.OnlineResource + '" /><br />
             </a>
             </span>
             <p><h4 class="sv-md-title">' + escHTML(mdLayer.Title) + '</h4>
             <p class='sv-md-abstract'>" + escHTML(mdLayer.Abstract)&nbsp;
             <a target="_blank" class="sv-md-meta" href="' + this.OnlineResource + '">
             tr('metadata')
             ... </a>
             </p>
             // legend
             <img class="sv-md-legend" src="' + mdLayer.LegendUrl + '" />
             </div>
             */

            var layerCapability = this.getCapability();
            var html = [];
            if (layerCapability) {
                html.push('<div class="sv-md">');
                // attribution
                if (layerCapability.Attribution) {
                    html.push('<span class="sv-md-attrib">' + tr('source'));
                    html.push(' : <a target="_blank" href="' + layerCapability.Attribution.OnlineResource + '" >');
                    if (layerCapability.Attribution.LogoURL) {
                        html.push('<img class="sv-md-logo" src="' + layerCapability.Attribution.LogoURL.OnlineResource + '" /><br />');
                    }
                    html.push(sv.escHTML(layerCapability.Attribution.Title));
                    html.push('</a></span>');
                }
                // title
                console.log(layerCapability);
                html.push('<p><h4 class="sv-md-title">' + sv.escHTML(layerCapability.Title) + '</h4>');
                // abstract
                html.push("<p class='sv-md-abstract'>" + sv.escHTML(layerCapability.Abstract));
                // metadata
                if (layerCapability.hasOwnProperty('MetadataURL')) {
                    $.each(layerCapability.MetadataURL, function() {
                        if (this.Format === "text/html") {
                            html.push('&nbsp;<a target="_blank" class="sv-md-meta" href="' + this.OnlineResource + '">');
                            html.push(tr('metadata'));
                            html.push(" ... </a>");
                        }
                    });
                }
                html.push("</p>");
                // legend
                html.push('<img class="sv-md-legend" src="' + layerCapability.LegendUrl + '" />');
                html.push('</div>');
                html.push('<hr/>');

                $('#legend').append(html.join(''));
            }
        };


        //************************************************************
        // Class sv.Plugin
        //************************************************************

        /**
         * Class sv.Plugin
         */
        sv.Plugin = function(name) {
            this.name = name || undefined;
        };

        //************************************************************
        // MAIN PROGRAM
        //************************************************************

        /**
         * Public variable of URL query string parameters
         * Core parameters:
         *  - 'title'       : Title of the sviewer
         *  - 'c'           : Config file (without prefix and extension)
         *  - 'onlyPlugins' : Only plugins to activate
         *  - 'addPlugins'  : Plugins to add to config plugins list
         *  - 'delPlugins'  : Plugins to remove from config plugins list
         *  - 'lang'        : Lang of sviewer UI
         *  - 'x', 'y', 'z' : recenters map on specified location ((x,y) is center coordinates of map and z the zoom level)
         *  - 'lb'          : id of background layer in layersBackground list variable
         *  - 'layers'      : TODO
         *  - 'wmc'         : TODO
         *  - 'kml'         : TODO
         *  - 'q'           : TODO
         *  - 'qr'          : TODO
         *  - 's'           : TODO
         *  - 'isVerbose'   : If define, display sv.log message
         */
        sv.qs = sv.getUrlParams(window.location.search);

        /**
         * Public variable of plugins list
         */
        sv.plugins = [];

        /**
         * Public function to display sv.log message according value of isVerbose config parameter
         */
        sv.log = function(message) {
            if (sv.qs.hasOwnProperty('isVerbose')) {
                sv.config.isVerbose = true;
            }
            if (sv.config.isVerbose) {
                console.log(message);
            }
        };

        /**
         * Private function to load config file for sviewer app from URL query string 'c' parameter or customConfig.js or default config.js
         * @callback {function} loadPlugins
         */
        function loadConfigFile() {
            if (sv.qs.c) {
                var configFile = sv.config.customConfigPrefix + sv.qs.c + '.js';
            } else {
                var configFile = sv.config.customConfigFile;
            }
            sv.loadScript(sv.config.customConfigDir + configFile, true)
                .done(function() {
                    $.extend(sv.config, sv.customConfig);
                    sv.log('Config file "' + configFile + '" loaded.');
                })
                .fail(function() {
                    sv.log('Config file "' + configFile + '" not loaded. - [ERROR]');
                })
                .always(function() {
                    // Load plugins
                    if (sv.qs.onlyPlugins) {
                        sv.config.activePlugins = sv.qs.onlyPlugins.replace(' ', '').split(',');
                    }
                    if (sv.qs.addPlugins) {
                        $.Extend(sv.config.activePlugins, sv.qs.replace(' ', '').addPlugins.split(','));
                    }
                    if (sv.qs.delPlugins) {
                        $.each(sv.qs.delPlugins.replace(' ', '').split(','), function(i, plugin) {
                            var index = sv.config.activePlugins.indexOf(plugin);
                            if (index !== -1) {
                                //console.log(index + ' ' + plugin);
                                sv.config.activePlugins.splice(index, 1);
                            }
                        });
                    }
                    
                    doConfiguration();
                    doMap();
                    doGUI();
                    $.when.apply($, getPluginsScripts(sv.config.activePlugins));
                    $('#sviewer').trigger('create');
                    
                    //.then(doMap).then(doGUI).then.apply($, getPluginsScripts(sv.config.activePlugins));
                    /*
                    $.when.apply($, getPluginsScripts(sv.config.activePlugins)).then(function() {
                        doConfiguration();
                        doMap();
                        doGUI();
                    });
                    */
            });
        }

        /**
         * Private function to get list of promise to load plugins define in config file
         */
        function getPluginsScripts(plugins) {
            var pluginScripts = [];
            $.each(plugins, function(index, plugin) {
                sv.plugins[plugin] = new sv.Plugin(plugin);
                pluginScripts.push(sv.loadScript(sv.config.pluginsPath + plugin + '/' + plugin + '.js', false).done(function() {
                    sv.log('Plugin "' + plugin + '" activation...');
                }));
            });
            return pluginScripts;
        }

        loadConfigFile();
        //loadConfigFile(sv.config.customConfigDir + sv.config.customConfigFile, pluginScripts);

        function doConfiguration() {
            // Get title from URL
            if (sv.qs.title) {
                sv.config.title = sv.qs.title;
            }
            // Get lang from URL
            if (sv.qs.lang) {
                sv.config.lang = sv.qs.lang;
            }
            // get x, y and z from URL
            if (sv.qs.x && sv.qs.y && sv.qs.z) {
                sv.config.z = parseInt(sv.qs.z);
                var p = [parseFloat(sv.qs.x), parseFloat(sv.qs.y)];
                // is this lonlat ? anyway don't use sviewer for the vendee globe
                if (Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 180 && sv.config.z > 7) {
                    p = ol.proj.transform(p, 'EPSG:4326', sv.config.projcode);
                }
                sv.config.x = p[0];
                sv.config.y = p[1];
            }
            // Get layers from URL
            if (sv.qs.layers) {
                sv.config.layersQueryString = sv.qs.layers;
                var ns_layer_style_list = [];
                // parser to retrieve serialized namespace:name[*style[*cql_filter]] and store the description in config
                ns_layer_style_list = ( typeof sv.qs.layers === 'string') ? sv.qs.layers.split(',') : sv.qs.layers;
                $.each(ns_layer_style_list, function() {
                    //console.log(this);
                    sv.config.layersQueryable.push(new sv.TileLayer(this));
                });
                $('#panelLegendBtn').show();
            }
        }

        function doMap() {
            // map creation
            sv.map = new sv.Map({
                layers : [],
                controls : [new ol.control.ScaleLine(), new ol.control.Attribution({
                    target : 'panelAttributions'
                })],
                target : 'map',
                view : new ol.View()
            });

            sv.map.addLayersBackground(sv.config.layersBackground);
            sv.map.switchBackground(sv.config.lb);

            /*
            // adding WMS layers from georchestra map (WMC)
            // try wmc=58a713a089cf408419b871b73110b7cb on dev.geobretagne.fr
            if (config.wmc) {
            parseWMC(config.wmc);
            }
            */
            // adding queryable WMS layers from querystring
            $.each(sv.config.layersQueryable, function() {
                //var layer = new sv.TileLayer(this);
                sv.map.addLayer(this);
                //sv.setLegend(this.capability);
                //console.log(this.getCapability());
                //console.log(this.options);
            });
            //sv.map.addLayer(new ol.layer.Tile({source: new ol.source.OSM()}));
            
            /*
            //activate search for WMS layer (origin : ?layers=...)
            if (config.search && config.layersQueryable.length > 0) {
            activateSearchFeatures('remote');
            }

            // adding kml overlay
            if (config.kmlUrl) {
            config.kmlLayer = new ol.layer.Vector({
            source : new ol.source.Vector({
            projection : 'EPSG:3857',
            url : ajaxURL(config.kmlUrl),
            format : new ol.format.KML()
            })
            });
            map.addLayer(config.kmlLayer);

            //activate search for kml layer (origin : ?kml=...)
            if (config.search) {
            activateSearchFeatures('local');
            }
            }
            */
            // map recentering
            if (sv.config.x && sv.config.y && sv.config.z) {
                sv.map.getView().setCenter([sv.config.x, sv.config.y]);
                sv.map.getView().setZoom(sv.config.z);
            } else {
                sv.map.getView().fit(sv.config.initialExtent, sv.map.getSize());
                sv.map.getView().setRotation(0);
            }

            /*
             // marker overlay for geoloc and queries
             marker = new ol.Overlay({
             element : $('#marker'),
             positioning : 'bottom-left',
             stopEvent : false
             });
             map.addOverlay(marker);
             */
        }
        //doMap();

        /*
        // panel size and placement to fit small screens
        function panelLayout(e) {
        var panel = $(this);
        panel.css('max-width', Math.min($(window).width() - 44, 450) + 'px');
        panel.css('max-height', $(window).height() - 64 + 'px');
        }
        */

        //**********************************************************************
        // GUI
        //**********************************************************************

        function doGUI() {
            // opens permalink tab if required
            /*
            if (qs.qr) {
            setPermalink();
            $('#panelShare').popup('open');
            }
            */

            /*
            // map events
            map.on('singleclick', function(e) {
            queryMap(e.coordinate);
            });
            map.on('moveend', setPermalink);
            $('#marker').click(clearQuery);
            */
            // map buttons
            $('#ziBt').on('click', function() {
                sv.log('Zoom from ' + sv.map.getView().getZoom() + ' to ' + sv.map.getView().getZoom() + 1 + '.');
                sv.map.zoom(sv.map.getView().getZoom() + 1);
            });
            $('#zoBt').on('click', function() {
                sv.log('Zoom from ' + sv.map.getView().getZoom() + ' to ' + sv.map.getView().getZoom() - 1 + '.');
                sv.map.zoom(sv.map.getView().getZoom() - 1);
            });
            $('#zeBt').on('click', function() {
                sv.map.zoomInit(sv.config.initialExtent);
                sv.log('Go back to initial exent.');
            });
            // Switch button
            $('#bgBt').on('click', function() {
                sv.log('Switch background layer map from ' + sv.config.lb + ' to ' + sv.config.lb + 1 + '.');
                sv.config.lb = sv.map.switchBackground(sv.config.lb + 1);
            });
            // Print button
            //$('#prBt').click(printMap);
            $('#prBt').on('click', function() {
                sv.log('Print map.');
                sv.map.printMap($(this));
            });

            /*
            // geolocation form
            $('#zpBt').click(locateMe);
            $('#addressForm').on('submit', searchPlace);
            */
            // Set default title dialog
            sv.setTitle(sv.config.title);
            // Change title from panelShare panel
            $(document).on('keyup', '#setTitle', function(event) {
                sv.setTitle($("#setTitle").val());
                sv.setPermalink(sv.config, sv.map);
            });
            /*
            $('#setTitle').keyup(function() {
            sv.setTitle($("#setTitle").val());
            });
            */
            /*
            $(document).on('blur', '#setTitle', function(event) {
            sv.setPermalink(sv.config, sv.map);
            });
            //$('#setTitle').blur(sv.setPermalink(sv.config, sv.map));
            */
            /*
            // sendto form
            $('#georchestraForm').submit(function(e) {
            sendMapTo('georchestra_viewer');
            });
            */
            // dynamic resize
            /*
            $(window).bind('orientationchange resize pageshow updatelayout', panelLayout);
            $('.sv-panel').bind('popupbeforeposition popupafteropen', panelLayout);
            $.each($('.sv-panel'), panelLayout);
            */
            //$('.sv-panel').bind('popupafteropen', setPermalink);

            // Remove panelControls button highlight after panel close
            $(document).on('popupafterclose', '.sv-panel', sv.onClosePanel);

            // Bypass popup behavior on panelControls button clicked
            $(document).on('click', '#panelcontrols a', sv.onClickPanelControlsBtn);

            $(document).on('popupafteropen', '#panelShare', function() {
                sv.setPermalink(sv.config, sv.map);
            });

            // i18n
            sv.translate(sv.config.lang);

            // resize map
            //$(window).bind("orientationchange resize pageshow", fixContentHeight);
            //$(window).bind("orientationchange resize pageshow", function() { map.updateSize(); });
            $(window).on("orientationchange resize pagecontainershow", function() {
                sv.map.updateSize();
            });

            /*
             if (config.gfiok && (!(config.wmc.length > 0))) {
             //~ queryMap(view.getCenter());
             setTimeout(function() {
             queryMap(view.getCenter());
             }, 300);
             }
             */
            
        }
        //doGUI();

    }(window.sv = window.sv || {}));