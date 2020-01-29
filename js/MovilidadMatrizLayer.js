/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["recursos/js/Util", "recursos/js/Shapes",
        "luciad/geodesy/GeodesyFactory",
        "luciad/geodesy/Geodesy",
    "luciad/model/feature/Feature"], function (Util, Shapes, GeodesyFactory, Geodesy,Feature) {
    
    function createArcs(reference, arcLayer, nodosLayer) {
        var features = nodosLayer.model.query().array;
        var index=0;
        var geodesy = GeodesyFactory.createEllipsoidalGeodesy(reference);
        for(var i=0; i<features.length; i++) {
            var f1 = features[i];
            //var id1 = f1.properties.Id;
            var id1 = f1.id;
            var shape1 = f1.shape;
            if(f1.id !== f1.properties.Id) {
                console.log(f1);
            }
            for(var j=0; j<features.length; j++) {
                var f2 = features[j];
                //var id2 = f2.properties.Id;
                var id2 = f2.id;
                var shape2 = f2.shape;
                if(id1 !== id2) {
                    var id = id1+"-"+id2;
                    var valor = f2.properties[id] || 0;
                    
                    var distance = geodesy.distance(shape1, shape2);
                    var properties = {Nombre: id, Valor: valor, Distancia: distance,
                        Origen: id1, Destino: id2, ValorHistorial: 0};
                    var line = Shapes.create3dArcBy2Points(reference, shape1, shape2, 1000, id, properties, 20);
                    
                    index++;
                    arcLayer.model.put(line);
                }
            }
        }
        console.log("N Curvas "+index);
    }
    
    return {
        createArcs: createArcs
    };
});
