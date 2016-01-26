//Module locateBox
( function(sv, undefined) {

		// Define private variables
        var pluginName = sv.plugins.locateBox.name;
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
            $.get(sv.config.pluginsPath + pluginName + '/'  + config.htmlFile_Panel, function(data) {
                console.log('[' + pluginName + '] - HTML partial file "' + config.htmlFile_Panel + '" loaded.');
                $("#sviewer").append(data);
                $('#panelLocate').popup();
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
                $('#panelLocateBtn').show();
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
            var config = sv.plugins.locateBox.config;
            console.log('[' + pluginName + '] - config file "'+ configFile +'" loaded.');
            init(config);
        }).fail(function() {
            console.log('[' + pluginName + '] - config file "'+ configFile +'" error.');
        });

    }(window.sv = window.sv || {}));
