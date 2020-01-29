var map, actualTimePoblacion;

define([
    "recursos/js/MapFactory",
    "recursos/js/GoogleMap",
    "recursos/js/LayerFactory",
    
    
    "luciad/reference/ReferenceProvider",
    "samples/common/LayerConfigUtil",
    "recursos/js/Util",
    "luciad/view/LayerType",
    
    "./painters/EstadoPainter",
    "./painters/SensorTelegestion",
    "./painters/SensoresPainter",
    "./painters/layerPainter",
    "./painters/callesPainter",
    "./painters/SensoresSonido",
    
    "./painters/SensoresAmbiental",
    "./painters/MatrizPainter",
    "./painters/PublicacionesPainter",
    "./painters/DenuePainter",
    
    "./SoundLayer",
    "./Ambiental",
    "recursos/js/Shapes",
    "./balloons/AireBalloon",
    "./balloons/TelegestionBalloon",
    
    "./MovilidadLayer",
    "./balloons/DefaultBalloon",
    "./TelegestionLayer",
    "luciad/view/feature/loadingstrategy/LoadEverything",
    "luciad/ogc/filter/FilterFactory",
    "./painters/SensoresMovilidad"
    //"./OnHoverController"
    
], function (MapFactory, GoogleMap, LayerFactory,
         ReferenceProvider, LayerConfigUtil, Util, LayerType,
        EstadoPainter, SensorTelegestion, SensoresPainter, layerPainter, callesPainter,SensoresSonido,
        SensoresAmbiental,MatrizPainter,PublicacionesPainter,DenuePainter,
         SoundLayer, Ambiental, Shapes, AireBalloon, TelegestionBalloon,
        MovilidadLayer, DefaultBalloon, TelegestionLayer, LoadEverything, FilterFactory, SensoresMovilidad) {
    console.log("Iniciando...");
    
    
    var referenceC = ReferenceProvider.getReference("CRS:84");
    var referenceE = ReferenceProvider.getReference("EPSG:4978");
    var referenceG = ReferenceProvider.getReference("EPSG:900913");
    var mainReference;
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
            .test(navigator.userAgent);
    var googleMap = false;
    //var userName = document.getElementById("userName").innerHTML;
    var conectToFusion = true;
    var fusionUrl = "https://lfci.aggme.tech:";
    var tipoUsuario = document.getElementById("userType").innerHTML;
    tipoUsuario = tipoUsuario.toLowerCase();
    /*
     * Funcion encargada de crear el mala dependiendo de si esta en un dispositivo mobil o no
     * creara el mapa en 3d o 2d, ademas de si esta activado e mapa de google 
     * 
     * Google: satellite, hybrid, roadmap o terrain
     * BingMap: AerialWithLabels, Road o Aerial
    */
    
    function Start() {
        var config = loadConfig();
        fusionUrl = config.fusionServer;
        var mapOptions = config.mapOptions || {}; 
        googleMap = config.googleMap;
        var reference = config.mapReference;
        if(!reference){
            aler("No se encontro referencia en config.json, se usara CRS:84");
            reference = "CRS:84";
        } 
        try {
            reference = ReferenceProvider.getReference(reference);
        } catch(e) {
            alert("Error al crear referencia "+reference);
            console.error(e);
            reference = ReferenceProvider.getReference("CRS:84");
        }
        if(googleMap === true) {
            map = GoogleMap.crearMapaGoogle("map", "hybrid", mapOptions); 
            mainReference = referenceG;
        }
        else {
            if(isMobile) 
                map = MapFactory.makeMap3d("map", {reference: reference}, mapOptions);
            else
                map = MapFactory.makeMap3d("map", {reference: reference}, mapOptions);
            /*{
                    includeBackground: false, includeElevation: true, includeLayerControl: true,
                    includeMouseLocation: true, includeBingLayer: ["Road", "Aerial"], openLayerControl: false});*/
            mainReference = referenceC;
        }
        //var hover = new OnHoverController();
        //map.controller = hover;
        CrearCapas(config);
    }
    
    var guanajuato, sMovilidad={},sMovilidadVectores={},sMovilidadSimulacion={}, sMovilidadMatriz={}, calles={}, luminarias={};
    var luminariasTramos={}, edificios={}, sAire={}, sSonido={}, eventos={}, telegestion={}, publicitarios, denue, agebs;
    
    var rutas={}, ambiental={};
    var tablaSensores=[];
    
    function CrearCapas(config) {
        $(".datepicker").datepicker({
            minDate: new Date("2019/11/21"),
            maxDate: new Date(),
            dateFormat: 'yy-mm-dd'
        });
        if(googleMap !== true)
            LayerConfigUtil.addLonLatGridLayer(map);
        var mexicoLayer;
        //mexicoLayer = LayerFactory.createKmlLayer({label: "Mexico", selectable: false, layerType: LayerType.BASE}, '../../proyecto/recursos/estados.kml');
        mexicoLayer = LayerFactory.createWMSLayer(referenceC, {label: "Mexico", selectable: false, layerType: LayerType.BASE},
            "https://lfci.aggme.tech:/ogc/wms/estadosmexico", "estadosmexico");
        /*if(conectToFusion === false) {
            
        } else {
            mexicoLayer = LayerFactory.createWMS
        map.layerTree.addChild(mexicoLayer, "bottom");Layer(referenceC, {label: "Mexico", selectable: false, layerType: LayerType.BASE}, "http://localhost:8081/ogc/wms/estadosmexicojson", "estadosmexicojson");
        }*/
        map.layerTree.addChild(mexicoLayer, "bottom");
        Util.fitToMexico(map, true);
        
        //var jalisco = LayerFactory.createMunicipiosLayer(["Jalisco"], referenceC, {label:"Jalisco", layerType: LayerType.BASE});
        //map.layerTree.addChild(jalisco);
        guanajuato = LayerFactory.createWMSLayer(mainReference, {label: "Guanajuato (WMS)", layerType: LayerType.STATIC//, maxScale: 0.00000527501341042231
            //requestParameters: {RedirectURL: "http://localhost:8081/ogc/wms/guanajuatomunicipios"}}, 
            //"https://cileon.aggme.tech/InterSect/redireccion", "guanajuatomunicipios");
            },"https://lfci.aggme.tech:/ogc/wms/guadalajara", "guadalajara");
        map.layerTree.addChild(guanajuato);
        
        agebs = LayerFactory.createWMSLayer(mainReference, {label:"AGEBs", visible: false, selectable:true, layerType:LayerType.BASE},"https://lfci.aggme.tech:/ogc/wms/guadalajara_ageb", "guadalajara_agebs");
        map.layerTree.addChild(agebs, "bottom");
        agebs.balloonContentProvider = function (feature) {
            return DefaultBalloon.getBalloon(feature);
        };
        
        // ================================ Movilidad ===================================== //
        if(tipoUsuario === "dev" || tipoUsuario === "movilidad") {
            //calles = LayerFactory.createFeatureLayer(referenceC, {label: "Calles", painter: new callesPainter(), selectable:true, layerType: LayerType.STATIC}, "data/vialidades.geojson");
            //map.layerTree.addChild(calles);

            try {
                sMovilidadSimulacion = LayerFactory.createMemoryLayer(referenceC, {label:"Vectores Movilidad (S)", visible: false, painter: new SensoresMovilidad(), selectable: true, layerType: LayerType.DINAMIC});
                map.layerTree.addChild(sMovilidadSimulacion);
                sMovilidadSimulacion.balloonContentProvider = function (feature) {
                    return DefaultBalloon.getBalloon(feature);
                };
                sMovilidadVectores = LayerFactory.createMemoryLayer(referenceC, {label:"Vectores Movilidad", painter: new SensoresMovilidad(), selectable: true, layerType: LayerType.DINAMIC});
                map.layerTree.addChild(sMovilidadVectores);
                sMovilidadVectores.balloonContentProvider = function (feature) {
                    return DefaultBalloon.getBalloon(feature);
                };
                
                sMovilidadMatriz = LayerFactory.createMemoryLayer(referenceC, {visible: false, label:"Matriz Origen Destino", painter: new MatrizPainter(), selectable: true, selected: true, layerType: LayerType.DINAMIC});
                map.layerTree.addChild(sMovilidadMatriz);
                sMovilidadMatriz.balloonContentProvider = function (feature) {
                    return DefaultBalloon.getBalloon(feature);
                };
                
                
                sMovilidad = LayerFactory.createMemoryLayer(referenceC, {label:"Sensores Movilidad", painter: new SensoresMovilidad(), selectable: true, layerType: LayerType.DINAMIC});
                map.layerTree.addChild(sMovilidad);
                sMovilidad.balloonContentProvider = function (feature) {
                        /*var id = feature.id;
                        if(id === "1126" || id === 1126)
                            $("#panelGraficasMovilidad1").fadeIn();
                        else
                            $("#panelGraficasMovilidad2").fadeIn();*/
                    return DefaultBalloon.getBalloon(feature);
                };
                
                MovilidadLayer.createLayer(referenceC, sMovilidad, sMovilidadVectores, config.baseUrl, sMovilidadSimulacion, sMovilidadMatriz);
                if(tipoUsuario === "movilidad") {
                    /*var queryFinishedHandle = calles.workingSet.on("QueryFinished", function() {
                            if(calles.bounds) 
                                map.mapNavigator.fit({bounds: calles.bounds, animate: true});
                            queryFinishedHandle.remove();
                        });*/
                }
            } catch(e) {
                console.log(e);
                //sMovilidad = LayerFactory.createFeatureLayer(referenceC, {label:"Sensores Movilidad", painter: new SensoresPainter(), selectable: true, layerType: LayerType.DINAMIC}, "data/Sensores/movilidad.geojson");
                //map.layerTree.addChild(sMovilidad);
            }
        }
        // ================================ Telegestion ===================================== //
        if(tipoUsuario === "dev" || tipoUsuario === "telegestion") {
            
            denue = LayerFactory.createWFSLayer(referenceC, {id:"TDenue", label:"Denue", visible: false, selectable:true, painter: new DenuePainter(), layerType: LayerType.STATIC},
                "https://lfci.aggme.tech:/ogc/wfs/sip_filtro-2", "sip_guadalajara");
            map.layerTree.addChild(denue);
            denue.balloonContentProvider = function (feature) {
               return DefaultBalloon.getBalloon(feature);
            };
            Util.setLabels(denue, false);
            /*luminariasTramos = LayerFactory.createFeatureLayer(referenceC, {id: "TLuminariasTramos", label:"Luminarias Tramos", painter: new SensorTelegestion(), selectable:true, layerType: LayerType.STATIC}, "data/lineas_fragmentado.geojson");
            //luminariasTramos = LayerFactory.createWMSLayer(referenceC, {label:"Luminarias Tramos", layerType: LayerType.STATIC}, "http://localhost:8081/ogc/wms/luminarias_tramos", "LuminariasTramos");
            map.layerTree.addChild(luminariasTramos);
            luminariasTramos.balloonContentProvider = function (feature) {
               return DefaultBalloon.getBalloon(feature);
            };
            
            luminarias = LayerFactory.createMemoryLayer(referenceC, {id: "TLuminarias", label:"Luminarias", painter: new SensorTelegestion(), selectable:false, layerType: LayerType.DINAMIC}, "data/prueba.geojson");
            luminarias.balloonContentProvider = function (feature) {
               return DefaultBalloon.getBalloon(feature);
            };
            map.layerTree.addChild(luminarias);*/
            
            telegestion = LayerFactory.createMemoryLayer(referenceC, {id: "TBisnagas", label:"Bisnagas", painter: new SensorTelegestion(),selectable: true, layerType: LayerType.STATIC});
            map.layerTree.addChild(telegestion);
            TelegestionLayer.getDataLayer(telegestion, config.useUrl, luminarias, map, referenceC);
            
            /*if(tipoUsuario === "telegestion") {
                var queryFinishedHandle = luminariasTramos.workingSet.on("QueryFinished", function() {
                        if(luminariasTramos.bounds) 
                            map.mapNavigator.fit({bounds: luminariasTramos.bounds, animate: true});
                        queryFinishedHandle.remove();
                    });
            }*/
        }
        
        // ================================ Ambiental ===================================== //
        if(tipoUsuario === "dev" || tipoUsuario === "ambiental") {
            var handeler = function (features, layer) {
                ambiental = layer;
                ambiental.balloonContentProvider = function (feature) {
                    return AireBalloon.getBalloon(feature);
                };
            };
            var filtro = FilterFactory.eq(
              FilterFactory.property( "nombre" ),
              FilterFactory.literal( "Estación Ambiental 1" )
            );
            var loadStrategy = new LoadEverything( {query: {filter: filtro}} );
            ambiental = LayerFactory.createMemoryLayer(referenceC, {id: "AEstaciones", label:"Sensores Aire", 
                painter: new SensoresAmbiental(), selectable:true, layerType: LayerType.STATIC, loadingStrategy: loadStrategy});
            map.layerTree.addChild(ambiental);
            ambiental.balloonContentProvider = function (feature) {
                return AireBalloon.getBalloon(feature);
            };
            
            Ambiental.startAmbiental(referenceC, ambiental, config.useUrl, map);
            
            sSonido = LayerFactory.createMemoryLayer(referenceC, {id: "SSensoresSonido", label:"Sensores Sonido", painter: new SensoresSonido(), selectable:true});
            var sSonidoH = LayerFactory.createMemoryLayer(referenceC, {id: "SSensoresSonidosH", label:"Sensores Sonido (H)", visible: false, painter: new SensoresSonido(), selectable:true});
            map.layerTree.addChild(sSonido);
            sSonido.balloonContentProvider = function (feature) {
                    return DefaultBalloon.getBalloon(feature);
                };
            map.layerTree.addChild(sSonidoH);
            sSonidoH.balloonContentProvider = function (feature) {
                    return DefaultBalloon.getBalloon(feature);
            };
            SoundLayer.createSoundLayer(sSonido, referenceC, config.useUrl, sSonidoH/*, {label:"Sensores Sonido", painter: new SensoresSonido(), selectable:true}*/);
        }
        // ================================ Ambiental ===================================== //
        if(tipoUsuario === "administrador") {
            publicitarios = LayerFactory.createFeatureLayer(referenceC, {id: "CLayer", label: "Publicitarios", visible: true, 
                selectable: true, painter: new PublicacionesPainter(), layerType: LayerType.STATIC}, "data/publicitarios.geojson");
            map.layerTree.addChild(publicitarios);
            publicitarios.balloonContentProvider = function (feature) {
                return DefaultBalloon.getBalloon(feature);
            };
            
            var queryFinishedHandle = publicitarios.workingSet.on("QueryFinished", function() {
                if(publicitarios.bounds) 
                     map.mapNavigator.fit({bounds: publicitarios.bounds, animate: true});
                queryFinishedHandle.remove();
            });
        }
       
    }
    Start();
    
    /*
     * ===========================================================================================
     *                          Reloj
     * ===========================================================================================
     */
    //Clock();
    function Clock() {
        //$('#timelabel').text(Util.formatDate(null, "dd/mm/aaaa hh:mm"));
        setTimeout(Clock,3000);
    }
    
    /*
     * ===========================================================================================
     *                          Map Selector
     * ===========================================================================================
     */
    var selectedFeature;
    map.on("SelectionChanged", function (event) {
            var selectedFeature = null;
            if (event.selectionChanges.length > 0 && event.selectionChanges[0].selected.length > 0 ) {
                selectedFeature = event.selectionChanges[0].selected[0]; 
                
            } 
        });
        /*map.on("MapChange", function (event) {
            console.log("X "+map.xScale+"    Y "+map.yScale);
        });
    
    
    /*
     *== ==========================================================================================================
     *                                      cambio en el mapa
     *============================================================================================================
     */
    var roadL, arealL, world, googleLayer, selectMap=1;
    var types = ["satellite", "hybrid", "roadmap", "terrain"];
    $("#cambiarMapa").click(function () {
        var Layers = map.layerTree.children;
        //if(googleMap === false) {
            if(!roadL || !arealL || !googleLayer) {
                for(var l in Layers) {
                    var id = Layers[l].id;
                    if(id === "RoadBing")
                        roadL = Layers[l];
                    if(id === "AerialBing" || id === "AerialWithLabelsBing")
                        arealL = Layers[l];
                    if(id === "World")
                        world = Layers[l];
                    var label = Layers[l].label;
                    if(label === "Google Maps")
                        googleLayer = Layers[l];
                }
            }
            var logo = "B";
            if(googleLayer) {
                selectMap ++;
                selectMap = selectMap === types.length? 0: selectMap;
                googleLayer.mapType = types[selectMap];
                switch(selectMap) {
                    case 0: 
                    case 1: logo = "B"; break;
                    case 2: 
                    case 3: logo = "A"; break;
                }
            } else {
                
                if(roadL) {
                    roadL.visible = !roadL.visible;
                    logo = roadL.visible? "A": "B";
                }
                if(arealL) {
                    arealL.visible = !roadL.visible;
                    logo = arealL.visible? "B": "A";
                }
            }
            if(logo === "B") {
                $("#logoLeon").fadeOut();
                $("#logoLeonB").fadeIn();
            } else {
                $("#logoLeon").fadeIn();
                $("#logoLeonB").fadeOut();
            }
        //} 
    });
    /*
     *============================================================================================================
     *                                      Filtro de infraestructura
     *============================================================================================================
     *
    var lum = ["lumCentro","lumNorte","lumSur","lumPoniente","lumOriente"];
    function updateLuminarias() {
        luminarias.filter = function() { return true; };
    }
    lum.forEach(function (div) {
        $("#"+div).on("input change", function () {
            updateLuminarias();
        });
    });
    
    /*
     *============================================================================================================
     *                                      Listeners
     *============================================================================================================
     */
    var visiblePanel=false;
    $("#showLeftPanel").click(function () {
        visiblePanel = !visiblePanel;
        var btn = $('#showLeftPanel');
        btn.toggleClass("active", visiblePanel);
        btn.find("> span").toggleClass("glyphicon-chevron-right", !visiblePanel);
        btn.find("> span").toggleClass("glyphicon-chevron-left", visiblePanel);
        
        var panel = $("#panelIzquierdo");
        if(visiblePanel === true) {
            panel.fadeIn();
            panel.removeClass('moveLeft');
            panel.addClass('moveRight');
        } else {
            panel.removeClass('moveRight');
            panel.addClass('moveLeft');
            panel.fadeOut();
        }
        
    });
    
    $("#capaLuces").on("change", function (div) {
        var check = div.currentTarget.checked;
        luminarias.visible = check;
    });
    $("#capaLucesTramos").on("change", function (div) {
        var check = div.currentTarget.checked;
        luminariasTramos.visible = check;
    });
    $("#capaCalles").on("change", function (div) {
        var check = div.currentTarget.checked;
        calles.visible = check;
    });
    $("#capaEdificios").on("change", function (div) {
        var check = div.currentTarget.checked;
        edificios.visible = check;
    });
    //      Sensores
    $("#cSensoresMovilidad").on("change", function (div) {
        var check = div.currentTarget.checked;
        sMovilidad.visible = check;
    });
    $("#cSensoresMovilidadVectores").on("change", function (div) {
        var check = div.currentTarget.checked;
        sMovilidadVectores.visible = check;
        if(check === true) {
            sMovilidadSimulacion.visible = false;
            document.getElementById("mostrarSimulacion").checked = false;
        }
        if(check=== true)
            $("#pTimeMovilidadTimeslider").fadeOut("slow");
    });
    $("#cSensoresMovilidadMatriz").on("change", function (div) {
        var check = div.currentTarget.checked;
        sMovilidadMatriz.visible = check;
    });
    $("#cSensoresSonido").on("change", function (div) {
        var check = div.currentTarget.checked;
        sSonido.visible = check;
    });
    $("#iconos3d").on("change", function (div) {
        sSonido.filter = function () { return true; };
    });
    $("#verCirculo").on("change", function (div) {
        sSonido.filter = function () { return true; };
    });
    $("#cSensoreHistoricos").on("change", function (div) {
        var check = div.currentTarget.checked;
        ambiental.visible = check;
    });
    $("#verAccidentes").on("change", function (div) {
        var check = div.currentTarget.checked;
        eventos.visible = check;
    });
    $("#verRutas").on("change", function (div) {
        var check = div.currentTarget.checked;
        rutas.visible = check;
    });
    $("#verTelegestion").on("change", function (div) {
        var check = div.currentTarget.checked;
        telegestion.visible = check;
        luminarias.visible = check;
    });
    $("#verPublicidades").on("change", function (div) {
        var check = div.currentTarget.checked;
        publicitarios.visible = check;
    });
    
    $("#verDenue").on("change", function (div) {
        var check = div.currentTarget.checked;
        denue.visible = check;
    });
    $("#verAgebs").on("change", function (div) {
        var check = div.currentTarget.checked;
        agebs.visible = check;
    });
    
    var etiquetas = true;
    $("#Labels").click(function () {
        etiquetas = !etiquetas;
        Util.setLabels(calles, etiquetas);
        Util.setLabels(sMovilidad, etiquetas);
        Util.setLabels(sMovilidadVectores, etiquetas);
        Util.setLabels(sMovilidadSimulacion, etiquetas);
        Util.setLabels(luminarias, etiquetas);
        Util.setLabels(luminariasTramos, etiquetas);
        Util.setLabels(edificios, etiquetas);
        Util.setLabels(ambiental, etiquetas);
        //Util.setLabels(sAire, etiquetas);
        Util.setLabels(sSonido, etiquetas);
        Util.setLabels(telegestion, etiquetas);
        Util.setLabels(publicitarios, etiquetas);
    });
    /*
     *============================================================================================================
     *                                      Crear Capa Eventos
     *============================================================================================================
     *
    function wireEvents() {
        var queryFinishedHandleMexico = eventos.workingSet.on("QueryFinished", function() {
            queryFinishedHandleMexico.remove();
            var eventosPromise = eventos.model.query();
            Promise.when(eventosPromise, function (cursor) {
                var keyEventTime = "Fecha";
                var features = [];
                var index = 0;
                while (cursor.hasNext()) {
                    var feature = cursor.next();
                    var time = feature.properties[keyEventTime];
                    feature.properties.EventTime = time;
                    features[index] = feature;
                    index++;
                }
                document.getElementById("nEventos").innerHTML = index;
                var lab = ["CALLE"];
                var fil = [true];
                var titles = ["Calle"];
                var tops= [10];
                var types = ["piechart"];
                var pieOptions ={width: 400, height: 220,
                    titleTextStyle: {
                        color: '#FFFFFF',
                        frontSize: 20
                      },
                    legend: {
                      textStyle: {
                          fontSize: 11,
                          color: "#95a5a6"
                      }
                    },
                    backgroundColor:{
                        fill: "#17202a"
                    },
                    chartArea: {
                        left: 10,
                        width: 390,
                        height: 210,
                        backgroundColor: "#17202a"
                    },
                    pieSliceBorderColor: "#17202a"};
                var datos = Graficas.crearGraficasFeatures(features, "graficasAccidentes", lab, types, fil, "tablaCompleta", titles, null, tops, pieOptions, true);
                var filOptions = {filtros: datos.filtros, labels: lab};
                //var sStart = "2018/10/01 00:00:00", sEnd = "2018/11/01 00:00:00";
                //var startTime = Date.parse(sStart)/1000, endTime = Date.parse(sEnd)/1000;
                var startTime = Date.parse("2019/07/01 12:00")/1000, endTime = Date.parse("2019/08/01 23:00")/1000;
                updateHistogram.updateHistogram(map, features, eventos, referenceC, startTime, endTime, datos.tablaDatos, datos.graficas, filOptions);
                $("#afterafter").fadeOut("slow");
                $("#LPMovilidad").fadeOut("slow");
                $("#LPTelegestion").fadeOut("slow");
            });
        });
    }
    /*
     *============================================================================================================
     *                                      Control Densidad
     *============================================================================================================
     *
    $("#Densidad").on("change input", function() {
        var x = 1, y = 0;
        x = Math.round(parseFloat($("#Densidad").val()));
        if(x<=10 && x >0) {
            eventos.painter.density = {
                colorMap: ColorMap.createGradientColorMap([
                {level: y, color: "rgba(  0,   0,   255, 1)"},
                {level: y+=x, color: "rgba(  0, 100,   255, 1)"},
                {level: y+=x*2, color: "rgba(  0, 255,   255, 1.0)"},
                {level: y+=x*3, color: "rgba(  255, 255,   0, 1.0)"},
                {level: y+=x*4, color: "rgba(255, 0, 0, 1.0)"}
                ])
            };
        } 
    });
    
    $("#lineaTiempo").on("change input", function(div) {
        var check = div.currentTarget.checked;
        if(check===true) 
            $("#afterafter").fadeIn("slow");
        else
            $("#afterafter").fadeOut("slow");
    });
    /*
     *============================================================================================================
     *                                      Video en vivo Dron
     *============================================================================================================
     */
    $("#verPanelDron").click(function() {
        $("#panelDron").fadeIn("slow");
    });
    $("#videoDron").click(function() {
        var ip = document.getElementById("ipDron").value;
        if(ip==="") {
            alert("Es necesario ingresar una Ip valida");
            return 0;
        }
        var reproductor = '<div class="flowplayer" style="min-width: 410px; min-height: 310px;">\
                            <video>\
                               <source type="video/flash"  src="URL">\
                            </video>\
                         </div>';
        reproductor = reproductor.replace("URL", ip);
        //
        //var div = document.getElementById("reproductorDron");
        //div.innerHTML = reproductor;
        crearFlowPlayer(ip);
    });
    
    function crearFlowPlayer(ip) {
        ip = ip || "rtmp://112.342.143.123/live/intelgeo";
        flowplayer('#flowplayer', {
            token: '<add_your_token_here>',
            hls: {
              native: true
            },
            src: ip
        });
    }
    /*
     *============================================================================================================
     *                                      TimeChart Trafico
     *============================================================================================================
     *
    var timeChart2;
    function actualizarRutas() {
        
        try {
            var time = timeChart2.getCurrentTime().getTime();
            rutas.painter.timeWindow = [time - 1000000, time];
        } catch(e){};
        //$('#timelabel').text(Util.formatDate(actualTimePoblacion, "dd/mm/aaaa"));
     }
    
    function rutasHandeler(layer, features) {
        rutas = layer;
        var timeChartOptions2 = {
            startTime: "2019/08/18 08:00", endTime: "2019/08/18 09:10" , speedUp: 50, playing: true,
            /*divPlay: "play2",* format: "hh:mm"
        };
        timeChart2 = TimeChartManager.startTimeChart("timeChartTrafico", map, timeChartOptions2, actualizarRutas);
    }
    /*
     *============================================================================================================
     *                                      Control Panel Izquierdo
     *============================================================================================================
     */
    var paneles = ["Telegestion", "Movilidad", "Sonido", "Ambiental"];
    paneles.forEach(function (panel) {
        $("#show"+panel).click(function() {
            cambiarPanelIzquierdo(panel);
        });
    });
    function cambiarPanelIzquierdo(div) {
        for(var i in paneles) {
            if(div === paneles[i])
                $("#LP"+div).fadeIn("slow");
            else
                $("#LP"+paneles[i]).fadeOut();
        }
        setMapTo(div);
        
        $("#pTimeChartSensores").fadeOut("slow");
        $("#pTimeChartSensoresSonido").fadeOut("slow");
        $("#pTimeChartMovilidad").fadeOut("slow");
        $("#pTimeChartTelegestion").fadeOut("slow");
    }
    function setMapTo(usuario) {
        var layers = map.layerTree.children;
        layers.forEach(function (layer) {
           if(layer.type !== LayerType.BASE) {
               var x=false;
               var id = layer.id;
               id = id.charAt(0);
               if(usuario === "Telegestion" && id === "T" && x===false) {
                   layer.visible = true;
                   x=true;
               }
               
               if(usuario === "Movilidad" && id === "M" && x===false) {
                   layer.visible = true;
                   x=true;
               }
               
               if(usuario === "Sonido" && id === "S" && x===false) {
                   layer.visible = true;
                   x=true;
               }
               if(usuario === "Ambiental" && id === "A" && x===false) {
                   layer.visible = true;
                   x=true;
               }
               if(x===false && layer.label !== "Grid")
                   layer.visible = false;
               
           } 
        });
        switch(usuario) {
            case "Telegestion": if(luminarias.bounds)
                    map.mapNavigator.fit({bounds: luminarias.bounds, animate: true});
                break;
            case "Movilidad": if(sMovilidad.bounds)
                    map.mapNavigator.fit({bounds: sMovilidad.bounds, animate: true});
                break;
            case "Sonido": if(sSonido.bounds)
                    map.mapNavigator.fit({bounds: sSonido.bounds, animate: true});
                break;
            case "Ambiental": if(ambiental.bounds)
                    map.mapNavigator.fit({bounds: ambiental.bounds, animate: true});
                break;
        }
        /*switch(usuario) {
            case "Obras":
                calles.visible = false;
                luminarias.visible = true;
                edificios.visible = true;
                luminariasTramos.visible = true;
                telegestion.visible = true;
                
                sMovilidad.visible = false;
                sMovilidadVectores.visible = false;
                sMovilidadSimulacion.visible = false;
                rutas.visible = false;
                ambiental.visible = false;
                eventos.visible = false;
                sSonido.visible = false;
                sAire.visible = false;
                if(luminarias.bounds)
                    map.mapNavigator.fit({bounds: luminarias.bounds, animate: true});
                break;
            case "Movilidad":
                calles.visible = true;
                luminarias.visible = false;
                luminariasTramos.visible = false;
                edificios.visible = false;
                telegestion.visible = false;
                
                sMovilidad.visible = true;
                sMovilidadVectores.visible = true;
                sMovilidadSimulacion.visible = true;
                rutas.visible = true;
                eventos.visible = true;
                
                ambiental.visible = false;
                sSonido.visible = false;
                sAire.visible = false;
                if(sMovilidad.bounds)
                    map.mapNavigator.fit({bounds: sMovilidad.bounds, animate: true});
                break;
            case "Sonido":
                calles.visible = false;
                luminarias.visible = false;
                luminariasTramos.visible = false;
                edificios.visible = false;
                sMovilidad.visible = false;
                sMovilidadVectores.visible = false;
                sMovilidadSimulacion.visible = false;
                rutas.visible = false;
                ambiental.visible = false;
                eventos.visible = false;
                sAire.visible = false;
                telegestion.visible = false;
                
                sSonido.visible = true;
                //Util.fitCoordinates(map, [-101.674469, 0.5, 21.119744, 0], true);
                if(sSonido.bounds)
                    map.mapNavigator.fit({bounds: sSonido.bounds, animate: true});
                break;
            case "Ambiental":
                ambiental.visible = true;
                sAire.visible = true;
                
                calles.visible = false;
                luminarias.visible = false;
                luminariasTramos.visible = false;
                edificios.visible = false;
                sMovilidad.visible = false;
                sMovilidadVectores.visible = false;
                sMovilidadSimulacion.visible = false;
                rutas.visible = false;
                eventos.visible = false;
                sSonido.visible = false;
                telegestion.visible = false;
                if(ambiental.bounds)
                    map.mapNavigator.fit({bounds: ambiental.bounds, animate: true});
                break;
        }*/
    }   
    /*
     *============================================================================================================
     *                                      Configuracion
     *============================================================================================================
     */
    function loadConfig() {
        var datos = {};
        $.ajax("data/config.json", {
            async: false,
            contentType: "json",
            type: "GET"
        }).done( function (data) {
                datos = data;
                console.log(data);
            //}
        }).fail(function (e) {
            console.log(e);
        });
        return datos;
    }
    
    
    
    $("#descargarTabla1").click(function (element) {
        Util.exportarTablaXLS(element, "tablaCompleta1");
    });
    $("#descargarTabla2").click(function (element) {
        Util.exportarTablaXLS(element, "tablaCompleta2");
    });
    $("#descargarTabla3").click(function (element) {
        Util.exportarTablaXLS(element, "tablaCompleta3");
    });
    
    
    var infoPanel=false;
    $("#showinfo").click(function () {
        if(infoPanel === false) {
            $('#infoPanel').fadeIn('slow');
            infoPanel = true;
        } else {
            $('#infoPanel').fadeOut('slow');
            infoPanel = false;
        }
    });
    
    //$(".draggable").draggable({ cancel: ".panelContent", grid: [ 10, 10 ] });
    $(".draggable").draggable({ cancel: ".nodraggable" }).resizable({ grid: [ 10, 10 ]
});
    /*
     *============================================================================================================
     *                                      Control Actuador
     *============================================================================================================
     */
    // Aqui se detecta cuando se cambia el switch de apagado y encendido
    $("#Actuador").click( function (div) {
        var check = div.currentTarget.checked;
        var ms;
        if(check===true) {
            ms = "On";
        } else 
           //socket.emit("message", "off");
        console.log("Actuador "+ms);
    });
    // aqui se detecta cuando se da clic en el boton de activar
    $("#activarMotor").click( function (div) {
        var angulo = document.getElementById("anguloMotor").value;
        angulo = parseInt(angulo);
        // check sera true cuando el switch este activado
        var check = document.getElementById("#Actuador").checked;
        var ms;
        if(check===true) {
            ms = "On";
        } else 
            ms = "Off";
        console.log("Actuador "+ms);
        console.log("Angulo Motor "+angulo);
    });
    /*
     *============================================================================================================
     *                                      Fin de Main
     *============================================================================================================
     */
});


function getYearPoblacion() {
    var date = new Date(actualTimePoblacion);
    var y = date.getFullYear();
    return y;
}

