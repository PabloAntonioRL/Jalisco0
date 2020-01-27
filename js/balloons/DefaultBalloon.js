/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    
], function () {
    function getBalloon(feature) {
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
        if(properties) {
            for (var key in properties) {
                if(i%2 === 0 )
                    color = '#19232c';
                else
                    color = '';
                i++;
                etiquetaDatos+= _etiquetaDatos.replace("$Propertie", key+":").replace("$Value", properties[key]===null? "": properties[key]).replace("$COLOR", color);
            }
        }
            
        etiqueta = _etiqueta.replace("$DATOS", etiquetaDatos);
        var balloon;
        //balloon = etiqueta.replace('$NAME', name);
        //console.log(feature.properties.name);
        return etiqueta;   
    }
    
    return  { getBalloon: getBalloon };
});


