/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */ 

define(["recursos/js/Shapes", "recursos/js/LayerFactory", 'recursos/js/Util', "./soundCharts",
    "./TimeChartManager"], function (Shapes, LayerFactory, Util, soundCharts, TimeChartManager) {
    var actualToken={token: "Mw4UPwd9xPu4OV1DWsXLanycTUZQdHUgXYCO26mUC3jMblc3OKAOWHPgZ28HJByu", time: "2019/10/05 11:35", intervalo: 1000*60*60*5};
    var realTime = true; //document.getElementById("cSonidoReal").checked;
    var user, capaSonido, capaSonidoH;
    var baseUrl = "https://cileon.aggme.tech/InterSect/serviciosrs/monitor/1.0";
    function createSoundLayer(layer, reference, url, layer2) {
        baseUrl = url;
        getDataSound(layer, reference, layer2);
    }
    
    var sensores = ["leq_a","leq_c", "leq_spl"], nA=0;
    var ultimoValor=0;
    var tablaDatos=[], timeChartSound;
    /*
     * ===========================================================================================
     *                          Obtener datos Endpoint
     * ===========================================================================================
     */
    var reintentar = true;
    function getDataSound(layer, reference, layer2) {
        //var url = "https://cileon.aggme.tech/InterSect/redireccion";
        var url = baseUrl+"/sonido/sensores";
        $.getJSON(url, function (data) {
        //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica"), function(data) {
        //$.getJSON("https://www.olly.science/urbiotica", function(data) {
            console.log("Api de sonido, creando Capa");
            createLayer(layer, reference, data, layer2);
        }).fail(function(e) {
            console.log("No se conecto con el endpoint de sonido");
            console.error(e);
            var http = new XMLHttpRequest();
            //http.open("get", "https://www.olly.science/urbiotica", true);
            //var url1 = "https://cileon.aggme.tech/InterSect/redireccion";
            //http.open("get", url1+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica"), true);
            http.open("get", url, true);
            http.setRequestHeader("Content-Type", "application/json");
            http.onreadystatechange = function (data) {
                console.log("ReadyState "+http.readyState+", Status "+http.status+ ", Response "+ http.responseText);
                if(http.readyState === 4 && (http.status === 200 || http.status === 202)) { 
                    createLayer(layer, reference, JSON.parse(http.responseText), layer2);
                    console.log("Conectado con httpRequest");
                } else {
                    if(reintentar=== true) {
                        reintentar = false;
                        getDataSound(layer, reference, layer2);
                    }
                }
            };
            http.send(null);
            
        });
    }
    
    function getData(inicio, fin, estacion, handeler, errorHandeler) {
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*5);
        }
        estacion = estacion || "all";
        inicio = typeof inicio === "string"? inicio: Util.formatDate(inicio, "aaaa-mm-dd hh:mm:ss");
        fin = typeof fin === "string"? fin: Util.formatDate(fin, "aaaa-mm-dd hh:mm:ss");
        var inicio2 = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm:ss");
        var fin2  = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm:ss");
        console.log("inicio     "+inicio+"  utc     "+inicio2);
        console.log("fin        "+fin+"     utc     "+fin2);
        var parametros = "inicio="+inicio2+"&fin="+fin2+"&estacion="+estacion;
        $.getJSON(baseUrl+"/sonido/lecturaPhenomenons?"+parametros, function (data) {
            console.log("=============== Conectado con exito con Sonido =================");
            handeler(data, inicio, fin, estacion);
        }).fail(function (e) {
            if(errorHandeler)
                errorHandeler(e);
            else
                console.error(e);
        });
    }
    
    function getDataTR(inicio, fin, estacion, handeler, errorHandeler) {
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*5);
        }
        estacion = estacion || "all";
        inicio = typeof inicio === "string"? inicio: Util.formatDate(inicio, "aaaa-mm-dd hh:mm:ss");
        fin = typeof fin === "string"? fin: Util.formatDate(fin, "aaaa-mm-dd hh:mm:ss");
        var inicio2 = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm:ss");
        var fin2  = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm:ss");
        console.log("inicio     "+inicio+"  utc     "+inicio2);
        console.log("fin        "+fin+"     utc     "+fin2);
        var parametros = "inicio="+inicio2+"&fin="+fin2+"&estacion="+estacion;
        $.getJSON(baseUrl+"/sonido/lecturaPhenomenonsUlt?"+parametros, function (data) {
            console.log("=============== Conectado con exito con Sonido =================");
            handeler(data, inicio, fin, estacion);
        }).fail(function (e) {
            if(errorHandeler)
                errorHandeler(e);
            else
                console.error(e);
        });
    }
    /*
     *============================================================================================================
     *                                      Administrar Timechart
     *============================================================================================================
     */
    function setDates(date1, date2) {
        var sStartdate = Util.formatDate(date1, "aaaa-mm-dd");
        var date = new Date(date1);
        var sStartTime = date.getHours();
        //sStartTime = sStartTime>12? sStartTime-13: sStartTime-1;
        document.getElementById("fechaSound1").value = sStartdate;
        document.getElementById("timeSound1").selectedIndex  = sStartTime;
        //document.getElementById("timeSound1-2").selectedIndex  = x;
        
        var sEndDate = Util.formatDate(date2, "aaaa-mm-dd");
        date = new Date(date2);
        var sEndTime = date.getHours();
        if(sEndTime+1 >= 24) {
            sEndTime = 0;
            date = date.getTime() + (1000*60*60);
            sEndDate = Util.formatDate(date, "aaaa-mm-dd");
        } else
            sEndTime ++;
        document.getElementById("fechaSound2").value = sEndDate;
        document.getElementById("timeSound2").selectedIndex = sEndTime;
        //document.getElementById("timeSound2-2").selectedIndex = x;
    }
    
    
    function loadDataCharts(idSensor, start, end) {
        //
        var url = "https://cileon.aggme.tech/InterSect/redireccion";
        getData(start, end, idSensor, function (leq) {
        //$.getJSON("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+start+"/"+end, function(leq) {
	//$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+start+"/"+end), function(leq) {
        //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+fen+"/"+start+"/"+end), function(leq) {
            console.log("Obteniendo datos de sonido "+fen);
            if(leq.length === 0) {
                //alert("No se encontro informacion del Sensor "+idSensor+" Phe "+fen);
                document.getElementById("labelSonido").innerHTML = "No se encontro informacion del Sensor "+idSensor;
                console.log("No datos sensor "+idSensor+" start "+ Util.formatDate(start, "aaaa/mm/dd hh:mm")+" fin "+Util.formatDate(end, "aaaa/mm/dd hh:mm"));
                $("#loadingHistorialSonido0").fadeOut();
                $("#loadingHistorialSonido1").fadeOut();
                $("#loadingHistorialSonido2").fadeOut();
                leq = [{}];
            } 
            var tabla = [["Fecha", "Valor"]];
            var metrics = leq[0].metrics;
            for(var i=0; i<metrics.length; i++) {
                var fen = metrics[i].metric;
                var datos = metrics[i].measurements;
                var id = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                //var sensor = leq[i].pomid || idSensor;
                //var unit = leq[i].phenomenon.unit;
                //var startDate, endDate, mayor=0;
                var time, fecha;
                var unit = metrics[i].unit;
                tabla = [["Fecha", "Decibeles "+unit]];
                if(datos.length >0) {
                    for(var d=datos.length-1; d>=0; d--) {
                        var valor = parseFloat(datos[d].value);
                        time = datos[d].lstamp;
                        fecha = Util.formatDate(time, "aaaa/mm/dd hh:mm:ss");
                        tabla[tabla.length] = [new Date(time), valor];
                    }
                }
                
                    //endDate = datos[0].lstamp;
                if(tabla.length === 1) {
                   tabla[1] = [new Date(start), 0];
                   tabla[2] = [new Date(end), 0];
                   document.getElementById("labelSonido").innerHTML = "No se encontro informacion del Sensor "+idSensor;
                } 
                datos={ tabla: tabla, fen: fen};
                soundCharts.crearHistorial("chartSensorHistorial"+id, idSensor, id, datos);
            }
        }, function(e) {
            console.log("============Error al cargar datos de "+idSensor+" intentos = "+reintentar+"==============");
            console.error(e);
            if(reintentar) {
                reintentar = false;
                loadDataCharts(idSensor, start, end);
            } else {
                document.getElementById("labelSonido").innerHTML = "No se encontro informacion del Sensor "+idSensor;
                var tabla = [["Fecha", "Decibeles"]];
                tabla[1] = [new Date(start), 0];
                tabla[2] = [new Date(end), 0];
                sensores.forEach(function (fen) {
                    var id = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                    var datos={tabla: tabla,  fen: fen};
                    soundCharts.crearHistorial("chartSensorHistorial"+id, idSensor, id, datos);
                });
            }
        });
    }
    
    /* =================================================================================
     *                          Crear Capa de Sonido
     * =================================================================================
     */
    var keyIdSensor;
    function createLayer(layer, reference, data, layer2) {
        var n = data.length;
        var ids = [], names=[];
        var features=[];
        capaSonido = layer;
        capaSonidoH = layer2;
        for(var i=0; i<n; i++) {
            var actual = data[i];
            var lon = parseFloat(actual.longitude);
            var lat = parseFloat(actual.latitude);
            var id = actual.pomid;
            var name = actual.name;
            var type = actual.type;
            var elementid = actual.elementid;
            var status_location = actual.status_location;
            var entity = actual.entity;
            var properties={
                Nombre: name, Tipo: type, Id: id, "Id Elemento": elementid,
               "Estado Locacion": status_location, "Entidad": entity
            };
            var properties2={
                Nombre: name, Tipo: type, Id: id, "Id Elemento": elementid,
               "Estado Locacion": status_location, "Entidad": entity
            };
            /*var atr = actual.attributes;
            for(var j in atr) {
                var att = atr[j].attributeid;
                var val = atr[j].value;
                var last = atr[j].last_update;
                last = Util.formatDate(last, "aaaa/mm/dd hh:mm:ss");
                properties[att] = val;
                properties[att+"_last_update"] = last;
            }*/
            //if(lon > -101.80101604972198 && lon < -101.37788057285069 && lat > 20.864701036059994 && lat < 21.339929516664647) {
                var feature = Shapes.createPoint(reference, lon, lat, 0, id, properties);
                features[i] = feature;
                capaSonido.model.add(feature);
                ids[ids.length] = id;
                names[names.length] = name;
                
                var feature2 = Shapes.createPoint(reference, lon, lat, 0, id, properties);
                capaSonidoH.model.add(feature2);
                if(id === "41908" || id === 41908)
                    keyIdSensor = ids.length-1;
            //}
        }
        capaSonido.visible = false;
        capaSonidoH.visible = false;
        Util.setOptions("selectSensorSonido", names, false, ids);
       // crearGraficasHistorial();
       var idSensor = "41908";
       if(keyIdSensor)
            document.getElementById("selectSensorSonido").selectedIndex = keyIdSensor;
       startRealTime(idSensor);
    }
    var cargar=true;
    $("#mostrarHistorialSonido").click(function () {
        if(cargar===true) {
            cargar = false;
            crearGraficasHistorial();
        }
    });
    function crearGraficasHistorial() {
        // Conectarse con endpoint para obtener los datos de LEQ_A 41908
        var actualTime = Date.parse(new Date());
        var startTime = actualTime - (1000*60*60*2);
        
        setDates(startTime, actualTime);
        //var idSensor = "41908";
        var idSensor = document.getElementById("selectSensorSonido").value;
        //sensores.forEach(function (fen) {
            //var id = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
        $("#loadingHistorialSonido0").fadeOut();
        $("#loadingHistorialSonido1").fadeOut();
        $("#loadingHistorialSonido2").fadeOut();
        if(Util.startTimer) {
            Util.startTimer("SonidoHistorial0");
            Util.startTimer("SonidoHistorial1");
            Util.startTimer("SonidoHistorial2");
        }
        loadDataCharts(idSensor, startTime, actualTime);
        crearGraficaIndicadores(startTime, actualTime, idSensor);
        //});    
        
    }
    /* =================================================================================
     *                          Administrar TimePickers
     * =================================================================================
     */
    var actualizar = true;
    $("#fechaSound1").on("change input", function (element) {
        // value = element.currentTarget.value;
        updateTimeChart();
    });
    $("#fechaSound2").on("change input", function (element) {
        //var value = element.currentTarget.value;
        updateTimeChart();
    });
    $("#timeSound1").on("change input", function (element) {
        if(actualizar === true) {
            updateTimeChart();
            actualizar = false;
        } else 
            actualizar = true;
    });
    $("#timeSound2").on("change input", function (element) {
        if(actualizar === true) {
            updateTimeChart();
            actualizar = false;
        } else 
            actualizar = true;
    });
    
    function updateTimeChart(date1, time1, date2, time2) {
        var date1 = $("#fechaSound1").val();
        //var x = document.getElementById("timeSound1-2").selectedOptions[0].innerHTML;
        var time1 = document.getElementById("timeSound1").selectedOptions[0].innerHTML;
        var date2 = date2 || $("#fechaSound2").val();
        //x = document.getElementById("timeSound2-2").selectedOptions[0].innerHTML;
        var time2 = document.getElementById("timeSound2").selectedOptions[0].innerHTML;
        
        date1 = date1+" "+time1;
        date2 = date2+" "+time2;
        time1 = Date.parse(date1);
        time2 = Date.parse(date2);
        if(time1 >= time2) {
            console.log("Fechas Incorrectas");
            document.getElementById("labelSonido").innerHTML = "Rangos de fechas incorrectos, la fecha incial debe ser menor a la final";
            return 0;
        }
        document.getElementById("labelSonido").innerHTML = "";
        /*timeChartSound.startDate = new Date(date1);
        timeChartSound.endDate = new Date(date2);
        timeChartSound.setCurrentTime(new Date(time1));*/
        $("#loadingHistorialSonido0").fadeIn();
        $("#loadingHistorialSonido1").fadeIn();
        $("#loadingHistorialSonido2").fadeIn();
        if(cargar === false) {
            updateData(time1, time2, date1, date2);
            var idSensor = document.getElementById("selectSensorSonido").selectedOptions[0].value;
            crearGraficaIndicadores(date1, date2, idSensor);
        }
    }
    /* =================================================================================
     *                          Actualizacion Historial
     * =================================================================================
     */
    function updateData(time1, time2) {
        //sensores.forEach(function(fen) {
            
            var idSensor = document.getElementById("selectSensorSonido").selectedOptions[0].value;
            if(Util.startTimer)
                Util.startTimer("Sonido0");
            getData(time1, time2, idSensor, function (leq) {
            //$.getJSON("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+time1+"/"+time2, function(leq) {
            //var url = "https://cileon.aggme.tech/InterSect/redireccion";
            //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+time1+"/"+time2), function(leq) {
            //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+fen+"/"+time1+"/"+time2), function(leq) {
                
                var tabla = [["Fecha", "Valor"]];
                var datos=[];
                if(leq.length === 0 ) {
                    document.getElementById("labelSonido").innerHTML = "No se encontro Informacion del sensor "+idSensor;
                    console.log("No hay informacion del sensor "+idSensor);
                    $("#loadingHistorialSonido0").fadeOut();
                    $("#loadingHistorialSonido1").fadeOut();
                    $("#loadingHistorialSonido2").fadeOut();
                    //return 0;
                } else {
                    document.getElementById("labelSonido").innerHTML = "";
                    console.log(datos.length+" Datos encontrados de "+idSensor);
                }
                var startDate, endDate, mayor=0;
                var metrics = leq[0].metrics;
                for(var i =0; i<metrics.length; i++) {
                    var fen = metrics[i].metric;
                    var id = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                    datos = metrics[i].measurements;
                    var unit = metrics[i].unit;
                    tabla = [["Fecha", "Decibeles "+unit]];
                    //if(leq[i].pomid+"" === idSensor) {
                    for(var d=datos.length-1; d>=0; d--) {
                        var valor = parseFloat(datos[d].value);
                        var time = datos[d].lstamp;
                        var fecha = Util.formatDate(time, "aaaa/mm/dd hh:mm:ss");
                        tabla[tabla.length] = [new Date(fecha), valor];
                    }
                    try {
                        if(tabla.length === 1) {
                            tabla[1] = [new Date(time1), 0];
                            tabla[2] = [new Date(time2), 0];
                            document.getElementById("labelSonido").innerHTML = "No se encontro informacion en este rango de fechas";
                            //soundCharts.updateDataHistorial(idSensor, id, tabla);
                            //soundCharts.updateHistorial(idSensor, id, fen, null, tabla);
                        }
                            //soundCharts.updateDataHistorial(idSensor, id, tabla);
                        soundCharts.updateHistorial(idSensor, id, fen, "chartSensorHistorial"+id, tabla);
                        $("#loadingHistorialSonido"+id).fadeOut();
                    } catch(e) {
                        console.error(e);
                        document.getElementById("labelSonido").innerHTML = "Error al actualizar Graficas de historial";
                    }
                   // }
                }
            }, function (e) {
                console.error(e);
                console.log("Error "+e.textStatus+" con el sensor "+idSensor);
                $("#loadingHistorialSonido0").fadeOut();
                $("#loadingHistorialSonido1").fadeOut();
                $("#loadingHistorialSonido2").fadeOut();
            });
       // });
        
    }
    
    /* =================================================================================
     *                          Actualizacion en tiempo real
     * =================================================================================
     */
    var startTimeTR = Date.parse(new Date()) - (1000*60*12);
    var progreso = 0;
    function startRealTime() {
        restartTR(true);
        setInterval(function () {
            updateRealTime();
            /*try {
                capaSonido.filter = function(feature) {
                    var id = feature.properties.id+"";
                    
                    return true;
                };
            } catch(e) {
                console.error(e);
            }*/
        }, 1000*60);
        //setTimeout(startRealTime, 1000*30);
    }
    
    function updateRealTime() {
        var selected = document.getElementById("selectSensorSonido").selectedOptions[0].value;
        //if(selected !== idSensor)
          //  return 0;
        $("#loadingHistorialSonidoTR").fadeIn();
        //sensores.forEach(function(fen) {
            var time1, time2;
                time2 = Date.parse(new Date());
                time1 = time2-(1000*60*10);
                startTimeTR = startTimeTR || time1;
            getDataTR(time1, time2, "all", function (respuesta) {
            //$.getJSON("https://www.olly.science/urbiotica/phenomenons/*/"+fen, function (respuesta) {
            //$.getJSON("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+time1+"/"+time2, function(respuesta) {
            //var url = "https://cileon.aggme.tech/InterSect/redireccion";
            //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+time1+"/"+time2), function(leq) {
            //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+fen+"/"+time1+"/"+time2), function(datos) {
                
            try {
                if(!respuesta || respuesta.length === 0) {
                    return 0;
                }
                if(respuesta.message) {
                    console.log(respuesta.message);
                    return 0;
                }
                if(respuesta.length === 0 ) {
                    document.getElementById("labelSonidoTR").innerHTML = "No hay informacion de ningun sensor";
                    console.log("No hay informacion de ningun sensor ");
                    $("#loadingHistorialSonido"+idFen).fadeOut();
                    soundCharts.updateChartsRT(id, idFen, Date.now(), 0);
                     return 0;
                }
                
                for(var i in respuesta) {
                    var id = respuesta[i].pomid+"";
                    var metrics = respuesta[i].metrics;
                    for(var j in metrics) {
                        var fen = metrics[j].metric;
                        var idFen = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                        var feature = capaSonido.model.get(id);
                        var lecturas = metrics[j].measurements || []; 
                        var valor, time;
                        if(!feature) {
                            feature = {};
                            console.log("No se encontro el Feature de sonido "+id);
                        }
                        var traduccion = fen==="leq_a"? "Decibeles A": fen==="leq_c"? "Decibeles C": "Decibeles SPL";
                        if(lecturas.length===0) {
                            valor = feature.properties[traduccion] || 0;
                            time = time2;
                            feature.properties["Ultima Actualizacion"] = Util.formatTime(time, "aaaa/mm/dd hh:mm");
                        } else {
                            time = lecturas[0].lstamp;
                            valor = parseFloat(lecturas[0].value);
                            feature.properties["Ultima Actualizacion"] = Util.formatDate(time, "aaaa/mm/dd hh:mm");
                            
                            feature.properties[traduccion] = valor;
                            if(selected === id) 
                                document.getElementById("pieChartsonido"+idFen+"label").innerHTML = "Ultima actualización: "+feature.properties["Ultima Actualizacion"];
                        }
                        if(selected === id) {
                            progreso ++;
                            if(progreso > 3) {
                                progreso = 0;
                                $("#loadingHistorialSonidoTR").fadeOut();
                            }
                            console.log("Actualizando Grafica de sonido de "+fen);
                            document.getElementById("labelSonidoTR").innerHTML = "";
                            var dif = Date.now() - time;
                            if(dif > (1000*60*30))
                                valor = 0;
                            soundCharts.updateChartsRT(id, idFen, time, valor);
                        }
                    }
                }
                capaSonido.filter = function(feature) { return true; };
            } catch (e) {
                console.error(e);
                //if(selected === idSensor) 
                document.getElementById("labelSonidoTR").innerHTML = "Error al actualizar Graficas de tiempo real "+e.statusText;
                   
            }
            }, function (e) {
                console.error(e);
                console.log("No se actualizo Grafica de sonido de ");
                //var idFen = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                //soundCharts.updateRealTime(id, ultimoValor);
                //soundCharts.updateChartsRT(idFen, time2, ultimoValor);
            });
        //});
        
    }
    
    function restartTR(update) {
        //sensores.forEach(function(fen) {
        var time1, time2 = Date.now();
        time1 = time2 - (1000*60*30);
        $("#loadingHistorialSonidoTR").fadeIn();
        var idSensor = document.getElementById("selectSensorSonido").selectedOptions[0].value;
        getData(time1, time2, idSensor, function (leq) {
            //$.getJSON("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+time1+"/"+time2, function(leq) {
            //var url = "https://cileon.aggme.tech/InterSect/redireccion";
            //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+idSensor+"/"+fen+"/"+time1+"/"+time2), function(leq) {
            //$.getJSON(url+"?"+"RedirectURL="+encodeURI("https://www.olly.science/urbiotica/phenomenons/"+fen+"/"+time1+"/"+time2), function(leq) {
                //datos = datos[0].measurements || []; 
            var tabla = [["Fecha", "Valor"]];
            var datos = [];
            for(var i =0; i<leq.length; i++) {
                document.getElementById("labelSonidoTR").innerHTML = "";
                var id = leq[i].pomid;
                if(id+"" === idSensor) {
                    var metrics = leq[i].metrics;
                    for(var j in metrics) {
                        var unit = metrics[j].unit;
                        var fen = metrics[j].metric;
                        var idFen = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                        console.log("Actualizando Grafica de sonido de "+fen);
                        datos = metrics[j].measurements;   
                        tabla = [["historial", "Decibeles"]];
                        for(var d=datos.length-1; d>=0; d--) {
                            var valor = parseFloat(datos[d].value);
                            var time = datos[d].lstamp;
                            var fecha = Util.formatDate(time, "aaaa/mm/dd hh:mm:ss");
                            tabla[tabla.length] = [new Date(fecha), valor];
                        }
                        try {
                            if(tabla.length === 1){
                                tabla[1] = [new Date(time1), 0];
                                valor = 0;
                                document.getElementById("labelSonidoTR").innerHTML = "No hay informacion del sensor "+idSensor;
                            }
                            soundCharts.crearRealTime("sonidoUltimaHora"+idFen, "pieChartsonido"+idFen, idSensor, idFen, tabla);
                        } catch(e) {
                            console.error(e);
                            document.getElementById("labelSonidoTR").innerHTML = "Error al actualizar Graficas de historial";
                        }
                    }
                }
            }
                if(leq.length ===0) {
                    document.getElementById("labelSonidoTR").innerHTML = "No hay informacion del sensor "+idSensor;
                    console.log("No hay informacion del sensor "+idSensor);
                    $("#loadingHistorialSonidoTR").fadeOut();
                    tabla[tabla.length] = [new Date(time1), 0];
                    //tabla[tabla.length] = [fen, 0, "", Util.formatDate(null, "aaaa/mm/dd hh:mm:ss"), Date.now()];
                    for(var idFen=0; idFen<3; idFen++)
                       soundCharts.crearRealTime("sonidoUltimaHora"+idFen, "pieChartsonido"+idFen, idSensor, idFen, tabla);
                    //soundCharts.updateChartsRT(idSensor, idFen, Date.now(), 0);
                    return 0;
                } 
                $("#loadingHistorialSonidoTR").fadeOut();
                if(update===true)
                    updateRealTime();
            }, function (e) {
                console.error(e);
                console.log("No se actualizo Grafica de sonido de ");
                for(var i in sensores) {
                    var fen = sensores[i];
                    var idFen = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                    var tabla = [["historial", "Decibeles"]];
                    tabla[tabla.length] = [new Date(time1), 0];
                    soundCharts.crearRealTime("sonidoUltimaHora"+idFen, "pieChartsonido"+idFen, idSensor, idFen, tabla);
                }
                document.getElementById("labelSonidoTR").innerHTML = "No hay informacion del sensor "+idSensor;
                 $("#loadingHistorialSonidoTR").fadeOut();
                //
                //soundCharts.updateRealTime(id, ultimoValor);
                //soundCharts.updateChartsRT(idFen, time2, ultimoValor);
            });
        //});
    }
    
    $("#selectSensorSonido").on("change input", function (element) {
        if(actualizar===true) {
            actualizar = false;
            restartTR();
            if(cargar === false)
                updateTimeChart();
        } else
            actualizar = true;
    });
    
    /* =================================================================================
     *                          Crear Capa de Sonido
     * =================================================================================
     */
    
    function getIndicatorData(inicio, fin, idSensor, handeler, handelerError) {
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*5);
        }
        inicio = typeof inicio === "string"? inicio: Util.formatDate(inicio, "aaaa-mm-dd hh:mm:ss");
        fin = typeof fin === "string"? fin: Util.formatDate(fin, "aaaa-mm-dd hh:mm:ss");
        var inicio2 = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm:ss");
        var fin2  = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm:ss");
        console.log("inicio     "+inicio+"  utc     "+inicio2);
        console.log("fin        "+fin+"     utc     "+fin2);
        idSensor = idSensor || document.getElementById("selectSensorSonido").selectedOptions[0].value;
        var parametros = "?inicio="+inicio2+"&fin="+fin2+"&estacion="+idSensor;
        $.getJSON(baseUrl+"/sonido/lecturaIndicators"+parametros, function (data) {
            
            handeler(data);
        }).fail(function (e) {
            console.error(e);
            if(handelerError)
                handelerError(e);
        });
    }
    var nombresFen = {ld: "Dia", ln: "Noche", le: "Tarde"};
    function crearGraficaIndicadores(inicio, fin, idSensor) {
        $("#loadingIndicadores").fadeIn();
        document.getElementById("labelIndicador").innerHTML = "";
        getIndicatorData(inicio, fin, idSensor, function (leq) {
            console.log("Obteniendo datos de sonido ");
            if(leq.length === 0) {
                //alert("No se encontro informacion del Sensor "+idSensor+" Phe "+fen);
                document.getElementById("labelIndicador").innerHTML = "No se encontro informacion del Sensor "+idSensor;
                console.log("No datos sensor "+idSensor+" start "+ Util.formatDate(inicio, "aaaa/mm/dd hh:mm")+" fin "+Util.formatDate(fin, "aaaa/mm/dd hh:mm"));
                $("#loadingIndicadores").fadeOut();
                leq = [{}];
            } 
            var sFen = document.getElementById("selectorIndicador").selectedOptions[0].value;
            var tabla = [];
            var metrics = leq[0].metrics || [];
            var sensor = leq[0].pomid || idSensor;
            var fechas = [];
            var valores = [];
            var units = [], fen = [], n = metrics.length;
            for(var i=0; i<n; i++) {
                var datos = metrics[i].measurements;
                var fe = metrics[i].metric;
                var time, fecha;
                if(datos.length >0 && (fe !== "laeq10" && fe !== "laeq1h" && fe !== "lden")) {
                    valores[valores.length] = {};
                    fen[fen.length] = fe;
                    units[units.length] = metrics[i].unit;
                    for(var d=datos.length-1; d>=0; d--) {
                        var valor = parseFloat(datos[d].value);
                        time = datos[d].inicio;
                        fecha = Util.formatDateUTCToLocal(time, "mm-dd");
                        //fecha = Util.formatDate(time, "mm-dd hh:mm");
                        var nueva = true;
                        for(var f in fechas) {
                            if(fecha === fechas[f]) {
                                nueva = false;
                                break;
                            }
                        }
                        if(nueva === true)
                            fechas[fechas.length] = fecha;
                        valores[valores.length-1][fecha] = valor;
                    }
                }
            }
            //tabla = [["Fecha", "Decibeles "+fen[0],/* {role: "annotation"},*/ "Decibeles "+fen[1]/*, {role: "annotation"}*/]];
            fechas = ordenarFechas(fechas);
            if(sFen === "0") {
                var fila=["Fecha"];
                for(i=0; i<fen.length; i++) {
                    fila[fila.length] = nombresFen[fen[i]];
                    //fila[fila.length] = {role: "annotation"};
                }
                tabla = [fila];
                for(f in fechas) {
                    fecha = fechas[f];
                    fila = [fecha];
                    for(i=0; i<fen.length; i++) {
                        fila[fila.length] = valores[i][fecha];
                        //fila[fila.length] = valores[i][fecha]+" "+units[i];
                    }
                    tabla[tabla.length] = fila;
                }
            } else {
                var sId = -1;
                for(i=0; i<fen.length; i++) {
                    if(fen[i] === sFen) {
                        sId = i;
                        break;
                    }
                }
                if(sId < 0) {
                    console.log("No se encontro el Indicador seleccionado");
                    document.getElementById("labelIndicador").innerHTML = "Indicador no disponible en el rango de tiempo seleccionado";
                    tabla = [["Fecha", "Decibeles "+sFen], [Util.formatDate(inicio, "aaaa-mm-dd"), 0]];
                } else {
                    tabla = [["Fecha", nombresFen[fen[i]]]];
                    var datos = valores[sId];
                    for(fecha in datos) {
                        valor = datos[fecha];
                        tabla[tabla.length] = [fecha, valor];
                    }
                }
            }
                
            if(tabla.length <= 1) {
                tabla = [["Fecha", "Decibeles"], [Util.formatDate(inicio, "aaaa-mm-dd"), 0]];
                document.getElementById("labelIndicador").innerHTML = "Indicador no disponible en el rango de tiempo seleccionado, el rango de tiempo debe ser de almenos 24 horas";
            } else{
                console.log("Cantidad de datos "+ tabla.length);
            }
            soundCharts.updateIndicadores("chartIndicadores", tabla);
            
        }, function(e) {
            console.log("============Error al cargar datos de "+idSensor+" intentos = "+reintentar+"==============");
            console.error(e);
            if(reintentar) {
                reintentar = false;
                loadDataCharts(idSensor, inicio, fin);
            } else {
                document.getElementById("labelIndicador").innerHTML = "No se encontro informacion del Sensor "+idSensor;
                var tabla = [["Fecha", "Decibeles"]];
                tabla[1] = [inicio, 0];
                tabla[2] = [fin, 0];
                sensores.forEach(function (fen) {
                    var id = fen==="leq_a"? 0: fen==="leq_c"? 1: 2;
                    var datos={tabla: tabla,  fen: fen};
                    soundCharts.crearHistorial("chartSensorHistorial"+id, idSensor, id, datos);
                });
            }
        });
    }
    var updateIndicador=true;
    $("#selectorIndicador").on("change input", function(element) {
        if(updateIndicador === false) {
            updateIndicador = true;
            return 0;
        }
        updateIndicador = false;
        var date1 = $("#fechaSound1").val();
        var time1 = document.getElementById("timeSound1").selectedOptions[0].innerHTML;
        var date2 = date2 || $("#fechaSound2").val();
        var time2 = document.getElementById("timeSound2").selectedOptions[0].innerHTML;
        
        date1 = date1+" "+time1;
        date2 = date2+" "+time2;
        crearGraficaIndicadores(date1, date2);
    });
    
    function ordenarFechas(fechas) {
        var y, x;
        x = Date.parse(fechas[0]);
        for(var i=0; i<fechas.length; i++) {
            y = Date.parse(fechas[i]);
            if(x>y) {
                x = fechas[i-1];
                fechas[i-1] = fechas[i];
                fechas[i] = x;
                x = Date.parse(fechas[0]);
                i=0;
            }
        }
        return fechas;
    }
    /* =================================================================================
     *                          Crear TimeChart
     * =================================================================================
     */
    var timeChart, datosHistorial, actualTime;
    $("#verHistorialTime").click(function () {
        $("#pTimeChartSensoresSonido").fadeOut();
        $("#loadingTimechart").fadeIn();
        $("#pSonidoTimeslider").fadeIn();
        capaSonido.visible = false;
        capaSonidoH.visible = true;
        if(!timeChart) {
            var date1 = $("#fechaSound1").val();
            var time1 = document.getElementById("timeSound1").selectedOptions[0].innerHTML;
            var date2 = date2 || $("#fechaSound2").val();
            var time2 = document.getElementById("timeSound2").selectedOptions[0].innerHTML;
            getData(date1+" "+time1, date2+" "+time2, "all", crearTimeChart);
        } else
             updateTimeRange();
    });
    $("#cerrarHistorial").click(function () {
        $("#pSonidoTimeslider").fadeOut();
        capaSonido.visible = true;
        capaSonidoH.visible = false;
    });
    
    function crearTimeChart(data, inicio, fin) {
        datosHistorial = data;
        //inicio = Util.formatDateUTCToLocal(inicio, "aaaa-mm-dd hh:mm");
        //fin = Util.formatDateUTCToLocal(fin, "aaaa-mm-dd hh:mm");
        var timeChartOptions = {
            startTime: inicio, endTime: fin , speedUp: 100, playing: false,
            divPlay: "playtimeT", format: "hh:mm", label: "labelTimeSonido"
        };
        setDatesHistorial(inicio, fin);
        timeChart = TimeChartManager.startTimeChart("timeChart", null, timeChartOptions, actualizarHistorial);
        $("#loadingTimechart").fadeOut();
    }
    function updateTimeRange() {
        var date1 = $("#fechaSonido1").val();
        var time1 = document.getElementById("timeSonido1").selectedOptions[0].innerHTML;
        var date2 = $("#fechaSonido2").val();
        var time2 = document.getElementById("timeSonido2").selectedOptions[0].innerHTML;
        date1 = date1 + " " + time1;
        date2 = date2 + " " + time2;
        var sDate = Date.parse(date1);
        var eDate = Date.parse(date2);
        if (sDate >= eDate) {
            return 0;
        }
        getData(date1, date2, "all", function (data, inicio, fin) {
            $("#loadingTimechart").fadeOut();
            if(!timeChart) {
                crearTimeChart(data, inicio, fin);
                return 0;
            }
            datosHistorial = data;
            inicio = new Date(inicio);
            fin = new Date(fin);
            timeChart.startDate = inicio;
            timeChart.endDate = fin;
            timeChart.setCurrentTimeWithZoom(fin, inicio, fin);
            //timeChart.setCurrentTime(inicio);
        });
    }
    $("#fechaSonido1").on("change", updateTimeRange);
    $("#fechaSonido2").on("change", updateTimeRange);
    $("#timeSonido1").on("change", updateTimeRange);
    $("#timeSonido2").on("change", updateTimeRange);
    $("#selectorDecibeles").on("change", function () {
        capaSonidoH.filter = function() { return true; };
    });
    
    var last;
    function actualizarHistorial() {
        try {
            actualTime = timeChart.getCurrentTime().getTime();
            $('#labelTimeSonido').text(Util.formatDate(actualTime, "aaaa-mm-dd hh:mm"));
            if(!last) {
                last = actualTime - (1000*60*10);
            }
            var dif = actualTime - last;
            dif = dif <0? dif *(-1): dif;
            if(dif >(1000*60) ) {
                last = actualTime;
                capaSonidoH.filter = function (feature) {
                    if(!datosHistorial)
                        return true;
                    var fecha = Util.formatDate(last, "aaaa/mm/dd hh:mm");
                    if(feature.properties["Ultima Actualizacion"] === fecha)
                        return true;
                    feature.properties["Ultima Actualizacion"] = fecha;
                    
                    var id = feature.properties.Id+"", datos;
                    for(var i in datosHistorial) {
                        if(id === datosHistorial[i].pomid) {
                            datos = datosHistorial[i];
                            break;
                        }
                    }
                    if(!datos) {
                        feature.properties["Decibeles A"] = 0;
                        feature.properties["Decibeles C"] = 0;
                        feature.properties["Decibeles SPL"] = 0;
                        return true;
                    }
                    
                    var fen = document.getElementById("selectSensorSonido").selectedOptions[0].value;
                    fen = parseInt(fen);
                    var lecturas = datos.metrics;
                    var leqs = [0, 0, 0], fecha2, fechas1, fechas2;
                    fechas2 = Util.formatDate(last, "mm-dd hh:mm");
                    for(i=0; i< lecturas.length; i++) {
                        var idfen = lecturas[i].metric === "leq_a"? 0: lecturas[i].metric === "leq_c"? 1: 2;
                        var m = lecturas[i].measurements;
                        for(var j=m.length-1; j>=0; j--) {
                            //fecha = Util.formatDateUTCToLocal(m[j].lstamp, "time");
                            fecha = m[j].lstamp;
                            fechas1 = Util.formatDate(fecha, "mm-dd hh:mm");
                            /*if(j === m.length-1) {
                                if(last >= fecha) {
                                    leqs[idfen] = parseFloat(m[j].value);
                                    break;
                                }
                            } else {*/
                                //fecha2 = m[j+1].lstamp;
                                //if(last >= fecha && last < (fecha + (1000*60))) {
                                if(fechas2 === fechas1) {
                                    leqs[idfen] = parseFloat(m[j].value);
                                    break;
                                }
                            //}
                        }
                    }
                    feature.properties["Decibeles A"] = leqs[0];
                    feature.properties["Decibeles C"] = leqs[1];
                    feature.properties["Decibeles SPL"] = leqs[2];
                    return true;
                };
            }
        } catch(e) {}
    }
    function setDatesHistorial(date1, date2) {
        var sStartdate = Util.formatDate(date1, "aaaa-mm-dd");
        var date = new Date(date1);
        var sStartTime = date.getHours();
        document.getElementById("fechaSonido1").value = sStartdate;
        document.getElementById("timeSonido1").selectedIndex  = sStartTime;
        
        var sEndDate = Util.formatDate(date2, "aaaa-mm-dd");
        date = new Date(date2);
        var sEndTime = date.getHours();
        if(sEndTime+1 >= 24) {
            sEndTime = 0;
            date = date.getTime() + (1000*60*60);
            sEndDate = Util.formatDate(date, "aaaa-mm-dd");
        } else
            sEndTime ++;
        document.getElementById("fechaSonido2").value = sEndDate;
        document.getElementById("timeSonido2").selectedIndex = sEndTime;
    }
    
    return {
        createSoundLayer: createSoundLayer
    };
});
