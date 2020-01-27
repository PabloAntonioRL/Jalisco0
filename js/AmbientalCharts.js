/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var datosSensores;
define(["recursos/js/Util"], function (Util) {
    
    var graficas = [], tablaTR=[], tablaHistorial=[], nt=0;
    var graficaHistorial, graficaTR;
    var tablaDatos=[["Estacion", "Parametro", "Lectura", "Fecha"]];
    var lastTable1=[], lastTable2=[], rangoActual=[], datosParametros;
    /* 
     * ==========================================================================================
     *                             Nuevas Versiones
     * ==========================================================================================
     */
    var totales={}, mayor={}, menor={}, nDatos={};
    var promedios ={}, dia, fechas=[];
    var old = true;
    function crearTablaHistorial(tabla, selectParNom) {
        console.log("Creando tabla Sensores");
        
        var newTabla = [["Fecha", "Medias Moviles",  {role:"style"}, "Promedios Horarios"]];
        //tablas[1] = [encabezados2];
        var fecha, fecha1, fecha2, j, par;
        //var data = new google.visualization.DataTable();
        var max=0, min=100, promedio, total=0, n=0;
        
        mayor = {};
        menor = {};
        totales = {};
        nDatos = {};
        promedios ={};
        fechas=[];
        var nor = false;
        var par = obtenerParametro(selectParNom);
        par = par.alias;
        if(par ==="co_" || par ==="so2" || par ==="o3_" || par === "p10" ||par ==="p02" /*|| par==="no_"*/) {
            nor = true;
        } else
             newTabla = [["Fecha", "Lecturas", {role:"style"}]];
        //tablaDatos=[["Estacion", "Parametro", "Lectura", "Fecha", "Nodo"]];
        tablaDatos = {};
        for(var i = nor? tabla.length-1: 0; nor? i>=0: i <tabla.length; nor? i--: i++) {
            var datos = tabla[i];
            par = datos.alias;
            var nombre = datosParametros[par].nombre;
            var valor;
            if(datos.valorm)
                valor = parseFloat(datos.valorm);
            else
                valor = parseFloat(datos.valorpromhoraf || 0);
            //fecha = tabla[i].timestamp;
            //fecha = tabla[i].fechaact;
            if(datos.fechahoralect)
                fecha = datos.fechahoralect;
            else
                fecha = datos.fecha;
            if(!fecha1)
                fecha1 = fecha;
            
            var nodo = datos.tipo_nodo;
            //if(!tablaDatos[nodo]) 
              //  tablaDatos[nodo] = {};
            if(nombre === selectParNom || !selectParNom) {
                //fecha = tabla[i].timestamp;
                var date = Util.formatDateUTCToLocal(fecha, "mm-dd hh:mm");
                var valorm;
                var color = datos.color || datos.colorhora;
                if(datos.valorm) {
                     valorm = parseFloat(datos.valorm);
                 } else {
                    if(par === "so2") {
                        valorm = parseFloat(datos.prommediamov24f || 0);
                        color = datos.color24h;
                    } else {
                        if(par === "p10" || par === "p02") {
                            valorm = parseFloat(datos.prommediamov12f || 0);
                            color = datos.color12h;
                        } else {
                            valorm = parseFloat(datos.prommediamov8f || 0);
                            color = datos.color8h;
                        }
                    }
                    //valorm = parseFloat(datos.prommediamov8f || 0);
                }
                //console.log("color "+color+" Valor "+valor+" Valor "+valorm);
                
                //newTabla[newTabla.length] = [new Date(fecha), valor, valor, color];
                if(nor === true)
                    newTabla[newTabla.length] = [date, valorm, color || "rgb(0, 164, 226)", valor];
                else
                    newTabla[newTabla.length] = [date, valor, "rgb(0, 164, 226)"];
                n++;
                total += valor;
                max = valor>max? valor: max;
                min = valor<min? valor: min;
            }
            //if(!dia) {
                var f = new Date(fecha);
                dia = f.getDate();
            if(!fechas[dia])
                fechas[dia] = Util.formatDate(fecha, "aaaa/mm/dd");
            //}
            // Calcular Promedios
            if(!totales[par]) {
                totales[par] = [];
                totales[par][dia] = 0;
                nDatos[par] = [];
                nDatos[par][dia]= 0;
            } else {
                if(!totales[par][dia]){
                    totales[par][dia] = 0;
                    nDatos[par][dia] = 0;
                }
            }
            totales[par][dia] += valor;
            nDatos[par][dia] ++;
            if(!mayor[par]) {
                mayor[par] = [];
                mayor[par][dia] = valor;
                
            } else {
                if(!mayor[par][dia])
                    mayor[par][dia] = valor;
            }
            if(valor > mayor[par]) {
                mayor[par][dia] = valor;
            }
            if(!menor[par]) {
                if(menor[par] !==0) {
                    menor[par] = [];
                    menor[par][dia] = valor;
                }
            } else {
                if(!menor[par][dia]) {
                    if(menor[par][dia] !== 0)
                        menor[par][dia] = valor;
                }
            }
            if(valor < menor[par][dia])
                menor[par][dia] = valor;
            
            //tablaDatos[tablaDatos.length] = [tabla[i].estacion_id, nombre, tabla[i].valor, tabla[i].timestamp, tabla[i].tipo_nodo];
            
            /*
            if(!tablaDatos[nodo]["fecha"])
                tablaDatos[nodo]["fecha"] = [];
            var fechaAnt = tablaDatos[nodo]["fecha"][tablaDatos[nodo]["fecha"].length - 1];
            if(fechaAnt !== fecha)
                tablaDatos[nodo]["fecha"][tablaDatos[nodo]["fecha"].length] = fecha;
            if(!tablaDatos[nodo][nombre]) 
                tablaDatos[nodo][nombre] = [];
            tablaDatos[nodo][nombre][tablaDatos[nodo]["fecha"].length-1] = valor;
            */
        }
        selectParNom = selectParNom || nombre;
        var parametro = obtenerParametro(selectParNom);
        //var series = { 0:{color: parametro.color}};
        //areaOptionsHT.series = series;
        var estacion = document.getElementById("selectSensorAmbiental").selectedOptions[0].innerHTML;
        var unidad = parametro.unidad_medida;
        comboOptions.title = estacion+" - "+selectParNom;
        comboOptions.vAxis.title = "Unidad "+unidad;
        console.log(parametro);
        if(nor === true) {
            comboOptions.series[0] = { color: "gray"};
        } else {
            comboOptions.series[0] = { color: "rgb(0, 164, 226)"};
        }
        
        for(par in totales) {
            promedios[par] = [];
            for(i in totales[par]) {
                promedios[par][i] = totales[par][i] / nDatos[par][i];
                promedios[par][i] = promedios[par][i].toFixed(3);
            }
        }
        if(newTabla.length === 1) {
            console.log("No se encontro informacion");
            document.getElementById("labelAmbientalH").innerHTML = "No se encontro informacion del parametro seleccionado en este rango de tiempo";
            newTabla = [["Fecha", selectParNom], [new Date(fecha1), 0], [new Date(fecha), 0]];
        } 
        crearTablaDetalles(parametro, "tablaDetallesAmbiental");
        return newTabla;
    }
    
    function crearTablaTiempoReal(tabla) {
        var selectParNom = document.getElementById("selectorParametroTR").selectedOptions[0].innerHTML;
        var newTabla = [["Tiempo", selectParNom, {role:"style"}]];
        var color = obtenerParametro(selectParNom).color;
        for(var i in tabla) {
            var par = tabla[i].alias;
            var datos = datosParametros[par];
            var nombre = datos.nombre;
            
            if(nombre === selectParNom) {
                var color = tabla[i].color;
                var fecha = Util.formatDateUTCToLocal(tabla[i].fechahoralect, "mm-dd hh:mm");
                //var fecha = new Date(tabla[i].timestamp);
                var valor = parseFloat(tabla[i].valorm);
                valor = valor || 0;
                newTabla[newTabla.length] = [fecha, valor, color ||  "rgb(0, 164, 226)"];
            }
        }
        if(newTabla.length === 1) {
            newTabla[1] = [Util.formatDate(null, "mm-dd hh:mm"), 0, "rgb(0, 164, 226)"];
            document.getElementById("labelAmbientalTR").innerHTML = "Útilma actualización:";
            return newTabla;
        }
        //fecha = Util.formatDate(fecha, "mm/dd hh:mm");
        document.getElementById("labelAmbientalTR").innerHTML = "Útilma actualización: "+fecha;
        var series = { 0: { color: "rgb(0, 164, 226)" } };
        columnsOptions.series = series;
        columnsOptions.title = selectParNom;
        columnsOptions.vAxis.title = "Unidad "+datos.unidad_medida;
        comboOptionsTR.title = selectParNom;
        comboOptionsTR.vAxis.title = "Unidad "+datos.unidad_medida;
        if(newTabla.length >=121) {
            newTabla = correrInformacion(newTabla);
        }
        
        return newTabla;
    }
    function correrInformacion(tabla) {
        var x=[tabla[0]];
        for(var i=1; i<tabla.length-1; i++) {
            x[x.length] = tabla[i+1];
        }
        return x;
    }
    /* 
     * ==========================================================================================
     *                              Preparacion y creacion de graficas
     * ==========================================================================================
     */
    function setDatosParametros(datosP) {
        datosParametros = datosP.datos;
    }
    function crearGraficaHistorial(tabla, div) {
        var selectParNom = document.getElementById("selectorParametroH").selectedOptions[0].innerHTML;
        var tablas = crearTablaHistorial(tabla, selectParNom);
        tablaHistorial = tabla;
        
        console.log(tablas.length+" Numero de Datos en tabla");
        if(tablas.length > 300) {
            comboOptions.seriesType = "area";
            comboOptions.series[1].pointSize = 1;
        } else {
            comboOptions.seriesType = "bars";
            comboOptions.series[1].pointSize = 5;
        }
        ComboChart(div, tablas, comboOptions);
    }
    function crearGraficaTiempoReal(tabla, divTR) {
        
        //var tablas = crearTablaHistorial(tabla);
        //ComboChart(divTR, tablas, comboOptionsTR, true);
        var tabla = crearTablaTiempoReal(tabla);
        ColumnChart(divTR, tabla, columnsOptions);
        tablaTR = tabla;
    }
    /* 
     * ==========================================================================================
     *                              Actualizar Graficas de barras
     * ==========================================================================================
     */
    function updateChartRT(tabla, date, realTime, parametroId) {
        var selectParNom = document.getElementById("selectorParametroTR").selectedOptions[0].innerHTML;
        //var tablas = crearTablaHistorial(tabla, selectParNom);
        var tablas = crearTablaTiempoReal(tabla, selectParNom);
        if(tablas.length === 1) {
            console.log("No se encontro informacion");
        } else {
            updateChart(graficaTR, new google.visualization.arrayToDataTable(tablas), columnsOptions);
            //updateChart(graficaTR, new google.visualization.arrayToDataTable(tablas), comboOptions);
            tablaTR = tablas;
        }
    }
    
    function updateChart(grafica, data, options) {
        if(!data || data.length <=1) 
            console.log("no Data");
        else {
            //if(typeof data !== "object")
               // data = new google.visualization.arrayToDataTable(data);
            if(grafica)
                grafica.draw(data, options);
            else 
                console.log("Grafica Ambiental no actualizada");
        }
    }
      
    /* 
     * ==========================================================================================
     *                              Actualizar Graficas historicas
     * ==========================================================================================
     */
    function updateHistorico(tabla, parametro, startDate, endDate) {
        document.getElementById("labelAmbientalH").innerHTML = "";
        var selectParNom = document.getElementById("selectorParametroH").selectedOptions[0].innerHTML;
        tabla = tabla || tablaHistorial;
        var newTable = crearTablaHistorial(tabla, selectParNom);
        tablaHistorial = tabla;
        
        console.log(newTable.length+" Numero de Datos en tabla");
        if(newTable.length > 300) {
            comboOptions.seriesType = "area";
            comboOptions.series[1].pointSize = 1;
        } else {
            comboOptions.seriesType = "bars";
            comboOptions.series[1].pointSize = 5;
        }
        if(!graficaHistorial) 
            ComboChart("graficaAmbientalH", newTable, comboOptions);
        updateChart(graficaHistorial, new google.visualization.arrayToDataTable(newTable), comboOptions);
        //updateChart(graficaHistorial, newTable, areaOptionsHT);
        if(Util.endTimer)
            Util.endTimer("GraficaAmbientalHistorial");
    }
    /* 
     * ==========================================================================================
     *                              Actualizar grafica comparativa
     * ==========================================================================================
     */
    function updateTablaComparativa( parametro, tablaId) {
        var tabla = datosSensores[tablaId];
        if(tabla.length===1)
            return 0;
        if(!parametro) {
            updateChart(graficas[tablaId], tabla, columnsOptions);
            return 0;
        }
        var newTable =[["Parametro", "valor", {type: 'string', role: 'annotation'}, {role:"style"}, "Promedio"]];
        try {
        for(var i=1; i<tabla.length; i++) {
            if(parametro === tabla[i][0]) {
                newTable [1] = tabla[i];
            }
        }
        if(newTable.length===1) {
            newTable = tabla;
        }
        updateChart(graficas[tablaId], newTable, columnsOptions);
        } catch(e) {
             console.error(e);
        }
    }
    
    function obtenerParametro(idONombre) {
        var buscar;
        if(typeof idONombre === "string") {
            buscar = "nombre";
        } else {
            buscar = "id";
        }
        for(var par in datosParametros) {
            var dato = datosParametros[par][buscar];
            if(idONombre === dato) {
                return datosParametros[par];
            }
        }
        return null;
    }
    /* 
     * ==========================================================================================
     *                             Creacion de graficas
     * ==========================================================================================
     */
    var left = $("#panelIzquierdo");
    var leftWidth = left.innerWidth() - 50;
    leftWidth = leftWidth<300? 300: leftWidth;
    console.log("Grafica Tiempo Real width "+leftWidth);
    const columnsOptions = { title : "Tiempo Real", width: leftWidth, height: 280, //orientation: "vertical",
                backgroundColor:{ fill: "#17202a" },
                legend: { position: "none", position: "none" },
                titleTextStyle: { color: '#FFFFFF', frontSize: 30 },
                chartArea: {  backgroundColor: "#17202a" },
                annotations: { textStyle: { fontSize: 12, color: '#FFFFFF', auraColor: 'none' } },
                axisTitlesPosition: "out",
                hAxis: {  logScale: false, slantedText: false, format: 'short',
                    title: "Fecha",
                    textStyle: { color: '#95a5a6', frontSize: 10 },
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                vAxis: { direction: 1, textStyle: { color: '#95a5a6' },
                    title: "Unidades",
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                seriesType: 'bars'
                    //series: { 1: {type: 'line'} }
                };
    function ColumnChart(div, datos, chartOptions) {
        try{
            google.charts.load('current', {packages: ['corechart', 'bar']});
            return google.charts.setOnLoadCallback(drawColumnChart);
            
        }catch(e){
            console.log("Error al crear Grafica de columna\n");
            console.log(e);
        }
        function drawColumnChart() {
            //graficas[id] = new google.visualization.ColumnChart(document.getElementById(div));
            
            graficaTR = new google.visualization.ComboChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(datos);
            graficaTR.draw(datosNuevos, chartOptions);
        }
    }
    var panelWidth = $("#pTimeChartSensores").innerWidth() - 20;
    panelWidth = panelWidth<500? 500: panelWidth;
    console.log("Grafica Historial width "+(panelWidth));
    var series={0: {type: 'bars'}};
    const areaOptionsHT = { title: "Historico", width: panelWidth, height: 340,
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
    const comboOptions = { title : "Historial", width: panelWidth, height: 280, //orientation: "vertical",
                backgroundColor:{ fill: "#17202a" },
                //pointSize: 5,
                legend: { position: "bottom", textStyle: { color: '#95a5a6'} },
                titleTextStyle: { color: '#FFFFFF', frontSize: 30 },
                chartArea: {  backgroundColor: "#17202a" },
                annotations: { textStyle: { fontSize: 12, color: '#FFFFFF', auraColor: 'none' } },
                axisTitlesPosition: "out",
                animation:{ duration: 1000, easing: 'linear' },
                hAxis: {  logScale: false, slantedText: false, format: 'short',
                    title: "Fecha",
                    textStyle: { color: '#95a5a6', frontSize: 10 },
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                vAxis: { direction: 1, textStyle: { color: '#95a5a6' },
                    title: "Unidades",
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                seriesType: 'bars',
                series: { 1: {type: 'line', color: "white", pointSize: 5},
                    0: {color: "rgb(0, 164, 226)"}}
                };
    const comboOptionsTR = { title : "Tiempo Real", width: leftWidth, height: 280, //orientation: "vertical",
                backgroundColor:{ fill: "#17202a" },
                pointSize: 5,
                legend: { position: "bottom", textStyle: { color: '#95a5a6'} },
                titleTextStyle: { color: '#FFFFFF', frontSize: 30 },
                chartArea: {  backgroundColor: "#17202a" },
                annotations: { textStyle: { fontSize: 12, color: '#FFFFFF', auraColor: 'none' } },
                axisTitlesPosition: "out",
                hAxis: {  logScale: false, slantedText: false, format: 'short',
                    title: "Fecha",
                    textStyle: { color: '#95a5a6', frontSize: 10 },
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                vAxis: { direction: 1, textStyle: { color: '#95a5a6' },
                    title: "Unidades",
                    titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                seriesType: 'bars',
                series: { 0: {type: 'line', color: "white"},
                    1: {color: "rgb(0, 164, 226)"}}
                };
    function ComboChart(div, datos, options, tr){
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawAreaChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawAreaChart() {
            //graficaHistorial = new google.visualization.AreaChart(document.getElementById(div));
            if(tr === true) {
                graficaTR = new google.visualization.ComboChart(document.getElementById(div));
                var datosNuevos = new google.visualization.arrayToDataTable(datos);
                graficaTR.draw(datosNuevos, options);
            } else {
                graficaHistorial = new google.visualization.ComboChart(document.getElementById(div));
                var datosNuevos;
                    datos = new google.visualization.arrayToDataTable(datos);
                graficaHistorial.draw(datos, options);
                //$("#pTimeChartSensores").fadeOut("slow");
                if(Util.endTimer)
                    Util.endTimer("GraficasAmbientalHistorial");
            }
        }
    }
    function AreaChart(div, datos, options){
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawAreaChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawAreaChart() {
            graficaHistorial = new google.visualization.AreaChart(document.getElementById(div));
            //graficas[id] = new google.visualization.ComboChart(document.getElementById(div));
            var datosNuevos;
            //if(typeof datos !== "object")
                datos = new google.visualization.arrayToDataTable(datos);
            //else
            //    datosNuevos = datos;
            graficaHistorial.draw(datos, options);
            $("#pTimeChartSensores").fadeOut("slow");
            if(Util.endTimer)
                Util.endTimer("GraficasAmbientalHistorial");
        }
    }
    /* 
     * ==========================================================================================
     *                              Funciones de ayuda
     * ==========================================================================================
     */
    function clone( obj ) {
        if ( obj === null ) {
            return obj;
        }
        var temp;
        if( typeof obj  === 'object') {
            temp = obj.constructor();
            for ( var key in obj ) {
                temp[ key ] = clone( obj[ key ] );
            }
        }
        if(typeof obj === "array") {
            temp = [];
            for ( var key in obj ) {
                temp[ key ] = clone( obj[ key ] );
            }
        }
        return  temp || obj;
    }
    
    function crearTablaDetalles(selectPar, divTabla) {
        var tabla=[["Fecha","Parametro", "Promedio", "Cantidad", "Mayor lectura", "Menor lectura"]];
        if(!selectPar) {
            for(var par in totales) {
                var nombre = datosParametros[par].nombre;
                for(var i in totales[par])
                    tabla[tabla.length] = [fechas[i], nombre, promedios[par][i], nDatos[par][i], mayor[par][i], menor[par][i]];
            }
        } else  {
            var par = selectPar.alias;
             for(var i in totales[par])
                tabla[tabla.length] = [fechas[i], selectPar.nombre, promedios[par][i], nDatos[par][i], mayor[par][i], menor[par][i]];
        }
        
        //Util.crearTablaDIV(divTabla, tabla);
    }
    
    
     /*
     * ========================================================================
     *                      Listener
     * ========================================================================
     */
    $("#ballonChartAmbiental").click(function () {
        $("#ballonnChartAmbiental").fadeIn("slow");
        var width = $("#ballonnChartAmbiental").innerWidth() - 20;
        columnsOptions.width = width;
        document.getElementById("graficaAmbientalTR").innerHTML = "";
        ColumnChart("chartBAmbiental", tablaTR, columnsOptions);
    });
    $("#cerrarBalloonChartAmbiental").click(function () {
        $("#ballonnChartAmbiental").fadeOut("slow");
        $("#panelIzquierdo").fadeIn();
        $("#LPAmbiental").fadeIn();
        columnsOptions.width = leftWidth;
        document.getElementById("chartBAmbiental").innerHTML = "";
        ColumnChart("graficaAmbientalTR", tablaTR, columnsOptions);
    });
    
    $("#pTimeChartSensores").resize(function (event) {
        panelWidth = event.currentTarget.clientWidth - 20;
        if(comboOptions.width !== panelWidth) {
            comboOptions.width = panelWidth;
            var data = graficaHistorial.J;
            graficaHistorial.draw(data, comboOptions);
        }
    });
    $("#ballonnChartAmbiental").resize(function (event) {
        panelWidth = event.currentTarget.clientWidth - 20;
        if(columnsOptions.width !== panelWidth) {
            columnsOptions.width = panelWidth;
            var data = graficaTR.J;
            graficaTR.draw(data, columnsOptions);
        }
    });
    
    function getHistorialPng() {
        return '<img src="' + graficaHistorial.getImageURI() + '">';
    }
    
    return {
        crearGraficaHistorial: crearGraficaHistorial,
        crearGraficaTiempoReal: crearGraficaTiempoReal,
        updateChartRT: updateChartRT,
        updateHistorico: updateHistorico,
        updateTablaComparativa: updateTablaComparativa,
        crearTablaHistorial: crearTablaHistorial,
        setDatosParametros: setDatosParametros,
        getHistorialPng: getHistorialPng
    };
});

function getActualDataForSensors() {
    return datosSensores;
}
