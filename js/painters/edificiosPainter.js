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
    var sRojo = 'rgb(255, 0, 0)', Rojo = 'rgb(249, 75, 15)';
    var sAmarilloClaro = 'rgb(255, 255, 204)';
    var sGris = 'rgb(230, 230, 230)', Gris = "rgb( 135, 135, 135)";
    var sNaranjaClaro = 'rgb(255, 239, 204)';
    var sNaranja = 'rgb(255, 174, 102)', Naranja = 'rgba(255, 174, 102, 0.5)';
    var Verde = "rgba(50,230,50,0.5)", sVerde = "rgb(50,230,50)";
    var sMorado ="rgb(200,0,200)", Morado = "rgba(200,0,200, 0.5)";
    var Azul = "rgba(70, 100, 230, 0.5)", sAzul = "rgb(70, 100, 230)";
    var VerdeClaro = "rgb( 134, 255, 132 )", sVerdeClaro = "rgb( 134, 255, 132 )";
    var maxRadio = 0, minRadio = 1;
    
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
        var color = Gris;
        var name = feature.properties.name;
        if(name ==="PARQUE METROPOLITANO DE LEÓN" || name === "Plaza Principal")
            color = VerdeClaro;
        if(name === "Palacio Municipal") 
            color = Rojo;
        if(!feature.geometry.x) {
                geoCanvas.drawShape(shape3d? shape3d : shape,{ 
                    fill: {color: color},
                    stroke: {
                        color: state.selected ? sRojo : color,
                        width: 1} 
                });
            
        }
        else {
            var icon, dimension= 14;
            if(state.selected) 
                icon = IconFactory.circle({stroke: sBlanco, fill: sRojo, width: dimension, height: dimension});
            else 
                icon  = IconFactory.circle({stroke: sNaranja, fill: sNaranjaClaro, width: dimension, height: dimension});
            geoCanvas.drawIcon(shape.focusPoint,{
                width: dimension+"px",
                height: dimension+"px",
                image: icon
            });
         }
    };
    
    
    layerPainter.prototype.paintLabel = function (labelCanvas, feature, shape, layer, map, state) {
        var label, labelName = "", i=0, properties = feature.properties;
        
        if(properties) {
            if(properties.Folio_pred) {
                labelName = properties.Folio_pred;
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
        
        label = "<span style='color: $color' class='label'>" + labelName + "</span>";
        if(state.level > 3) {     
            if(state.selected)
                labelCanvas.drawLabel(label.replace("$color", sRojo),shape.focusPoint, {});
            else
                labelCanvas.drawLabel(label.replace("$color", sBlanco),shape.focusPoint, {});
        }
    }
 
    return layerPainter;
});

