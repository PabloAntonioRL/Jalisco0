/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
        "luciad/shape/ShapeFactory",
        "recursos/js/simple3DMeshes/Simple3DMeshFactory"
    ], function (FeaturePainter, ShapeFactory, Simple3DMeshFactory) {
    
    function layerPainter() {
        this.style0 = {
            width: "30px",
            height: "30px",
            image: "data/icons/sonido/speaker0.png",
            draped: false,
            zOrden: 3
        };
        this.style1 = {
            width: "30px",
            height: "30px",
            image: "data/icons/sonido/speaker1.png",
            draped: false,
            zOrden: 3
        };
        this.style2 = {
            width: "30px",
            height: "30px",
            image: "data/icons/sonido/speaker2.png",
            draped: false,
            zOrden: 3
        };
        this.style3 = {
            width: "30px",
            height: "30px",
            image: "data/icons/sonido/speaker3.png",
            draped: false,
            zOrden: 3
        };
        this.styleS0 = {
            width: "40px",
            height: "40px",
            image: "data/icons/sonido/speaker0.png",
            draped: false,
            zOrden: 3
        };
        this.styleS1 = {
            width: "40px",
            height: "40px",
            image: "data/icons/sonido/speaker1.png",
            draped: false,
            zOrden: 3
        };
        this.styleS2 = {
            width: "40px",
            height: "40px",
            image: "data/icons/sonido/speaker2.png",
            draped: false,
            zOrden: 3
        };
        this.styleS3 = {
            width: "40px",
            height: "40px",
            image: "data/icons/sonido/speaker3.png",
            draped: false,
            zOrden: 3
        };
        
        this.csv = { 
            fill: {color: Verde  },
            stroke: {
                color: sGris,
                width: 2} 
        };
        this.csa = { 
            fill: {color: Amarillo  },
            stroke: {
                color: sGris,
                width: 2} 
        };
        this.csr = { 
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
        
        /*var radio;// = Math.random() * (100 - 30) + 30;
        radio = document.getElementById("labelChart0").innerHTML;
        if(radio) {
            radio = radio.replace("%", "");
            radio = parseInt(radio);
        } else 
            radio = 10;
        var datos = getDataSonidos();
        var id = feature.id;
        radio = datos[id] || radio;
        //var circle = ShapeFactory.createCircleByCenterPoint(shape.reference, shape, radio);
        //valor = radio;
            
            /*geoCanvas.drawShape(circle,{ 
                fill: {color: Verde  },
                stroke: {
                    color: sGris,
                    width: 2} 
            });*/
        var se = document.getElementById("selectSensorSonido").selectedOptions[0].value;
        var id = feature.properties.id+"";
        var valor=0; 
        var style, circleStyle;
        var selFen = document.getElementById("selectorDecibeles").selectedOptions[0].value;
        if(layer.label === "Sensores Sonido (H)" && selFen !== "3") {
            switch(selFen) {
                case "0": valor = feature.properties["Decibeles A"] || 0; break;
                case "1": valor = feature.properties["Decibeles C"] || 0; break;
                case "2": valor = feature.properties["Decibeles SPL"] || 0; break;
            }
        } else {
            var leqA = feature.properties["Decibeles A"] || 0;
            valor = leqA > valor? leqA: valor;
            var leqC = feature.properties["Decibeles C"] || 0;
            valor = leqC > valor? leqC: valor;
            var leqS = feature.properties["Decibeles SPL"] || 0;
            valor = leqS > valor? leqS: valor;
        }
        var color;
        if(!valor)
            style = se === id? this.styleS0: this.style0;
        else {
            if(valor<55) {
                style = se === id? this.styleS1: this.style1;
                circleStyle = this.csv;
                color = Verde;
            } else {
                if(valor < 75) {
                    style = se === id? this.styleS2: this.style2;
                    circleStyle = this.csa;
                    color = Amarillo;
                } else {
                    style = se === id? this.styleS3: this.style3;
                    circleStyle = this.csr;
                    color = Rojo;
                }
            }
        }
        
        geoCanvas.drawIcon(shape.focusPoint, style);
        
        var radio = valor;
        if(!radio)
            return 0;
        var circulo = document.getElementById("verCirculo").checked;
        if(circulo === true) {
            var circle = ShapeFactory.createCircleByCenterPoint(shape.reference, shape, 70);
            geoCanvas.drawShape(circle, circleStyle);
        }

        var icon3d = document.getElementById("iconos3d").checked;
        if( icon3d === true) {
            var domeStyle = {
                mesh: Simple3DMeshFactory.create3DDome(70, 50),
                color: color,
                rotation: {
                    x: 180
                }
            };
            geoCanvas.drawIcon3D(shape, domeStyle);
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
        var datos = getDataSonidos();
        var id = feature.id;
        var valor =0, leq="Leq";
        var selFen = document.getElementById("selectorDecibeles").selectedOptions[0].value;
        if(layer.label === "Sensores Sonido (H)" && selFen !== "3") {
            switch(selFen) {
                case "0": valor = feature.properties["Decibeles A"] || 0; leq = "Decibeles A"; break;
                case "1": valor = feature.properties["Decibeles C"] || 0; leq = "Decibeles C"; break;
                case "2": valor = feature.properties["Decibeles SPL"] || 0; leq = "Decibeles SPL"; break;
            }
        } else {
            var leqA = feature.properties["Decibeles A"] || 0;
            if(leqA > valor) {
                valor = leqA;
                leq = "Decibeles A";
            }
            var leqC = feature.properties["Decibeles C"] || 0;
            if(leqC > valor) {
                valor = leqC;
                leq = "Decibeles C";
            }
            var leqS = feature.properties["Decibeles SPL"] || 0;
            if(leqS > valor) {
                valor = leqS;
                leq = "Decibeles SPL";
            }
        }
        //label = "<span style='color: $color' class='label'>" + labelName + "</span>";
        label  = '<div class="labelwrapper">' +
                                '<div class="sensorLabel blueColorLabel">' +
                                '<div class="theader">' +
                                '<div class="leftTick blueColorTick"></div>' +
                                '<div class="rightTick blueColorTick"></div>' +
                                '<div class="name">'+labelName+'</div>' +
                                '</div>' +
                                '<div class="type">'+leq+': '+valor+'</div>' +
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

