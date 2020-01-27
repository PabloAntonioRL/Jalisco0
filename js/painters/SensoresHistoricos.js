/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
        "luciad/shape/ShapeFactory",
        'samples/common/IconFactory'
    ], function (FeaturePainter, ShapeFactory, IconFactory) {
    
    function layerPainter() {
    } 
    layerPainter.prototype = new FeaturePainter();
    layerPainter.prototype.constructor = layerPainter;
    layerPainter.prototype.getDetailLevelScales = function() {
        return [1 / 3000000, 1 / 2000000, 1 / 1000000,1 / 500000,1 / 250000];
    };
    
    var sBlanco = 'rgb(255, 255, 255)';
    var sGrisOscuro = 'rgb(50, 50, 50)';
    var sGrisClaro = 'rgb(200, 200, 200)', GrisClaro = 'rgba(200, 200, 200, 0.5)';
    var sRojo = 'rgb(255, 0, 0)', Rojo = 'rgba(255, 0, 0, 0.5)';
    var sAmarilloClaro = 'rgb(255, 255, 204)';
    var sGris = 'rgb(230, 230, 230)', Gris = "rgba(230,230,230, 0.5)";
    var sNaranjaClaro = 'rgb(255, 239, 204)';
    var sNaranja = 'rgb(255, 174, 102)', Naranja = 'rgba(255, 174, 102, 0.5)';
    var Verde = "rgba(50,230,50,0.5)", sVerde = "rgb(50,230,50)";
    var sMorado ="rgb(200,0,200)", Morado = "rgba(200,0,200, 0.5)";
    var Azul = "rgba(70, 100, 230, 0.5)", sAzul = "rgb(70, 100, 230)";
    var VerdeClaro = "rgba( 134, 255, 132 , 0.5)", sVerdeClaro = "rgb( 134, 255, 132 )";
    var maxRadio = 0, minRadio = 1;
    
    var valor, radio;
    layerPainter.prototype.paintBody = function (geoCanvas, feature, shape, layer, map, state) {
        
        
        var tables = getActualDataForSensors() || {};
        var maxValues ={
            T21: [1, 1, 1, 1, 140, 5, 1, 5],
            BOMBEROS: [1000, 1, 25, 10],
            SensorHPTE: [ 300, 100,616, 20, 100, 1, 5]};
        var id = feature.id;
        var key=-1, sensores = tables.sensores;
        tables = tables.tables;
        for(var i=0; i<sensores.length; i++) {
            if(id === sensores[i]) {
                key = i;
                break;
            }
        }
        if(key===-1) {
            var  dimension= 14, icon;
            if(state.selected) 
                icon = IconFactory.circle({stroke: sBlanco, fill: sRojo, width: dimension, height: dimension});
            else 
                icon  = IconFactory.circle({stroke: sBlanco, fill: sVerde, width: dimension, height: dimension});

            geoCanvas.drawIcon(shape.focusPoint,{
                width: dimension+"px",
                height: dimension+"px",
                image: icon
            });
        } else {
            tables = tables[key];
            var may = 0, dato;
            try {
            var parametro = document.getElementById("selector"+id).selectedOptions[0].innerHTML;
            var parametroI = document.getElementById("selector"+id).selectedOptions[0].value;
            if(parametro === "Todos") {
                switch(id) {
                    case "SensorHPTE": parametro = "TEMP"; parametroI=0; break;
                    case "SensorG": parametro = "NO"; parametroI=0; break;
                    case "SensorP": parametro = "SO2"; parametroI=0; break;
                }
            }
                parametroI = parseInt(parametroI);
                radio=0;
            for(i=1; i<tables.length; i++) {
                var par = tables[i][0];
                if(par === parametro) {
                    radio = tables[i][1];
                    valor = tables[i][2];
                    break;
                }
            }
            if(radio <1.0) {
                if(radio <0.01) 
                    radio = radio*1000;
                else
                    radio = radio * 100;
            } else {
                //if(radio >100) {
                    var max = maxValues[id];
                    max = max[parametroI];
                    radio = (radio / max) *100;
                //}
            }
            radio = radio<10? 10: radio;
            radio = radio>100? 100: radio;
            } catch(e) {
                radio = 10;
            }
            var circle = ShapeFactory.createCircleByCenterPoint(shape.reference, shape, radio);
            
            geoCanvas.drawShape(circle,{ 
                    fill: {color: state.selected ? Verde : Naranja},
                    stroke: {
                        color: state.selected ? sRojo : sGris,
                        width: 2} 
            });

            var  dimension= 14, icon;
            if(state.selected) 
                icon = IconFactory.circle({stroke: sBlanco, fill: sRojo, width: dimension, height: dimension});
            else 
                icon  = IconFactory.circle({stroke: sBlanco, fill: sVerde, width: dimension, height: dimension});

            geoCanvas.drawIcon(shape.focusPoint,{
                width: dimension+"px",
                height: dimension+"px",
                image: icon
            });
            
        }
         
    };
    
    
    layerPainter.prototype.paintLabel = function (labelCanvas, feature, shape, layer, map, state) {
        var label, labelName = "", i=0, properties = feature.properties;
        var id = feature.id;
        labelName = id;
        var parametro = document.getElementById("selector"+id).selectedOptions[0].innerHTML;
        
        //label = "<span style='color: $color' class='label'>" + labelName + "</span>";
        label  = '<div class="labelwrapper">' +
                                '<div class="sensorLabel blueColorLabel">' +
                                '<div class="theader">' +
                                '<div class="leftTick blueColorTick"></div>' +
                                '<div class="rightTick blueColorTick"></div>' +
                                '<div class="name">'+labelName+' '+parametro+'</div>' +
                                '</div>' +
                                '<div class="type">Valor : '+valor+'</div>' +
                                '<div class="type">Radio : '+radio+'</div>' +
                                '</div>' +
                                '</div>';
        if(state.level > 3) {     
            if(state.selected)
                labelCanvas.drawLabel(label.replace("$color", sRojo),shape.focusPoint, {});
            else
                labelCanvas.drawLabel(label.replace("$color", sBlanco),shape.focusPoint, {});
        }
    };
 
    return layerPainter;
});

