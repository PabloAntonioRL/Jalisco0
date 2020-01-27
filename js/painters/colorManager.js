/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([], function () {
   
    var sBlanco = 'rgb(255, 255, 255)', Blanco = 'rgba(255, 255, 255, opasity)';
    var sGrisOscuro = 'rgb(50, 50, 50)';
    var sGrisClaro = 'rgb(200, 200, 200)', GrisClaro = 'rgba(200, 200, 200, opasity)';
    var sRojo = 'rgb(228, 50, 30)', Rojo = 'rgba(228, 50, 30, opasity)';
    var sRojoClaro = "rgb(226, 93, 107)";
    var sRosa = "rgb(213, 93, 226)", Rosa = "rgba(213, 93, 226, opasity)";
    var sAmarilloClaro = 'rgb(255, 255, 204)', AmarilloClaro = 'rgba(255, 255, 204, opasity)';
    var sGris = 'rgb(230, 230, 230)', Gris = "rgba(230,230,230, opasity)";
    var sNaranjaClaro = 'rgb(255, 239, 204)';
    var sNaranja = 'rgb(255, 174, 102)', Naranja = 'rgba(255, 174, 102, opasity)';
    var Verde = "rgba(50,230,50,opasity)", sVerde = "rgb(50,230,50)";
    var sMorado ="rgb(200,0,200)", Morado = "rgba(200,0,200, opasity)";
    var Amarillo = "rgba( 245, 255, 46 , opasity)", sAmarillo = "rgb( 245, 255, 46 )";
    var Azul = "rgba(70, 100, 230, opasity)", sAzul = "rgb(70, 100, 230)";
    var FullAzul = "rgba(0, 0, 255, opasity)", sFullAzul = "rgb(0, 0, 255)";
    var Celeste = "rgba( 93, 173, 226, opasity)", sCeleste = "rgb( 93, 173, 226 )";
    var VerdeClaro = "rgba( 134, 255, 132 , opasity)", sVerdeClaro = "rgb( 134, 255, 132 )";
    var palettes;
    
    function getColor(id, opasity) {
        id = typeof id==="string"? parseInt(id) : id;
        opasity = opasity+"" || "0.5";
        switch(id) {
            case 0: return {rgba: Azul.replace("opasity", opasity), rgb: sAzul};
            case 1: return {rgba: Celeste.replace("opasity", opasity), rgb: sCeleste};
            case 2: return {rgba: Verde.replace("opasity", opasity), rgb: sVerde};
            case 3: return {rgba: VerdeClaro.replace("opasity", opasity), rgb: sVerdeClaro};
            case 4: return {rgba: AmarilloClaro.replace("opasity", opasity), rgb: sAmarilloClaro};
            case 5: return {rgba: Amarillo.replace("opasity", opasity), rgb: sAmarillo};
            case 6: return {rgba: Naranja.replace("opasity", opasity), rgb: sNaranjaClaro};
            case 7: return {rgba: Naranja.replace("opasity", opasity), rgb: sNaranja};
            case 8: return {rgba: Rojo.replace("opasity", opasity), rgb: sRojo};
            case 0: return {rgba: Rosa.replace("opasity", opasity), rgb: sRosa};
            case 10: return {rgba: Blanco.replace("opasity", opasity), rgb: sBlanco};
            case 11: return {rgba: Morado.replace("opasity", opasity), rgb: sMorado};
            default: return {rgba: Gris.replace("opasity", opasity), rgb: sGris};
        }
    }
    
    function getColorByName(name, opasity) {
        opasity = opasity || "0.5";
       switch(name.toLowerCase()) {
            case "azul":        return {rgba: Azul.replace("opasity", opasity), rgb: sAzul};
            case "celeste":     return {rgba: Celeste.replace("opasity", opasity), rgb: sCeleste};
            case "verde":       return {rgba: Verde.replace("opasity", opasity), rgb: sVerde};
            case "verdeclaro":  return {rgba: VerdeClaro.replace("opasity", opasity), rgb: sVerdeClaro};
            case "amarilloclaro": return {rgba: AmarilloClaro.replace("opasity", opasity), rgb: sAmarilloClaro};
            case "amarillo":    return {rgba: Amarillo.replace("opasity", opasity), rgb: sAmarillo};
            case "naranjaclaro": return {rgba: Naranja.replace("opasity", opasity), rgb: sNaranjaClaro};
            case "naranja":     return {rgba: Naranja.replace("opasity", opasity), rgb: sNaranja};
            case "rojo":        return {rgba: Rojo.replace("opasity", opasity), rgb: sRojo};
            case "rosa":        return {rgba: Rosa.replace("opasity", opasity), rgb: sRosa};
            case "blanco":      return {rgba: Blanco.replace("opasity", opasity), rgb: sBlanco};
            case "morado":      return {rgba: Morado.replace("opasity", opasity), rgb: sMorado};
            case "gris":        return {rgba: Gris.replace("opasity", opasity), rgb: sGris};
            default:            return {rgba: Gris.replace("opasity", opasity), rgb: sGris};
        }
    }
    
    function getGradianColor(id, porcent, opasity) {
        //id = typeof id==="string"? parseInt(id) : id;
        opasity = opasity || "0.5";
        switch(id) {
            case "1": case 1: return getGradiantBlueRed(porcent, opasity);
            case "0": case 0: return getGradiantBlue(porcent, opasity);
            case "2": case 2: return getGradiantGreen(porcent, opasity);
            case "3": case 3: return getGradiantYellow(porcent, opasity);
            case "4": case 4: return getGradiantRed(porcent, opasity);
            case "5": case 5: return getGradiantPurple(porcent, opasity);
            default: var p = getCustomPalette(id, porcent, opasity);
                return p || {rgba: Gris.replace("opasity", opasity), rgb: sGris};
            //default: return {rgba: Gris.replace("opasity", opasity), rgb: sGris};
        }
    }
    
    function getGradiantGreen(porcent, opasity) {
        var r=20, g, b=50;
        porcent = porcent/100;
        g = Math.round(porcent * 180)+70;
        r = Math.round(porcent * 150);
        b = Math.round(porcent * 150);
        r = r>255? 255: r;
        g = g>255? 255: g;
        b = b>255? 255: b;
        return {rgb: "rgb("+r+","+g+","+b+")", rgba: "rgba("+r+","+g+","+b+", "+opasity+")"};
    }
    function getGradiantBlue(porcent, opasity) {
        var r=20, g, b=50;
        porcent = porcent/100;
        //porcent = 1-porcent;
        b = Math.round(porcent * 200)+70;
        r = Math.round(porcent * 200);
        g = Math.round(porcent * 200);
        r = r>255? 255: r;
        g = g>255? 255: g;
        b = b>255? 255: b;
        return {rgb: "rgb("+r+","+g+","+b+")", rgba: "rgba("+r+","+g+","+b+", "+opasity+")"};
    }
    function getGradiantRed(porcent, opasity) {
        var r=20, g, b=50;
        porcent = porcent/100;
        r = Math.round(porcent * 180)+70;
        g = Math.round(10);
        b = Math.round(10);
        r = r>255? 255: r;
        g = g>255? 255: g;
        b = b>255? 255: b;
        return {rgb:"rgb("+r+","+g+","+b+")", rgba: "rgba("+r+","+g+","+b+", "+opasity+")"};
    }
    function getGradiantYellow(porcent, opasity) {
        var r=20, g, b=50;
        porcent = porcent/100;
        g = Math.round(porcent * 155)+100;
        r = Math.round(porcent * 149)+96;
        b = Math.round(10);
        r = r>255? 255: r;
        g = g>255? 255: g;
        b = b>255? 255: b;
        return {rgb: "rgb("+r+","+g+","+b+")", rgba: "rgba("+r+","+g+","+b+", "+opasity+")"};
    }
    function getGradiantPurple(porcent, opasity) {
        var r=20, g, b=50;
        porcent = porcent/100;
        b = Math.round(porcent * 155)+100;
        r = Math.round(porcent * 94)+61;
        g = Math.round(10);
        r = r>255? 255: r;
        g = g>255? 255: g;
        b = b>255? 255: b;
        return {rgb: "rgb("+r+","+g+","+b+")", rgba: "rgba("+r+","+g+","+b+", "+opasity+")"};
    }
    
    function getGradiantBlueRed(porcent, opasity) {
        var rgb="", rgba="";
        if(porcent<=10) {
            rgb = sAzul;
            rgba = Azul;
        } else {
            if(porcent <=20) {
                rgb = "rgb(48, 166, 228)";
                rgba = "rgba(48, 166, 228, opasity)";
            } else {
                if(porcent<=30) {
                    rgb = "rgb(33, 215, 228)";
                    rgba = "rgba(33, 215, 228, opasity)";
                } else {
                    if(porcent <=40) {
                        rgb = "rgb(39, 228, 153)";
                        rgba = "rgba(39, 228, 153, opasity)";
                    } else {
                        if(porcent<=50) {
                            rgb = "rgb(62, 228, 65)";
                            rgba = "rgba(62, 228, 65, opasity)";
                        }else {
                            if(porcent<=60) {
                                rgb = "rgb(154, 225, 38)";
                                rgba = "rgba(154, 225, 38, opasity)";
                            } else {
                                if(porcent<=70) {
                                    rgb = "rgb(227, 222, 29)";
                                    rgba = "rgba(227, 222, 29, opasity)";
                                } else {
                                    if(porcent<=80) {
                                        rgb = "rgb(226, 182, 29)";
                                        rgba = "rgba(226, 182, 29, opasity)";
                                    } else {
                                        if(porcent<=90) {
                                            rgb = "rgb(227, 124, 28)";
                                            rgba = "rgba(227, 124, 28, opasity)";
                                        } else {
                                            rgb = sRojo;
                                            rgba = Rojo;
        }   }   }   }   }   }   }   }   }
        rgba = rgba.replace("opasity", opasity);
        return {rgb: rgb, rgba: rgba};
    }
    
    function getCustomPalette(id, porcent, opasity) {
        if(!palettes[id])
            return false;
        var pal = palettes[id];
        var i=0, index=10;
        var a = "#";
        if(opasity <1) {
            a = "#E6";
        }
        while(porcent > index && i <= 9) {
            index += 10;
            i++;
        }
        return {rgb: pal[i], rgba: pal[i].replace("#", a)};
        //return {rgb: pal[i], rgba: pal[i]+a};
    }
    
    function loadPalettes (div) {
        if(!palettes) {
        $.getJSON("data/color_palette.json", function (data) {
            palettes = data;
            var n = ["Azul", "Azul a Rojo"];
            var id = [0, 1];
            for(var i in palettes) {
                if(i === "RdBu" || i === "viridis_r" || i === "Accent") {
                    n[n.length] = i;
                    id[id.length] = i;
                }
            }
            try {
                setOptions(div, n, false, id);
            } catch(e) {
                
            }
        }).fail(function(e) {
            console.error(e);
        });
        }
    }
    function setOptions (div, options, firstOption, valueOptions) {
        document.getElementById(div).innerHTML = "";
            var base = "<option value='$VALUE'>$LABEL</option>", etiqueta = "";
            if(firstOption !== false) {
                if(!firstOption)
                    firstOption = firstOption || "Todos";
                etiqueta = base.replace("$VALUE", 0).replace("$LABEL", firstOption);
            }
                
            var  n = options.length, values=false;
            if(valueOptions) {
                if(valueOptions.length === n)
                    values = true;
            }
            for(var i =0; i<n; i++) {
                if(values)
                    etiqueta += base.replace("$VALUE", valueOptions[i]).replace("$LABEL", options[i]);
                else 
                    etiqueta += base.replace("$VALUE", i+1).replace("$LABEL", options[i]);
            }
            document.getElementById(div).innerHTML = etiqueta;
    }
    //loadPalettes();
    return {
        getColor: getColor,
        getColorByName: getColorByName,
        getGradianColor: getGradianColor,
        loadPalettes: loadPalettes
    };
});
