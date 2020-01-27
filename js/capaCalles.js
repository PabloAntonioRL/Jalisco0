/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var valoresCalles={}, fechas=[], sensores=[];
define(["recursos/js/Shapes", "luciad/reference/ReferenceProvider","luciad/shape/ShapeFactory", 
    "recursos/js/Util", "recursos/js/TimeChart"], function (Shapes,  ReferenceProvider, ShapeFactory, Util, TimeChart) {
    
    var dataSetStartTime;//1421143477; // Tue Jan 13 11:04:37 CET 2015
    var dataSetEndTime;
    var speedup ; //speedup
    var lasttime;
    var playing;
    var timeChart;
    var divPlay;
    var map;
    var layerCalles;
    var tablaCalles;
    var grafica;
    
    function crearMapaCalor(features, layer) {
         $.ajax({
            type:'Get',
            dataType: "json",
            url: "data/valores.json" 
        }).done(function(data) {
            crearFeatures(features, layer, data);
            
        }).fail(function(e) {
            console.error(e);
        });
    }
    /*
     * 
     * @param {array} features
     * @param {object} layer
     * @param {object} data
     * @returns {undefined}
     */
    function crearFeatures(features, layer, data) {
        for(var f in features) {
            var feature = features[f];
            var id = feature.id;
            var properties = {sensor: id};
            for(var i=1; i<5; i++) {
                var newFeature = Shapes.cloneFeature(feature);
                newFeature.id = id+"-"+i;
                newFeature.properties = properties;
                layer.model.put(newFeature);
            }
        }
        for(var f in data.fechas) {
            fechas[f] = Date.parse(data.fechas[f]);
        }
        valoresCalles = data.valores;
        tablaCalles = data.tabla;
        sensores = data.sensores;
        var options = {
            startTime: "2019/09/09 00:00:00", endTime: "2019/09/12 00:00:00" , speedUp: 500, playing: false,
            format: "hh:mm", divPlay: "play4"
        };
        startTimeChart("timeChart4", map, options, updateCalles);
        layer.filter = filtrarCalles;
        layerCalles = layer;
        crearGrafica();
    }
    /*
     * 
     * @type Number
     */
    var actualTime, nextT;
    function updateCalles( forzar) {
        var intervalo = 20*60*1000;
        try {
            actualTime = timeChart.getCurrentTime().getTime();
            $('#labelCalles').text(Util.formatDate(actualTime, "hh:mm"));
            if(!nextT) {
                nextT =actualTime;
            }
            if(actualTime >= nextT || forzar===true) {
                if(forzar!==true)
                    nextT += intervalo;
                layerCalles.filter = filtrarCalles;

                for(var fecha=0; fecha<fechas.length-1; fecha++) {
                    var rango1 = fechas[fecha];
                    var rango2 = fechas[fecha+1];
                    if(actualTime>=rango1 && actualTime<rango2) {
                        break;
                    }
                }
                var flujoNode = document.getElementById("selectFlujo");
                var flujo = flujoNode? flujoNode.selectedOptions[0].value || 0: 0;
                var newTable = getTablaGrafica(flujo, fecha);
                updateChart(newTable);
            } 
        } catch(e) {}
    }
    
    $("#selectFlujo").on("change input", function () {
        updateCalles(true);
    });
    /*
     * 
     * @param {object} feature
     * @returns {Boolean}
     */
    function filtrarCalles(feature) {
        var id = feature.id;
        if(typeof id === "number")
            return true;
        var flujoNode = document.getElementById("selectFlujo");
        var flujo = flujoNode? flujoNode.selectedOptions[0].value || 0: 0;
        var sensor = feature.properties.sensor;
        actualTime = actualTime || Date.parse("2019/09/09 00:00:00");
        var valor = getValorCalle(flujo, sensor, actualTime);
        id = id.charAt(id.length-1);
        id = parseInt(id);
        if(id<=valor)
            return true;
        else 
            return false;
    }
    
    function crearGrafica() {
        var tabla = getTablaGrafica(0, 0);
        ColumnChart("GraficaCalles", tabla);
    }
    /*
     * 
     * @param {int} flujo
     * @param {int} fecha
     * @returns {Array}
     */
    function getTablaGrafica(flujo, fecha) {
        var tabla = [["sensor", "valor", {type: 'string', role: 'annotation'}]];
        var val=[], sen=[];
        for(var i=0; i<tablaCalles[flujo].length; i++) {
            val[i] = tablaCalles[flujo][i][fecha];
            sen[i] = i<10? "s0"+i: "s"+i;
        }
        val = ordenarMayorMenor(val, sen);
        sen = val.nombres;
        val = val.valores;
        for(i=0; i<10; i++) {
            tabla[i+1] = [sen[i], val[i], ""+val[i]];
        }
        
        return tabla;
    }
    /*
     * 
     * @param {type} valores
     * @param {type} nombres
     * @returns {object}
     */
    function ordenarMayorMenor(valores, nombres) {
        var n = valores.length, x, y, k =0;
        for(var j=1; j<n; j++) {
            if(valores[j] > valores[j-1]) {
                x = valores[j-1];
                y = nombres[j-1];
                valores[j-1] = valores[j];
                nombres[j-1] = nombres[j];
                valores[j] = x;
                nombres[j] = y;
                j = 0;
                k++;
                if(k>(n*10)) {
                    break;
                }
            }
        }
        return {
            valores: valores, nombres: nombres
        };
    }
    var options = {
                width: 450,
                height: 350,
                orientation: "vertical",
                backgroundColor:{
                    fill: "#17202a"
                },
                legend: {
                    position: "none"
                },
                
                chartArea: {
                    left: 50,
                    width: 400,
                    height: 300,
                    backgroundColor: "#17202a"
                },
                annotations: {
                  textStyle: {
                    fontSize: 12,
                    color: '#FFFFFF',
                    auraColor: 'none'
                  }
                },
                axisTitlesPosition: "out",
                hAxis: {
                  logScale: false,
                  slantedText: false,
                  format: 'short',
                  textStyle: {
                    color: '#FFFFFF',
                    frontSize: 10
                  },
                  titleTextStyle: {
                    color: '#FFFFFF',
                    frontSize: 16
                  }
                },
                vAxis: {
                  direction: 1,
                  textStyle: {
                    color: '#FFFFFF'
                  }

                },
                animation:{
                    duration: 100,
                    easing: 'linear'
                }
                };
    function ColumnChart(div, datos) {
        try{
            google.charts.load('current', {packages: ['corechart', 'bar']});
            return google.charts.setOnLoadCallback(drawColumnChart);
            
        }catch(e){
            console.log("Error al crear Grafica de columna\n");
            console.log(e);
        }
        function drawColumnChart() {
            grafica = new google.visualization.ColumnChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(datos);
            grafica.draw(datosNuevos, options);
        }
    }
    function updateChart(data) {
        data = new google.visualization.arrayToDataTable(data);
        grafica.draw(data, options);
    }
    /*
     * ==========================================================================================
     *              TimeChart
     * ==========================================================================================
     */
    function startTimeChart(div,Map, options, updater) {
        options = options || {};
        map = Map;
        lasttime = options.lastTime || Date.now();
        if(!options.startTime) {
            console.log("no hay tiempo de incicio");
            return 0;
        }
        dataSetStartTime = Date.parse(options.startTime) /1000;
        dataSetEndTime = Date.parse(options.endTime || lasttime)/1000;
        speedup = options.speedUp || 100000;
        divPlay = options.divPlay || "";
        playing = options.playing || false;
        var format = options.format || "mm/dd/aaaa";
        timeChart = new TimeChart(document.getElementById(div), new Date(dataSetStartTime * 1000), new Date(dataSetEndTime * 1000), format);
        if(!updater)
            updater = defaultUpdater;
        wireListeners(updater);
        setTime(0, updater);
        if(playing===true) {
            lasttime = Date.now();
            play(playing);
        }
        return timeChart;
    }
    
    function defaultUpdater() {
        var actualTime = timeChart.getCurrentTime().getTime();
        $('#timeChartLabel').text(Util.formatDate(actualTime, "dd/mm/aaaa"));
     }
     
     function wireListeners(updater) {
    //timechart
        timeChart.addInteractionListener(updater);
        timeChart.addZoomListener(function(currZoomLevel, prevZoomLevel) {
            speedup *= prevZoomLevel / currZoomLevel;
        });
        if(divPlay !== "") {
            $("#"+divPlay).click(function() {
                lasttime = Date.now();
                play(!playing);
            });
        }
        //expose navigateTo on window so it can be called from index.html
        window.navigateTo = function(moveTo) {
            var wgs84 = ReferenceProvider.getReference("EPSG:4326");
            var center = ShapeFactory.createPoint(wgs84, [moveTo.lon, moveTo.lat]);
            var radius = moveTo.radius || 5.0;
            var bounds = ShapeFactory.createBounds(wgs84, [center.x - radius, 2 * radius, center.y - radius, 2 * radius]);
            return map.mapNavigator.fit(bounds);
        };
    }
    
    function playStep() {
        if (playing) {
            var currTime = Date.now();
            var deltaTime = (currTime - lasttime);
            lasttime = currTime;
            var timeChartTime = timeChart.getCurrentTime().getTime();
            var newTime = timeChartTime + (deltaTime) * speedup;
            if (newTime >= timeChart.endDate.getTime()) {
            newTime = timeChart.startDate.getTime();
        }
        timeChart.setCurrentTime(new Date(newTime));
        window.requestAnimationFrame(playStep);
        }
    }

    function play(shouldPlay) {
        playing = shouldPlay;
        if (playing) {
            playStep();
        }
        var playBtn = $('#play');
        playBtn.toggleClass("active", playing);
        playBtn.find("> span").toggleClass("glyphicon-pause", playing);
        playBtn.find("> span").toggleClass("glyphicon-play", !playing);
    }

    function setTime(milliseconds, updater) {
        timeChart.setCurrentTime(new Date(timeChart.startDate.getTime() + milliseconds));
        updater();
        
    }
    
    return {
        crearMapaCalor: crearMapaCalor
    };
});

function getValorCalle(flujo, sensor, fechaActual) {
    fechaActual = typeof fechaActual==="string"? Date.parse(fechaActual): fechaActual;
    for(var fecha=0; fecha<fechas.length-1; fecha++) {
        var rango1 = fechas[fecha];
        var rango2 = fechas[fecha+1];
        if(fechaActual>=rango1 && fechaActual<rango2) {
            break;
        }
    }
    if(fecha===fechas.length) {
        console.log("No se encontro la fecha");
        return 1;
    }
    if(typeof sensor !== "number") {
        for(var s in sensores) {
            if(sensor === sensores[s]) {
                sensor = s;
                break;
            }
        }
    }
    
    return valoresCalles[flujo][sensor][fecha];
}
