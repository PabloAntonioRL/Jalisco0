/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "recursos/js/Shapes",  'recursos/js/Util', "./MovilidadCharts",
    "./TimeChartManager", "./MovilidadMatrizLayer", 'luciad/util/ColorMap'
], function (Shapes, Util, MovilidadCharts, TimeChartManager, MovilidadMatrizLayer, ColorMap) {
    
    var gODM, gDTM, gComparativa, layerNodes, layerVectors, layerSimulacion, layerMatriz;
    var tablaOdm = [["from", "to", "count", "time"]];
    var baseUrl="https://cileon.aggme.tech/InterSect/serviciosrs/monitor/1.0";  
    function createLayer(reference, layer1, layer2, url, layer3, layer4) {
        baseUrl = url;
        //crearGraficas();
        crearGraficaTR();
        // Nodos
        layerNodes = layer1;
        //var url = "https://api.bitcarrier.net/v1.0/api/installations/guanajuato_leon/config/nodes?key=i0MztbpzfNdWqWI3MWVkODBlLTRhOWItNDE5OS05NmU1LTE4ZjM5YzczYTAyMw";
        $.getJSON(baseUrl+"/movilidad/nodos", function (data) {
            console.log("============ Conectado con Nodos Movilidad ============");
            var features = [], nodos=[], names=[];
            for(var i=0; i<data.length; i++) {
                var datos = data[i];
                var x = parseFloat(datos.lon) - 1.68;
                var y = parseFloat(datos.lat) - 0.451;
                var id = datos.id;
                nodos[nodos.length] = id;
                names[names.length] = datos.customer_name;
                var properties = {
                    Id: id,
                    Nombre: datos.customer_name,
                    "Bloque Tiempo": datos.block_time,
                    Zona: datos.zone,
                    "Id Ciudad": datos.cityid,
                    Longitud: datos.lon,
                    Latitud: datos.lat,
                    Tipo: "Nodo",
                    "Total dispositivos": 0
                };
                var point = Shapes.createPoint(reference, x, y, 0, id, properties);
                layerNodes.model.add(point);
                features[i] = point;
            }
            Util.setOptions("selectorNodo", names, false, nodos);
            Util.setOptions("vectoresMatriz", names, "Todos", nodos);
            crearVectors(reference, layer2, features, layer3);
            layerMatriz = layer4;
            setTimeout(function () {
                if(layerNodes.bounds) {
                    Util.fitBounds(map, layerNodes.bounds, true);
                }
            }, 2000);
            MovilidadMatrizLayer.createArcs(reference, layerMatriz, layerNodes);
        }).fail(function (e) {
            console.error(e);
        });
        

    }
    
    function crearVectors(reference, layer, features, layer2) {
        layerVectors = layer;
        layerSimulacion = layer2;
        var vectores={};
        //var url = "https://api.bitcarrier.net/v1.0/api/installations/guanajuato_leon/config/vectors?key=i0MztbpzfNdWqWI3MWVkODBlLTRhOWItNDE5OS05NmU1LTE4ZjM5YzczYTAyMw";
        $.getJSON(baseUrl+"/movilidad/vectores", function (data) {
        //$.getJSON("data/VectoresMovilidad.json", function (data) {
            console.log("============ Conectado con Vectores Movilidad ============");
            var n = data.length, m = features.length;
            var names=[];
            for(var i = 0; i<n; i++) {
                var properties = {
                    Id: data[i].id,
                    Nombre: data[i].name,
                    "Nombre Vector": data[i].customer_name,
                    Desde: data[i].from,
                    Hasta: data[i].to,
                    Zona: data[i].zone,
                    "ID Ciudad": data[i].cityid,
                    Sid: data[i].sid,
                    Rid: data[i].rid,
                    Distancia: data[i].distance,
                    Tipo: "Vector"
                };
                var id = properties.Id;
                vectores[id] = properties;
                names[names.length] = id;
            }
            Util.setOptions("selectorVector", names, false);
            Util.setOptions("nivelesVectores", names);
            Util.setOptions("selectorTramo", names);
            crearLineasVectors(reference, vectores);
        }).fail(function (e) {
            console.error(e);
        });
    }
    function crearLineasVectors (reference, properties) {
        //var url = "https://api.bitcarrier.net/v1.0/api/installations/guanajuato_leon/config/sketches?key=i0MztbpzfNdWqWI3MWVkODBlLTRhOWItNDE5OS05NmU1LTE4ZjM5YzczYTAyMw";
        $.getJSON(baseUrl+"/movilidad/escenas", function (data) {
            var n = data.length;
            for(var i=0; i<n; i++) {
                var vid = data[i].vid;
                if(properties[vid]) {
                    try {
                        var p = properties[vid];
                        var coordinates = JSON.parse(data[i].json);
                        var xs=[];
                        var ys=[];
                        for(var j in coordinates) {
                            xs[xs.length] = coordinates[j].lon - 1.68;
                            ys[ys.length] = coordinates[j].lat - 0.451;
                        }
                        var vector = Shapes.createPolyline(reference, xs, ys, 0, vid, p);
                        layerVectors.model.add(vector);
                        //var vector2 = Shapes.createPolyline(reference, xs, ys, 0, vid+"S", p);
                        var vector2 = Shapes.createPolyline(reference, xs, ys, 0, vid+"S", 
                            {Id: p.Id, Nombre: p.Nombre, Tipo: "Vector", Desde: p.Desde, Hasta: p.Hasta, "Nombre Vector": p["Nombre Vector"]});
                        layerSimulacion.model.add(vector2);
                    } catch(e) {
                        console.log("No se creo el siguente vector ");
                        console.log(data[i]);
                    }
                }
            }
            updateLayers();
        }).fail(function (e) {
            console.error(e);
        });
    }
    /* 
     * ==========================================================================================
     *                             Obtener datos de nodos
     * ==========================================================================================
     */
    function updateDataNodes() {
        var url = "https://cileon.aggme.tech/InterSect/redireccion";
        var date = Util.formatDate(null, "aaaammdd");
        var date2 = Util.formatDateUTC(null, "aaaammdd");
        console.log("Fecha Nodos "+date+" UTC "+date2);
        //var time = Util.formatDateUTC(null, "date");
        /*var h = time.getHours(), m = time.getMinutes();
        h = (h) * 60;
        time = Math.round((h + m) / 15);*/
        var time2 = new Date();
        var h2 = time2.getHours()-1, m2 = time2.getMinutes();
        h2 = (h2) * 60;
        h2 = (h2 + m2) / 15;
        h2 = Math.floor(h2);
        //h2 = (h2*4)-1;
        var origenDestino = document.getElementById("tipoMatriz").selectedOptions[0].value;
        $.getJSON(baseUrl+"/movilidad/odm?date="+date+"&slot="+h2+"s1&table="+origenDestino+"&returns=true&z=1", function (data) {
        //$.getJSON(url+"?date="+date+"&slot="+time+"s1&table="+origenDestino+"&returns=true&z=1"
	//	+"&RedirectURL="+encodeURI("http://165.22.155.28:5000/bitcarrier/odm"), function (data) {
        //$.getJSON(baseUrl+"/movilidad/odm?date="+date2+"&slot="+time, function (data) {
            console.log("============ Conectado con Datos de Nodos Movilidad ============");
            var features = layerNodes.model.query().array;
            // ["from", "to", "count", "time"]
            var tabla = [];
            var matrix = data.matrix;
            
            if(matrix === null || !matrix)
                return 0;
            for(var from in matrix) {
                for(var to in matrix[from]) {
                    tablaOdm[tablaOdm.length] = [from, to, matrix[from][to].count, matrix[from][to].elapsed];
                }
            }
            
            var total = 0;
            for(var i=0; i<features.length; i++) {
                var id = features[i].id;
                var datos = matrix[id];
                total = 0;
                if(datos) {
                    for(to in datos) {
                        features[i].properties[id+"-"+to] = datos[to].count || 0;
                        total += datos[to].count || 0;
                        try {
                            if(id !== to) {
                                var arc = layerMatriz.model.get(id+"-"+to);
                                arc.properties.Valor = datos[to].count || 0;
                                layerMatriz.model.put(arc);
                            }
                        }catch(e) {
                            console.log("Vector no encontrado Origen "+id+" Destino "+to);
                            console.log(e);
                        }
                    }
                }
                features[i].properties["Total dispositivos"] = total;
                layerNodes.model.put(features[i]);
            }
            /*if(!gComparativa)
                createChart(gComparativa, "graficaMovilidad", tablaOdm);
            else
                updateChart(gComparativa, tablaOdm);*/
        }).fail(function (e) {
            console.log(e);
            if(!stop)
                updateDataVectors(layerNodes, true);
        });
    }
    $("#tipoMatriz").on("change", updateDataNodes);
    /* 
     * ==========================================================================================
     *                             Obtener datos de vectores
     * ==========================================================================================
     */
    function updateDataVectors(layer, stop) {
        if(layer) {
            layerVectors = layer;
        }
        var url = "https://cileon.aggme.tech/InterSect/redireccion";
        $.getJSON(baseUrl+"/movilidad/lecturavectores", function (data) {
        //$.getJSON(url +"?"+"RedirectURL="+encodeURI("http://165.22.155.28:5000/bitcarrier/vectors"), function (data) {
            console.log("===================== Conectado con Vectores Movilidad ==========================");
            var features = layerVectors.model.query().array;
            var n = features.length, m = data.length;
            for(var i=0; i<n; i++) {
                var id = features[i].id;
                var vid;
                for(var j=0; j<m; j++) {
                    vid = data[j].vid;
                    if(vid === id) {
                        var datos = data[j];
                        features[i].properties["Ultima actualización"] = datos.time || 0;
                        var nivel = datos.levelofservice;
                        switch(nivel){
                            case "red": nivel = "Rojo"; break;
                            case "yellow": nivel = "Amarillo"; break;
                            case "green": nivel = "Verde"; break;
                            default: nivel = "Sin definir"; break;
                        }
                        features[i].properties["Nivel de servicio"] = nivel;
                        if(datos.average) {
                            if(!datos.average.calculated) 
                                datos.average.calculated = {};
                            features[i].properties["Velocidad promedio"] = datos.average.calculated.speed || 0;
                            features[i].properties["Lectura promedio"] = datos.average.calculated.readings || 0;
                            features[i].properties["Tiempo promedio"] = datos.average.calculated.elapsed || 0;
                            
                        }
                        if(datos.last) {
                            if(!datos.last.calculated) 
                                datos.last.calculated = {};
                            features[i].properties["Ultima velocidad"] = datos.last.calculated.speed || 0;
                            features[i].properties["Ultima lectura"] = datos.last.calculated.readings || 0;
                            features[i].properties["Ultimo tiempo"] = datos.last.calculated.elapsed || 0;
                        }
                        break;
                    }
                }
                layerVectors.model.put(features[i]);
                //layerSimulacion.model.put(features[i]);
            }
            crearTablaNivelesServicio(features);
            
        }).fail(function (e) {
            console.log(e);
            if(!stop)
                updateDataVectors(layer, true);
        });
    }
    
    
    
    function updateLayers() {
        console.log("Actualizando Nodos y Vectores");
        updateDataNodes();
        updateDataVectors();
        setTimeout(updateLayers, 60*1000);
    }
    /* 
     * ==========================================================================================
     *                             Crear Tabla de niveles de servicio
     * ==========================================================================================
     */
    function crearTablaNivelesServicio(vectores) {
        //var vectores = layerVectors.model.query().array;
        var tabla = [["Estado", "Distancia", "Porcentaje"]];
        var niveles = [], distancias = {green: 0, yellow: 0, red: 0};
        var total = 0;
        for(var i=0; i<vectores.length; i++) {
            var nivel = vectores[i].properties["Nivel de servicio"];
            if(!distancias[nivel])
                distancias[nivel] = 0;
            distancias[nivel] += parseInt(vectores[i].properties.Distancia);
            total += parseInt(vectores[i].properties.Distancia);
        }
        var  i=1;
        var porcentaje, labels = ["Bueno", "Regular", "Malo", "Sin Definir"];
        var niveles = ["Verde", "Amarillo", "Rojo", "Sin definir"];
        for(i=0;  i<niveles.length; i++) {
            porcentaje = (distancias[niveles[i]] / total) *100;
            porcentaje = porcentaje.toFixed(2)+"%";
            tabla[i+1] = [labels[i], ((distancias[niveles[i]]|| 0 )/1000)+" Km", porcentaje];
        }
        porcentaje = (distancias[niveles[i-1]] / total) *100;
        porcentaje = 100 - porcentaje;
        porcentaje = porcentaje.toFixed(2)+"%";
        var dis = total - distancias[niveles[i-1]];
        tabla[tabla.length] = ["Total", (dis/1000)+" Km", porcentaje];
        var etiqueta = '<table id="contenttablaNivelesServicio>$tabla</table>';
        var columna = '<td align="center"><b>$dato</b></td>';
        var colorColum = '<td align="center" style="color: $COLOR"><b>$dato</b></td>';
        var columnas ='';
        var fila = '<tr bgcolor="$COLOR">$columna</tr>' ;
        var filas= '', etiquetaTabla ='', n=tabla.length , m = tabla[0].length;
        var options =  { color1: '#4b6a86', color2: '', enumerado: false };
        var datos = tabla[0], color;
        var colores = ["#20e11a", "#f3f328", "#f34428", "#b0b0b0", "#ffffff"];
        try {
            for(var i=0; i<n; i++) {
                datos = tabla[i];
                for(var j=0;j<m;j++) {
                    if(i>0 && j===0)
                        columnas += colorColum.replace("$COLOR", colores[i-1]).replace('$dato', datos[j]);
                    else
                        columnas += columna.replace('$dato', datos[j]);
                }
                color = "";
                filas += fila.replace('$columna', columnas).replace("$COLOR", color);
                etiquetaTabla += filas;
                columnas='';
                filas ='';
            }
        } catch(e) { console.error(e); }
        etiqueta = etiqueta.replace('$tabla', etiquetaTabla);
        document.getElementById("tablaNivelesServicio").innerHTML=etiqueta;
    }
    /* 
     * ==========================================================================================
     *                             Creacion de graficas
     * ==========================================================================================
     */
    function getData(inicio, fin, nodo, vector, handeler, handelerError) {
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*24);
        } 
        var inicio2 = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm:ss");
        var fin2 = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm:ss");
        inicio = typeof inicio === "string"? inicio: Util.formatDate(inicio, "aaaa-mm-ddThh:mm:ss");
        fin = typeof fin === "string"? fin: Util.formatDate(fin, "aaaa-mm-ddThh:mm:ss");
        console.log("Movilidad time "+inicio+" UTC "+inicio2);
        console.log("fin "+fin+" UTL "+ fin2);
        var tipo, id;
        if(nodo) {
            tipo = "devices";
            id = "?sid="+nodo;
        } else {
            tipo = "speeds";
            id= "?vid="+vector;
        }
        var url = "https://cileon.aggme.tech/InterSect/redireccion";
        var urlb="http://165.22.155.28:8080/bitcarrier/"+tipo;
        //$.getJSON("http://165.22.155.28:8080/bitcarrier/"+id+tipo+"&start="+inicio+"&end="+fin, function (data) {
        //$.getJSON(url+id+"&start="+inicio+"&end="+fin+"&RedirectURL="+encodeURI(urlb), function (data) {
        var parametros = id+"&inicio="+inicio2+"&fin="+fin2;
        $.getJSON(baseUrl+"/movilidad/"+tipo+parametros, function(data) {
            handeler(data, inicio, fin);
        }).fail(function (error) {
            handelerError(error);
        });
    }
    
            $("#fechaMovilidad1").datepicker({
                minDate: new Date("2019/12/3"),
                //maxDate: new Date("2019/12/8"),
                dateFormat: 'yy-mm-dd'
            });
            $("#fechaMovilidad2").datepicker({
                minDate: new Date("2019/12/3"),
                //maxDate: new Date("2019/12/8"),
                dateFormat: 'yy-mm-dd'
            });
    var cargar = true;
    $("#mostrarHistorialMovilidad").click(function() {
       if(cargar === true) {
           cargar = false;
           crearGraficas();
       } 
    });
    var actualizar = true;
    function crearGraficas () {
        
        var nodo = document.getElementById("selectorNodo").selectedOptions[0].value;
        if(Util.startTimer)
            Util.startTimer("MovilidadHistorialNodos");
        getData(null, null, nodo, null, function (data, inicio, fin) {
            setDates(inicio, fin);
            MovilidadCharts.crearGraficasNodos( "chartMovilidadHistorial0", data.devices, 0 );
            
        }, function (error) {
            console.error(error);
            MovilidadCharts.crearGraficasNodos( "chartMovilidadHistorial0", [], 0 );
            //crearGraficaTR();
        });
        var vector = document.getElementById("selectorVector").selectedOptions[0].innerHTML;
        if(Util.startTimer)
            Util.startTimer("MovilidadHistorialVectores");
        getData(null, null, null, vector, function (data, inicio, fin) {
            MovilidadCharts.crearGraficasVelocidad("chartMovilidadHistorial1", data.speeds,  1);
            
        }, function (error) {
            console.error(error);
            MovilidadCharts.crearGraficasVelocidad("chartMovilidadHistorial1", [],  1);
        });
    }
    
    function setDates(date1, date2) {
        var sStartdate = Util.formatDate(date1, "aaaa-mm-dd");
        var date = new Date(date1);
        var sStartTime = date.getHours();
        document.getElementById("fechaMovilidad1").value = sStartdate;
        document.getElementById("timeMovilidad1").selectedIndex  = sStartTime;
        
        var sEndDate = Util.formatDate(date2, "aaaa-mm-dd");
        date = new Date(date2);
        var sEndTime = date.getHours();
        if(sEndTime+1 >= 24) {
            sEndTime = 0;
            date = date.getTime() + (1000*60*60);
            sEndDate = Util.formatDate(date, "aaaa-mm-dd");
        } else
            sEndTime ++;
        document.getElementById("fechaMovilidad2").value = sEndDate;
        document.getElementById("timeMovilidad2").selectedIndex = sEndTime;
    }
    /* 
     * ==========================================================================================
     *                             Listeners
     * ==========================================================================================
     */
    $("#fechaMovilidad1").on("change", updateTimeChartRange);
    $("#fechaMovilidad2").on("change", updateTimeChartRange);
    $("#timeMovilidad1").on("change", function (element) {
            updateTimeChartRange();
    });
    $("#timeMovilidad2").on("change", function (element) {
            updateTimeChartRange();
    });
    
    $("#selectorVector").on("change", function() {
            updateTimeChartRange("vectores");
    });
    $("#selectorNodo").on("change", function() {
            updateTimeChartRange("nodos");
    });
    $("#selectorTramo").on('change', function (element) {
       
        var select = element.currentTarget.selectedOptions[0].innerHTML;
        if(select === "Todos")
            layerVectors.filter = null;
        else {
            var map = layerVectors.parent.map;
            var hacerFit = true;
            layerVectors.filter = function (feature, layer) {
                var id = feature.properties.Id;
                if(id === select) {
                    if(feature.shape.bounds && hacerFit === true) {
                        Util.fitBounds(map, feature.shape.bounds, true);
                        hacerFit = false;
                    }
                    return true;
                } else
                    return false;
            };
        }
    });
    /* 
     * ==========================================================================================
     *                             Update Rango de tiempo
     * ==========================================================================================
     */
    function updateTimeChartRange(update) {
        if(update !== "vectores")
            $("#loadingHistorialMovilidad0").fadeIn();
        if(update !== "nodos")
            $("#loadingHistorialMovilidad1").fadeIn();
        var date1 = $("#fechaMovilidad1").val();
        var time1 = document.getElementById("timeMovilidad1").selectedOptions[0].innerHTML;
        
        var date2 = $("#fechaMovilidad2").val();
        var time2 = document.getElementById("timeMovilidad2").selectedOptions[0].innerHTML;
        
        date1 = date1 + " " + time1;
        date2 = date2 + " " + time2;
        var sDate = Date.parse(date1);
        var eDate = Date.parse(date2);
        if (sDate >= eDate) {
            console.log("Fechas Incorrectas");
            document.getElementById("labelMovilidad").innerHTML = "Rango de Fechas incorrecto, la fecha de incio debe ser menor a la de final";
            $("#loadingHistorialMovilidad1").fadeOut();
            $("#loadingHistorialMovilidad0").fadeOut();
            return 0;
        }
        //date1 = Util.formatDateUTC(sDate, "aaaa-mm-dd hh:mm:ss");
        //date2 = Util.formatDateUTC(eDate, "aaaa-mm-dd hh:mm:ss");
        document.getElementById("labelMovilidad").innerHTML = "";
        if(update !== "vectores") {
        var sensor = document.getElementById("selectorNodo").selectedOptions[0].value;
        getData(date1, date2, sensor, null, function (data) {
            if(data.length===0) {
                document.getElementById("labelMovilidad").innerHTML = "No se encontro informacion en este rango de tiempo";
                data.devices = [];
            }
            MovilidadCharts.updateGrafica(0, data.devices, null);
            $("#loadingHistorialMovilidad0").fadeOut();
        }, function (error) {
            console.log(error);
            document.getElementById("labelMovilidad").innerHTML = "Error al conectarce con API";
            MovilidadCharts.updateGrafica(0, [], null);
            $("#loadingHistorialMovilidad0").fadeOut();
        });
        }
        if(update !== "nodos") {
        var vector = document.getElementById("selectorVector").selectedOptions[0].innerHTML;
        getData(date1, date2, null, vector, function (data) {
            if(data.length===0) {
                document.getElementById("labelMovilidad").innerHTML = "No se encontro informacion en este rango de tiempo";
                data.speeds = [];
            }
            MovilidadCharts.updateGrafica(1, data.speeds, null);
            //MovilidadCharts.updateGrafica(2, data, null);
            $("#loadingHistorialMovilidad1").fadeOut();
        }, function (error) {
            console.log(error);
            document.getElementById("labelMovilidad").innerHTML = "Error al conectarce con API";
            MovilidadCharts.updateGrafica(1, [], null);
            $("#loadingHistorialMovilidad1").fadeOut();
        });
        }
    }
    
    $("#selectorParametroNodos").on("change", function () {
            MovilidadCharts.updateGrafica(0, null, null);
    });
    $("#selectorParametroVector").on("change", function (element) {
        var x = element.currentTarget.selectedOptions[0].value;
        var ms = x==="0"? "Tiempo (s)": "Velocidad (km/h)";
        document.getElementById("labelGraficaMTV").innerHTML = ms;
            MovilidadCharts.updateGrafica(1, null, null);
            
    });
    
    function updateDay(id, fecha) {
        var inicio = Date.parse(fecha+" 00:00");
        var final = Date.parse(fecha+" 23:59");
        var tablas = crearTablaDatos(inicio, final);
        MovilidadCharts.updateChart(id, tablas, null, fecha);
    }
    
    function updateHora(id, fecha, hora) {
        var inicio = Date.parse(fecha+" "+hora);
        var final = inicio + (1000*60*60);
        var tablas = crearTablaDatos(inicio, final);
        MovilidadCharts.updateChart(id, tablas, null, fecha);
    }
    function crearTablaDatos(startTime, endTime) {
        var actualTime = typeof startTime==="string"? Date.parse(startTime): startTime;
        var actualTimeS = Util.formatTime(actualTime);
        var tablaDatos = [["Fecha", "avg_speed"]];
        endTime = typeof endTime==="string"? Date.parse(endTime): endTime;
        while(actualTime < endTime) {
            actualTimeS = Util.formatTime(actualTime, false);
            tablaDatos[tablaDatos.length] = [actualTimeS, Util.getRandom(0, 80)];
            actualTime += (1000*60*15);
        }
        
        return tablaDatos;
    }
    /* 
     * ==========================================================================================
     *                             Graficas Tiempo Real
     * ==========================================================================================
     */
    function getDataRT(handeler, handelerError) {
        var url = "https://cileon.aggme.tech/InterSect/redireccion";
        //$.getJSON(url+"?"+"RedirectURL="+encodeURI("http://165.22.155.28:5000/bitcarrier/traveltimes"), function (data) {
        $.getJSON(baseUrl+"/movilidad/lecturatraveltimes", function (data) {
            handeler(data);
        }).fail(function(error) {
            handelerError(error);
        });
    }
    
    function crearGraficaTR() {
        getDataRT(function (data) {
            MovilidadCharts.crearGraficaTR("graficaMovilidadTR", data, 3);
            startRT();
        }, function(error) {
            console.error(error);
            startRT();
        });
    }
    
    function startRT() {
        setInterval(function () {
            updateRealTime();
        }, 1000 * 60);
    }
    
    function updateRealTime() {
        $("#loadingMovilidadTR").fadeIn();
        getDataRT(function (data) {
            MovilidadCharts.updateGraficaTR(data, 3);
            $("#loadingMovilidadTR").fadeOut();
        }, function(error) {
            console.error(error);
            $("#loadingMovilidadTR").fadeOut();
        });
    }
    
    $("#selectorRID").on("change", function () {
            updateRealTime();
    });
    $("#movilidadParametroTR").on("change", function () {
            updateRealTime();
    });
    
    $("#selectorCirculos").on("change", function () {
        layerNodes.filter = function() { return true; };
    });
    /* 
     * ==========================================================================================
     *                             Simulacion de vectores
     * ==========================================================================================
     */
    var timeChart, datosSimulacion;
    function crearTimeChart(data, inicio, fin) {
        datosSimulacion = corregirFechas(data);
        
        inicio = Util.formatDateUTCToLocal(inicio, "aaaa-mm-dd hh:mm");
        fin = Util.formatDateUTCToLocal(fin, "aaaa-mm-dd hh:mm");
        var timeChartOptions = {
            startTime: inicio, endTime: fin , speedUp: 200, playing: false,
            divPlay: "playtime", format: "hh:mm", label: "timeLabel"
        };
        setDatesSimulacion(inicio, fin);
        timeChart = TimeChartManager.startTimeChart("timeChart", null, timeChartOptions, actualizarSimulacion);
    }
    function cargarDatosSimulacion(inicio, fin, vid, handeler, handelerError) {
        $("#loadingNiveles").fadeIn();
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*4);
        }
        inicio = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm");
        fin = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm");
        vid = vid || "all";
        var parametros = "?inicio="+inicio+"&fin="+fin+"&vid="+vid;
        //$.getJSON("data/ejemploVectores.json", function (data) {
        $.getJSON(baseUrl+"/movilidad/lecturaNivelServicio"+parametros, function (data) {
            handeler(data, inicio, fin);
            $("#loadingNiveles").fadeOut();
        }).fail(function (e) {
            console.error(e);
            if(handelerError)
                handelerError(e);
        });
        
    }
    var actualTime, historialMatriz=[], last;
    function actualizarSimulacion() {
        try {
            
            actualTime = timeChart.getCurrentTime().getTime();
            $('#labelTime').text(Util.formatDate(actualTime, "aaaa-mm-dd hh:mm"));
            var select = document.getElementById("nivelesVectores").selectedOptions[0].innerHTML;
            //layerVectors.filter = function () { return true; };
            
            if(!last) {
                last = actualTime - (1000*60*10);
            }
            var dif = actualTime - last;
            dif = dif <0? dif *(-1): dif;
            if(dif >(1000*60*10) ) {
                last = actualTime;
                
            if(document.getElementById("mostrarSimulacion").checked === true && datosSimulacion) {
            layerSimulacion.filter = function (feature) {
                var id = feature.id.replace("S", "");
                var datos;
                if(select !== "Todos" && id !== select ) {
                    feature.properties["Nivel de servicio"] = "Sin Definir";
                    return false;
                }
                var fecha = Util.formatDate(last, "aaaa-mm-dd hh:mm");
                if(feature.properties.Fecha === fecha) 
                    return true;
                feature.properties.Fecha = fecha;
                
                for(var i in datosSimulacion) {
                    if(id === datosSimulacion[i].vid){
                        datos = datosSimulacion[i];
                        break;
                    }
                }
                if(!datos) {
                    feature.properties["Nivel de servicio"] = "Sin Definir";
                    return true;
                }
                var fechas = datos.fechas;
                if(!fechas) {
                    feature.properties["Nivel de servicio"] = "Sin Definir";
                    return true;
                }
                var color;
                for(i=0; i<fechas.length; i++) {
                    var f1 = Date.parse(fechas[i][0]);
                    if(i=== fechas.length-1) {
                        if(actualTime > f1) {
                            color = fechas[i][1];
                        }
                    } else {
                        var f2 = Date.parse(fechas[i+1][0]);
                        if(actualTime>=f1 && actualTime<f2) {
                            color = fechas[i][1];
                            break;
                        }
                    }
                }
                /*switch(color) {
                    default: color = "Sin Definir"; break;
                    case "green": color = "Verde"; break;
                    case "yellow": color = "Amarillo"; break;
                    case "red": color = "Rojo"; break;
                }*/
                feature.properties["Nivel de servicio"] = color;
                return true;
            };
            }
            
            if(historialMatriz && document.getElementById("mostrarMatrizS").checked === true) {
                layerMatriz.filter = function (feature) { 
                    var origen = document.getElementById("vectoresMatriz").selectedOptions[0].value;
                    var id = feature.properties.Origen;
                    
                    if(origen !== "0" && origen !== id)
                        return false;
                    var fecha = Util.formatDate(last, "aaaa-mm-dd hh:mm");
                    if(fecha === feature.properties.Fecha)
                        return true;
                    feature.properties.Fecha = fecha;
                    
                    var matrix;
                    for(var i=0; i<historialMatriz.length-1; i++) {
                        var fecha = Util.formatDateUTCToLocal(historialMatriz[i].fecha);
                        var fecha2 = Util.formatDateUTCToLocal(historialMatriz[i+1].fecha);
                        if(actualTime > fecha && actualTime < fecha2) {
                            matrix = historialMatriz[i];
                            break;
                        }
                    }
                    if(matrix === null || !matrix) {
                        var r = Util.getRandom(0, 100);
                        if(r < 80)
                            r = 0;
                        else {
                            if(r < 86)
                                r = 1;
                            else {
                                if(r < 91) 
                                    r = 5;
                                else {
                                    if(r < 95) 
                                        r = 7;
                                    else {
                                        if(r < 98) 
                                            r=10;
                                        else
                                            r=12;
                                    }
                                }
                            }
                        }
                        feature.properties.ValorHistorial = r;
                        feature.properties.Valor = r;
                        return true;
                    }
                    
                    var origen = feature.Origen;

                    //for(var i=0; i<features.length; i++) {
                      //  var id = features[i].id;
                        var datos = matrix[origen];
                        if(datos) {
                            for(var to in datos) {
                                try {
                                    if(origen !== to) {
                                        //var arc = layerMatriz.model.get(id+"-"+to);
                                        feature.properties.ValorHistorial = datos[to].count || 0;
                                        return true;
                                        //layerMatriz.model.put(arc);
                                    }
                                }catch(e) {
                                    console.log(e);
                                }
                            }
                        }
                    //}
                    return true; 
                };
            }
            }
        } catch(e) {
            
        }
    }
    
    function setDatesSimulacion(date1, date2) {
        var sStartdate = Util.formatDate(date1, "aaaa-mm-dd");
        var date = new Date(date1);
        var sStartTime = date.getHours();
        document.getElementById("fechaSimulacion1").value = sStartdate;
        document.getElementById("timeSimulacion1").selectedIndex  = sStartTime;
        
        var sEndDate = Util.formatDate(date2, "aaaa-mm-dd");
        date = new Date(date2);
        var sEndTime = date.getHours();
        if(sEndTime+1 >= 24) {
            sEndTime = 0;
            date = date.getTime() + (1000*60*60);
            sEndDate = Util.formatDate(date, "aaaa-mm-dd");
        } else
            sEndTime ++;
        document.getElementById("fechaSimulacion2").value = sEndDate;
        document.getElementById("timeSimulacion2").selectedIndex = sEndTime;
    }
    var simulacion = true;
    $("#mostrarMatrizS").on("change", function (element) {
        if(!timeChart)
            cargarDatosSimulacion(null, null, null, crearTimeChart);
        var check = element.currentTarget.checked;
        
        if(check === true) {
            document.getElementById("cSensoresMovilidadMatriz").checked = true;
            layerMatriz.visible = true;
        } else {
            updateMatriz();
        }
        if(check=== true)
            $("#pTimeMovilidadTimeslider").fadeIn("slow");
        else
            $("#pTimeMovilidadTimeslider").fadeOut("slow");
    });
    $("#mostrarSimulacion").on("change", function (element) {
        
        if(!timeChart)
            cargarDatosSimulacion(null, null, null, crearTimeChart);
        var check = element.currentTarget.checked;
        
        if(check === true) {
            document.getElementById("cSensoresMovilidadVectores").checked = false;
            layerVectors.visible = false;
        }
        layerSimulacion.visible = check;
        if(check=== true)
            $("#pTimeMovilidadTimeslider").fadeIn("slow");
        else
            $("#pTimeMovilidadTimeslider").fadeOut("slow");
    });
    
    function corregirFechas(tabla) {
        var n = tabla.length;
        for(var i=0; i<n; i++) {
            var fechas = tabla[i].fechas;
            for(var j in fechas) {
                var fecha = fechas[j][0];
                fecha = Util.formatDateUTCToLocal(fecha, "aaaa-mm-dd hh:mm");
                fechas[j][0] = fecha;
            }
            tabla[i].fechas = fechas;
        }
        return tabla;
    }
    
    function updateTimeRange() {
        var date1 = $("#fechaSimulacion1").val();
        var time1 = document.getElementById("timeSimulacion1").selectedOptions[0].innerHTML;
        
        var date2 = $("#fechaSimulacion2").val();
        var time2 = document.getElementById("timeSimulacion2").selectedOptions[0].innerHTML;
        
        date1 = date1 + " " + time1;
        date2 = date2 + " " + time2;
        var sDate = Date.parse(date1);
        var eDate = Date.parse(date2);
        if (sDate >= eDate) {
            return 0;
        }
        cargarDatosSimulacion(date1, date2, "all", function (data, inicio, fin) {
            datosSimulacion = corregirFechas(data);
            inicio = Util.formatDateUTCToLocal(inicio, "date");
            fin = Util.formatDateUTCToLocal(fin, "date");
            timeChart.startDate = inicio;
            timeChart.endDate = fin;
            timeChart.setCurrentTime(inicio);
        });
    }
    
    $("#fechaSimulacion1").on("change", updateTimeRange);
    $("#fechaSimulacion2").on("change", updateTimeRange);
    $("#timeSimulacion1").on("change", function () {
        updateTimeRange();
    });
    $("#timeSimulacion2").on("change", function () {
        updateTimeRange();
    });
    $("#nivelesVectores").on("change", function () {
        actualizarSimulacion();
    });
    
    $("#verTablaNiveles").click(function () {
        document.getElementById("LabelTabla1").innerHTML = "Historial de niveles de servicio";
        var tabla = [["Fechas", "Niveles de servicio"]];
        var select = document.getElementById("nivelesVectores").selectedOptions[0].innerHTML;
        if(select === "Todos") {
            var n = datosSimulacion.length;
            tabla = [];
            var encabezados=["Fechas"], fechas={};
            for(var i in datosSimulacion) {
                encabezados[encabezados.length] = datosSimulacion[i].vid;
                var f = datosSimulacion[i].fechas;
                for(var j in f) {
                    var fecha = f[j][0];
                    if(!fechas[fecha])
                        fechas[fecha] = [];
                    fechas[fecha][i] = f[j][1];
                }
            }
            n = encabezados.length;
            tabla= [encabezados];
            for(var f in fechas) {
                var fila = [f];
                for(i=0; i<n-1; i++) {
                   /* var v = fechas[f][i];
                    switch(v) {
                        case "red": v = "Rojo"; break;
                        case "yellow": v = "Amarillo"; break;
                        case "green": v = "Verde"; break;
                        default: v = "Sin definir";
                    }
                    fila[fila.length] = fechas[f][i];*/
                    fila[fila.length] = fechas[f][i] || "Sin definir";
                }
                tabla[tabla.length] = fila;
            }
        } else {
            var fechas;
            for(var i in datosSimulacion) {
                if(select === datosSimulacion[i].vid) {
                    fechas = datosSimulacion[i].fechas || [];
                    break;
                }
            }
            if(fechas.length >0) {
                var color;
                for(i in fechas) {
                    /*var v = fechas[i][1];
                    switch(v) {
                        case "red": v = "Rojo"; break;
                        case "yellow": v = "Amarillo"; break;
                        case "green": v = "Verde"; break;
                        default: v = "Sin definir";
                    }
                    tabla[tabla.length] = [fechas[i][0], fechas[i][1]];*/
                    tabla[tabla.length] = fechas[i];
                }
            }
        }
        Util.crearTablaDIV("tablaCompleta1", tabla, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
        document.getElementById("graficaImagenM1").innerHTML = "";
        document.getElementById("graficaImagenM2").innerHTML = "";
        $("#descargarGraficas").fadeOut();
        $("#panelTablas").fadeIn("slow");
    });
    
    $("#Densidad").on("input", function() {
        var x = 1, y = 0;
        x = parseInt($("#Densidad").val());
        if(x < 10) {
            layerMatriz.painter.density = {
                colorMap: ColorMap.createGradientColorMap([
                {level: y, color: "rgba(  0,   0,   255, 1)"},
                {level: y+=x, color: "rgba(  0, 100,   255, 1)"},
                {level: y+=x*2, color: "rgba(  0, 255,   255, 1.0)"},
                {level: y+=x*3, color: "rgba(  255, 255,   0, 1.0)"},
                {level: y+=x*4, color: "rgba(255, 0, 0, 1.0)"}
                ])
            };
        } else {
            layerMatriz.painter.density = null;
        }
    });
    
    $("#AlturaCurvas").on("input", updateMatriz);
    
    $("#vectoresMatriz").on("change", updateMatriz);
    
    function updateMatriz() {
        var origen = document.getElementById("vectoresMatriz").selectedOptions[0].value;
        if(origen === "0") {
            layerMatriz.filter = null;
            layerNodes.filter = null;
            return 0;
        }
        layerMatriz.filter = function (feature) {
            if(origen === "0")
                return true;
            if(origen === feature.properties.Origen)
                return true;
            else
                return false;
        };
        /*layerNodes.filter = function (feature) {
            if(origen === "0")
                return true;
            if(origen === feature.properties.Id)
                return true;
            else
                return false;
        };*/
    }
    
    function updateMatrizData(inicio, fin, handeler, he) {
        $("#loadingNiveles").fadeIn();
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*4);
        }
        inicio = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm");
        fin = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm");
        var parametros = "?inicio="+inicio+"&fin="+fin;
        $.getJSON(baseUrl+""+parametros, function (data) {
            historialMatriz = data.matrix;
            $("#loadingNiveles").fadeOut();
        }).fail(function (e) {
            console.error(e);
        });
    }
    
    return {
        createLayer: createLayer,
        updateDataNodes: updateDataNodes,
        updateDataVectors: updateDataVectors,
        updateLayers: updateLayers
    };
});
