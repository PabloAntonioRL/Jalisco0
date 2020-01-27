/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
        "luciad/shape/ShapeFactory",
        'samples/common/IconFactory',
        "recursos/js/Util",
        "./colorManager"
    ], function (FeaturePainter, ShapeFactory, IconFactory, Util, colorManager) {
    
    var painterOptions={};
    function layerPainter() {
        colorManager.loadPalettes("selectorColor");
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
    var Amarillo = "rgba( 245, 255, 46 , 0.7)", sAmarillo = "rgb( 245, 255, 46 )";
     
    var maxCount = {}, update = 0;
    var maxPower = {}, lastH = 0;
    var maxH = {};
    layerPainter.prototype.paintBody = function (geoCanvas, feature, shape, layer, map, state) {
        //var selectedLayer = document.getElementById("LayerName").value;
        var label = layer.label;
        var options;
        /*if(label) {
            painterOptions[label] = newOptions();
            options = painterOptions[label];
        } else {*/
            if(!painterOptions[label]) {
                painterOptions[label] = newOptions();
            } 
            options = painterOptions[label];
        //}
        
        
        var shape3d = feature.shape.shape3d;
        
        
        var valor, alt;
        var historial = document.getElementById("mostrarHistorilGrid").checked;
        if(options.labelValue && options.labelValue !== "0") {
            valor = parseInt(feature.properties[options.labelValue]) || 0;
        } else {
            if(historial === false) {
                if(!feature.properties.power)
                    feature.properties.power = Util.getRandom(0, 100);
                valor = feature.properties.power;
            } else {
                if(!feature.properties.powerH)
                    feature.properties.powerH = Util.getRandom(0, 7);
                valor = feature.properties.powerH;
            }
        }
        if(historial === false) {
            if(!maxCount[label]) {
                maxCount[label] = 0;
            }
            if(valor > maxCount[label]) {
                maxCount[label] = valor;
                update = 0;
            }
            var maxHeight = parseInt($("#gridHeigth").val()) || 2000;
            if(lastH !== maxHeight) {
                lastH = maxHeight;
                update = 0;
            }
            alt = (valor / maxCount[label]) * maxHeight;
        } else {
            if(!maxH["alt"]) {
                maxH["alt"] = 0;
            }
            if(valor > maxH["alt"]) {
                maxH["alt"] = valor;
                update = 0;
            }
            var maxHeight = parseInt($("#gridHeigth").val()) || 2000;
            if(lastH !== maxHeight) {
                lastH = maxHeight;
                update = 0;
            }
            alt = (valor / maxH["alt"]) * maxHeight;
        }
        if(alt && !shape3d || update <100 || historial === true) {
            if(feature.properties.minimumHeight)
                shape3d = ShapeFactory.createExtrudedShape(
                    shape.reference, shape, feature.properties.minimumHeight, alt);
            else
                shape3d = ShapeFactory.createExtrudedShape(
                    shape.reference, shape, 0, alt);
            feature.shape.shape3d = shape3d;
            update ++;
        }
        
        if(historial === false) {
            if(!feature.properties.promedio) {
                var pro = feature.properties.power / feature.properties.value;
                feature.properties.promedio = pro;
            }
            var poder = feature.properties.promedio;
            if(!maxPower[label]) {
                maxPower[label] = 0;
            }
            if(poder > maxPower[label]) {
                maxPower[label] = poder;
            }
            var porcentP = (poder/maxPower[label]) * 100;
            var porcentV = (valor/maxCount[label]) * 100;
        } else {
            
            //if(!feature.properties.promedioH) {
                var pro = feature.properties.powerH / feature.properties.value;
                feature.properties.promedioH = pro;
            //}
            var poder = feature.properties.promedioH;
            if(!maxH["prom"]) {
                maxH["prom"] = 0;
            }
            if(poder > maxH["prom"]) {
                maxH["prom"] = poder;
            }
            var porcentP = (poder/maxH["prom"]) * 100;
            var porcentV = (valor/maxH["alt"]) * 100;
        }
        var selectColor = document.getElementById("selectorColor").selectedOptions[0].value;
        var opasity = document.getElementById("gridTransparencia").checked;
        opasity = opasity === true? 0.5: 1;
        var color = colorManager.getGradianColor(selectColor, porcentP, opasity);
        
            geoCanvas.drawShape(shape3d? shape3d : shape,{ 
                fill: {color: state.selected ? color.rgb : color.rgba},
                stroke: {
                    color: state.selected ? sBlanco : color.rgb,
                    width: 1} 
            });
            
        
    };
    
    
    
    layerPainter.prototype.paintLabel = function (labelCanvas, feature, shape, layer, map, state) {
        var label, labelName = "", i=0, properties = feature.properties;
        
        //var selectedLayer = document.getElementById("LayerName").value;
        var label = layer.label;
        var options;
        /*if(label === selectedLayer) {
            painterOptions[label] = newOptions();
            options = painterOptions[label];
        } else {*/
            if(!painterOptions[label]) {
                painterOptions[label] = newOptions();
            } 
            options = painterOptions[label];
        //}
        
        var keyLabel = options.label;
        if(keyLabel === "0") {
            return null;
        }
        if(properties) {
            if(properties[keyLabel]) {
                labelName = properties[keyLabel];
            }
            else {
                for(var key in properties) {
                    if(i===0) {
                         labelName = properties[key];
                         break;
                    }
                } 
                if(labelName==="") {
                    labelName = feature.id;
                }
            }
        } else {
            labelName = feature.id;
        }
        
        label = "<span style='color: $color' class='label'>" + labelName + "</span>";
        //if(state.level > 3) {     
            if(state.selected)
                labelCanvas.drawLabel(label.replace("$color", sRojo),shape.focusPoint, {});
            else
                labelCanvas.drawLabel(label.replace("$color", sBlanco),shape.focusPoint, {});
        //}
    };
 
    function newOptions(label) {
        return {
            //maxValue: 0,
                color:  "0",
                //radio: parseInt(document.getElementById("layerRadio").value) || 30,
                label: "0",
                name:  label,
                labelValue:  "0"
                //density: parseInt($("#ltHeatLayer").val()) || 3
            };
    }
    return {
        crearPainter: function (label) {
            if(label && !painterOptions[label]) {
                painterOptions[label] = newOptions();
            }
            if(label) {
                maxCount[label] = 0;
                maxPower[label] = 0;
            }
            return new layerPainter;
        }
    };
});

