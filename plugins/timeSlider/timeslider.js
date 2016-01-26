//Module timeSlider
( function(sviewer, undefined) {
        var config = {
            name : 'timeSlider',
            dir : 'timeSlider/',
            cssFile : 'timeslider.css',
            htmlFile : 'timeslider.html'
        };

        function sliderBoxInit() {
            var minValue = 0;
            var maxValue = 100;
            var initValue = maxValue;
            $('#timeInput').html('test');
            $("#timeSlider").attr("min", minValue);
            $("#timeSlider").attr("max", maxValue);
            $("#timeSlider").attr("value", initValue);
            $("#timeSlider").slider("refresh");
            $('#timeBox').show();
        }

        function init() {
            // Load CCS file for plugin
            var isCssLoaded = sviewer.loadCssFile(sviewer.config.pluginsPath + config.dir + config.cssFile);
            if (isCssLoaded) {
                console.log('[' + config.name + '] - CCS file "' + config.cssFile + '" loaded.');
            }
            // Load HTML file
            $.get(sviewer.config.pluginsPath + config.dir + config.htmlFile, function(data) {
                $("#sviewer").append(data);
                $('#timeBox').trigger('create');
                sliderBoxInit();
                console.log('[' + config.name + '] - HTML partial file "' + config.htmlFile + '" loaded.');
            }, "html").fail(function() {
                console.log('[' + config.name + '] - HTML partial file "' + config.htmlFile + '" error.');
            });
        }

        var timeLayerParam = sviewer.getUrlParam('timeLayer');
        if (timeLayerParam) {
            init();
        }

    }(window.sviewer = window.sviewer || {}));
