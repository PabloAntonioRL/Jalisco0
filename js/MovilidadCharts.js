/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["recursos/js/Util"], function (Util) {
    
    var graficaMedia, graficaTotal, graficas=[];
    var tablas =[], tablaTR = {};
    var colores = ["blue", "red", "yellow", "green", "purple"];
    var tablaVacia = [["Fecha", ""], [new Date(), 0]];
    function crearGraficasVelocidad(div, tabla, id, fecha) {
        //tablas = crearTablas(datos);
        //areaOptions.title = fecha;
        tabla = corregirTablaNodos(tabla);
        tablas[id] = tabla;
        tabla = getTablaVector(tabla);
        console.log("Creando Grafica de Velocidad y Tiempo de Movilidad");
        if(!graficas[id])
            graficaLineas(div, tabla, id, comboOptions);
        else
            updateChart(id, tabla, areaOptions);
    }
    
    function crearGraficasNodos(div, tabla, id, fecha) {
        tabla = corregirTablaNodos(tabla);
        tablas[id] = tabla;
        tabla = getTablaDispositivos(tabla);
        console.log("Creando Grafica de Nodos Movilidad");
        //areaOptions.title = fecha;
        if(!graficas[id])
            graficaArea(div, tabla, id, areaOptions);
        else
            updateChart(id, tabla, areaOptions);
    }
    
    function corregirTablaNodos(tabla) {
        tabla = tabla || tablaVacia;
        var valor;
        for(var i=1;i< tabla.length; i++) {
            for(var j=1; j< tabla[i].length; j++) {
                try {
                    valor = parseFloat(tabla[i][j]);
                    tabla[i][j] = valor;
                } catch(e) {
                    valor = tabla[i][j];
                    if(valor ==="nan")
                        tabla[i][j] = 0;
                }
            }
        }
        return tabla;
    }
    
    function getTablaDispositivos(tabla) {
        var par = document.getElementById("selectorParametroNodos").selectedOptions[0].innerHTML;
        var key, newTabla=[], color;
        switch(par) {
            case "Todos": 
                areaOptions.series = {0:{color:"blue"}};
                areaOptions.title = "Todos";
                for(var i=1; i<tabla.length; i++) {
                    tabla[i][0] = Util.formatDateUTCToLocal(tabla[i][0], "date");
                }
                //return ordenarFechas(tabla);
                return tabla;
            case "Total": key = 0; areaOptions.title = "Total"; break;
            case "Vehiculos":key = 1; areaOptions.title = "Vehiculos"; break;
            case "Celulares": key =2; areaOptions.title = "Celulares"; break;
            case "Otros": key = 3; areaOptions.title = "Otros"; break;
            case "Devices": key = 4; areaOptions.title = "Devices"; break;
        }
        if(key ===0)
            color = colores[colores.length];
        else
            color = colores[key-1];
        var total=0, valor;
        newTabla[0] = ["Fecha", par];
        for(var i=1; i<tabla.length; i++) {
            if(key ===0) {
                total=0;
                for(var j=1; j<tabla[i].length; j++) {
                    valor = tabla[i][j];
                    total += valor;
                }
                newTabla[i] = [Util.formatDateUTCToLocal(tabla[i][0], "date"), total];
            } else {
                newTabla[i] = [Util.formatDateUTCToLocal(tabla[i][0], "date"), tabla[i][key]];
            }
        }
        var series = {0: {color: color}};
        areaOptions.series = series;
        //return ordenarFechas(newTabla);
        return newTabla;
    }
    
    function getTablaVector(tabla) {
        var par = document.getElementById("selectorParametroVector").selectedOptions[0].innerHTML;
        var key;
        if(par === "Velocidad")
            key = 1;
        else
            key = 2;
        var newTabla=[["Fecha", "tiempo"]], tablaDef=[["Fecha", "Velocidad", "Desfase"]];
        var j=tabla.length-6;
        for(var i=1; i<tabla.length; i++) {
            newTabla[i] = [Util.formatDateUTCToLocal(tabla[i][0], "date"), tabla[i][2]];
            if(j>=tabla.length)
                j = 1;
            try {
                tablaDef[i] = [Util.formatDateUTCToLocal(tabla[i][0], "date"), tabla[i][1], tabla[j][1]];
            }catch(e) {}
            j++;
            
        }
        var color = colores[key-1];
        if(par === "Velocidad") {
            var series = {0: {type: "area",color: color}, 1:{type: "line",color: "green"}};
            comboOptions.series = series;
            //return ordenarFechas(tablaDef);
            return tablaDef;
        } else {
            var series = {0: {type: "area", color: color}};
            comboOptions.series = series;
            //return ordenarFechas(newTabla);
            return newTabla;
        }
    }
    
    function ordenarFechas(tabla) {
        var y, x;
        x = Date.parse(tabla[1][0]);
        for(var i=1; i<tabla.length; i++) {
            var fecha = tabla[i][0];
            y = Date.parse(fecha);
            if(x>y) {
                x = tabla[i-1];
                tabla[i-1] = tabla[i];
                tabla[i] = x;
                x = Date.parse(tabla[1][0]);
                i=0;
            }
            x = y;
        }
        return tabla;
    }
    
    function crearTablas(datos) {
        var nodo = document.getElementById("selectorNodo").selectedOptions[0].innerHTML;
        var vector = document.getElementById("selectorVector").selectedOptions[0].innerHTML;
    }
    
    function updateGrafica(id, tablaDatos, options) {
        if(tablaDatos)
            tablaDatos = corregirTablaNodos(tablaDatos);
        else 
            tablaDatos = tablas[id];
        tablas[id] = tablaDatos;
        if(id === 0)
            tablaDatos = getTablaDispositivos(tablaDatos);
        else
            tablaDatos = getTablaVector(tablaDatos);
        console.log(tablaDatos);
        if(id===1) {
            options = comboOptions;
        }
        options = options || areaOptions;
        var datos = new google.visualization.arrayToDataTable(tablaDatos);
        graficas[id].draw(datos, options);
    }
    
    function crearGraficaDesfase(div, tabla, id) {
        
    }
    /* 
     * ==========================================================================================
     *                             Grafica Tiempo Real
     * ==========================================================================================
     */
    function crearGraficaTR(div, data, id) {
        //tablaTR[0] = [["Fecha", "Valor"]];
        //tablaTR[1] = [["Fecha", "Valor"]];
        var tabla = getValor(data);
        //tablaTR[0][1] = [valores.time, valores.speed];
        //tablaTR[1][1] = [valores.time, valores.elapsed];
        Util.setOptions("selectorRID", tabla.rid, false);
        //var datos = new google.visualization.arrayToDataTable(tablaTR);
        var par = parseInt(document.getElementById("movilidadParametroTR").selectedOptions[0].value);
        if(par === 1) {
            areaOptionsTR.title = "Velocidad";
            areaOptionsTR.vAxis.title = "KM / H";
        } else {
            areaOptionsTR.title = "Tiempo";
            areaOptionsTR.vAxis.title = "Segundos";
        }
        graficaArea(div, tabla.tabla[par], id, areaOptionsTR);
    }
    function getValor(data) {
        var id = document.getElementById("selectorRID").selectedOptions[0].innerHTML;
        var speed=0, elapsed=0, trend=0;
        var datos, rids = [], n;
        for(var i in data) {
            var datos = data[i];
            var rid = data[i].rid;
            rids[rids.length] = rid;
            //if(rid === id)
              //  datos = data[i];
              if(datos.average) {
                if(datos.average.publish) {
                    speed = datos.average.publish.speed || 0;
                    elapsed = datos.average.publish.elapsed || 0;
                    trend = datos.average.publish.trend || 0;
                }
            }
            var time="";
            if(datos.time)
                time = datos.time;
            time = Util.formatDateUTCToLocal(time, "hh:mm");
            //time = new Date(time);
            if(!tablaTR[rid]) {
                tablaTR[rid] = { 0: [["Fecha", "Valor"]], 1: [["Fecha", "Valor", "Tendencia"]]};
            }
            var anterior;
            n = tablaTR[rid][0].length;
            anterior = tablaTR[rid][0][n-1][0];
            /*if(time === anterior) {
                tablaTR[rid][0][n-1][1] += parseFloat(elapsed);
                tablaTR[rid][1][n-1][1] += parseFloat(speed);
            } else {*/
                tablaTR[rid][0][n] = [time, parseFloat(elapsed)];
                tablaTR[rid][1][n] = [time, parseFloat(speed), parseFloat(trend)];
            //}
        }
        if(!id)
            id = rids[0];
        if(!tablaTR[id]) {
            tablaTR[id] = { 0: [["Fecha", "Valor"], [Util.formatTime(), 0]], 1: [["Fecha", "Valor"], [Util.formatTime(), 0]]};
        }
        return {tabla: tablaTR[id], rid: rids};
        /*
        if(datos.last) {
            if(datos.last.publish) {
                speed = datos.last.publish.speed;
                elapsed = datos.last.publish.elapsed;
            }
        }
        var time="";
        if(datos.time)
            time = datos.time;
        time = Util.formatTime(time);
        return {speed: speed, elapsed: elapsed, time: time, rids: rids};*/
    }
    
    function updateGraficaTR(data, id) {
        var valores = getValor(data).tabla;
        /*if(tablaTR[0].length===0) {
            tablaTR[0][0] = ["Fecha", "valor"];
        }
        if(tablaTR[1].length===0) {
            tablaTR[1][0] = ["Fecha", "valor"];
        }
        if(tablaTR[0].length >= 121) {
            tablaTR[0] = correrInformacion(tablaTR[0]);
            tablaTR[0][tablaTR[0].length-1] = [valores.time, valores.speed];
        } else 
            tablaTR[0][tablaTR[0].length] = [valores.time, valores.speed];
        
        if(tablaTR[1].length >= 121) {
            tablaTR[1] = correrInformacion(tablaTR[1]);
            tablaTR[1][tablaTR[1].length-1] = [valores.time, valores.elapsed];
        } else 
            tablaTR[1][tablaTR[1].length] = [valores.time, valores.elapsed];*/
        var rid = document.getElementById("selectorRID").selectedOptions[0].innerHTML;
        var par = parseInt(document.getElementById("movilidadParametroTR").selectedOptions[0].value);
        var datos = new google.visualization.arrayToDataTable(tablaTR[rid][par]);
        if(par === 1) {
            areaOptionsTR.title = "Velocidad";
            areaOptionsTR.vAxis.title = "KM / H";
        } else {
            areaOptionsTR.title = "Tiempo";
            areaOptionsTR.vAxis.title = "Segundos";
        }
        if(!graficas[id])
            graficaArea("graficaMovilidadTR", datos, areaOptionsTR);
        else
            graficas[id].draw(datos, areaOptionsTR);
    }
    function correrInformacion(tabla) {
        var x;
        for(var i=1; i<tabla.length-1; i++) {
            tabla[i] = tabla[i+1];
        }
        return tabla;
    }
    /* 
     * ==========================================================================================
     *                             Creacion de graficas
     * ==========================================================================================
     */
    var nChart = 0;
    var panelWidth = $("#pTimeChartMovilidad").innerWidth()-80;
    console.log("Grafica Historial Movilidad width "+(panelWidth));
    //var series={0: {type: 'bars'}};
    const areaOptions = { title: "Historico", width: panelWidth, height: 340,
                backgroundColor:{ fill: "#17202a" },
                legend: {  position: "bottom", textStyle: {color: '#95a5a6'} },
                chartArea: {  backgroundColor: "#17202a" },
                titleTextStyle: { color: '#FFFFFF', frontSize: 20 },
                animation:{ duration: 1000, easing: 'linear' },
                hAxis: { 
                    //logScale: true, slantedText: false, format: 'short',
                  textStyle: { color: '#f0f0f0', frontSize: 8 },
                  titleTextStyle: { color: '#FFFFFF', frontSize: 16 }
                },
                vAxis: { direction: 1, textStyle: { color: '#FFFFFF' } }
            };
    var left = $("#panelIzquierdo").innerWidth()-50;
    console.log("Grafica Historial Movilidad width "+(left));
    const areaOptionsTR = { title: "Historico", width: left, height: 340,
        pointSize: 5,
                backgroundColor:{ fill: "#17202a" },
                legend: { textStyle: {color: '#95a5a6'} },
                chartArea: {  backgroundColor: "#17202a" },
                titleTextStyle: { color: '#FFFFFF', frontSize: 20 },
                animation:{ duration: 1000, easing: 'linear' },
                hAxis: { 
                    //logScale: true, slantedText: false, format: 'short',
                  textStyle: { color: '#f0f0f0', frontSize: 8 },
                  title: "Lapso de Tiempo (Elapsed)",
                  titleTextStyle: { color: '#95a5a6', frontSize: 16 }
                },
                vAxis: { direction: 1, textStyle: { color: '#f0f0f0' },
                    title: "Unidades", titleTextStyle: { color: '#95a5a6', frontSize: 16 }}
            };
    function graficaArea(div, tablaDatos, id, options) {
        //var datos = createChartTable(tablaDatos);
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawAreaChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawAreaChart() {
            graficas[id] = new google.visualization.AreaChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(tablaDatos);
            
            graficas[id].draw(datosNuevos, options);
            switch(id) {
                case 0: $("#loadingHistorialMovilidad0").fadeOut();
                if(Util.endTimer)
                    Util.endTimer("MovilidadHistorialNodos"); break;
                case 2:
                case 1: $("#loadingHistorialMovilidad1").fadeOut(); break;
                case 3: $("#loadingMovilidadTR").fadeOut(); break;
            }
            //nChart++;
           // if(nChart>=2) 
                //$("#pTimeChartMovilidad").fadeOut();
        }
    }
    
    //var width = $("#pTimeChartSensores").innerWidth() - 50;
    //width = width<500? 500: width;
    const comboOptions = { title : "", width: panelWidth, height: 280, //orientation: "vertical",
                backgroundColor:{ fill: "#17202a" },
                legend: { position:"bottom", textStyle: {color: '#95a5a6'} },
                titleTextStyle: { color: '#FFFFFF', frontSize: 30 },
                chartArea: {  backgroundColor: "#17202a" },
                annotations: { textStyle: { fontSize: 12, color: '#FFFFFF', auraColor: 'none' } },
                animation:{ duration: 1000, easing: 'linear' },
                axisTitlesPosition: "out",
                hAxis: {  
                    //logScale: false, slantedText: false, format: 'short',
                  textStyle: { color: '#FFFFFF', frontSize: 10 },
                  titleTextStyle: { color: '#FFFFFF', frontSize: 16 }
                },
                vAxis: { direction: 1, textStyle: { color: '#FFFFFF' } },
                //seriesType: 'bars',
                series: { 1: {type: 'area'} }
                };
    function graficaLineas(div, tablaDatos, id, options) {
        //var datos = createChartTable(tablaDatos);
        try{
            google.charts.load('current', {'packages':['corechart']});
            return google.charts.setOnLoadCallback(drawAreaChart);
        }catch(e){
            console.log("Error al crear Grafica de lineas\n");
            console.log(e);
        }
        function drawAreaChart() {
            //graficas[id] = new google.visualization.LineChart(document.getElementById(div));
            graficas[id] = new google.visualization.ComboChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(tablaDatos);
            
            graficas[id].draw(datosNuevos, options);
            $("#loadingHistorialMovilidad1").fadeOut();
            
            if(Util.endTimer)
                Util.endTimer("MovilidadHistorialVectores");
        }
    }
    
    $("#verTablasMovilidad").click(function () {
        var  tabla=[];
        var n = tablas[0].length;
        for(var i=0; i<n; i++) {
            var f = tablas[0][i][0];
            f = i>0? Util.formatDate(f, "aaaa-mm-dd hh:mm"): f;
            tabla[tabla.length] = [f, tablas[0][i][1], tablas[0][i][2], tablas[0][i][3], tablas[0][i][4], tablas[1][i][1], tablas[1][i][2]];
        }
        document.getElementById("LabelTabla1").innerHTML = "Datos de Movilidad";
        var tablaCreada = Util.crearTablaDIV("tablaCompleta1", tabla, {enumerado: true, color1: "rgba(136, 181, 222, 0.5)", color2: ""});
        $("#descargarGraficas").fadeIn();
        var png = '<img src="' + graficas[0].getImageURI() + '">';
        document.getElementById("graficaImagenM1").innerHTML = png;
        png = '<img src="' + graficas[1].getImageURI() + '">';
        document.getElementById("graficaImagenM2").innerHTML = png;
        $("#panelTablas").fadeIn("slow");
    });
     /*
     * ========================================================================
     *                      Listener
     * ========================================================================
     */
    $("#ballonChartMovilidad").click(function () {
        $("#ballonnChartMovilidad").fadeIn("slow");
        var width = $("#ballonnChartMovilidad").innerWidth() - 20;
        var id = document.getElementById("selectorRID").selectedOptions[0].innerHTML;
        var par = parseInt(document.getElementById("movilidadParametroTR").selectedOptions[0].value);
        areaOptionsTR.width = width;
        document.getElementById("graficaMovilidadTR").innerHTML = "";
        graficaArea("chartBMovilidad", tablaTR[id][par], 3, areaOptionsTR);
    });
    $("#cerrarBalloonChartMovilidad").click(function () {
        $("#ballonnChartMovilidad").fadeOut("slow");
        $("#panelIzquierdo").fadeIn();
        $("#LPMovilidad").fadeIn();
        var id = document.getElementById("selectorRID").selectedOptions[0].innerHTML;
        var par = parseInt(document.getElementById("movilidadParametroTR").selectedOptions[0].value);
        areaOptionsTR.width = left;
        document.getElementById("chartBMovilidad").innerHTML = "";
        graficaArea("graficaMovilidadTR", tablaTR[id][par], 3, areaOptionsTR);
    });
    $("#ballonnChartMovilidad").resize(function (event) {
        panelWidth = event.currentTarget.clientWidth - 20;
        if(areaOptionsTR.width !== panelWidth) {
            areaOptionsTR.width = panelWidth;
            var data = graficas[3].J;
            graficas[3].draw(data, areaOptionsTR);
        }
    });
    
    $("#pTimeChartMovilidad").resize(function (event) {
        panelWidth = event.currentTarget.clientWidth - 20;
        if(areaOptions.width !== panelWidth) {
            areaOptions.width = panelWidth;
            comboOptions.width = panelWidth;
            var data = graficas[0].J;
            graficas[0].draw(data, areaOptions);
            data = graficas[1].J;
            graficas[1].draw(data, comboOptions);
        }
    });
    
    
    return {
        crearGraficasVelocidad: crearGraficasVelocidad,
        updateGrafica: updateGrafica,
        crearGraficasNodos: crearGraficasNodos,
        crearGraficaTR: crearGraficaTR,
        updateGraficaTR: updateGraficaTR
    };
});
