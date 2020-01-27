/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
        "luciad/shape/ShapeFactory",
        'samples/common/IconFactory',
        'luciad/util/ColorMap'
    ], function (FeaturePainter, ShapeFactory, IconFactory, ColorMap) {
    
    function layerPainter() {
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
    var maxRadio = 0, minRadio = 1;
    
    var x = 1, y = 0;
    x = Math.round(parseFloat($("#Densidad").val())) || 2;
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
        var icon;
        var dimension = 30, d=25;
        icon = IconFactory.circle({stroke: sBlanco, fill: sGrisOscuro, width: dimension, height: dimension});
        var url = "../../proyecto/recursos/icons/marca.png"; 
        var regularStyle = {
            url: url,
            width: (d*2)+"px",
            height: (d*2)+"px",
            draped: false
        };
        var densityStyle = {
            width: dimension+"px",
            height: dimension+"px",
            draped: true
        };
        var style = state.selected ? regularStyle :
                (layerPainter.prototype.density ? densityStyle : regularStyle);
        //console.log(feature.geometry.coordinateType);
        if(!feature.geometry.x) {
                    geoCanvas.drawShape(shape,{ 
                    fill: {color: state.selected ? Verde : Azul},
                    stroke: {
                        color: state.selected ? sRojo : sGris,
                        width: 2} 
                });
        }
        else {
            var  dimension= 14;
             geoCanvas.drawIcon(shape.focusPoint, style);
        }
    };
    
 
    return layerPainter;
});

