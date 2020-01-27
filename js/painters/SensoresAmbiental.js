/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter"
    ], function (FeaturePainter) {
    
    function layerPainter() {
        this.HoverStyle = {
                width: "40px",
                height: "40px",
                image: "data/icons/ambiental/nube0.png",
            draped: false
            };
        this.styleLevel0 = {
            width: "40px",
            height: "40px",
            image: "data/icons/ambiental/nube0.png",
            draped: false
        };
        this.styleLevel1 = {
            width: "40px",
            height: "40px",
            image: "data/icons/ambiental/nube1.png",
            draped: false
        };
        this.styleLevel2 = {
            width: "40px",
            height: "40px",
            image: "data/icons/ambiental/nube2.png",
            draped: false
        };
        this.styleLevel3 = {
            width: "40px",
            height: "40px",
            image: "data/icons/ambiental/nube3.png",
            draped: false
        };
        this.styleLevel4 = {
            width: "40px",
            height: "40px",
            image: "data/icons/ambiental/nube4.png",
            draped: false
        };
        this.styleLevel5 = {
            width: "40px",
            height: "40px",
            image: "data/icons/ambiental/nube5.png",
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
        
        //if(feature.id !==1)
          //  return 0;
        
        if(!feature.geometry.x) {
            
            geoCanvas.drawShape( shape,{ 
                fill: {color: Azul},
                stroke: {
                    color: state.selected ? sRojo : sGris,
                    width: 2} 
            });
            
        }
        else {
            if(!shape.HoverStyle)
                shape.HoverStyle = this.HoverStyle;
            var style, estacion = feature.properties.Id;
            //var datos = getActualDataAmbiental(estacion);
            //var calidad = datos.calidad || "Sin definir";
            var calidad = feature.properties["Calidad del Aire"] || "";
            //var valor=document.getElementById("calActual").innerHTML;
            //var selectParam = document.getElementById("selectorParametroTR").selectedOptions[0].innerHTML;
            switch(calidad.toLowerCase()) {
                case "buena": 
                    style = this.styleLevel1; break;
                //case "satisfactoria":
                //case "regular": 
                case "aceptable":
                    style = this.styleLevel2; break;
                case "mala":
                //case "no satisfactoria":
                    style = this.styleLevel3; break;
                case "muy mala": 
                    style = this.styleLevel4; break;
                case "extremadamente mala": 
                    style = this.styleLevel5; break;
                default: style = this.styleLevel0; break;
            }
            geoCanvas.drawIcon(shape, style);
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

