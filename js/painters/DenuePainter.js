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
        this.style0 = {
            width: "30px",
            height: "30px",
            image: "../recursos/icons/lugares/iconEscuela.png",
            draped: false
        };
        this.style1 = {
            width: "30px",
            height: "30px",
            image: "../recursos/icons/lugares/iconParque.png",
            draped: false
        };
        this.style2 = {
            width: "30px",
            height: "30px",
            image: "../recursos/icons/lugares/iconHospital.png",
            draped: false
        };
        this.style3 = {
            width: "30px",
            height: "30px",
            image: "../recursos/icons/lugares/iconGimnasio.png",
            draped: false
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
    var maxRadio = 0, minRadio = 1;
    
    layerPainter.prototype.paintBody = function (geoCanvas, feature, shape, layer, map, state) {
        var style;
        var tipo = feature.properties.TIPO;
        switch(tipo) {
            case "Primaria": style = this.style0; break;
            case "Parque": style = this.style1; break;
            case "Centro de Salud": style = this.style2; break;
            case "Unidad Deportiva": style = this.style3; break;
        }
        geoCanvas.drawIcon(shape, style);
         
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
                labelCanvas.drawLabel(label.replace("$color", sRojo),shape, {});
            else
                labelCanvas.drawLabel(label.replace("$color", sBlanco),shape, {});
        }
    }
 
    return layerPainter;
});

