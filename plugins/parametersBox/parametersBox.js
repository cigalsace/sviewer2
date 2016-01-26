//Module parametersBox
( function(sv, undefined) {
        //console.log(1);

        sv.test = 1;
        
        // Define private variables
        var pluginName = sv.plugins.parametersBox.name;
        var configFile = 'config.js';
        

        /**
         * Private function to init module
         * Load and activate i18n, CSS, HTML files
         * @param {Object} config - Config module file
         */
        function init(config) {
            // Load i18n file
            //$.getScript(sv.config.pluginsPath + pluginName + '/' + config.i18nFile).done(function() {
            sv.loadScript(sv.config.pluginsPath + pluginName + '/' + config.i18nFile, true).done(function() {
                console.log('[' + pluginName + '] - i18n file "' + config.i18nFile + '" loaded.');
                $.extend(true, sv.i18n, sv.plugins.parametersBox.i18n);
            }).fail(function() {
                console.log('[' + pluginName + '] - i18n file "' + config.i18nFile + '" error.');
            });

            // Load CCS file for plugin
            var isCssLoaded = sv.loadCssFile(sv.config.pluginsPath + pluginName + '/' + config.cssFile);
            if (isCssLoaded) {
                console.log('[' + pluginName + '] - CCS file "' + config.cssFile + '" loaded.');
            }

            // Load HTML panel file
            $.get(sv.config.pluginsPath + pluginName + '/' + config.htmlFile_Panel, function(data) {
                console.log('[' + pluginName + '] - HTML partial file "' + config.htmlFile_Panel + '" loaded.');
                $("#sviewer").append(data);
                // TODO: reprendre et intégrer la mise en forme dans le html avec des span et clone de li
                $.each(sv.qs, function(key, value) {
                    var text = key + ': ' + value;
                    $('<li>', {
                        title : 'URL parameter: ' + key,
                        text : text
                    }).appendTo('#urlParameters ul');
                });
                $.each(sv.config, function(key, value) {
                    var text = key + ': ' + value;
                    $('<li>', {
                        title : 'URL parameter: ' + key,
                        text : text
                    }).appendTo('#configParameters ul');
                });
                $('#panelParameters').popup();
                $('#sviewer').trigger('create');
                //$('#parametersBox').show();
            }, "html").fail(function() {
                console.log('[' + pluginName + '] - HTML partial file "' + config.htmlFile_Panel + '" error.');
            });

            // Load HTML button file
            $.get(sv.config.pluginsPath + pluginName + '/' + config.htmlFile_ControlButton, function(data) {
                $("#panelcontrols").controlgroup("container").append(data);
                $('#panelcontrols').controlgroup('refresh');
                //$('#panelcontrols').trigger('create');
                $('#panelParametersBtn').show();
                console.log('[' + pluginName + '] - HTML partial file "' + config.htmlFile_ControlButton + '" loaded.');
            }, "html").fail(function() {
                console.log('[' + pluginName + '] - HTML partial file "' + config.htmlFile_ControlButton + '" error.');
            });
        }

        /**
         * Main part of script module
         */
        // Load config file
        //$.getScript(sv.config.pluginsPath + pluginName + '/' + configFile).done(function() {
        sv.loadScript(sv.config.pluginsPath + pluginName + '/' + configFile, true).done(function() {
            var config = sv.plugins.parametersBox.config;
            console.log('[' + pluginName + '] - config file "' + configFile + '" loaded.');
            init(config);
        }).fail(function() {
            console.log('[' + pluginName + '] - config file "' + configFile + '" error.');
        });

    }(window.sv = window.sv || {}));
