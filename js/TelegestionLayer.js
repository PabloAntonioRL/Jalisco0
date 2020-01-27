/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["recursos/js/Shapes", "recursos/js/Util", "./TelegestionCharts",
    "./balloons/TelegestionBalloon", "./GridLayer", "./TimeChartManager"], 
function (Shapes, Util, TelegestionCharts, TelegestionBalloon, GridLayer, TimeChartManager) {
    
    var baseUrl = "https://cileon.aggme.tech/InterSect/serviciosrs/monitor/1.0";
    var telegestionLayer, gridLayer;
    var meters = ["500GUC", "501GUC", "502GUC", "503GUC", "504GUC", "505GUC"];
    function getDataLayer(layer, url, layer2, map, reference) {
        baseUrl = url;
        telegestionLayer = layer;
        telegestionLayer.balloonContentProvider = function (feature) {
            document.getElementById("labelErrorTelegestion").innerHTML = "";
            var balloon = TelegestionBalloon.getBalloon(feature);
            //document.getElementById("cEncenderApagar").checked = estado;
            //var meds=[];
            /*for(var i in meters) {
                var e = feature.properties[meters[i]];
                if(e === true || e === false) {
                    meds[meds.length] = meters[i];
                    
                    //est[est.length] = feature.properties[meters[i]];
                }
            }*/
            var est = feature.properties.Estado;
            var msg = est===true? "Apagar": "Encender";
            document.getElementById("meterId1").innerHTML = msg;
            document.getElementById("cEncenderApagar1").checked = est;
            //document.getElementById("meterId2").innerHTML = meds[1];
            //document.getElementById("cEncenderApagar2").checked = est[1];
            document.getElementById("luminariaContent").innerHTML = balloon;
            document.getElementById("labelContactador").innerHTML = "";
            document.getElementById("labelErrorTelegestion").innerHTML = "";
            $("#balloonLuminarias").fadeIn();
            return null;
        };
        //getToken(layer);
        //getData(layer);
        var fin = Date.now() +(1000*60*60*24);
        fin = new Date(fin);
        $(".datepicker").datepicker({
            minDate: new Date("2019/11/21"),
            maxDate: fin,
            dateFormat: 'yy-mm-dd'
        });
        crearCapa();
        $("#capaLucesGrid").on("change", function (element) {
            if(!gridLayer) {
                gridLayer = GridLayer.createLayer(map, layer2, reference);
                return 0;
            }
            var check = element.currentTarget.checked;
            gridLayer.visible = check;
        });
        
        $("#gridSize").on("change", function() {
            gridLayer = GridLayer.createLayer(map, layer2, reference, gridLayer);
        });
        
    }
    $("#gridHeigth").on("input", updateGrid);
    $("#selectorColor").on("change", updateGrid);
    function updateGrid() {
        if(gridLayer) 
            gridLayer.filter = function () { return true; };
    }
        
    $("#gridTransparencia").on("input", updateGrid);
    
    function crearCapa() {
        $.getJSON(baseUrl+"/telegestion/contactores", function(data) {
            var n = data.length;
            meters = [];
            var ids=[];
            for(var i=0; i<n; i++) {
                var contactor = data[i];
                var x = contactor.longitud;
                var y = contactor.latitud;
                var id = contactor.id;
                var medidores = contactor.medidores;
                var properties = {
                    Id: id,
                    Nombre: contactor.nombre,
                    "Numero de serie": contactor.serialnumber,
                    "Dirección": contactor.address,
                    Longitud: x,
                    Latitud: y,
                    Medidores: medidores,
                    Estado: false,
                    Alertas: 0
                };
                if(x > -101.80101604972198 && x < -101.37788057285069 && y > 20.864701036059994 && y < 21.339929516664647 && id !== "LEN_01") {
                    for(var j in medidores) {
                        meters[meters.length] = medidores[j].id;
                        //properties[medidores[j].id] = false;
                    }
                    var point = Shapes.createPoint(telegestionLayer.model.reference, x, y, 0, id, properties);
                    telegestionLayer.model.add(point);
                    ids[ids.length] = id;
                }
            }
            Util.setOptions("selectorContactor", ids, false);
            //Util.setOptions("selectorMedidorTelegestionTR", meters, false);
            
            crearGraficaTR();
            //startRT();
        }).fail(function(e) {
            console.error(e);
        });
        
        
    }
    
    function getBisnagas(layer) {
        telegestionLayer = layer;
        var ids = ["TLO-A02", "TLO-A04", "TLO-A06"];
        var lat = [21.094600, 21.093250, 21.091967];
        var lon = [-101.692217, -101.687433, -101.682017];
        var meter = [["500GUC", "501GUC"], ["502GUC", "503GUC"], ["504GUC", "505GUC"]], j=0;
        for(var i=0; i<ids.length; i++) {
            var properties = {
                Nombre: ids[i], Longitud: lon[i], Latitud: lat[i], Tipo: "bisnaga"
                //"Medidor 1": meter[j], "Medidor 2": meters[j+1]
            };
            var med;
            for(j in meter[i]) {
                med = meter[i][j];
                properties[med] = false;
            }
            var point = Shapes.createPoint(layer.model.reference, lon[i], lat[i], 0, ids[i], properties);
            telegestionLayer.model.add(point);
        }
    }
    /* 
     * ==========================================================================================
     *                             Creacion de graficas
     * ==========================================================================================
     */
    var reintentar = true;
    function getData(inicio, fin, id, handeler, handelerError) {
        if(!inicio && ! fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*24);
        }
        inicio = typeof inicio === "string"? inicio: Util.formatDate(inicio, "aaaa-mm-dd");
        fin = typeof fin === "string"? fin: Util.formatDate(fin, "aaaa-mm-dd");
        if(!id) {
            id = "503GUC";
            document.getElementById("selectorMedidorTelegestionTR").selectedIndex = 3;
        }
        //$.getJSON("http://165.22.155.28:8080/protecsa/instantaneous_statistics?guc="+id+"&start="+inicio+"&end="+fin, function (data) {
        $.getJSON("https://cileon.aggme.tech/InterSect/redireccion?guc="+id+"&start="+inicio+"&end="+fin+"&RedirectURL=http%3A%2F%2F165.22.155.28%3A8080%2Fprotecsa%2Finstantaneous_statistics",
        function (data) {
            handeler(data, inicio, fin);
        }).fail(function (error) {
            handelerError(error);
        });
    }
    
    function crearGraficas() {
        var fin = Date.now();
        var inicio = Util.formatDate(fin - (1000*60*60*24), "aaaa-mm-dd");
        fin = Util.formatDate(fin + (1000*60*60*24), "aaaa-mm-dd");
        getDataTR( inicio, fin, null, function (data, inicio, fin) {
            //document.getElementById("fechaTelegestion1").value = Util.formatDate(inicio, "aaaa-mm-dd");
            //document.getElementById("fechaTelegestion2").value = Util.formatDate(fin, "aaaa-mm-dd");
            setDates(inicio, fin);
            TelegestionCharts.crearGraficaHistorial("graficaTelegestionConsumo", data);
            
        }, function(error) {
            console.log("======== Error al obtener datos Telegestion ===========");
            console.error(error);
            if(reintentar === true) {
                reintentar=false;
                crearGraficas();
            }
        });
    }
    function setDates(date1, date2) {
        var sStartdate = Util.formatDate(date1, "aaaa-mm-dd");
        var date = new Date(date1);
        var sStartTime = date.getHours();
        document.getElementById("fechaTelegestion1").value = sStartdate;
        document.getElementById("timeTelegestion1").selectedIndex  = sStartTime;
        
        var sEndDate = Util.formatDate(date2, "aaaa-mm-dd");
        date = new Date(date2);
        var sEndTime = date.getHours();
        if(sEndTime+1 >= 24) {
            sEndTime = 0;
            date = date.getTime() + (1000*60*60);
            sEndDate = Util.formatDate(date, "aaaa-mm-dd");
        } else
            sEndTime ++;
        document.getElementById("fechaTelegestion2").value = sEndDate;
        document.getElementById("timeTelegestion2").selectedIndex = sEndTime;
    }
    /* 
     * ==========================================================================================
     *                             Update Rango de tiempo
     * ==========================================================================================
     */
    function updateTimeChartRange() {
            $("#loadingTelegestion0").fadeIn();
        var date1 = $("#fechaTelegestion1").val();
        var time1 = document.getElementById("timeTelegestion1").selectedOptions[0].innerHTML;
        
        var date2 = $("#fechaTelegestion2").val();
        var time2 = document.getElementById("timeTelegestion2").selectedOptions[0].innerHTML;
        
        date1 = date1+" "+time1;
        date2 = date2+" "+time2;
        //var time = Date.parse(date1 + " " + time1);
        var sDate = Date.parse(date1);
        var eDate = Date.parse(date2);
        if (sDate >= eDate) {
            console.log("Fechas Incorrectas");
            document.getElementById("labelTelegestion").innerHTML = "Rango de Fechas incorrecto, la fecha de incio debe ser menor a la de final";
            $("#loadingTelegestion0").fadeOut();
            return 0;
        }
        document.getElementById("labelTelegestion").innerHTML = "";
        
        //var id = document.getElementById("selectorMedidorTelegestionTR").selectedOptions[0].innerHTML;
        getDataTR(date1, date2, null, function (data, inicio, fin) {
            if(data.ERROR) {
                alert(data.ERROR);
                console.error(data);
                document.getElementById("labelTelegestion").innerHTML = "No se encontro informacion del Medidor seleccionado";
                data = {};
            }
            TelegestionCharts.updateHistorial(data);
            $("#loadingTelegestion0").fadeOut();
        }, function (error) {
            console.log(error);
            document.getElementById("labelTelegestion").innerHTML = "Error al conectarce con API";
            $("#loadingTelegestion0").fadeOut();
        });
    }
    $("#fechaTelegestion1").on("change", updateTimeChartRange);
    $("#fechaTelegestion2").on("change", updateTimeChartRange);
    $("#timeTelegestion1").on("change", updateTimeChartRange);
    $("#timeTelegestion2").on("change", updateTimeChartRange);
    $("#selectorParametroTelegestion").on("change", function() {
        //if(actualizar === true) {
         //   actualizar = false;
            TelegestionCharts.updateHistorial();
        //} else
        //    actualizar = true;
    });
    /* 
     * ==========================================================================================
     *                             Graficas Tiempo Real
     * ==========================================================================================
     */
    var reintentarTR=true;
    function getDataTR(inicio, fin, id, handeler, handelerError) {
        id = id || document.getElementById("selectorContactor").selectedOptions[0].innerHTML;
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60);
        }
        inicio = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm");
        fin = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm");
        var parametros = "?inicio="+inicio+"&fin="+fin+"&contactor="+id;
        //$.getJSON("http://165.22.155.28:8080/protecsa/instantaneous_statistics?guc="+id+"&start="+inicio+"&end="+fin, function (data) {
        //$.getJSON("https://cileon.aggme.tech/InterSect/redireccion?guc="+id+"&RedirectURL=http%3A%2F%2F165.22.155.28%3A8080%2Fprotecsa%2Fmeters",
        $.getJSON(baseUrl+"/telegestion/lecturaEstadoContactores"+parametros,
        function (data) {
            handeler(data, inicio, fin);
        }).fail(function (error) {
            handelerError(error);
        });
    }
    function getDataTRUlt( handeler, handelerError) {
        $.getJSON(baseUrl+"/telegestion/lecturaEstadoContactoresUlt",
        function (data) {
            handeler(data);
        }).fail(function (error) {
            handelerError(error);
        });
    }
    
    function crearGraficaTR() {
        $("#loadingTelegestionTR").fadeIn();
        getDataTR( 0, 0, null, function (data) {
            //var select = document.getElementById("selectorMedidorTelegestionTR").selectedOptions[0].innerHTML;
            /*var datosMedidor = [];
            for(var i in data) {
                var medidores = data[i].medidores;
                for(var j in medidores) {
                    var med = medidores[j].id;
                    //if(med === select) {
                        datosMedidor[datosMedidor.length] = medidores[j];
                    //}
                }
            }*/
            TelegestionCharts.crearGraficaTR("graficaTelegestionTR", data);
            startRT();
            //updateLayer(data);
        }, function(error) {
            console.log("========== Error al crear Grafica de tiempo Real Telegestion ==========");
            console.error(error);
            if(reintentar === true) {
                reintentar=false;
                crearGraficaTR();
            }
        });
    }
    
    function startRT() {
        updateRealTime();
        setInterval(function () {
            updateRealTime();
        }, 300000);
    }
    
    function updateRealTime() {
        $("#loadingTelegestionTR").fadeIn();
        getDataTRUlt(function (data) {
            var select = document.getElementById("selectorContactor").selectedOptions[0].innerHTML;
            var datos;
            for(var i in data) {
                var id = data[i].id;
                if(id === select) {
                    datos = data[i];
                }
            }
            TelegestionCharts.updateGraficaTR(datos);
            updateLayer(data);
            $("#loadingTelegestionTR").fadeOut();
        }, function(error) {
            console.error(error);
            $("#loadingTelegestionTR").fadeOut();
        });
    }
    
    function updateLayer(data) {
        telegestionLayer.filter = function(feature) {
            var id = feature.id;
            var datos;
            for(var i in data) {
                if(id === data[i].id) {
                    datos = data[i];
                    break;
                }
            }
            if(!datos) {
                feature.properties.Estado = "Desconosido";
                return true;
            }
            var lum = datos.luminosity;
            feature.properties.Luminosidad = lum;
            var estado = datos.medidores[0].statusrelay || false;
            estado = estado === "TRUE"? true: false;
            feature.properties.Estado = estado;
            var ent = datos.total_kwh_delivered;
            feature.properties.Entregado = ent+" kwh";
            var rec = datos.total_kwh_recieved;
            feature.properties.Rcivido = rec+" kwh";
            var bal = datos.total_kwh_balance;
            feature.properties.Balance = bal+" kwh";
            var con = datos.status;
            con = con === "ONLINE"? "En linea": "Sin conexion";
            feature.properties.Conexion = con;
            
            var medidores = datos.medidores;
            var nAlertas=0;
            for(var i in medidores) {
                nAlertas += medidores[i].numalarm;
            }
            feature.properties.Alertas = nAlertas;
            
            return true;
        };
    }
    
    var actualizar = true;
    var graficaHistorialCreada = false;
    $("#selectorParametroTelegestionTR").on("change", function () {
            updateRealTime();
    });
    $("#selectorContactor").on("change", function (event) {
        //event.stopPropagation();
        event.stopImmediatePropagation();
        console.log("Entrando "+actualizar);
            crearGraficaTR();
            if(graficaHistorialCreada === true)
                updateTimeChartRange();
        
    });
    $("#mostrarHistorialTelegestion").click(function () {
        if(graficaHistorialCreada === false) {
            crearGraficas();
            graficaHistorialCreada = true;
        }
    });
    $("#selectorMedidorTelegestionTR").on("change", function (event) {
        event.preventDefault();
        
            updateRealTime();
            if(graficaHistorialCreada === true)
                updateTimeChartRange();
        
    });
    
    
    
    function encenderApagar(element) {
        var estado = element.currentTarget.checked;
        var msg = estado===true? "Encender": "Apagar";
        var r = confirm("Esta por "+msg+" las luminarias, ¿Desea continuar?");
        if(r === false) {
            element.currentTarget.checked = !estado;
            return 0;
        }
        var idSelected = document.getElementById("idLuminaria").innerHTML;
        var feature = telegestionLayer.model.get(idSelected);
        if(!feature || !idSelected) {
            console.log("No id "+idSelected+" O no feature");
            return 0;
        }
        document.getElementById("labelContactador").innerHTML = "";
        document.getElementById("labelErrorTelegestion").innerHTML = "";
        //var meter = document.getElementById("meterId"+(id+1)).innerHTML;
        var datos = feature.properties.Medidores;
        var medidores=[];
        for(var m in datos) {
            medidores[m] = datos[m].id;
        }
        enviar(estado, medidores, feature, 0);
        
    }
    
    function enviar (estado, medidores, feature, nEnvio) {
        if(!medidores[nEnvio]) { 
            var msg = estado===true? "Apagar": "Encender";
            document.getElementById("meterId1").innerHTML = msg;
            feature.properties.Estado = estado;
            var balloon = TelegestionBalloon.getBalloon(feature);
            document.getElementById("luminariaContent").innerHTML = balloon;
            telegestionLayer.filter = function(feature) { return true; };
            return 0;
        }
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && (this.status === 200 || this.status === 202)) {
                try {
                    var response = JSON.parse(this.responseText);
                } catch(e) {
                    console.error(e);
                    console.log(this.responseText);
                }
                console.log(response);
                if(response.ERROR) {
                    estado = !estado;
                    document.getElementById("labelErrorTelegestion").innerHTML += "<p>Error con "+medidores[nEnvio]+" "+response.ERROR;
                } else {
                    var ms = document.getElementById("meterId1").innerHTML;
                    document.getElementById("labelContactador").innerHTML += "<p>Medidor "+medidores[nEnvio]+" "+ms+" con exito";
                }
                
                enviar (estado, medidores, feature, nEnvio+1);
            } else {
                if(this.readyState>3) {
                    document.getElementById("cEncenderApagar1").checked = !estado;
                    console.error(this.responseText);
                    document.getElementById("labelErrorTelegestion").innerHTML += "<p>Error con "+medidores[nEnvio]+" "+this.statusText+" "+this.status;
                    enviar (estado, medidores, feature, nEnvio+1);
                }
            }
        };
        xhttp.open("POST", baseUrl+"/r/telegestion/com", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send('DATA=[{"TYPE":"relay","SERIAL_NUMBER":"'+medidores[nEnvio]+'","PARAM":{"ST":'+estado+'}}]');
    }
    var actualizar = true;
    $("#cEncenderApagar1").on("change", function (element) {
            encenderApagar(element, 0) ;
    });
    var actualizar = true;
    $("#cEncenderApagar2").on("change", function (element) {
            encenderApagar(element, 1) ;
    });
    
    function getInfoMeter(meter, handeler, handelerError) {
        $.getJSON("http://165.22.155.28:8080/protecsa/meters?guc="+meter, function (data) {
            handeler(data);
        }).fail(function (e) {
            if(handelerError)
                handelerError(e.responseText, e.status);
            console.error(e);
        });
    }
    
    function checkEstadosMedidores() {
        telegestionLayer.filter = function (feature) {
            var meds=[], est = [];
            for(var i in meters) {
                var e = feature.properties[meters[i]];
                if(e === true || e === false) {
                    meds[meds.length] = meters[i];
                }
            }
            for(i in meds) {
                var meter = meds[i];
                getInfoMeter(meter, function (data) {
                    
                });
            }
        };
    }
    
    /*
     * ============================================================================================
     *                                     Alarmas
     * ============================================================================================
     */
    function getAlarmas(inicio, contactor, handeler, handelerError) {
        if(!inicio)
            inicio = Date.now() - (1000*60*60*6);
        contactor = contactor || document.getElementById("idLuminaria").innerHTML;
        inicio = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm");
        if(!contactor) {
            console.log("Ningun contactor seleccionado");
            return 0;
        }
        var parametros = "?inicio="+inicio+"&contactor="+contactor;
        $.getJSON(baseUrl+"/telegestion/lecturaAlarmas"+parametros, function (data) {
            handeler(data, inicio, contactor);
        }).fail(function (e) {
            console.error(e);
            if(handelerError)
                handelerError(e);
        });
    }
    
    function crearTablaAlarmas(inicio, contactor){
        if(!inicio) {
            var t = document.getElementById("timeTelegestion3").selectedOptions[0].innerHTML;
            var d = document.getElementById("fechaTelegestion3").value;
            inicio = d+" "+t;
        }
        $("#loadingAlertas").fadeIn();
        getAlarmas(inicio, contactor, function (data) {
            var tabla = [], fila, d;
            var n = data.length;
            var filtro = document.getElementById("filtroAlertas").selectedOptions[0].innerHTML;
            document.getElementById("LabelTablaAlertas").innerHTML = "Tabla de alertas "+(contactor|| document.getElementById("idLuminaria").innerHTML);
            tabla[0] = ["Id", "Tipo", "Icono", "Id alarma", "Fecha lectura", "Descripción", "Cosumo", "Número de Serie", "Contactor"];
            for(var i=0; i<n; i++) {
                try {
                    fila = [];
                    d = data[i];
                    var des = getIcon(d.descripcion);
                    if(filtro === "Todas" || filtro === des.nombre)
                        tabla[tabla.length] = [d.id, d.tipo, des.icon, d.idalarma, Util.formatDateUTCToLocal(d.fechalectura, "aaaa-mm-dd hh:mm"), 
                            des.nombre, d.consumption, d.serialnumber, d.contactor];
                } catch(e) {
                    console.log(e);
                }
            }
            
            Util.crearTablaDIV("tablaAlertas", tabla, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
            $("#loadingAlertas").fadeOut();
            $("#panelAlertas").fadeIn("slow");
        }, function (e) {
             $("#loadingAlertas").fadeOut();
        });
    }
    function getIcon(alarma) {
        switch(alarma) {
            default: return {nombre: alarma, icon: ""};
            case "RE-PROGRAMMING OF DATE AND TIME": return {nombre: "Re-programación de fecha y hora", 
                    icon: '<img src="data/icons/telegestion/reprogramming_datetime.png" width="30" height="30">'};
                
            case "DISCONNECT / ALARM EXCEEDED DEMAND": return {nombre: "Demanda de desconexión por exceso de alarmas", 
                    icon: '<img src="data/icons/telegestion/demand_disconnect_alarm_exced.png" width="30" height="30">'};
                
            case "POWER FAILURE": return {nombre: "Falla de energia", 
                    icon: '<img src="data/icons/telegestion/power_failure.png" width="30" height="30">'};
                
            case "RECONNECTION BY COMMAND": return {nombre: "Reconexion por comando", 
                    icon: '<img src="data/icons/telegestion/reconnection_by_command.png" width="30" height="30">'};
                
            case "REMOTE DISCONNECT": return {nombre: "Desconexión remota", 
                    icon: '<img src="data/icons/telegestion/remote_disconect.png" width="30" height="30">'};
                
            case "RE-PROGRAMMING PARAMETERS": return {nombre: "Re-programacion de parametros", 
                    icon: '<img src="data/icons/telegestion/reprograming_parameters.png" width="30" height="30">'};
                
            case "RE-PROGRAMMING OPERATION": return {nombre: "Re-programacion de operaciona", 
                    icon: '<img src="data/icons/telegestion/reprogramming_operation.png" width="30" height="30">'};
                
            case "RESTARTITN METER": return {nombre: "Reinicio de medidor", 
                    icon: '<img src="data/icons/telegestion/restarting_meter.png" width="30" height="30">'};
                
            case "RESTORATION ENERGY": return {nombre: "Restauracion de energia", 
                    icon: '<img src="data/icons/telegestion/restoration_energy.png" width="30" height="30">'};
                
            case "RETURN OF DEMAND AT NOMINAL VALUE": return {nombre: "Devolución de demanda al valor nominal", 
                    icon: '<img src="data/icons/telegestion/return_of_demand.png" width="30" height="30">'};
            
        }
    }
    
    $("#mostrarAlertas").click(function() {
        var c =  document.getElementById("idLuminaria").innerHTML;
        var inicio = Date.now() - (1000*60*60*6);
        var date = new Date(inicio);
        var sStartTime = date.getHours();
        var string =  Util.formatDate(inicio, "aaaa-mm-dd");
        inicio = Util.formatDate(inicio, "aaaa-mm-dd hh:mm");
        document.getElementById("fechaTelegestion3").value = string;
        document.getElementById("timeTelegestion3").selectedIndex  = sStartTime;
        
        crearTablaAlarmas(inicio, c);
    });
    var actualizaralertas = true;
    $("#fechaTelegestion3").on("change", function () {
        crearTablaAlarmas();
    });
    $("#timeTelegestion3").on("change", function () {
        
        crearTablaAlarmas();
    });
    $("#filtroAlertas").on("change", function () {
        
        crearTablaAlarmas();
    });
    $("#descargarTablaAlertas").click(function (element) {
        Util.exportarTablaXLS(element, "tablaAlertas");
    });
    /*
     * ============================================================================================
     *                                     Historial Grid
     * ============================================================================================
     */
    var timeChart, historialGrid, actualTime;
    $("#mostrarHistorilGrid").on("change", function (div) {
        var check = div.currentTarget.checked;
        if(check === true) {
            $("#pTimeTelegestionTimeslider").fadeIn("slow");
            if(!timeChart) {
                //cargarDatosSimulacion(null, null, null, crearTimeChart);
                crearTimeChart();
            }
        } else {
            $("#pTimeTelegestionTimeslider").fadeOut("slow");
        }
        gridLayer.vidsible = check;
        gridLayer.filter = function () { return true; };
    });
    
    function crearTimeChart(data, inicio, fin) {
        historialGrid = data;
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*4);
        }
        inicio = Util.formatDateUTCToLocal(inicio, "aaaa-mm-dd hh:mm");
        fin = Util.formatDateUTCToLocal(fin, "aaaa-mm-dd hh:mm");
        var timeChartOptions = {
            startTime: inicio, endTime: fin , speedUp: 100, playing: false,
            divPlay: "playtimeT", format: "hh:mm", label: "timeLabel"
        };
        setDatesSimulacion(inicio, fin);
        timeChart = TimeChartManager.startTimeChart("timeChart", null, timeChartOptions, actualizarSimulacion);
    }
    
    function cargarDatosSimulacion(inicio, fin, handeler, handelerError) {
        //$("#loadingNiveles").fadeIn();
        if(!inicio && !fin) {
            fin = Date.now();
            inicio = fin - (1000*60*60*4);
        }
        inicio = Util.formatDateUTC(inicio, "aaaa-mm-dd hh:mm");
        fin = Util.formatDateUTC(fin, "aaaa-mm-dd hh:mm");
        var parametros = "?inicio="+inicio+"&fin="+fin;
        //$.getJSON("data/ejemploVectores.json", function (data) {
        $.getJSON(baseUrl+"/"+parametros, function (data) {
            handeler(data, inicio, fin);
            //$("#loadingNiveles").fadeOut();
        }).fail(function (e) {
            console.error(e);
            if(handelerError)
                handelerError(e);
        });
        
    }
    var last;
    function setDatesSimulacion(date1, date2) {
        var sStartdate = Util.formatDate(date1, "aaaa-mm-dd");
        var date = new Date(date1);
        var sStartTime = date.getHours();
        document.getElementById("fechaTelegestionGrid1").value = sStartdate;
        document.getElementById("timeTelegestionGrid1").selectedIndex  = sStartTime;
        
        var sEndDate = Util.formatDate(date2, "aaaa-mm-dd");
        date = new Date(date2);
        var sEndTime = date.getHours();
        if(sEndTime+1 >= 24) {
            sEndTime = 0;
            date = date.getTime() + (1000*60*60);
            sEndDate = Util.formatDate(date, "aaaa-mm-dd");
        } else
            sEndTime ++;
        document.getElementById("fechaTelegestionGrid2").value = sEndDate;
        document.getElementById("timeTelegestionGrid2").selectedIndex = sEndTime;
    }
    
    function actualizarSimulacion() {
        try {
            actualTime = timeChart.getCurrentTime().getTime();
            $('#labelTime').text(Util.formatDate(actualTime, "aaaa-mm-dd hh:mm"));
            if(!last) {
                last = actualTime - (1000*60*10);
            }
            var dif = actualTime - last;
            dif = dif <0? dif *(-1): dif;
            if(dif > (1000*60*10)) {
                last = actualTime;
                gridLayer.filter = function (feature) {
                    if(feature.properties.fecha === last)
                        return true;
                    if(!historialGrid ) {
                        var features = feature.properties.features, f;
                        var sum=0;
                        for(var i=0; i<features.length; i++) {
                            f = features[i];
                            f.properties.powerH = Util.getRandom(0, 7);
                            sum += f.properties.powerH;
                        }
                        
                        feature.properties.powerH = sum;
                        feature.properties.fecha = last;
                        return true;
                    }
                    return true;
                };
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    return {
        crearCapa: crearCapa,
        getDataLayer: getDataLayer
    };
});
