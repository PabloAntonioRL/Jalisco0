/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    
], function () {
    function getBalloon(feature, data, detallesParametros) {
        var etiqueta = "", etiquetaDatos="";
        var _etiqueta = //block, flex
                '<div class="labelDatos" style="display:block !important">' +
                '<table>'+
                 '$DATOS' +
                '</table>' +
                '</div>';
        var _etiquetaDatos = '<tr bgcolor="$COLOR">' +
                '<td align="center">' +
                '<b>$Propertie</b>' +
                '</td >' +
                '<td align="center">' +
                '<b>$Value</b>' +
                '</td >' +
                '</tr>';
        //var name = "Transmision en vivo";
        var properties = feature.properties;
        var i=0, color;
        var date = new Date();
        var h = date.getHours() <10 ? "0"+date.getHours(): date.getHours();
        var m = date.getMinutes() <10 ? "0"+date.getMinutes(): date.getMinutes();
        var s = date.getSeconds() <10 ? "0"+date.getSeconds(): date.getSeconds();
        var actualTime = h+":"+m;
        if(properties) {
            for (var key in properties) {
                if(i%2 === 0 )
                    color = '#19232c';
                else
                    color = '';
                i++;
                if(key === "Hora") 
                    properties[key] = actualTime;
                etiquetaDatos+= _etiquetaDatos.replace("$Propertie", key+":").replace("$Value", properties[key]).replace("$COLOR", color);
            }
        }
        /*var estacion = feature.properties.Id;
        var data = getActualDataAmbiental(estacion);
        for(var par in data) {
            var nombre = data[par].nombre;
            var valor = data[par].valor;
            var unidad = data[par].unidad;
            //for(var j=0; j<parametros[i].length; j++) {
                if(i%2 === 0 )
                    color = '#19232c';
                else
                    color = '';
                if(par !== "calidad") {
                    if(key === "Direccion del viento") {
                        valor = getDireccionViento(valor);
                        etiquetaDatos+= _etiquetaDatos.replace("$Propertie", nombre+":").replace("$Value", valor).replace("$COLOR", color);
                    } else
                        etiquetaDatos+= _etiquetaDatos.replace("$Propertie", nombre+":").replace("$Value", valor+" "+unidad).replace("$COLOR", color);
                }
                i++;
            //}
        }
        var color1;
        if(i%2 === 0 ) {
            color = '#19232c';
            color1 = '';
        } else {
            color = '';
            color1 = '#19232c';
        }
        //etiquetaDatos+= _etiquetaDatos.replace("$Propertie", "Calidad del Aire:").replace("$Value", "Buena").replace("$COLOR", color);
        */
        etiqueta = _etiqueta.replace("$DATOS", etiquetaDatos);
        var balloon;
        //balloon = etiqueta.replace('$NAME', name);
        //console.log(feature.properties.name);
        return etiqueta;   
    }
    function getDireccionViento(valor) {
        var nombres= {'0':'Este','1':'Este-Noreste','2':'Noreste','3':'Nor-Noreste','4':'Norte','5':'Nor-Noroeste','6':'Noroeste',
               '7':'Oeste-Noroeste','8':'Oeste','9':'Oeste-Suroeste','10':'Suroeste','11':'Sur-Suroeste','12':'Sur',
               '13':'Sur-Sureste','14':'Sureste','15':'Este-Sureste'};
        return nombres[valor];
    }
    return  { getBalloon: getBalloon };
});


