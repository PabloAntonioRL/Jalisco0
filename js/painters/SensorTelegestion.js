/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(["luciad/view/feature/FeaturePainter",
    "luciad/view/style/PathLabelPosition",
    "luciad/view/style/PathLabelRotation",
    "luciad/view/style/PointLabelPosition"
    ], function (FeaturePainter, PathLabelPosition, PathLabelRotation, PointLabelPosition) {
    
    function layerPainter() {
        this._luminariaTramosStyle = {
            priority: 5,
            positions: PathLabelPosition.ABOVE,
            rotation: PathLabelRotation.FIXED_LINE_ANGLE
        };
        this.labelContactor = {
            priority: 2,
            positions: PointLabelPosition.SOUTH,
            offset: 10
        };
        this.alertLabel = {
            priority: 4,
            positions: PointLabelPosition.NORTH_EAST,
            offset: [7, -1]
        };
        this.alertLabel2 = {
            priority: 4,
            positions: PointLabelPosition.NORTH_EAST,
            offset: [3, -1]
        };
        
        this.styleOff = {
            width: "40px",
            height: "40px",
            image: "data/icons/telegestion/bisnagaR2.png",
            draped: false,
            zOrden: 3
        };
        this.styleOn = {
            width: "40px",
            height: "40px",
            image: "data/icons/telegestion/bisnagaOn2.png",
            draped: false,
            zOrden: 3
        };
        this.styleOffline = {
            width: "30px",
            height: "30px",
            image: "data/icons/telegestion/bisnagaOff2.png",
            draped: true
        };
        
        this.styleOffa = {
            width: "40px",
            height: "40px",
            image: "data/icons/telegestion/bisnagaR2a.png",
            draped: false,
            zOrden: 3
        };
        this.styleOna = {
            width: "40px",
            height: "40px",
            image: "data/icons/telegestion/bisnagaOn2a.png",
            draped: false,
            zOrden: 3
        };
        this.styleOfflinea = {
            width: "30px",
            height: "30px",
            image: "data/icons/telegestion/bisnagaOff2a.png",
            draped: true
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
        
        
        var icon;
        var zona = feature.properties.zona;
        /*try {
            switch(zona) {
                case "centro": encendido = document.getElementById("lumCentro").checked; break;
                case "norte": encendido = document.getElementById("lumNorte").checked; break;
                case "sur": encendido = document.getElementById("lumSur").checked; break;
                case "poniente": encendido = document.getElementById("lumPoniente").checked; break;
                case "oriente": encendido = document.getElementById("lumOriente").checked; break;
                default: encendido = true; break;
            }
        } catch(e) {
            console.log("No se identifico la zona "+zona);
        }*/
        var name = feature.properties.Name || "";
        if(name === "TIMOTEO LOZANO A06 FTE 610�" || name === "TIMOTEO LOZANO A04 FTE 510�" || name === "TIMOTEO LOZANO A02 FTE 114�")
            return 0;
        
        if(feature.geometry.x) {
            
            var encendido= feature.properties.Estado;
            var style;
            var alertas = feature.properties.Alertas;
            var online = feature.properties["Conexion"];
            if(!alertas) {
                if(online !== "En linea")
                    style = this.styleOffline;
                else {
                    if(encendido===true || encendido === "TRUE") 
                        style = this.styleOn;
                     else 
                        style = this.styleOff;
                }
            } else {
                if(online !== "En linea")
                    style = this.styleOfflinea;
                else {
                    if(encendido===true || encendido === "TRUE") 
                        style = this.styleOna;
                     else 
                        style = this.styleOffa;
                }
            }
            geoCanvas.drawIcon(shape, style);
            
            
        }
        else {
            geoCanvas.drawShape(shape,{ 
                fill: {color: state.selected ? Verde : Azul},
                stroke: {
                    color: state.selected ? sRojo : Verde,
                    width: 6} 
            });
         }
         
         var coor = feature.properties.coordenada;
         if(coor === "pendiente") {
             var x = feature.geometry.x;
             var y = feature.geometry.y;
             coor = "Longitud "+x+" Latitud "+y;
             feature.properties.coordenada = coor;
         }
    };
    
    
    layerPainter.prototype.paintLabel = function (labelCanvas, feature, shape, layer, map, state) {
        var label, labelName = "", i=0, properties = feature.properties;
        
        if(properties) {
            if(properties.Name) {
                labelName = properties.Name;
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
        
                var alertas = feature.properties.Alertas;
                if(alertas > 0) {
                    alertas = alertas >=100? 99: alertas;
                    var labelA = "<span style='color: $color'>" + alertas + "</span>";
                    var as;
                    if(alertas >= 10)
                        as = this.alertLabel2;
                    else
                        as = this.alertLabel;
                    labelCanvas.drawLabel(labelA, shape, as);
                }
        label = "<span style='color: $color' class='label'>" + labelName + "</span>";
        if(state.level > 3) {
            if(layer.label === "Luminarias Tramos") {
                labelCanvas.drawLabelOnPath(label.replace("$color", sBlanco),shape, this._luminariaTramosStyle);
            } else {
                if(layer.label === "Bisnagas") {
                    if(state.selected)
                        labelCanvas.drawLabel(label.replace("$color", sRojo),shape, this.labelContactor);
                    else
                        labelCanvas.drawLabel(label.replace("$color", sBlanco),shape, this.labelContactor);
                }
            }
        }
    };
 
    return layerPainter;
});

