/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
        "luciad/shape/ShapeFactory"
    ], function (FeaturePainter, ShapeFactory) {
    
    function layerPainter() {
        this.sensorStyle = {
                width: "40px",
                height: "40px",
                image: "data/icons/sensor.png"
        };
        this.selectSensorStyle = {
                width: "45px",
                height: "45px",
                image: "data/icons/sensor.png"
        };
        
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
    var sAmarillo = "rgb( 252, 241, 0 )";
    var maxRadio = 0, minRadio = 1;
    //var reference = ReferenceProvider.getReference("CRS:84");
    var valor;
    layerPainter.prototype.paintBody = function (geoCanvas, feature, shape, layer, map, state) {
        
        
        
        var shape3d;
        if(feature.properties.maximumHeight) {
            if(feature.properties.minimumHeight)
                shape3d = ShapeFactory.createExtrudedShape(
                    shape.reference, shape, feature.properties.minimumHeight, feature.properties.maximumHeight);
            else
                shape3d = ShapeFactory.createExtrudedShape(
                    shape.reference, shape, 0, feature.properties.maximumHeight);
        }
        
        //valor = radio;
        if(feature.geometry.x || feature.properties.type === "node") {
            /*geoCanvas.drawShape(circle,{ 
                fill: {color: state.selected ? Verde : Naranja},
                stroke: {
                    color: state.selected ? sRojo : sGris,
                    width: 2} 
            });*/
            
            geoCanvas.drawIcon(shape, this.sensorStyle);
        } else {
            var color;
            var level = feature.properties.levelofservice;
            switch(level) {
                default: color = sGris; break;
                case "green": color = sVerde; break;
                case "yellow": color = sAmarillo; break;
                case "orange": color = sNaranja; break;
                case "red": color = sRojo; break;
            }
            if(state.selected) {
                geoCanvas.drawShape(shape, { 
                    stroke: {
                        color: sAzul,
                        width: 8} 
                });
            }
            geoCanvas.drawShape(shape,{ 
                fill: {color: state.selected ? Verde : Naranja},
                stroke: {
                    color: color,
                    width: 5} 
            });
        }
         
    };
    
    
    layerPainter.prototype.paintLabel = function (labelCanvas, feature, shape, layer, map, state) {
        var label, labelName = "", i=0, properties = feature.properties;
        
        if(properties) {
            if(properties.customer_name) {
                labelName = properties.customer_name;
            }
            else {
            for(var key in properties) {
                if(i===0)
                    labelName = properties[key];
                i++;
            } 
            }
        } else {
            labelName = feature.id;
        }
        
        //label = "<span style='color: $color' class='label'>" + labelName + "</span>";
        var  id = feature.id;
        var count = feature.properties[id+"-"+id] || 0;
        label  = '<div class="labelwrapper">' +
                                '<div class="sensorLabel blueColorLabel">' +
                                '<div class="theader">' +
                                '<div class="leftTick blueColorTick"></div>' +
                                '<div class="rightTick blueColorTick"></div>' +
                                '<div class="name">'+labelName+'</div>' +
                                '</div>' +
                                '<div class="type">Valor : '+count +'</div>' +
                                '</div>' +
                                '</div>';
        if(state.level > 3) {     
            if(state.selected)
                labelCanvas.drawLabel(label.replace("$color", sRojo),shape, {});
            else
                labelCanvas.drawLabel(label.replace("$color", sBlanco),shape, {});
        }
    };
 
    return layerPainter;
});

