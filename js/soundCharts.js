/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var datosActualesSonido =[];
define(["recursos/js/Util"], function(Util) {
    
    var graficasPie =[], historial = [], nd=0;
    var gHistorial = [], ids=[], divLabels=[];
    var gRealTime=[], historialRT={};
    var gComparativa, tablaIndicadores=[];
    
    var tablasDatos={}, selected=0;
    //var max = [], names=[], colores = ["blue","red","green"];
    function crearHistorial( divHistorial, idSensor, idFen, datos) {
        //tablasDatos[id] = aumentarDatos(datos.tabla);
        if(!historial[idFen])
            historial[idFen] = datos.tabla;
        if(!tablasDatos[idSensor])
            tablasDatos[idSensor] = [];
        //tablasDatos[idSensor][idFen] = datos.tabla;
        //max[idFen] = datos.mayor || 0;
        //names[idSensor] = datos.name;
        updateHistorial(idSensor, idFen, datos.fen, divHistorial, datos.tabla);
        
        ids[nd] = idFen;
        nd++;
        
        /*
        divLabels[idFen] = divLabel;
        var data = getPieData(idFen, divLabel, datos.fecha2);
        PieChart(div, data, idFen, getOptions(data[2][1]));
        crearRealTime(divRT, idSensor, idFen, datos.tabla);*/
    }
    
    function updateHistorial(sensor, id, nombre, divHistorial, tabla) {
        if(!sensor) {
            if(sensor !== 0) {
                sensor = document.getElementById("selectSensorSonido").selectedOptions[0].value;
            }
        }
        try {
           // var tabla = tablasDatos[sensor][id];
           //var tabla = historial
        }catch(e) {
            console.log("No se encontro la tabla para el sensor de sonido "+sensor+" id "+id);
            return 0;
        }
        //time1 = typeof time1==="string"? Date.parse(time1): time1;
        //time2 = typeof time2==="string"? Date.parse(time2): time2;
        //var newTable = [["historial", nombre || ""+id]];
        /*var data = new google.visualization.DataTable();
        data.addColumn('datetime', 'Fecha');
        data.addColumn('number', nombre || ""+id);*/
        /*var valor, fecha;
        for(var i=1; i<tabla.length; i++) {
            //var time = tabla[i][4];
            //if(time>=time1 && time<time2) {
                valor = tabla[i][1];
                fecha = tabla[i][3];
                newTable[newTable.length] = [new Date(fecha), valor];
            //data.addRow([new Date(fecha), valor]);
            //}
        }*/
        historial[id] = tabla || [];
        if(historial[id].length===1) {
            historial[id][1] = [new Date(Date.now() - 1000*60*60), 0];
            historial[id][2] = [new Date(), 0];
        }
        if(gHistorial[id]) {
            var series;
                switch(id) {
                    case 0: series = {0: {color: "blue"}}; break;
                    case 1: series = {0: {color: "red"}}; break;
                    case 2: series = {0: {color: "green"}}; break;
                }
                areaOptions.series = series;
            if(historial[id].length > 300) {
                areaOptions.pointSize = 2;
            } else
                areaOptions.pointSize = 5;
            var hi = new google.visualization.arrayToDataTable(historial[id]);
            gHistorial[id].draw(hi, areaOptions);
            if(Util.endTimer)
                Util.endTimer("Sonido"+nombre);
        } else {
            AreaChart(divHistorial,  historial[id], id);
        }
    }
    /* ====================================================================================
     *                  Crear Graficas Tiempo Real
     * =======================================================================================
     */
    function crearRealTime(divRT, divPie, idSensor, idFen, tabla) {
        //idSensor = 0;
        if(!historialRT[idSensor]) {
            historialRT[idSensor]=[];
        }
        var valor, fecha;
        var n = tabla.length;
        /*var newTable = [["historial", "Decibeles"]];
        if(n>1) {
            for(var i= n>=10? n - 10: 1; i<n; i++) {
                   valor = tabla[i][1];
                   fecha = tabla[i][3];
                   //fecha = formatDate(tabla[i][3]);
                    //historialRT[idSensor][idFen][historialRT[idSensor][idFen].length] = [new Date(fecha), valor];
                    newTable[newTable.length] = [new Date(fecha), valor];
           }
        }*/
        if(tabla.length === 1) {
            tabla[1] = [new Date(), 0];
            fecha = Date.now();
            valor = 0;
        }
        historialRT[idSensor][idFen] = tabla;
        if(!gRealTime[idFen]) {
            AreaChart(divRT, tabla, idFen, true);
            divLabels[idFen] = divPie+"label";
            var data = getPieData(idFen, divPie+"label", fecha, valor);
            GaugeChart(divPie, data, idFen);
        } else {
            var newTabla = new google.visualization.arrayToDataTable(tabla);
            gRealTime[idFen].draw(newTabla, areaOptions2);
            
            var data = getPieData(idFen, divPie+"label", fecha, valor);
            var table = new google.visualization.arrayToDataTable(data);
            graficasPie[idFen].draw(table, GaugeOptions);
        }
    }
    
    function getPieData(idFen, div, actualTime, valor) {
        var sensor;
        if(!sensor) {
            if(sensor!==0) {
            sensor = document.getElementById("selectSensorSonido").selectedOptions[0].value;
            //sensor = parseInt(sensor) -1;
            }
        }
        if(!valor && valor !== 0) {
            var tabla = historialRT[sensor][idFen];
            if(!tabla) {
                console.log("ID de tabla de sonido "+idFen);
                return 0;
            }
            //actualTime = typeof actualTime==="string"? Date.parse(actualTime): actualTime;
            //var nextTime = actualTime + 1000*60;
            var time;
            var n = tabla.length;
            valor = tabla[n-1][1];
        }
        valor = valor || 0;
        var rest = 100-valor;
        var fen = idFen === 0 ? "dBA": idFen === 1? "dBC": "dBspl";
        var gauge = [["Fenomeno", "Lectura"], [fen, valor]];
        return gauge;
    }
    /* ====================================================================================
     *                  Crear Graficas Tiempo Real
     * =======================================================================================
     */
    function updateIndicadores(div, tabla) {
        if(!gComparativa)
            ColumnChart(div, tabla);
        else {
            if(tabla.length>100) {
                columnOptions.series[0].type = 'area';
            } else
                columnOptions.series[0].type = 'bars';
            var data = new google.visualization.arrayToDataTable(tabla);
            gComparativa.draw(data, columnOptions);
            $("#loadingIndicadores").fadeOut();
        }
        tablaIndicadores = tabla;
    }
    /*
    function getOptions (valor) {
        var color;
        if(valor<45) {
            color = '#1adf35';
        } else {
            if(valor < 55)
                color = '#6adf1a';
            else {
                if(valor < 65)
                    color = '#eff206';
                else {
                    if(valor<75)
                        color = '#f28006';
                    else
                        color = '#f20606';
                }
            }
        }
        var options ={ width: 350, height: 220, pieHole: 0.5, legend: 'none',  pieSliceText: 'none', pieStartAngle: 90,
            tooltip: { trigger: 'none' },
            slices: { 0: { color: 'transparent' }, 1: { color: color },  2: { color: 'white'} },
            backgroundColor:{ fill: "#17202a" },
            chartArea: { left: 50, width: 270, height: 210, backgroundColor: "#17202a" },
            pieSliceBorderColor: "#17202a",
            animation:{ duration: 100, easing: 'linear' }
        };
        
        return options;
    }
    
    /* ====================================================================================
     *                  Time format
     * =======================================================================================
     */
    function formatDate(time) {
        var date = time? new Date(time) : new Date();
        var mo = (date.getMonth()+1)<10? "0"+(date.getMonth()+1): (date.getMonth()+1);
        var d = date.getDate() <10? "0"+date.getDate(): date.getDate();
        return mo+"/"+d+" "+actualTime(time);
    }
    function actualTime(time) {
        if(time)
            var date = new Date(time);
        else
            var date =  new Date();
        var h = date.getHours() <10 ? "0"+date.getHours(): date.getHours();
        var m = date.getMinutes() <10 ? "0"+date.getMinutes(): date.getMinutes();
        var s = date.getSeconds() <10 ? "0"+date.getSeconds(): date.getSeconds();
        if(time)
            return h+":"+m;
        else
            return h+":"+m+":"+s;
    }
    
    function correrInformacion(tabla) {
        var x;
        for(var i=1; i<tabla.length-1; i++) {
            tabla[i] = tabla[i+1];
        }
        return tabla;
    }
    
    /* ====================================================================================
     *                          Updates
     * =======================================================================================
     */
    function updatePieCharts(newTime){
        ids.forEach(function (id) {
                var newData = getPieData(id, divLabels[id], newTime);
                try {
                    var table = new google.visualization.arrayToDataTable(newData);
                    graficasPie[id].draw(table, GaugeOptions);
                } catch(e) {
                    console.log("Graficas aun no Cargadas");
                };
            });
    }
    
    function updateChartsRT(idSensor, idFen, newTime, newValue){
        //for(var i=0; i<4; i++) {
        var newData = getPieData(idFen, divLabels[idFen], newTime, newValue, idSensor);
        try {
            selected = document.getElementById("selectSensorSonido").selectedOptions[0].value;
            datosActualesSonido[idFen] = newValue;
            updateTableRT(idSensor, idFen, newValue, newTime);
            var table = new google.visualization.arrayToDataTable(newData);
            graficasPie[idFen].draw(table, GaugeOptions);
        } catch(e) {
            console.log("Graficas aun no Cargadas");
        };
        //}
    }
    function updateTableRT(idSensor, idFen, newValue, newTime, i) {
        selected =  i;
        newTime = newTime || Date.now();
        //idSensor=0;
        //var newTime = actualTime(newTime);
        if(!historialRT[idSensor]) {
            historialRT[idSensor]=[];
            historialRT[idSensor][0] = [["historial", "Decibeles"]];
            historialRT[idSensor][1] = [["historial", "Decibeles"]];
            historialRT[idSensor][2] = [["historial", "Decibeles"]];
            historialRT[idSensor][3] = [["historial", "Decibeles"]];
        }
        i = i || 0;
        
        if(historialRT[idSensor][idFen].length >= 121) {
            historialRT[idSensor][idFen] = correrInformacion(historialRT[idSensor][idFen]);
            historialRT[idSensor][idFen][historialRT[idSensor][idFen].length-1] = [new Date(newTime), newValue];
        } else {
            historialRT[idSensor][idFen][historialRT[idSensor][idFen].length] = [new Date(newTime), newValue];
        }
        if(gRealTime[idFen]) {
            
                var hi = new google.visualization.arrayToDataTable(historialRT[idSensor][idFen]);
                gRealTime[idFen].draw(hi, areaOptions2);
            
        }
    }
    
    /* ====================================================================================
     *                      Grafica comparativa de fenomenos
     * =======================================================================================
     */
    
    function updateDataHistorial(sensor, id, newData) {
        if(!tablasDatos[sensor]) {
            tablasDatos[sensor] = [];
        } 
        tablasDatos[sensor][id] = newData;
    }
    function updateDataRT(sensor, id, newData) {
        if(!historialRT[sensor]) {
            historialRT[sensor] = [];
        } 
        historialRT[sensor][id] = newData;
    }
    
    /* ====================================================================================
     *                  Creando Graficas
     * =======================================================================================
     */
    var leftWidth = $("#panelIzquierdo").innerWidth();
    var panelWidth = $("#pTimeChartSensores").innerWidth();
    const columnOptions = { title : "Indicadores", width: panelWidth-50, height: 250,
            legend: {  textStyle: {color: '#95a5a6'}, position: "bottom" },
            backgroundColor:{ fill: "#17202a"  },
            titleTextStyle: { color: '#FFFFFF', frontSize: 30 },
            chartArea: { backgroundColor: "#17202a" },
            annotations: { textStyle: { fontSize: 8, color: '#FFFFFF', auraColor: 'none' } },
            axisTitlesPosition: "out",
            hAxis: { logScale: false, slantedText: false, format: 'short',
              textStyle: { color: '#FFFFFF', frontSize: 10 },
              titleTextStyle: { color: '#FFFFFF', frontSize: 16 }
            },
            vAxis: { direction: 1, textStyle: { color: '#FFFFFF' } },
            seriesType: 'bars',
            series: { 0: {type: 'bars'} },
            animation:{  easing: 'linear' }
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
            //gComparativa = new google.visualization.ColumnChart(document.getElementById(div));
            gComparativa = new google.visualization.ComboChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(datos);
            gComparativa.draw(datosNuevos, columnOptions);
            $("#loadingIndicadores").fadeOut();
        }
    }
    /*
     * 
     * @param {String} div
     * @param {Array[][]} datos
     * @param {String} titulo
     * @returns {unresolved}
     */
    function PieChart(div, datos, id, chartOptions){
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawPieChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawPieChart() {
            var grafica = new google.visualization.PieChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(datos);
            grafica.draw(datosNuevos, chartOptions);
            graficasPie[id] = grafica;
        }
    }
    
    var GaugeOptions = {
          width: 180, height: 180,
          greenFrom: 0, greenTo: 55,
          yellowFrom:55, yellowTo: 75,
          redFrom: 75, redTo: 100,
          minorTicks: 5
        };
    function GaugeChart(div, datos, id, x){
        try{
            google.charts.load('current', {'packages':['gauge']});
            return google.charts.setOnLoadCallback(drawGaugeChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawGaugeChart() {
            var chart = new google.visualization.Gauge(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(datos);
            chart.draw(datosNuevos, GaugeOptions);
            graficasPie[id] = chart;
            if(!x)
                $("#LPSonido").fadeOut("slow");
        }
    }
    
    
    var areaOptions = { width: panelWidth - 20, height: 300,
        legend: {  textStyle: {color: '#95a5a6'}, position: "bottom" },
        pointSize: 5,
        backgroundColor:{ fill: "#17202a" },
        chartArea: {  top: 5,  backgroundColor: "#17202a" },
        animation:{ duration: 1000, easing: 'linear' },
        hAxis: { 
            //logScale: true, slantedText: true, format: 'short',
            textStyle: { color: '#f0f0f0', frontSize: 8 },
            titleTextStyle: { color: '#FFFFFF', frontSize: 16 }
        },
        vAxis: { direction: 1, textStyle: { color: '#f0f0f0' } },
        series: {}
    };
    var areaOptions2 = { width: leftWidth - 20, height: 250,
                legend: { position: "bottom", textStyle: {color: '#95a5a6'} },
                backgroundColor:{ fill: "#17202a" },
                chartArea: {  top: 5, backgroundColor: "#17202a"  },
                animation:{ duration: 1000, easing: 'linear' },
                hAxis: { 
                    //logScale: false, slantedText: true, format: 'short',
                  textStyle: { color: '#FFFFFF', frontSize: 10 },
                  titleTextStyle: { color: '#FFFFFF', frontSize: 16 }
                },
                vAxis: {  direction: 1, textStyle: { color: '#FFFFFF' } }
            };
            var progreso = 0;
    function AreaChart(div, datos, id, rt){
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawAreaChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawAreaChart() {
            var grafica = new google.visualization.AreaChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(datos);
            if(rt === true) {
                grafica.draw(datosNuevos, areaOptions2);
                gRealTime[id] = grafica;
                $("#loadingHistorialSonidoTR").fadeOut();
            }
            else {
                var series, fen;
                switch(id) {
                    case 0: series = {0: {color: "blue"}}; fen = "leq_a"; break;
                    case 1: series = {0: {color: "red"}}; fen = "leq_c"; break;
                    case 2: series = {0: {color: "green"}}; fen = "leq_spl"; break;
                }
                areaOptions.series = series;
                grafica.draw(datosNuevos, areaOptions);
                gHistorial[id] = grafica;
                /*if(progreso >=2) {
                    $("#pTimeChartSensoresSonido").fadeOut("slow");
                }*/
                progreso++;
                $("#loadingHistorialSonido"+id).fadeOut();
                if(Util.endTimer)
                    Util.endTimer("sonido0");
            }
        }
    }   
    /* ====================================================================================
     *                  Tablas
     * =======================================================================================
     */
    $("#verTablasSonido").click(function () {
        var  tabla=[["Fecha", "Decibeles A", "Decibeles C", "Decibeles Spl"]];
        var n = historial[0].length;
        for(var i=1; i<n; i++) {
            var f = historial[0][i][0];
            try {
                tabla[tabla.length] = [f, historial[0][i][1], historial[1][i][1], historial[2][i][1]];
            } catch(e) {}
        }
        document.getElementById("LabelTablaSonido").innerHTML = "Datos de Sonido";
        var tablaCreada = Util.crearTablaDIV("tablaCompletaSonido", tabla, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
        Util.crearTablaDIV("tablaCompletaIndicadores", tablaIndicadores, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
        try {
            var png = '<img src="' + gHistorial[0].getImageURI() + '">';
            document.getElementById("imagenGrafica0").innerHTML = png;
            png = '<img src="' + gHistorial[1].getImageURI() + '">';
            document.getElementById("imagenGrafica1").innerHTML = png;
            png = '<img src="' + gHistorial[2].getImageURI() + '">';
            document.getElementById("imagenGrafica2").innerHTML = png;
            png = '<img src="' + gComparativa.getImageURI() + '">';
            document.getElementById("imagenIndicadores").innerHTML = png;
        } catch(e) {

        }
        $("#panelTablasSonido").fadeIn("slow");
    });
    
    $("#descargarGrafica0").click(function () {
        var dataType = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
        var png = '<img src="' + gHistorial[0].getImageURI() + '">';
        var a = document.createElement('a');
        a.href = dataType +', '+ png;
        a.download = "ejemplo.png";
        a.click();
        document.getElementById("imagenGrafica").innerHTML = png;
    });
    
    $("#descargarTablaSonido").click(function (element) {
        Util.exportarTablaXLS(element, "tablaCompletaSonido");
    });
    $("#descargarTablaIndicadores").click(function (element) {
        Util.exportarTablaXLS(element, "tablaCompletaIndicadores");
    });
    /* ====================================================================================
     *                  Balloons
     * =======================================================================================
     */
    $("#ballonChartSonido0").click(function () {
        crearBalloonChart(0);
    });
    $("#cerrarBalloonChartSonido0").click(function () {
        cerrarBalloonChart(0);
    });
    $("#ballonChartSonido1").click(function () {
        crearBalloonChart(1);
    });
    $("#cerrarBalloonChartSonido1").click(function () {
        cerrarBalloonChart(1);
    });
    $("#ballonChartSonido2").click(function () {
        crearBalloonChart(2);
    });
    $("#cerrarBalloonChartSonido2").click(function () {
        cerrarBalloonChart(2);
    });
    function crearBalloonChart(id) {
        $("#ballonnChartSonido"+id).fadeIn("slow");
        var width = $("#ballonnChartSonido"+id).innerWidth() - 20;
        areaOptions2.width = width;
        var sen = document.getElementById("selectSensorSonido").selectedOptions[0].value;
        document.getElementById("sonidoUltimaHora"+id).innerHTML = "";
        document.getElementById("pieChartsonido"+id).innerHTML = "";
        AreaChart("chartBSonido"+id, historialRT[sen][id], id, true);
        var data = getPieData(id);
        GaugeChart("chartBSonidoG"+id, data, id, true);
        $("#ballonnChartSonido"+id).resize(function (event) {
            var width = event.currentTarget.clientWidth - 20;
            areaOptions2.width = width;
            var data = gRealTime[id].J;
            gRealTime[id].draw(data, areaOptions2);
        });
    }
    function cerrarBalloonChart(id) {
        $("#ballonnChartSonido"+id).fadeOut("slow");
        $("#panelIzquierdo").fadeIn();
        $("#LPSonido").fadeIn();
        areaOptions2.width = leftWidth;
        var sen = document.getElementById("selectSensorSonido").selectedOptions[0].value;
        document.getElementById("chartBSonido"+id).innerHTML = "";
        document.getElementById("chartBSonidoG"+id).innerHTML = "";
        AreaChart("sonidoUltimaHora"+id, historialRT[sen][id], id, true);
        var data = getPieData(id);
        GaugeChart("pieChartsonido"+id, data, id, true);
    }
    
    $("#pTimeChartSensoresSonido").resize(function (event) {
        panelWidth = event.currentTarget.clientWidth - 20;
        if(areaOptions.width !== panelWidth) {
            areaOptions.width = panelWidth;
            for(var id in gHistorial) {
                var series;
                switch(id) {
                    case 0: series = {0: {color: "blue"}}; break;
                    case 1: series = {0: {color: "red"}}; break;
                    case 2: series = {0: {color: "green"}}; break;
                }
                areaOptions.series = series;
                var data = gHistorial[id].J;
                gHistorial[id].draw(data, areaOptions);
            }
            data = gComparativa.J;
            columnOptions.width = panelWidth;
            gComparativa.draw(data, columnOptions);
        }
    });
    
    
    return {
        crearHistorial: crearHistorial,
        updatePieCharts: updatePieCharts,
        updateHistorial: updateHistorial,
        //updateRealTime: updateRealTime,
        updateChartsRT: updateChartsRT,
        //updateComparativa: updateComparativa,
        updateDataHistorial: updateDataHistorial,
        updateDataRT: updateDataRT,
        crearRealTime: crearRealTime,
        updateIndicadores: updateIndicadores
        //crearGraficaComparativa: crearGraficaComparativa
    };
});

function getDataSonidos() {
    return datosActualesSonido;
}
