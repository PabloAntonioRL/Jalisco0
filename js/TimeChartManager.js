/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["luciad/reference/ReferenceProvider","luciad/shape/ShapeFactory", 
    "recursos/js/Util", "recursos/js/TimeChart"], function ( ReferenceProvider, ShapeFactory, Util, TimeChart) {
    
    /*
     * ==========================================================================================
     *              TimeChart
     * ==========================================================================================
     */
    var dataSetStartTime;//1421143477; // Tue Jan 13 11:04:37 CET 2015
    var dataSetEndTime;
    var speedup =[], divs=[]; 
    var lasttime =[];
    var playing =[];
    var timeChart =[];
    var divPlay =[];
    var map;
    var nTC=0;
    var Id;
    function startTimeChart(div,Map, options, updater) {
        options = options || {};
        map = Map;
        var id = options.id || nTC;
        Id = id;
        nTC++;
        lasttime[id] = options.lastTime || Date.now();
        if(!options.startTime) {
            console.log("no hay tiempo de inicio");
            return 0;
        }
        dataSetStartTime = options.startTime;
        dataSetEndTime = options.endTime || lasttime[id];
        divs[id] = div;
        speedup[id] = options.speedUp || 100000;
        divPlay[id] = options.divPlay || "play"+div;
        playing[id] = options.playing || false;
        var format = options.format || "mm/dd/aaaa";
        timeChart[id] = new TimeChart(document.getElementById(div), new Date(dataSetStartTime), new Date(dataSetEndTime), format);
        if(!updater)
            updater = defaultUpdater;
        wireListeners(updater, id);
        setTime(0, updater, id);
        if(playing[id]===true) {
            lasttime[id] = Date.now();
            play(playing[id], id);
        }
        return timeChart[id];
    }
    
    function defaultUpdater() {
        var actualTime = timeChart.getCurrentTime().getTime();
        $('#timeChartLabel').text(Util.formatDate(actualTime, "dd/mm/aaaa"));
        $('#timelabel').text(Util.formatDate(actualTime, "dd/mm/aaaa"));
     }
     
     function wireListeners(updater, id) {
    //timechart
        timeChart[id].addInteractionListener(updater);
        timeChart[id].addZoomListener(function(currZoomLevel, prevZoomLevel) {
            speedup[id] *= prevZoomLevel / currZoomLevel;
        });
        if(divPlay[id] !== "") {
            $("#"+divPlay[id]).click(function(element) {
                var divp = element.currentTarget.id;
                var div = divp.replace("play", "");
                for(var i=0; i<nTC; i++) {
                    if(div === divs[i] || divp === divPlay[i]) {
                        break;
                    }
                }
                lasttime[i] = Date.now();
                play(!playing[i], i);
            });
        }
        //expose navigateTo on window so it can be called from index.html
        window.navigateTo = function(moveTo) {
            if(!map)
                return 0;
            var wgs84 = ReferenceProvider.getReference("EPSG:4326");
            var center = ShapeFactory.createPoint(wgs84, [moveTo.lon, moveTo.lat]);
            var radius = moveTo.radius || 5.0;
            var bounds = ShapeFactory.createBounds(wgs84, [center.x - radius, 2 * radius, center.y - radius, 2 * radius]);
            return map.mapNavigator.fit(bounds);
        };
    }
    
    function playStep(id) {
        if (playing[id]) {
            var currTime = Date.now();
            var deltaTime = (currTime - lasttime[id]);
            lasttime[id] = currTime;
            var timeChartTime = timeChart[id].getCurrentTime().getTime();
            var newTime = timeChartTime + (deltaTime) * speedup[id];
            if (newTime >= timeChart[id].endDate.getTime()) {
            newTime = timeChart[id].startDate.getTime();
        }
        timeChart[id].setCurrentTime(new Date(newTime));
        window.requestAnimationFrame(function() {playStep(id);});
        }
    }

    function play(shouldPlay, id) {
        playing[id] = shouldPlay;
        if (playing[id]) {
            playStep(id);
        }
        var playBtn = $('#'+divPlay[id]);
        playBtn.toggleClass("active", playing[id]);
        playBtn.find("> span").toggleClass("glyphicon-pause", playing[id]);
        playBtn.find("> span").toggleClass("glyphicon-play", !playing[id]);
    }

    function setTime(milliseconds, updater, id) {
        timeChart[id].setCurrentTime(new Date(timeChart[id].startDate.getTime() + milliseconds));
        updater();
        
    }
    
    return {
        startTimeChart: startTimeChart,
        getActualTime: function () {
            return timeChart.getCurrentTime().getTime();
        },
        isPlaying: playing[Id]
    };
});
