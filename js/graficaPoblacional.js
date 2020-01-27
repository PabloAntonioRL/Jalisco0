/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([], function () {
    
    var graficaM, graficaH, Datos, ya;
    var optionsH = {
                width: 450,
                height: 350,
                orientation: "vertical",
                backgroundColor:{
                    fill: "#17202a"
                },
                legend: {
                    position: "none"
                },
                
                chartArea: {
                    left: 50,
                    width: 400,
                    height: 300,
                    backgroundColor: "#17202a"
                },
                annotations: {
                  textStyle: {
                    fontSize: 12,
                    color: '#FFFFFF',
                    auraColor: 'none'
                  }
                },
                axisTitlesPosition: "out",
                hAxis: {
                  logScale: false,
                  slantedText: false,
                  format: 'short',
                  textStyle: {
                    color: '#FFFFFF',
                    frontSize: 10
                  },
                  titleTextStyle: {
                    color: '#FFFFFF',
                    frontSize: 16
                  }
                },
                vAxis: {
                  direction: 1,
                  textStyle: {
                    color: '#FFFFFF'
                  }

                },
                animation:{
                    duration: 100,
                    easing: 'linear'
                }
                };
    
    function defaultFormat(number) {
        var anotation, c, j=0, x=false;
        anotation = Math.round(number) +"";
        number = "";
        for(var i=anotation.length-1;i>=0;i--) {
            c = anotation.charAt(i);
            if(c !=='K') {
                j++;
            }
            if(j>3) {
                number+=",";
                j=1;
                x=true;
            }
            number+=c;
        }
        if(x) {
            anotation = "";
            for(i=number.length-1; i>=0;i--) {
                c = number.charAt(i);
                anotation += c;
            }
        }
        return anotation;
    }
    
    function createChart(datos) {
        var y = getYearPoblacion();
        y = y || "2010";
        document.getElementById("poblacionYear").innerHTML = "Año: "+y;
        ya=y;
        var datos = Datos[y];
        var datosH = datos.hombre;
        var datosM = datos.mujeres;
        var tabla = getTables(datosH, datosM);
        //
        //var tablaM = getTables(datosM, "pink");
        
        ColumnChartH("GraficaH", tabla, optionsH);
        //ColumnChartM("GraficaM", tablaM, optionsM);
        
    }
    
    function update() {
        var y = getYearPoblacion();
        y = y || "2010";
        if(ya===y) {
            return 0;
        }
        ya=y;
        document.getElementById("poblacionYear").innerHTML = "Año: "+y;
        var datos = Datos[y];
        var datosH = datos.hombre;
        var datosM = datos.mujeres;
        var tabla = getTables(datosH, datosM);
        //
        //var tablaM = getTables(datosM, "pink");
        
        updateChart(graficaH, tabla, optionsH);
        //updateChart(graficaM, tablaM, optionsM);
        
    }
    
    function getTables(datosH, datosM) {
        var tabla = [["Edades", "Hombres", { role: 'style' },{type: 'string', role: 'annotation'},  "Mujeres", { role: 'style' }, {type: 'string', role: 'annotation'}]];
        for(var key in datosH) {
            tabla[tabla.length] = [key, datosH[key], "blue", defaultFormat(datosH[key]), datosM[key],"pink", defaultFormat(datosM[key])];
        }
        return tabla;
    }
    
    function getData() {
        $.ajax({
               type:'Get',
               dataType: "json",
               url:"data/population.json"
        }).done(function(data) {
            Datos = data;
            createChart(data);
        }).fail(function(e) {
           console.log(e);
        });
    }
    
    function ColumnChartH(div, datos, chartOptions) {
        try{
            google.charts.load('current', {packages: ['corechart', 'bar']});
            return google.charts.setOnLoadCallback(drawColumnChart);
            
        }catch(e){
            console.log("Error al crear Grafica de columna\n");
            console.log(e);
        }
        function drawColumnChart() {
            graficaH = new google.visualization.ColumnChart(document.getElementById(div));
            var datosNuevos = new google.visualization.arrayToDataTable(datos);
            graficaH.draw(datosNuevos, chartOptions);
        }
    }
    function updateChart(chart, data, options) {
        data = new google.visualization.arrayToDataTable(data);
        chart.draw(data, options);
    }
    
    return {
        getData: getData,
        update: update
    };
});
