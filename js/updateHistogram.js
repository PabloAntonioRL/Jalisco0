/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    'luciad/util/Promise',
    'luciad/shape/ShapeFactory',
    "time/TimeSlider",
    "time/TimeSliderWithOverview",
    'luciad/util/ColorMap',
    'luciad/transformation/TransformationFactory',
    
    "recursos/js/Graficas/Graficas",
    "./timeChartLayer",
    "luciad/model/store/MemoryStore",
    "luciad/model/feature/FeatureModel",
    "luciad/view/feature/FeatureLayer",
    
    
    'luciad/view/feature/ParameterizedLinePainter',
    'luciad/util/ColorMap',
    'luciad/view/feature/ShapeProvider',
    "recursos/js/Util"
    //"./painters/EventTimePainter"
], function (Promise, ShapeFactory, TimeSlider,TimeSliderWithOverview,ColorMap,TransformationFactory,
            Graficas, timeChartLayer, MemoryStore, FeatureModel, FeatureLayer,
            ParameterizedLinePainter, ColorMap, ShapeProvider, Util) {
    
    var timeSlider, nL=0, columnsMonthLayer, columnsDayLayer=[];
     /*
     * updateHistogram, esta funcion se encarga de actualizar toda la informacion necesario
     * al mover la linea de tiempo
     * @returns {undefined}
     */
    var timeFilter;
    function updateHistogram(map, features, layer, reference, startTime, endTime, tablaDatos, graficas, filtrosOptions) {
        
        var tablaActual;
        start();
        function start() {
            var shapeProvider = new ShapeProvider();
            shapeProvider.reference = TimeSlider.REFERENCE;
            shapeProvider.provideShape = function(feature) {
                if(!feature.properties.EventTime) {
                    var time = feature.properties.Fecha;
                    feature.properties.EventTime = time;
                }
                var date = feature.properties.EventTime;
                var time = Date.parse(date) / 1000 | 0;
                var depth = 100;
                return ShapeFactory.createPoint(TimeSlider.REFERENCE, [time, depth]);
            };
            var timeEventLayer = new FeatureLayer(layer.model, {
                selectable: true,
                shapeProvider: shapeProvider
                //painter: new EventTimePainter()
            });
            
            var updateTimeFilters = function() {
                layer.filter = null;
                var mapBounds = timeSlider.mapBounds;
                var filterStart = (timeSlider.mapBounds.x | 0 );
                var filterWidth = (timeSlider.mapBounds.width | 0 );
                var filterEnd = filterStart + filterWidth;
                var values=[], j=0;
                var Labels = filtrosOptions.labels;
                try{
                for(j=0;j<Filtros.length;j++) {
                    if(Filtros[j] && Filtros[j]!=="") {
                        values[j] = Filtros[j].selectedOptions[0].value;
                    }
                }
                }catch(e) {
                     console.log(e);
                     return null;
                }
                    layer.filter = function(feature) {
                        var f = timeEventLayer.shapeProvider.provideShape(feature);
                        var vFeatures=[];
                        for(j=0;j<Filtros.length;j++) {
                            var idLabel;
                            if(typeof Labels[j] === "string")
                                idLabel = Labels[j];
                            vFeatures[j] = feature.properties[idLabel];
                        }
                        var xFiltros = 0;
                        if(mapBounds.contains2D(f)) {
                            for(j=0;j<Filtros.length;j++) {
                                if(vFeatures[j] === values[j] || values[j] === "Todos") {
                                    xFiltros++;
                                }
                            }
                            if(xFiltros === Filtros.length){
                                return true;
                            } else
                                return false;
                        } else
                            return false;
                    };
                try {
                    tablaActual = Graficas.actualizarTabla(tablaDatos,timeEventLayer, mapBounds);
                    for(var k =0; k<graficas.length;k++) {
                        Graficas.actualizarGraficaIdTexto(graficas[k].id, tablaActual, graficas[k].tipo, graficas[k].label, graficas[k].top);
                    }
                    //document.getElementById("nEventosA").value = nuevaTabla.length;
                    //crearTablaDIV("tablaActual", nuevaTabla);
                    
                }catch(e) {
                    console.log("Error al actualizar grafica");
                }
                
            }; /// fin UpdateFilters
            var filtrosl = filtrosOptions.filtros, Filtros=[];
            for(var fi in filtrosl) {
                Filtros[fi] = document.getElementById( filtrosl[fi] );
                Filtros[fi].addEventListener( "change", function () {
                    updateTimeFilters();
                });
            }
            
            var combineModeChangedFunction = function(transform) {
                console.log("combineModeChangedFunction start");
                timeFilter = undefined;
                var combineMode = timeSlider.getCombineMode();

                var painter = new ParameterizedLinePainter({
                    lineWidth: 10,
                    rangePropertyProvider: function(feature, shape, pointIndex) {
                    // var time = offset + feature.properties.time / 1000 | 0;
                        var time = Date.parse(feature.properties.Fecha) / 1000 | 0;
                        time = !time? Date.parse(feature.properties.fechainici) / 1000 | 0: time;

                        return transform(time);
                    },
                    rangeWindow: [0, 999999999999]
                });
                painter.density = {
                    colorMap: ColorMap.createGradientColorMap([
                    {level: 0, color: "rgba(  0,   0,   0, 0.0)"},
                    {level: 1, color: "rgba(  0, 0,   255, 0.5)"},
                    {level: 5, color: "rgba(  0, 255,   255, 1.0)"},
                    {level: 10, color: "rgba(  255, 255,   0, 1.0)"},
                    {level: 20, color: "rgba(255, 0, 0, 1.0)"}
                    ])
                };

                var previousPainter = layer.painter;
                var quakesModel = layer.model;
                var layer2d = new FeatureLayer(quakesModel, {
                    label: "Eventos 2",
                    selectable: true,
                    id: "eventos",
                    painter: painter
                });
                map.layerTree.removeChild(map.layerTree.findLayerById("eventos"));
                timeSlider.layerTree.removeChild(timeEventLayer);

                var shapeProvider = new ShapeProvider();
                shapeProvider.reference = TimeSlider.REFERENCE;
                shapeProvider.provideShape = function(feature) {
                    if(!feature.properties.EventTime) {
                        var time = feature.properties.Fecha;
                        feature.properties.EventTime = time;
                    }
                    var date = feature.properties.EventTime;
                    var time = Date.parse(date) / 1000 | 0;
                     time = transform(time);

                    var depth = 100;
                    return ShapeFactory.createPoint(TimeSlider.REFERENCE, [time, depth]);
                };
                timeEventLayer = new FeatureLayer(quakesModel, {
                    selectable: true,
                    shapeProvider: shapeProvider,
                    //painter: new EventTimePainter()
                });

                //timeSlider.layerTree.addChild(timeEventLayer);
            
                updateTimeFilters();
                var lonlatBounds = transformation.transformBounds(map.mapBounds);
                timeEventLayer.filter = function(feature) {
                    return lonlatBounds.contains2DPoint(feature.shape.getPoint(0));
                };
            
            // timeSlider.getHistogram().updateHistogram(histogramUpdater);
            };

            var combineModeFilterChangedFunction = function(filter) {
                timeFilter = filter;
                if (timeFilter) {
                        map.layerTree.findLayerById("eventos").filter = function(feature) {
                        if(!feature.properties.EventTime) {
                            var time = feature.properties.Fecha;
                            feature.properties.EventTime = time;
                        }
                        var date = feature.properties.EventTime ;
                        var time = Date.parse(date) / 1000 | 0;
                        return timeFilter(time);
                    };
                    updateTimeFilters();
                    var lonlatBounds = transformation.transformBounds(map.mapBounds);
                    
                    timeEventLayer.filter = function(feature) {
                        if(!feature.properties.EventTime) {
                            var time = feature.properties.Fecha;
                            feature.properties.EventTime = time;
                        }
                        var date = feature.properties.EventTime;
                        var time = Date.parse(date) / 1000 | 0;
                        if (timeFilter(time)) {
                            return lonlatBounds.contains2DPoint(feature.shape.getPoint(0));
                        }
                        else {
                            return false;
                        }
                    };
                }
            };
            
            if(!timeSlider)
                timeSlider = new TimeSliderWithOverview("timeSlider", "timeSliderOverview", startTime, endTime, combineModeChangedFunction, combineModeFilterChangedFunction);

            /*columnsMonthLayer = timeChartLayer.createMounthLayer(features, startTime, endTime);
            if(columnsMonthLayer) {
                timeSlider.layerTree.addChild(columnsMonthLayer);
            
                if(columnsMonthLayer.bounds) {
                            try{
                                timeSlider.mapNavigator.fit({
                                    bounds: columnsMonthLayer.bounds,
                                    animation: {duration: 10000},
                                    allowWarpXYAxis: true,
                                    fitMargin: "5%"
                                });
                             }catch(e) {
                                    console.log(e);
                             }
                        }
            }*/
            columnsDayLayer = timeChartLayer.createDaysLayer(features, startTime, endTime);
            if(columnsDayLayer) {
                timeSlider.layerTree.addChild(columnsDayLayer);
            }
            //columnsDayLayer[nL] = TimeLineLayer.createLayer(features, "hours", 12*30, startTime, endTime, e);
            //timeSlider.layerTree.addChild(columnsDayLayer[nL]);

            timeSlider.refit();

            var transformation = TransformationFactory.createTransformation(map.reference, reference);
            var histogramUpdater = function(accumulate) {
                    var lonlatBounds = transformation.transformBounds(map.mapBounds);
                    for (var i = 0; i < features.length; i++) {
                        if(lonlatBounds.contains2DPoint(features[i].shape)) {
                        var date = features[i].properties.EventTime;
                            var time = Date.parse(date) / 1000 | 0;
                            var magnitude = features[i].properties.mag;
                            accumulate(time, magnitude);
                        }
                    }
                };
            timeSlider.getHistogram().updateHistogram(histogramUpdater);
            
            map.on("idle", function() {
                timeSlider.getHistogram().updateHistogram(histogramUpdater);
            });
            map.on("MapChange", function() {
                var lonlatBounds = transformation.transformBounds(map.mapBounds);
                //console.log(lonlatBounds);
                if (timeFilter) {
                    timeEventLayer.filter = function(feature) {
                    // var time = offset + feature.properties.time / 1000 | 0;
                        var date = feature.properties.EventTime;
                        var time = Date.parse(date) / 1000 | 0;
                        if (timeFilter(time)) {
                            return lonlatBounds.contains2DPoint(feature.shape);
                        }
                        else {
                            return false;
                        }
                    };
                }
                else {
                    timeEventLayer.filter = function(feature) {
                        return lonlatBounds.contains2DPoint(feature.shape);
                    };
                }
            });

            timeSlider.on("MapChange", function() {
                    updateTimeFilters();
            });
        
        //Fin Promise
        //});
        }
        ////================================================================================////////
        $("#verTablasAccidentes").click(function () {
            document.getElementById("LabelTabla1").innerHTML = "Datos Accidentes";
            var tablaCreada = Util.crearTablaDIV("tablaCompleta1", tablaDatos);
            document.getElementById("LabelTabla2").innerHTML = "Datos Dentro del rango de tiempo";
            Util.crearTablaDIV("tablaCompleta2", tablaActual);
            $("#panelTablas").fadeIn("slow");
        });
    //fin UpdateHistogram
    }
    /*
     *============================================================================================================
     *                                      Actual Date
     *============================================================================================================
     */
    function getActualDate() {
        if(!timeSlider || !timeSlider.mapBounds)
            return null;
        var left = timeSlider.mapBounds.left*1000, right = timeSlider.mapBounds.right*1000;
        var leftDate = Util.formatDate(left), rightDate = Util.formatDate(right);
        var middle = ((right - left)/2) + left;
        var middleDate = Util.formatDate(middle);
        return {middle:middle, left: left, right: right,
            middleDate: middleDate, leftDate: leftDate, rightDate: rightDate};
    }
    
    
    return {
        updateHistogram: updateHistogram,
        timeSlider: timeSlider,
        getActualDate: getActualDate
    };
});

