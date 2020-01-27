/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
        "luciad/shape/ShapeFactory",
        "luciad/view/style/PathLabelPosition",
        "luciad/view/style/PathLabelRotation"
    ], function (FeaturePainter, ShapeFactory, PathLabelPosition, PathLabelRotation) {
    
    function layerPainter() {
        this.sensorStyle = {
                width: "40px",
                height: "40px",
                image: "data/icons/sensor4.png",
                draped: false,
                zOrden: 10
        };
        this.selectSensorStyle = {
                width: "45px",
                height: "45px",
                image: "data/icons/sensor4.png",
                zOrden: 10
        };
        this.labelVector = {
            positions: PathLabelPosition.ABOVE,
            rotation: PathLabelRotation.FIXED_LINE_ANGLE
        };
        this.vectorR = {
            stroke: {
                color: sRojo,
                width: 5}
        };
        this.vectorV = {                
            stroke: {
                color: sVerde,
                width: 5}
        };
        this.vectorA = {                
            stroke: {
                color: sAmarillo,
                width: 5}
        };
        this.vectorG = {                
            stroke: {
                color: sGris,
                width: 5}
        };
        this.selectedVector = { 
            stroke: {
                color: sAzul,
                width: 8} 
        };
        
        this.circuloV = { 
            fill: {color: Verde  },
            stroke: {
                color: sGris,
                width: 2} 
        };
        this.circuloA = { 
            fill: {color: Amarillo  },
            stroke: {
                color: sGris,
                width: 2} 
        };
        this.circuloR = { 
            fill: {color: Rojo  },
            stroke: {
                color: sGris,
                width: 2} 
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
    var sAmarillo = "rgb( 252, 241, 0 )", Amarillo = "rgba( 252, 241, 0, 0.5 )";
    var maxRadio = 0, minRadio = 1;
    //var reference = ReferenceProvider.getReference("CRS:84");
    var mayorConteo=0;
    layerPainter.prototype.paintBody = function (geoCanvas, feature, shape, layer, map, state) {
        
        //valor = radio;
        if(feature.geometry.x || feature.properties.Tipo === "Nodo") {
            var cir = document.getElementById("selectorCirculos").checked;
            if(cir === true) {
                var id = feature.id;
                var radio = feature.properties[id+"-"+id] || 0;
                var properties = feature.properties;
                var total = properties["Total dispositivos"];
                if(total >0) {
                    if(total > mayorConteo) {
                        mayorConteo = total;
                        console.log(mayorConteo);
                    }
                    var cStyle;
                    var porcentaje = (total / mayorConteo) *100;
                    radio = porcentaje * 5;
                    //radio = radio >300? 300: radio;
                    if(porcentaje < 34)
                        cStyle = this.circuloV;
                    else {
                        if(porcentaje < 66)
                            cStyle = this.circuloA;
                        else {
                            cStyle = this.circuloR;
                        }
                    }
                    var circle = ShapeFactory.createCircleByCenterPoint(shape.reference, shape, radio);
                    geoCanvas.drawShape(circle, cStyle);
                }
            }
            
            geoCanvas.drawIcon(shape, this.sensorStyle);
        } else {
            var style;
            var level = feature.properties.levelofservice || feature.properties["Nivel de servicio"] || "Sin definir";
            var id = layer.label;
            
                switch(level.toLowerCase()) {
                    default: style = this.vectorG; break;
                    case "green":
                    case "verde": style = this.vectorV; break;
                    case "yellow":
                    case "amarillo": style = this.vectorA; break;
                    case "red":
                    case "rojo": style = this.vectorR; break;
                    case "sin definir": style = this.vectorG; break;
                }
               
                if(state.selected) {
                    geoCanvas.drawShape(shape, this.selectedVector);
                }
                geoCanvas.drawShape(shape, style);
            
        }
         
    };
    
    
    layerPainter.prototype.paintLabel = function (labelCanvas, feature, shape, layer, map, state) {
        var label, labelName = "", i=0, properties = feature.properties;
        
        if(properties) {
            if(properties.Nombre) {
                labelName = properties.Nombre;
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
        
        if(feature.geometry.x || feature.properties.Tipo === "Nodo") {
            var  id = feature.id;
            var count = feature.properties[id+"-"+id] || 0;
            var properties = feature.properties;
            var total = feature.properties["Total dispositivos"];
            
            label  = '<div class="labelwrapper">' +
                                    '<div class="sensorLabel blueColorLabel">' +
                                    '<div class="theader">' +
                                    '<div class="leftTick blueColorTick"></div>' +
                                    '<div class="rightTick blueColorTick"></div>' +
                                    '<div class="name">'+labelName+'</div>' +
                                    '</div>' +
                                    '<div class="type">ID : '+id +'</div>' +
                                    '<div class="type">Total : '+total +'</div>' +
                                    '</div>' +
                                    '</div>';
            if(state.level > 3) {     
                if(state.selected)
                    labelCanvas.drawLabel(label.replace("$color", sRojo),shape, {});
                else
                    labelCanvas.drawLabel(label.replace("$color", sBlanco),shape, {});
            }
        } else {
            labelName = feature.properties.Nombre;
            var from = feature.properties.Desde;
            var to = feature.properties.Hasta;
            label  = '<div class="labelwrapper">' +
                                    '<div class="sensorLabel blueColorLabel">' +
                                    '<div class="theader">' +
                                    '<div class="leftTick blueColorTick"></div>' +
                                    '<div class="rightTick blueColorTick"></div>' +
                                    '<div class="name">'+labelName+'</div>' +
                                    '</div>' +
                                    '<div class="type">Desde : '+from +'</div>' +
                                    '<div class="type">Hasta : '+to +'</div>' +
                                    '</div>' +
                                    '</div>';
            //label = "<span style='color: $color' class='label'>" + labelName + "</span>";
            
            labelCanvas.drawLabel(label,shape, {});
        }
    };
 
    return layerPainter;
});

