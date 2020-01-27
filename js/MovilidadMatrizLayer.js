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
       // var reference = nodosLayer.model.reference;
        var idOrigen, fOrigen, x1, y1, x2, y2;
        /*if(!data) {
            fOrigen = features[0];
        } else {
            fOrigen = nodosLayer.model.get(origen);
        }*/
        //idOrigen = origen.id;
        //x1 = fOrigen.shape.x;
        //y1 = fOrigen.shape.y;
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
                    //var midway = geodesy.interpolate(f1.shape, f2.shape, 0.5);
                    //var midway2 = geodesy.interpolate(f1.shape, f2.shape, 0.2);
                    /*var xs=[], ys=[], zs=[], np=40;
                    
                    var d = (distance / 2) *(-1);
                    var al = Math.pow(d, 2);
                    var inc = (distance / np) ;
                    var b = 1/np, a=0;
                    for(var k=0; k<np; k++) {
                        var point = geodesy.interpolate(shape1, shape2, a);
                        xs[xs.length] = point.x;
                        ys[ys.length] = point.y;
                        
                        zs[zs.length] = (((al - Math.pow(d + inc * k, 2))) / al) * 1000;
                        a += b;
                    }
                    point = geodesy.interpolate(shape1, shape2, 1);
                    xs[xs.length] = point.x;
                    ys[ys.length] = point.y;
                    zs[zs.length] = 0;
                    var line = Shapes.createPolyline(reference, xs, ys, zs, id, properties);*/
                    var properties = {Nombre: id, Valor: valor, Distancia: distance,
                        Origen: id1, Destino: id2, ValorHistorial: 0};
                    var line = Shapes.create3dArcBy2Points(reference, shape1, shape2, 1000, id, properties, 20);
                    
                    index++;
                    //var arc = Shapes.createArcByBulge(reference, x1, y1, x2, y2, 0.21921165723647137, id, properties);
                    arcLayer.model.put(line);
                    
                    /*midway = new Feature(midway, {}, id+".5");
                    arcLayer.model.add(midway);
                    
                    midway2 = new Feature(midway2, {}, id+".2");
                    arcLayer.model.add(midway2);*/
                }
            }
        }
        console.log("N Curvas "+index);
    }
    
    
    
    return {
        createArcs: createArcs
    };
});
