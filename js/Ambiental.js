/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var actualDataAmbiental = [];
define(["./AmbientalCharts",
    "recursos/js/Util", "recursos/js/Shapes",
    "./balloons/AireBalloon"], 
function (sensorCharts, Util, Shapes, AireBalloon) {
    var url = "http://sensores.ergonet.mx:8000/api/";
    var urlPuente = "https://cileon.aggme.tech/InterSect/redireccion";
    var proceder = true, capaSensores, Map;
    var tablaSensores, datosParametros;
    var sTime, eTime, sensorActual=1, limits;
    var baseUrl = "https://cileon.aggme.tech/InterSect/serviciosrs/monitor/1.0";
    var newEndpoint= 0;
    
    function startAmbiental(reference, layer, url, map) {
        baseUrl = url;
        //limits = createLimitsBounds();
        newobtenerEstaciones(reference, layer, map);
    }
    function newobtenerEstaciones(reference, layer, map) {
        $.getJSON(baseUrl+"/ambiental/obtenerListaEstaciones", function (data) {
            if(data.length === 0) {
                alert("No se encontraron las estaciones de Calidad del aire");
                console.error("Sin datos de Ambiental");
            } else
                console.log("================= Conectado con exito al sensor Ambiental =======================");
            //data = ordenarLista(data, ["AE01","AE02","AE03","AE04","AE05","AE06","AE07","AE08"]);
            crearCapa(reference, layer, data, map);
        }).fail(function(e) {
            console.log("Error al obtener datos ambiental");
            console.error(e);
        });
    }
    function ordenarLista(datos, orden) {
        var n = datos.length;
        var ordenado = [], j=0; 
        do {
            for(var i=0; i<n; i++) {
                if(datos[i].nombre === orden [j]) {
                    ordenado[ordenado.length] = datos[i];
                    break;
                }
            }
            j++;
        } while(ordenado.length !== orden.length && j<orden.length);
        return ordenado;
    }
    /*
     * @param {type} reference
     * @param {type} options
     * @param {type} datos
     * @param {type} handeler
     * @returns {undefined}
     */
    function crearCapa(reference, layer, datos, map) {
        var ne = datos.length, features=[], ids=[], nombres=[];
        capaSensores = layer;
        for(var i=0; i<ne; i++) {
            var dato = datos[i];
            var properties = {
                Id: dato.id,
                Nombre: dato.nombre,
                Longitud: dato.longitud,
                Latitud: dato.latitud
            };
            var x = parseFloat(dato.longitud);
            var y = parseFloat(dato.latitud);
            var point = Shapes.createPoint(reference, x, y, 0, dato.id, properties);
            //if(limits.contains2D(point)) {
            //if(x > -101.80101604972198 && x < -101.37788057285069 && y > 20.864701036059994 && y < 21.339929516664647) {
                capaSensores.model.add(point);
                ids[ids.length] = dato.id;
                nombres[nombres.length] = dato.nombre;
            
        }
        Util.setOptions("selectSensorAmbiental", nombres, false, ids);
        Util.fitCoordinates(map, [-101.74787733716875- 1.68, 0.13691, 21.05929218306161 - 0.451, 0.14522], true);
        newobtenerListaDatos();
    }
     function newobtenerListaDatos() {
         $.getJSON(baseUrl+"/ambiental/obtenerListaDatos", function (data) {
             var lista = ["Monóxido de carbono", "Dióxido de azufre", "Ozono", "Partículas PM 10", "Partículas PM 2.5","Óxido nitroso",
                "Radiacion UV", "Dióxido de carbono","Dióxido nitroso","Partículas PM 1.0","Temperatura","Humedad relativa","Presión atmosférica",
                "Velocidad del viento","Cantidad de Lluvia Actual","Cantidad de Lluvia ultima hora","Cantidad de Lluvia Ultimo dia","Direccion del viento",];
             datosParametros = formatDatos(ordenarLista(data, lista));
             
             var parametros = [], ids = [];
             for(var i=0; i< datosParametros.nombres.length; i++) {
                 if(datosParametros.nombres[i] !== "Direccion del viento") {
                     parametros[parametros.length] = datosParametros.nombres[i];
                     ids[ids.length] = datosParametros.ids[i];
                 }
             }
             Util.setOptions("selectorParametroH", parametros, false, ids);
             Util.setOptions("selectorParametroTR", parametros, false, ids);
             sensorCharts.setDatosParametros(datosParametros);
             crearGraficastiempoReal();
         }).fail(function(e) { 
             console.error(e);
         });
     }
    function newobtenerPromedios(inicio, fin, estacion, time, handeler, handelerError) {
        inicio = typeof inicio === "string"? inicio: Util.formatDate(inicio, "aaaa-mm-dd hh:mm:ss");
        fin = typeof fin === "string"? fin: Util.formatDate(fin, "aaaa-mm-dd hh:mm:ss");
        var inicio2 = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm:ss");
        var fin2  = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm:ss");
        console.log("Promedios inicio   "+inicio+"  utc     "+inicio2);
        console.log("           fin     "+fin+"     utc     "+fin2);
        
        estacion = estacion || "all";
        var parametros = "inicio="+inicio2+"&fin="+fin2+"&estacion="+estacion+"&timepo="+time;
        
        $.getJSON(baseUrl+"/ambiental/obtenerPromedios?"+parametros, function (data) {
            handeler(data);
        }).fail(function (e) {
            if(handelerError)
                handelerError(e);
            else
                console.error(e);
        });
    }
    function newgetData(inicio, fin, estacion, parametro, handeler, errorHandeler) {
        /*if(newEndpoint === true) {
            getDataVar(inicio, fin, estacion, parametro, handeler, errorHandeler);
            return 0;
        }*/
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*12);
            inicio = "2020-01-21 00:00:00";
            fin = "2020-01-21 12:00:00";
        } 
        inicio =  Util.formatDate(inicio, "aaaa-mm-dd hh:mm:ss");
        fin = Util.formatDate(fin, "aaaa-mm-dd hh:mm:ss");
        var inicio2 = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm:ss");
        var fin2  = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm:ss");
        console.log("Get Data   inicio  "+inicio+"  utc     "+inicio2);
        console.log("           fin     "+fin+"     utc     "+fin2);
        
        parametro = parametro || "all";
       // if(estacion !== "all" && estacion !== "4")
         //   estacion = getEstacion(parametro, estacion);
            
        var parametros = "inicio="+inicio2+"&fin="+fin2+"&dato="+parametro+"&estacion="+estacion;
        $.getJSON(baseUrl+"/ambiental/obtenerLecturas?"+parametros, function (data) {
            console.log("================= Conectado con exito al sensor Ambiental =================");
            console.log("Estacion "+estacion+" par "+parametro);
            handeler(data, inicio, fin);
        }).fail(function (e) {
            if(errorHandeler)
                errorHandeler(e);
            else
                console.error(e);
        });
    }
    
    function getLastData(handeler, handelerError) {
        $.getJSON(baseUrl+"/ambiental/obtenerLecturasUlt", function (data) {
            console.log("================= Obteniendo ultimos Datos de Ambiental =================");
            handeler(data);
        }).fail(function (e) {
            if(handelerError)
                handelerError(e);
            else
                console.error(e);
        });
    }
    
    function getDataVar(inicio, fin, estacion, parametro, handeler, errorHandeler) {
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*12);
            inicio = "2020-01-21 00:00:00";
            fin = "2020-01-21 12:00:00";
        } 
        inicio = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm:ss");
        fin  = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm:ss");
        //parametro = parametro || "all";
        estacion = estacion || "all";
        //if(estacion !== "all" && estacion !== "4")
          //  estacion = getEstacion(parametro);
        switch(parametro) {
            default: parametro = "all"; break;
            case "10": parametro = "co_"; break;
            case "15": parametro = "so2"; break;
            case "14": parametro = "o3_"; break;
            case "18": parametro = "p10"; break;
            case "17": parametro = "p02"; break;
        }
        var parametros = "inicio="+inicio+"&fin="+fin+"&dato="+parametro+"&estacion="+estacion;
        $.getJSON(baseUrl+"/ambiental/obtenerPromediosVar?"+parametros, function (data) {
            console.log("================= Obteniendo promedios Var =================");
            console.log("Estacion "+estacion+" par "+parametro);
            handeler(data, Util.formatDateUTCToLocal(inicio, "aaaa-mm-dd hh:mm:ss"), Util.formatDateUTCToLocal(fin, "aaaa-mm-dd hh:mm:ss"));
        }).fail(function (e) {
            console.error(e);
            if(errorHandeler)
                errorHandeler(e);
        });
    }
    
    function getEstacion(par, estacion) {
        switch(par) {
            default: return estacion;
            case "10": return 1;
            case "11": return 1;
            case "12": return 7;
            case "13": return 10;
            case "14": return 7;
            case "15": return 7;
            case "16": return 1;
            case "17": return 1;
            case "18": return 1;
        }
    }
    /*
     *============================================================================================================
     *                                     Crear Graficas
     *============================================================================================================
     */
    var cargar=true;
    $("#mostrarHistorialAmbiental").click(function (){
        if(cargar === true) {
            var estacion = document.getElementById("selectSensorAmbiental").value;
            var par = document.getElementById("selectorParametroH").selectedOptions[0].value;
            if(Util.startTimer)
                        Util.startTimer("GraficasAmbientalHistorial");
            //getDataVar(null, null, estacion, "all", analizarDatosCrearGraficas, function(e) {
            if(par ==="10" || par ==="15" || par ==="14" || par === "18" ||par ==="17" ) {
                newEndpoint = 1;
                getDataVar(null, null, estacion, par, analizarDatosCrearGraficas, function(e) {
                    cargar = true;
                });
            } else {
                newEndpoint = 0;
                newgetData(null, null, estacion, par, analizarDatosCrearGraficas, function(e) {
                    cargar = true;
                });
            }
            cargar = false;
        }
    });
    function analizarDatosCrearGraficas(datos, inicio, fin) {
        tablaSensores = datos;
        sensorCharts.crearGraficaHistorial(tablaSensores, "graficaAmbientalH");
        $("#loadingHistorial").fadeOut();
        
        setDates(inicio, fin);
        //startRealTime();
        //updateDisplay(datos);
        crearTablaPromedios(inicio, fin);
    }
    
    function crearGraficastiempoReal() {
        var fin = Date.now();
        var inicio = fin - (1000*60*30);
        //inicio = "2019-12-30 10:00:00";
        //fin = "2020-01-01 10:00:00";
        sTime = inicio;
        eTime = fin;
        var estacion;
        try {
            estacion = document.getElementById("selectSensorAmbiental").selectedOptions[0].value;
        } catch(e) {
            estacion = "all";
        }
        newgetData(inicio, fin, estacion, null, function (data) {
            sensorCharts.crearGraficaTiempoReal(data, "graficaAmbientalTR");
            $("#loadingAmbientalTR").fadeOut();
            startRealTime();
            updateDisplay();
            //$("#pTimeChartSensores").fadeOut("slow");
        }, function (error, status) {
            console.error(error);
            $("#loadingAmbientalTR").fadeOut();
        });
        createListener();
    }
    
    function formatDatos(datos) {
        var format = {};
        var colores = ["blue","#fa3434","orange","green","purple","#34b8fa","pink","#94ff79","#cb3f0b","#404ca0", "fcf100"];
        var nombres=[], ids=[];
        for(var i in datos) {
            var par = datos[i].alias, color;
            var id = datos[i].id;
            if(id>9)
                color = colores[id-10];
            else
                color = colores[id-1];
            nombres[nombres.length] = datos[i].nombre;
            ids[ids.length] = id;
            format[par] = datos[i];
            //if(par === "so2")
              //  format[par].unidad_medida= "ppb";
            format[par].color = color;
        }
        
        return {datos: format, nombres: nombres, ids: ids};
    }
    /*
     *============================================================================================================
     *                                     Actualizar graficas
     *============================================================================================================
     */
    function startRealTime() {
        setInterval(function () {
            updateRealTime();
            updateDisplay();
        }, 1000 * 60);
    }
    function updateRealTime() {
        var f = Date.now();
        var d = f - sTime;
        if(d > (1000 * 60 * 60))
            sTime = f - (1000 * 60 * 60);
        var sensor = document.getElementById("selectSensorAmbiental").selectedOptions[0].value;
        var par = document.getElementById("selectorParametroTR").selectedOptions[0].value;
        $("#loadingAmbientalTR").fadeIn();
        document.getElementById("labelAmbientalError").innerHTML = "";
        
            newgetData(sTime, f, sensor, par, function (datos, inicio, fin) {
                //var parametro = parseInt(document.getElementById("").selectedOptions[0].value);
                if(!datos || datos.length ===0) {
                    console.log("No se encontro informacion del parametro seleccionado: "+par);
                    document.getElementById("labelAmbientalError").innerHTML = "No se encontro informacion del parametro seleccionado";
                } 
                sensorCharts.updateChartRT(datos);
                $("#loadingAmbientalTR").fadeOut();
            }, function (error, code) {
                $("#loadingAmbientalTR").fadeOut(); 
                console.error(error);
                console.log("Error al conectarce con Ambiental");
            });
        
        
    }
    
    var maxInfo = {}, total={};
    function updateDisplay(tabla) {
        if(!tabla) {
            var f = Date.now();
            var i = f - (1000*60*60);
            getLastData(function (datos, inicio, fin) {
                if(!datos || datos.length ===0) {
                    console.log("No se encontro informacion, inicio "+inicio+" Fin: "+fin);
                    document.getElementById("labelAmbientalError").innerHTML = "No se encontro informacion nueva para el Display";
                } else {
                    updateDisplay(datos);
                }
            });
            return 0;
        }
        //var sensor = parseInt(document.getElementById("selectSensorAmbiental").selectedOptions[0].value);
        var sensor;
        try {
            sensor = document.getElementById("selectSensorAmbiental").selectedOptions[0].value ;
        } catch(e) {
            sensor = "";
        }
        var temperatura=null, presion=null, humedad=null, direccion=null;
        var datos={}, progreso = 0;
        actualDataAmbiental = {};
        for(var i =tabla.length-1; i>=0; i--) {
            var estacion = tabla[i].estacion_id+"";
            var par = tabla[i].alias;
            var fecha = tabla[i].fechahoralect;
            if(!actualDataAmbiental[estacion]) {
                actualDataAmbiental[estacion] = {};
            }
            if(!actualDataAmbiental[estacion][par]) {
                actualDataAmbiental[estacion][par] = {};
                actualDataAmbiental[estacion][par]["valor"] = parseFloat(tabla[i].valor);
                actualDataAmbiental[estacion][par]["nombre"] = datosParametros["datos"][par].nombre;
                actualDataAmbiental[estacion][par]["unidad"] = tabla[i].cveunidaddestino;
                actualDataAmbiental[estacion][par]["fecha"] = tabla[i].fechahoralect;
                if(sensor === estacion) {
                    if(actualDataAmbiental[estacion]["tmp"] && temperatura===null) 
                        temperatura = actualDataAmbiental[estacion]["tmp"].valor + " "+ actualDataAmbiental[estacion]["tmp"].unidad;
                    if(actualDataAmbiental[estacion]["apl"] && presion===null) 
                        presion = actualDataAmbiental[estacion]["apl"].valor +" "+ actualDataAmbiental[estacion]["apl"].unidad;
                    if(actualDataAmbiental[estacion]["rhp"] && humedad===null)
                        humedad = actualDataAmbiental[estacion]["rhp"].valor +" "+ actualDataAmbiental[estacion]["rhp"].unidad;
                    if(actualDataAmbiental[estacion]["wdv"] && direccion ===null)
                        direccion = getDireccionViento(actualDataAmbiental[estacion]["wdv"].valor);
                }
            }
            
        }
        if(temperatura) {
            document.getElementById("tempActual").innerHTML = temperatura;
        } else
            document.getElementById("tempActual").innerHTML = "No se encontro la Temperatura actual";
        if(presion) {
            document.getElementById("presActual").innerHTML = presion;
        } else
            document.getElementById("presActual").innerHTML = "No se encontro la Presion actual";
        if(humedad) {
            document.getElementById("humActual").innerHTML = humedad ;
        } else
            document.getElementById("humActual").innerHTML = "No se encontro la Humedad actual";
        if(direccion) 
            document.getElementById("direcActual").innerHTML = direccion+'&nbsp;<img src="data/icons/ambiental/flechas/'+direccion+'.png" width="30" height="30">';
        else
            document.getElementById("direcActual").innerHTML = "No se encontro la Direccion del viento";
        var calidad;
        //document.getElementById("calActual").innerHTML = "Sin Definir";
        
        updateLayer();
        /*for(var estacion in actualDataAmbiental) {
            //estacion = estacion;
            calidad = calcularCalidad(actualDataAmbiental[estacion]);
            actualDataAmbiental[estacion]["calidad"] = calidad.calidad;
            if(estacion === sensor) {
                document.getElementById("calActual").innerHTML = calidad.calidad;
                /*if(calidad.calidadP) {
                    document.getElementById("calActualParametro").innerHTML = calidad.calidadP;
                }*
            }
        }
        /*var parametro = obtenerParametro(selectParam);
        var lectura = datos[parametro.alias];
        if(lectura) {
            document.getElementById("lecturaParametroActual").innerHTML = lectura.valor;
            document.getElementById("unidadMedidaActual").innerHTML = " "+lectura.unidad;
        }*
        capaSensores.filter = function (feature) {
            /*var id = feature.properties.Nombre;
            var select = document.getElementById("selectSensorAmbiental").selectedOptions[0].innerHTML;
            if(select === "Todos")
                return true;
                    if(id === select) {
                        return true;
                    } else
                        return false;*
            return true;
        };*/
        //actualDataAmbiental = datos;
    }
    function obtenerParametro(idONombre) {
        var buscar;
        if(typeof idONombre === "string") {
            buscar = "nombre";
        } else {
            buscar = "id";
        }
        var datos = datosParametros.datos;
        for(var par in datos) {
            var dato = datos[par][buscar];
            if(idONombre === dato) {
                return datos[par];
            }
        }
        return null;
    }
    
    function calcularCalidad(datos) {
        //        Buena < Regular < Mala <  Muy Mala < Extremadamente Mala  
        var limites = {
            "co_": [1.125,  1.25,   1.875,  2.75],  // Monoxido de Carbono
            //"co2": [0,      0,      0,      0],     // Dioxido de Carbono
            //"no_": [0,      0,      0,      0],     // Osxico nitroso
            "no2": [189,    209,    315,    420],   // Dioxido Nitroso
            "o3_": [8,      8.625,  16.5,   23],    // Ozono
            "so2": [4.1,    4.541,  7.458,  9.958], // Dioxido de Azufre
            //"p01": [0,      0,      0,      0],
            "p02": [1.208,  1.833,  3.708,  7.5],
            "p10": [2.25,   3.083,  7.25,   11.41]
        };
        if(!datos) {
            return "Sin Definir";
        }
        //var selectParam = parseInt(document.getElementById("selectorParametroTR").selectedOptions[0].value);
        var select = document.getElementById("selectorParametroTR").selectedOptions[0].innerHTML;
        var alias = obtenerParametro(select);
        alias = alias.alias;
        var calidadPar="No aplica", calidadGen=null;
       
            var nivel=0, valores, nivelGeneral=0;
            for(var par in limites) {
                nivel=0;
                valores = datos[par];
                var lim = limites[par];
                if(valores) {
                    while(valores.valor > lim[nivel]) {
                        nivel++;
                    }
                }
                nivelGeneral += nivel;
            }
            if(nivelGeneral <=8)
                calidadGen = "Buena";
            if(nivelGeneral >8 && nivelGeneral <=15)
                calidadGen = "Satisfactoria";
            if(nivelGeneral >15 && nivelGeneral <=23)
                calidadGen = "No satisfactoria";
            if(nivelGeneral >23 && nivelGeneral <=30)
                calidadGen = "Mala";
            if(nivelGeneral > 30)
                calidadGen = "Muy Mala";
            
         if(limites[alias] && datos[alias]) {
            valores = datos[alias];
            var lim = limites[alias];
            nivel = 0;
            while(valores.valor > lim[nivel]) {
                nivel++;
            }
            switch(nivel) {
                case 0: calidadPar = "Buena"; break;
                case 1: calidadPar = "Satisfactoria"; break;
                case 2: calidadPar = "No satisfactoria"; break;
                case 3: calidadPar = "Mala"; break;
                case 4: calidadPar = "Muy mala"; break;
                default: calidadPar = "Sin Definir"; break;
            }
        }
        return {calidad: calidadGen, calidadP: calidadPar};
        //document.getElementById("calActual").innerHTML = calidad;
    }
    
    function getDireccionViento(valor) {
        var nombres= {'0':'Este','1':'Este-Noreste','2':'Noreste','3':'Nor-Noreste','4':'Norte','5':'Nor-Noroeste','6':'Noroeste',
               '7':'Oeste-Noroeste','8':'Oeste','9':'Oeste-Suroeste','10':'Suroeste','11':'Sur-Suroeste','12':'Sur',
               '13':'Sur-Sureste','14':'Sureste','15':'Este-Sureste'};
        return nombres[valor];
    }
    /*
     *============================================================================================================
     *                                      Tabla Sensores
     *============================================================================================================
     */
    var actualizar = true;
    function createListener() {
        $("#selectorParametroH").on("change", function (element) {
            var par = element.currentTarget.selectedOptions[0].value;
            var endpoint;
            if(par ==="10" || par ==="15" || par ==="14" || par === "18" ||par ==="17" )
                endpoint = 1;
            else
                endpoint = 0;
            /*if(endpoint === newEndpoint) {
                sensorCharts.updateHistorico();
                actualizarPromedios(par);
                return 0;
            }*/
            
            updateTimeChartRange();
        });
        $("#selectorParametroTR").on("change", function (element) {
            updateRealTime();
            updateDisplay();
        });
        $("#selectSensorAmbiental").on("change", function (element) {
            updateSensorData();
            var select = element.currentTarget.selectedOptions[0].innerHTML;
            if(select === "Todos") {
                capaSensores.filter = null;
            } /*else {
                var map = capaSensores.parent.map;
                var hacerFit= true;
                capaSensores.filter = function(feature) {
                    var id = feature.properties.Nombre;
                    if(id === select) {
                        if(hacerFit ===true && feature.shape.bounds) {
                            Util.fitBounds(map, feature.shape.bounds, true);
                            hacerFit = false;
                        }
                        return true;
                    } else
                        return false;
                };
            }*/
        });
    }

    var timeChart3, preH, time;
    function updateSensorData(element, tabla) {
        
        var sensor = document.getElementById("selectSensorAmbiental").selectedOptions[0].value;
        sensor = parseInt(sensor);
        if(sensor !== sensorActual) {
            // Si se selecciona un sensor difernete es necesario llamar el endpoint por nueva informacion
            sensorActual = sensor;
            if(cargar === false)
                updateTimeChartRange();
            updateRealTime();
            updateDisplay();
        }
    }
    /*
     *============================================================================================================
     *                                      Administrar TimePickers
     *============================================================================================================
     */
    function setDates(date1, date2) {
        var sStartdate = Util.formatDate(date1, "aaaa-mm-dd");
        var date = new Date(date1);
        var sStartTime = date.getHours();
        document.getElementById("fecha1").value = sStartdate;
        document.getElementById("time1").selectedIndex  = sStartTime;
        
        var sEndDate = Util.formatDate(date2, "aaaa-mm-dd");
        date = new Date(date2);
        var sEndTime = date.getHours();
        if(sEndTime+1 >= 24) {
            sEndTime = 0;
            date = date.getTime() + (1000*60*60);
            sEndDate = Util.formatDate(date, "aaaa-mm-dd");
        } else
            sEndTime ++;
        document.getElementById("fecha2").value = sEndDate;
        document.getElementById("time2").selectedIndex = sEndTime;
    }
    
    $("#fecha1").on("change input", function (element) {
        var value = element.currentTarget.value;
        updateTimeChartRange(value, null, null, null);
    });
    $("#fecha2").on("change input", function (element) {
        var value = element.currentTarget.value;
        updateTimeChartRange(null, null, value, null);
    });
    $("#time1").on("change input", function (element) {
        if(actualizar === false) {
            actualizar = true;
            return 0;
        }
        actualizar = false;
        updateTimeChartRange();
    });
    $("#time2").on("change input", function (element) {
        if(actualizar === false) {
            actualizar = true;
            return 0;
        }
        actualizar = false;
        updateTimeChartRange();
    });

    function updateTimeChartRange() {
        $("#loadingHistorial").fadeIn();
        var date1 = $("#fecha1").val();
        //var x1 = document.getElementById("time1-2").selectedOptions[0].innerHTML;
        var time1 = document.getElementById("time1").selectedOptions[0].innerHTML;
        
        var date2 = $("#fecha2").val();
        //var x2 = document.getElementById("time2-2").selectedOptions[0].innerHTML;
        var time2 = document.getElementById("time2").selectedOptions[0].innerHTML;
        
        var time = Date.parse(date1 + " " + time1);
        var sDate = time;
        var eDate = Date.parse(date2 + " " + time2);
        if (sDate >= eDate) {
            console.log("Fechas Incorrectas");
            document.getElementById("labelAmbientalH").innerHTML = "Rango de Fechas incorrecto, la fecha de incio debe ser menor a la de final";
            $("#loadingHistorial").fadeOut();
            return 0;
        }
        document.getElementById("labelAmbientalH").innerHTML = "";
        var sensor = document.getElementById("selectSensorAmbiental").selectedOptions[0].value;
        var par = document.getElementById("selectorParametroH").selectedOptions[0].value;
        
        if(Util.startTimer)
            Util.startTimer("GraficaAmbientalHistorial");
        if(par ==="10" || par ==="15" || par ==="14" || par === "18" ||par ==="17" ) {
            newEndpoint = 1;
            getDataVar(date1+" "+time1, date2+" "+time2, sensor, par, function(data) {
                console.log(data.length+" Datos encontrados");
                sensorCharts.updateHistorico(data);
                $("#loadingHistorial").fadeOut();
            }, function (error) {
                console.log(error);
                document.getElementById("labelAmbientalH").innerHTML = "Error al conectarce con API";
                $("#loadingHistorial").fadeOut();
            });
        } else {
            newEndpoint = 0;
            newgetData(date1+" "+time1, date2+" "+time2, sensor, par, function(data) {
                console.log(data.length+" Datos encontrados");
                sensorCharts.updateHistorico(data);
                $("#loadingHistorial").fadeOut();
            }, function (error) {
                console.log(error);
                document.getElementById("labelAmbientalH").innerHTML = "Error al conectarce con API";
                $("#loadingHistorial").fadeOut();
            });
        }
        crearTablaPromedios(date1+" "+time1, date2+" "+time2, sensor);
        //crearTimeChartSensores(date1, date2, time1, time2);
    }
    /*
     *============================================================================================================
     *                                      Tabla promedios
     *============================================================================================================
     */
    var tablaPromedios=[];
    function crearTablaPromedios(inicio, fin, sensor) {
        inicio = inicio || $("#fecha1").val()+" "+ document.getElementById("timeSound1").selectedOptions[0].innerHTML;
        fin = fin || $("#fecha2").val()+" "+ document.getElementById("timeSound2").selectedOptions[0].innerHTML;
        sensor = sensor || document.getElementById("selectSensorAmbiental").selectedOptions[0].value;
        
        newobtenerPromedios(inicio, fin, sensor, "86400", function (data) {
            var n = data.length, fecha, valores, promedios, nombre;
            var tabla=[["Fecha","Parametro", "Promedio"/*, "Cantidad", "Mayor lectura", "Menor lectura"*/]];
            tablaPromedios = [["Fecha","Parametro", "Promedio"]];
            var selected = document.getElementById("selectorParametroH").selectedOptions[0].innerHTML;
            
                for(var i=0; i<n; i++) {
                    fecha = data[i].fecha;
                    fecha = Util.formatDateUTCToLocal(fecha, "aaaa-mm-dd");
                    promedios = data[i].valores;
                    for(var par in promedios) {
                        nombre = datosParametros.datos[par].nombre;
                        if(nombre === selected)
                            tabla[tabla.length] = [fecha, nombre, promedios[par].toFixed(3)];
                        tablaPromedios[tablaPromedios.length] = [fecha, nombre, promedios[par].toFixed(3)];
                    }
                }
            Util.crearTablaDIV("tablaDetallesAmbiental", tabla);
        }, function (error, code) {
            console.error(error);
        });
    }
    /*
     *============================================================================================================
     *                                      Descarga de tablas
     *============================================================================================================
     */
    function actualizarPromedios() {
        var parametro = document.getElementById("selectorParametroH").selectedOptions[0].innerHTML;
        var tabla = [tablaPromedios[0]];
        for(var i=1; i<tablaPromedios.length; i++) {
            var nombre = tablaPromedios[i][1];
            if(nombre === parametro) {
                tabla[tabla.length] = tablaPromedios[i];
            }
        }
        Util.crearTablaDIV("tablaDetallesAmbiental", tabla);
    }
    $("#verTablasAmbientalDetalles").click(function () {
        Util.crearTablaDIV("tablaPromedios", tablaPromedios, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
        $("#panelTablasPromedios").fadeIn("slow");
    });
    $("#descargarTablaPromedios").click(function (element) {
        Util.exportarTablaXLS(element, "tablaPromedios");
    });
    /*
     *============================================================================================================
     *                                      Linea de tiempo
     *============================================================================================================
     */
    function updateLayer(datosActuales, inicio, fin) {
        if(!datosActuales && !inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60);
            getDataVar(inicio, fin, "all", "all", updateLayer, function (e) {
                console.log("Error al obtener datos de calidad");
            });
        }
        capaSensores.filter = function (feature) {
            if(!datosActuales)
                return true;
            try {
                var fecha = Util.formatDateUTCToLocal(datosActuales[0].fecha, "aaaa-mm-dd hh:mm");
            } catch(e) {
                return true;
            }
            if(feature.properties["Ultima Actualizacion"] === fecha) {
                return true;
            }
            feature.properties["Ultima Actualizacion"] = fecha;
            var id = feature.id, datos = [];
            for(var i in datosActuales) {
                if(id === datosActuales[i].estacion_id) {
                    datos[datos.length] = datosActuales[i];
                }
            }
            
            if(!datos.length === 0) {
                feature.properties["Calidad del Aire"] = "Sin Definir";
                return true;
            }
            
            var nivel =[0,0,0,0,0,0];
            for(var j=0; j<datos.length; j++) {
                for(i in datos[j]) {
                    var par = datos[j].alias;
                    var dPar = datosParametros.datos[par];
                    var nombre = dPar.nombre;
                    var unidad = datos[j].cveunidaddestino;
                    var valor = datos[j].valorpromhoraf? datos[j].valorpromhoraf+" "+unidad: "Sin definir";
                    feature.properties[nombre] = valor;
                    /*var cal = datos[j].calidadhora;
                    switch(cal) {
                        case "Buena": nivel[1]++; break;
                        case "Satisfactoria": nivel[2]++; break;
                        case "No satisfactoria": nivel[3]++; break;
                        case "Mala": nivel[4]++; break;
                        case "Muy mala": nivel[5]++; break;
                        default: nivel[0]++; break;
                    }*/
                }
            }
            /*var calidad = 0, may=0;
            for(i=0; i<nivel.length; i++) {
                if(nivel[i] > may) {
                    calidad = i;
                    may = nivel[i];
                }
            }
            switch(calidad) {
                case 0: calidad = "Sin Definir"; break;
                case 1: calidad = "Buena";  break;
                case 2: calidad = "Satisfactoria"; break;
                case 3: calidad = "No satisfactoria"; break;
                case 4: calidad = "Mala"; break;
                case 5: calidad = "Muy mala"; break; 
            }*/
            var calidad;
            for(i=0; i<datos.length; i++) {
                //calidad = datos[i].cvecalest;
                calidad = datos[i].calest;
                if(calidad)
                    break;
            }
            calidad = calidad || "Sin definir";
            feature.properties["Calidad del Aire"] = calidad;
            var select = document.getElementById("selectSensorAmbiental").selectedOptions[0].value;
            if(id === select+"") {
                document.getElementById("calActual").innerHTML = calidad;
            }
            return true;
        };
        
    }
    
    
    $("#verTablasAmbiental").click(function () {
        document.getElementById("LabelTabla1").innerHTML = "Datos Ambientales";
        $("#loadingTablas").fadeIn();
        var date1 = $("#fecha1").val();
        var time1 = document.getElementById("time1").selectedOptions[0].innerHTML;
        
        var date2 = $("#fecha2").val();
        var time2 = document.getElementById("time2").selectedOptions[0].innerHTML;
        
        var time = Date.parse(date1 + " " + time1);
        var sDate = time;
        var eDate = Date.parse(date2 + " " + time2);
        if (sDate >= eDate) {
            console.log("Fechas Incorrectas");
            document.getElementById("labelAmbientalH").innerHTML = "Rango de Fechas incorrecto, la fecha de incio debe ser menor a la de final";
            $("#loadingTablas").fadeOut();
            return 0;
        }
        document.getElementById("labelAmbientalH").innerHTML = "";
        $("#panelTablasAmbiental").fadeIn("slow");
        var sensor = document.getElementById("selectSensorAmbiental").selectedOptions[0].value;
        
        newgetData(date1+" "+time1, date2+" "+time2, sensor, "all", function(tabla) {
            var tablaDatos = {};
            for(var i in tabla) {
                var par = tabla[i].alias;
                var datos = datosParametros.datos[par];
                var nombre = datos.nombre;
                var fecha;
                if(tabla[i].fechahoralect)
                    fecha = Util.formatDateUTCToLocal(tabla[i].fechahoralect, "aaaa-mm-dd hh:mm");
                else
                    fecha = Util.formatDateUTCToLocal(tabla[i].fecha, "aaaa-mm-dd hh:mm");
                var valor;
                if(tabla[i].valor || tabla[i].valor === 0)
                    valor = parseFloat(tabla[i].valor);
                else
                    valor = parseFloat(tabla[i].valorpromhoraf || 0);
                var nodo = tabla[i].tipo_nodo;
                if(!tablaDatos[nodo]) 
                    tablaDatos[nodo] = {};
                if(!tablaDatos[nodo]["fecha"])
                    tablaDatos[nodo]["fecha"] = [];
                var fechaAnt = tablaDatos[nodo]["fecha"][tablaDatos[nodo]["fecha"].length - 1];
                if(fechaAnt !== fecha)
                    tablaDatos[nodo]["fecha"][tablaDatos[nodo]["fecha"].length] = fecha;
                if(!tablaDatos[nodo][nombre]) 
                    tablaDatos[nodo][nombre] = [];
                tablaDatos[nodo][nombre][tablaDatos[nodo]["fecha"].length-1] = valor;
            }
            
            var nodos = [];
            var tablas=[], columnas={};
            var nf, nn=0;
            for(var e=1; e<=3; e++) {
                document.getElementById("tablaCompleta"+e).innerHTML = "";
            }
            for(nodo in tablaDatos) {
                var parametros = tablaDatos[nodo];
                nf = parametros["fecha"].length;
                var encabezados = ["fecha"];
                for(var par in parametros) {
                    if(par !== "fecha")
                        encabezados[encabezados.length] = par;
                }
                tablas[nn] = [encabezados];
                for(var i=1; i<nf; i++) {
                    var fila = [];
                    for(var j=0; j<encabezados.length; j++) {
                        if(encabezados[j] === "Direccion del viento") {
                            var dir = getDireccionViento(parametros[encabezados[j]][i]);
                            fila[j] = dir;
                        } else
                            fila[j] = parametros[encabezados[j]][i] || 0;
                    }
                    tablas[nn][tablas[nn].length] = fila;
                }
                var id = nodo=== "Climatológico"? 1: nodo==="Partículas"? 3: 2;
                document.getElementById("LabelTabla"+id).innerHTML = "Datos "+nodo;
                Util.crearTablaDIV("tablaCompleta"+id, tablas[nn], {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
                nn++;
            }
            try {
                var png = sensorCharts.getHistorialPng();
                document.getElementById("imagenGraficaAmbiental").innerHTML = png;
            } catch(e) {}
            $("#loadingTablas").fadeOut();
        }, function (e) {
            
        });
            
        //Util.crearTablaDIV("tablaCompleta1", tablaDatos, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
    });
    
    return {
        //getData: getData,
        startAmbiental: startAmbiental
    };
});

function getActualDataAmbiental(estacion) {
    return actualDataAmbiental[estacion] || {};
}
