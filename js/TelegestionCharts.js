/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["recursos/js/Util"], function (Util) {
    
    var datosHistorial = [];
    var tablaHistorial = [];
    var graficaHistorial;
    var colores = ["blue","#fa3434","orange","green","purple","#34b8fa","pink","#94ff79","#cb3f0b","#404ca0", "fcf100"];
    var useTime=true;
    
    function crearGraficaHistorial(div, data){
        datosHistorial = data;
        tablaHistorial = crearTablaHistorial(data);
        var par = document.getElementById("selectorParametroTelegestion").selectedOptions[0].innerHTML;
        areaOptions.title = par;
        var unidad = getUnidad(par);
        areaOptions.vAxis.title = "Unidad "+unidad;
        crearGraficaArea(div, tablaHistorial, areaOptions);
    }
    function crearTablaHistorial(datos) {
        var tabla=[];
        var medidores = datos[0].medidores;
        var nom = [], i=0;
        do {
            nom=[];
            medidores = datos[i].medidores;
            for(var i in medidores) {
                nom[nom.length] = medidores[i].id;
            }
            i++;
        } while(!nom[0] && !nom[1] || i >= datos.length);
        tablaHistorial = [];
        var par = parseInt(document.getElementById("selectorParametroTelegestion").selectedOptions[0].value);
        //for(i=0; i<parametros.length; i++) {
        tabla = [["fecha", nom[0], nom[1]]];
        par = parametros[par];
        if(par === "activepower") 
            tabla= [["fecha", nom[0], nom[1], "Potencia Teorica"]];
        
            for(var j=0; j<datos.length; j++) {
                medidores = datos[j].medidores;
                var fecha = medidores[0].datemeter;
                if(fecha) {
                    fecha = Util.formatDateUTCToLocal(fecha, "aaaa-mm-dd hh:mm");
                    if(useTime === true) 
                        fecha = new Date(fecha);
                    if(par === "activepower")
                        tabla[tabla.length] = [fecha, medidores[0][par], medidores[1][par], medidores[0]["theoreticalpower"]];
                    else
                        tabla[tabla.length] = [fecha, medidores[0][par], medidores[1][par]];
                }
            }
        console.log(tabla);
         return ordenarFechas(tabla);
         //return tabla;
        //}
    }
    
    function crearTablaTR(datos) {
        var fecha;
        if(datos.length===0) {
            fecha = Util.formatDate(null, "mm-dd hh:mm");
            for(i=0; i<parametros.length; i++) {
                tablasTR[i] = [["fecha", "", ""], [fecha, 0, 0]];
            }
            return fecha;
        }
        var tabla=[];
        var medidores = datos[0].medidores;
        var nom = [];
        for(var i in medidores) {
            nom[nom.length] = medidores[i].id;
        }
        tablasTR = [];
        var par;
        for(i=0; i<parametros.length; i++) {
            tabla = [["fecha", nom[0], nom[1]]];
            par = parametros[i];
            for(var j=0; j<datos.length; j++) {
                medidores = datos[j].medidores;
                if(medidores) {
                    fecha = Util.formatDateUTCToLocal(medidores[0].datemeter, "mm-dd hh:mm");
                    tabla[tabla.length] = [fecha, medidores[0][par], medidores[1][par]];
                }
            }
            if(tabla.length ===1){
                tabla[1] = [Util.formatDate(null, "mm-dd hh:mm"), 0];
            }
            tablasTR[i] = tabla;
        }
        return fecha;
    }
    function ordenarFechas(tabla) {
        var y, x;
        x = Date.parse(tabla[1][0]);
        for(var i=2; i<tabla.length; i++) {
            y = Date.parse(tabla[i][0]);
            if(x>y) {
                x = tabla[i-1];
                tabla[i-1] = tabla[i];
                tabla[i] = x;
                x = Date.parse(tabla[1][0]);
                i=1;
            }
            x = y;
        }
        return tabla;
    }
    
    function crearTablaHistorialOld(data) {
        var parId = document.getElementById("selectorParametroTelegestion").selectedOptions[0].value;
        var par = getParametro(parId);
        var parE = document.getElementById("selectorParametroTelegestion").selectedOptions[0].innerHTML;
        var tabla=[["Fecha", parE]];
        try {
            for(var i in data) {
                tabla[tabla.length] = [new Date(data[i].TIMESTAMP), data[i][par] || 0];
            }
        } catch(e) {
            
        }
        var color = colores[parseInt(parId)];
        var series = {0: {color: color}};
        areaOptions.series = series;
        if(tabla.length === 1) {
            tabla[1]= [new Date($("#fechaTelegestion1").val()), 0];
            tabla[2]= [new Date($("#fechaTelegestion2").val()), 0];
        }
        return tabla;
    }
    
    function getParametro(par) {
        switch(par) {
            case "0": return "ACTIVE_POWER";
            case "1": return "APPARENT_POWER";
            case "2": return "CURRENT";
            case "3": return "FREQUENCY";
            case "4": return "POWER_FACTOR";
            case "5": return "REACTIVE_POWER";
            case "6": return "VOLTAGE";
        }
    }
    function updateHistorial(data) {
         if(!data)
             data = datosHistorial;
         else
             datosHistorial = data;
         tablaHistorial = crearTablaHistorial(data);
         var par = document.getElementById("selectorParametroTelegestion").selectedOptions[0].innerHTML;
        areaOptions.title = par;
        var unidad = getUnidad(par);
        areaOptions.vAxis.title = "Unidad "+unidad;
         var datos = new google.visualization.arrayToDataTable(tablaHistorial);
         graficaHistorial.draw(datos, areaOptions);
    }
    /*
     * =======================================================================================
     *                                  Graficas Tiempo Real
     * =======================================================================================
     */
    var tablasTR=[], datosTR, graficaTR;
    var parametros = ["ippi_activefactor", "ippi_aparentfactor","ippi_current","ippi_frecuency","ippi_powerfactor","ippi_reactivefactor","ippi_voltage", "activepower"];
    function crearGraficaTR(div, data) {
        
        datosTR = data;
        var last = crearTablaTR(data);
        var par = parseInt(document.getElementById("selectorParametroTelegestion").selectedOptions[0].value);
        var parE = document.getElementById("selectorParametroTelegestion").selectedOptions[0].innerHTML;
        var med = document.getElementById("selectorContactor").selectedOptions[0].innerHTML;
        var color = colores[par];
        //var series = {0: {color: color}};
        //areaOptionsTR.series = series;
        areaOptionsTR.title = parE;
        var unidad = getUnidad(parE);
        areaOptionsTR.vAxis.title = "Unidad "+unidad;
        document.getElementById("labelActualesParametros").innerHTML = parE+"<p>Ultima Actualización: "+last;
        if(!graficaTR) 
            crearGraficaAreaTR(div, tablasTR[par], areaOptionsTR);
        else {
            var googleTable = new google.visualization.arrayToDataTable(tablasTR[par]);
            graficaTR.draw(googleTable, areaOptionsTR);
        }
    }
    
    function updateTablaTR(datos) {
        try {
            var medidores = datos.medidores;
            //for(var j=0; j<datos.length; j++) {
              //  var m = datos[j].id;
                var fecha = Util.formatDateUTCToLocal(medidores[0].datemeter, "mm-dd hh:mm");
                for(var i=0; i<parametros.length; i++) {
                    if(tablasTR[i][tablasTR[i].length]) {
                        tablasTR[i][tablasTR[i].length] = correrInformacion(tablasTR[i][tablasTR[i].length]);
                        tablasTR[i][tablasTR[i].length-1] = [fecha, medidores[0][parametros[i]], medidores[1][parametros[i]]];
                    } else {
                        tablasTR[i][tablasTR[i].length] = [fecha, medidores[0][parametros[i]], medidores[1][parametros[i]]];

                    }
                }
           // }
            /*var datos = data.METERS[0].INSTANTANEOUS_PHASES.PHASE_I;
            var fecha = data.METERS[0].INFO_METER.TIMESTAMP;
            for(var i=0; i<parametros.length; i++) {
                if(tablasTR[i][tablasTR[i].length]) {
                    tablasTR[i][tablasTR[i].length] = correrInformacion(tablasTR[i][tablasTR[i].length]);
                    tablasTR[i][tablasTR[i].length-1] = [fecha, datos[parametros[i]]];
                } else
                    tablasTR[i][tablasTR[i].length] = [fecha, datos[parametros[i]]];
            }*/
        } catch(e) {
            console.error(e);
        }
        return fecha;
    }
    function correrInformacion(tabla) {
        var x;
        for(var i=1; i<tabla.length-1; i++) {
            tabla[i] = tabla[i+1];
        }
        return tabla;
    }
    
    function getUnidad(par) {
        var unidad="";
        switch(par) {
            case "Factor Activo":
            case "Poder activo": 
            case "Potencia Relativa":
            case "Potencia Aparente":
            case "Potencia Relativa": unidad = "kW"; break;
            case "Voltaje": unidad = "V"; break;
            case "Frecuencia": unidad = "Hz"; break;
            case "Corriente": unidad = "A"; break;
        }
        return unidad;
    }
    function updateGraficaTR(data) {
        var last;
        if(!data) {
            data = datosTR;
            last = datosTR[datosTR.length-1][0];
        } else {
            datosTR = data;
            last = updateTablaTR(data);
        }
        
        var par = parseInt(document.getElementById("selectorParametroTelegestionTR").selectedOptions[0].value);
        var color = colores[par];
        var parE = document.getElementById("selectorParametroTelegestionTR").selectedOptions[0].innerHTML;
        //var series = {0: {color: color}};
        //areaOptionsTR.series = series;
        areaOptionsTR.title = parE;
        var unidad = getUnidad(parE);
        areaOptionsTR.vAxis.title = "Unidad "+unidad;
        document.getElementById("labelActualesParametros").innerHTML = parE+"<p>Ultima Actualización: "+last;
        try {
            var datosNuevos = new google.visualization.arrayToDataTable(tablasTR[par]);
            graficaTR.draw(datosNuevos, areaOptionsTR);
        }catch(e) {
            //console.error(e);
        }
    }
    
    var left = $("#panelIzquierdo").innerWidth()-20;
    console.log("Grafica TR Telegestion width "+(left));
    const areaOptionsTR = { title: "", width: left, height: 340,
                backgroundColor:{ fill: "#17202a" },
                pointSize: 5,
                legend: { position: "bottom", textStyle: {color: '#FFFFFF'} },
                chartArea: {  backgroundColor: "#17202a" },
                titleTextStyle: { color: '#FFFFFF', frontSize: 20 },
                animation:{ duration: 1000, easing: 'linear' },
                hAxis: { 
                    //logScale: true, slantedText: false, format: 'short',
                  textStyle: { color: '#f0f0f0', frontSize: 8 },
                  titleTextStyle: { color: '#FFFFFF', frontSize: 16 }
                },
                vAxis: {  textStyle: { color: '#FFFFFF' },
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }}
            };
    function crearGraficaAreaTR(div, tablaDatos, options) {
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawAreaChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawAreaChart() {
            graficaTR = new google.visualization.AreaChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(tablaDatos);
            
            graficaTR.draw(datosNuevos, options);
            $("#loadingTelegestionTR").fadeOut();
        }
    }
    
    var panelWidth = $("#pTimeChartTelegestion").innerWidth()-20;
    console.log("Grafica Historial Telegestion width "+(panelWidth));
    //var series={0: {type: 'bars'}};
    const areaOptions ={ title: "Historico", width: panelWidth, height: 340,
                backgroundColor:{ fill: "#17202a" },
                pointSize: 5,
                legend: { position: "bottom", textStyle: {color: '#FFFFFF'} },
                chartArea: {  backgroundColor: "#17202a" },
                titleTextStyle: { color: '#FFFFFF', frontSize: 20 },
                animation:{ duration: 1000, easing: 'linear' },
                hAxis: { 
                  title: "Fecha",
                  textStyle: { color: '#95a5a6', frontSize: 8 },
                  titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                vAxis: { 
                    title: "Lectura",
                    textStyle: { color: '#95a5a6' },
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                }
            };
    function crearGraficaArea(div, tablaDatos, options) {
        //var datos = createChartTable(tablaDatos);
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawAreaChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawAreaChart() {
            graficaHistorial = new google.visualization.AreaChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(tablaDatos);
            
            graficaHistorial.draw(datosNuevos, options);
            $("#loadingTelegestion0").fadeOut();
            //$("#pTimeChartTelegestion").fadeOut();
        }
    }
    
    $("#verTablasTelegestion").click(function () {
        document.getElementById("LabelTabla1").innerHTML = "Datos de Telegestión";
        var tabla=[tablaHistorial[0]];
        for(var i=1; i<tablaHistorial.length; i++) {
            tablaHistorial[i][0] = Util.formatDate(tablaHistorial[i][0], "aaaa-mm-dd hh:mm"); 
            //tabla[i] = [Util.formatDate(tablaHistorial[i][0], "aaaa-mm-dd hh:mm"), tablaHistorial[i][1]];
        }
        var tablaCreada = Util.crearTablaDIV("tablaCompleta1", tablaHistorial, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
        var png = '<img src="' + graficaHistorial.getImageURI() + '">';
        document.getElementById("graficaImagenTele").innerHTML = png;
        $("#panelTablas").fadeIn("slow");
    });
    /*
     * ========================================================================
     *                      Listener
     * ========================================================================
     */
    $("#ballonChartTelegestion").click(function () {
        $("#ballonnChartTelegestion").fadeIn("slow");
        var width = $("#ballonnChartTelegestion").innerWidth() - 20;
        areaOptionsTR.width = width;
        document.getElementById("graficaTelegestionTR").innerHTML = "";
        var par = parseInt(document.getElementById("selectorParametroTelegestion").selectedOptions[0].value);
        crearGraficaAreaTR("chartBTelegestion", tablasTR[par], areaOptionsTR);
    });
    $("#cerrarBalloonChartTelegestion").click(function () {
        $("#ballonnChartTelegestion").fadeOut("slow");
        $("#panelIzquierdo").fadeIn();
        $("#LPTelegestion").fadeIn();
        var width = $("#ballonnChartTelegestion").innerWidth() - 20;
        areaOptionsTR.width = left;
        document.getElementById("chartBTelegestion").innerHTML = "";
        var par = parseInt(document.getElementById("selectorParametroTelegestion").selectedOptions[0].value);
        crearGraficaAreaTR("graficaTelegestionTR", tablasTR[par], areaOptionsTR);
    });
    $("#ballonnChartTelegestion").resize(function (event) {
        panelWidth = event.currentTarget.clientWidth - 20;
        if(areaOptionsTR.width !== panelWidth) {
            areaOptionsTR.width = panelWidth;
            var data = graficaTR.J;
            graficaTR.draw(data, areaOptionsTR);
        }
    });
    
    $("#pTimeChartTelegestion").resize(function (event) {
        panelWidth = event.currentTarget.clientWidth - 20;
        if(areaOptions.width !== panelWidth) {
            areaOptions.width = panelWidth;
            var data = graficaHistorial.J;
            graficaHistorial.draw(data, areaOptions);
        }
    });
    
    return {
        crearGraficaHistorial: crearGraficaHistorial,
        updateHistorial: updateHistorial,
        crearGraficaTR: crearGraficaTR,
        updateGraficaTR: updateGraficaTR
        
    };
});
