/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
        "luciad/shape/ShapeFactory",
        'samples/common/IconFactory',
        'luciad/util/ColorMap',
        "luciad/geodesy/GeodesyFactory",
        "luciad/geodesy/Geodesy",
        "recursos/js/Shapes",
        "./colorManager"
    ], function (FeaturePainter, ShapeFactory, IconFactory, ColorMap, GeodesyFactory, Geodesy, Shapes, colorManager) {
    
    function layerPainter() {
        this.outCircle = {
            draped: false,
            width: "20px",
            height: "20px",
            image: IconFactory.circle({
                width: 20,
                height: 20,
                fill: "rgba(0, 78, 146, 0.8)",
                stroke: "rgba(0, 78, 146, 0.8)"
            }),
            zOrder: 2
        };
        this.inCircle = {
            draped: false,
            width: "50px",
            height: "50px",
            image: IconFactory.circle({
                width: 30,
                height: 30,
                fill: "rgba(255,255,255,1)",
                stroke: "rgba(255,255,255,1)"
            }),
            zOrder: 3
        };
        
        this.densityStyle = {
            stroke: { width: 4 } 
        };
        this.regularStyle = {
            zOrder: 1,
            stroke: { width: 4, color: sAzul } 
        };
       /* colorManager.loadPalettes();
        var color0 = colorManager.getGradianColor("viridis_r", 0, 1).rgb;
        var color1 = colorManager.getGradianColor("viridis_r", 25, 1).rgb;
        var color2 = colorManager.getGradianColor("viridis_r", 50, 1).rgb;
        var color3 = colorManager.getGradianColor("viridis_r", 75, 1).rgb;
        var color4 = colorManager.getGradianColor("viridis_r", 100, 1).rgb;*/
        this.azul = {
            zOrder: 1,
            stroke: { width: 4, color: "#86d549" } 
        };
        this.verde = {
            zOrder: 2,
            stroke: { width: 5, color: "52c569" } 
        };
        this.amarillo = {
            zOrder: 3,
            stroke: { width: 6, color: "#1e9b8a" } 
        };
        this.naranja = {
            zOrder: 4,
            stroke: { width: 7, color: "#25858e" } 
        };
        this.rojo = {
            zOrder: 5,
            stroke: { width: 8, color: "38588c" } 
        };
        this.nostyle = {
            zOrder: 0,
            stroke: { width: 1, color: "#482173" } 
        };
    } 
    layerPainter.prototype = new FeaturePainter();
    layerPainter.prototype.constructor = layerPainter;
    layerPainter.prototype.getDetailLevelScales = function() {
        return [1 / 3000000, 1 / 2000000, 1 / 1000000,1 / 900000,1 / 4000000, 1/900000, 1/50000, 1/90000, 1/50000];
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
    var mayorConteo=0;
    var x = 1, y = 0;
    var lastH=0, update=0;
    x = parseInt($("#Densidad").val()) || 2;
    var gradient = ColorMap.createGradientColorMap([
                {level: y, color: "rgba(  0,   0,   255, 1.0)"},
                {level: y+=x, color: "rgba(  0, 125,   255, 1.0)"},
                {level: y+=x*2, color: "rgba(  0, 255,   255, 1.0)"},
                {level: y+=x*3, color: "rgba(  255, 255,   0, 1.0)"},
                {level: y+=x*4, color: "rgba(255, 0, 0, 1.0)"}
                ]);
    layerPainter.prototype.density = {
         colorMap: gradient
    };
    layerPainter.prototype.paintBody = function (geoCanvas, feature, shape, layer, map, state) {
        
        
        x = parseInt($("#Densidad").val());
        /*var h = parseFloat($("#AlturaCurvas").val());
        if(h !== lastH) {
            update = 0;
            lastH = h;
        }
          
        if(update <100) {
            var points = shape.pointCount;
            for(var i=0; i<points; i++) {
                var point = shape.getPoint(i);
                point.z = point.z * h;
            }
        }*/
        var valor;
        var historial = document.getElementById("mostrarMatrizS").checked;
        
        if(feature.geometry.x) {
            geoCanvas.drawShape(shape, this.outCircle);
        } else {
        if(x<10) {
            valor = 0;
            
            var style = this.densityStyle;
            if(historial === true) {
                if(!feature.properties.ValorHistorial)
                    return false;
            } else {
                if(!feature.properties.Valor)
                    return false;
            }
            geoCanvas.drawShape(shape, style);
            
        } else {
            
            var textStyle = {
                draped: false,
                width: "30px",
                height: "30px",
                image: IconFactory.text(valor, {
                    width: 30,
                    height: 30,
                    fill: "rgba(0, 78, 146, 0.8)",
                    font: "9pt Arial"
                }),
                zOrder: 4
              };
            var style;
            if(historial===true)
                valor = feature.properties.ValorHistorial;
            else
                valor = feature.properties.Valor;
            mayorConteo = valor > mayorConteo? valor: mayorConteo;
            var p = (valor / mayorConteo) * 100;
            var h, colorShape;
            if(!p)
                return false;
            else {
                if(p < 20) {
                    style = this.azul;
                    h=500;
                } else {
                    if(p < 40) {
                        style = this.verde;
                        h=750;
                    } else {
                        if(p < 60) { 
                            style = this.amarillo;
                            h = 1000;
                        } else {
                            if(p < 80) {
                                style = this.naranja;
                                h = 1250;
                            } else {
                                style = this.rojo;
                                h = 1500;
                            }
                        }
                    }
                }
            }
            var point1, point2, np = shape.pointCount-1;
            point1 = shape.getPoint(0);
            point2 = shape.getPoint(np);
            colorShape = Shapes.create3dArcBy2Points(layer.model.reference, point1, point2, h, feature.id, feature.properties);
            geoCanvas.drawShape(colorShape.shape, style);
        }
        }
        
    };
    
 
    return layerPainter;
});



