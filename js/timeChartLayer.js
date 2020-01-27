/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define([
    'luciad/view/LayerType',
    'luciad/view/feature/FeatureLayer',
  'luciad/reference/ReferenceProvider',
  "luciad/model/feature/FeatureModel",
  "luciad/model/store/MemoryStore",
  "luciad/shape/ShapeFactory",
  'recursos/js/TimeSlider',
  "luciad/model/feature/Feature",
  "luciad/view/feature/FeaturePainter",
  "luciad/view/style/PointLabelPosition",
  "recursos/js/Util"
], function (LayerType, FeatureLayer, ReferenceProvider, FeatureModel, MemoryStore, 
        ShapeFactory, TimeSlider, Feature, FeaturePainter, PointLabelPosition, Util) {
    //var mayoresMeses = [];
    function createMonthLineModel(features, start, end) {
        var datos =[[]], elements = [], p, eT, mayor = 0;
        var startDate = new Date(start*1000), startY = startDate.getFullYear();
        var endDate = new Date(end*1000), endY = endDate.getFullYear();
        var na = endY - startY;
        na = na<=1? 1 : na;
        try {
        for(var i=0; i<features.length; i++) {
            p = features[i].properties;
            eT = p.EventTime;
            if(!eT)
                return null;
            var eventDate = new Date(eT);
            var eventM = eventDate.getMonth();
            var eventY = eventDate.getFullYear();
            eventY = eventY - startY;
            eventY = eventY<=1? 0: (eventY>na? na-1: eventY-1);
            //if(na===1) {
                datos[eventY] = datos[eventY]? datos[eventY]: [];
                if(!datos[eventY][eventM]) 
                    datos[eventY][eventM] = 1;
                 else 
                    datos[eventY][eventM]++;
                //datos[eventY][eventM] = datos[eventY][eventM]? datos[eventY][eventM]++: 1;
                mayor = datos[eventY][eventM] > mayor? datos[eventY][eventM] : mayor;
            //}
        }
        } catch(e) {
            console.log(e);
            return null;
        }
        i=0;
        for(var y=0; y<na; y++) {
            for(var m=0; m<12; m++) {
                try {
                var altura = ((datos[y][m] || 0) * 1000) / mayor;
                var firstTime = Date.parse((m+1)+"/01/"+(startY+y))/1000, secondTime = Date.parse((m+2)+"/01/"+(startY+y))/1000;
                var p1 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [firstTime, 0]);
                var p2 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [secondTime, 0]);
                var p3 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [secondTime, altura]);
                var p4 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [firstTime, altura]);
                
                var shape = ShapeFactory.createPolygon(TimeSlider.REFERENCE, [p1, p2, p3, p4]);
                var properties = { sensorId: i, Mes: m+1, Cantidad: datos[y][m]};
                elements.push( new Feature(shape, properties, i));
                i++;
                } catch(e) {}
            }
        }
        return new FeatureModel(
            new MemoryStore( {data:elements}),
                {reference: TimeSlider.REFERENCE}
        );
    }
    
    function painterMonth() {
        var Painter = new FeaturePainter();
        Painter.paintBody = function (geocanvas, feature, shape, layer, map, paintState) {
        
            if (!paintState.selected) {
          
                geocanvas.drawShape(shape, {
                    stroke: {color: "rgb(13, 20, 28)", width: 3},
                    fill: {color: "rgba(255, 255, 204, 0.5)"}
                });
            } else {
                geocanvas.drawShape(shape, {
                    stroke: {color: "rgb(13, 20, 28)", width: 3},
                    fill: {color: "rgba(210, 160, 120, 0.5)"}
                });
            }
        };
        Painter.paintLabel = function (labelcanvas, feature, shape, layer, map, paintState) {
        if (paintState.selected ) {
            var labelTextS = "<span style='color: rgb(255, 255, 255)' class='label'>" + 
                  feature.properties.Cantidad + '</span>';
            labelcanvas.drawLabel( labelTextS, shape, {positions: (PointLabelPosition.NORTH)} );
        } else {
            var mes = getMes(feature.properties.Mes);
            //if(mes < 10)
              //  mes = "0"+mes;
            var labelText = "<span style='color: rgb(255, 255, 255)' class='label'>" + 
                   mes+ '</span>';
            labelcanvas.drawLabel( labelText, shape, {positions: (PointLabelPosition.NORTH)} );
        }
      };
      return Painter;
    }
    
    function getMes(id) {
        switch(id) {
            case 1: return "Enero";
            case 2: return "Febrero";
            case 3: return "Marzo";
            case 4: return "Abril";
            case 5: return "Mayo";
            case 6: return "Junio";
            case 7: return "Julio";
            case 8: return "Agosto";
            case 9: return "Septiembre";
            case 10: return "Octubre";
            case 11: return "Noviembre";
            case 12: return "Diciembre";
        }
    }
    function createDayLineModel(features, start, end) {
        var datos =[[]], elements = [], p, eT, mayor = 0;
        var startDate = new Date(start*1000), startM = startDate.getMonth()+1;
        var endDate = new Date(end*1000), endM = endDate.getMonth()+1;
        var year = startDate.getFullYear();
        var nm = endM - startM;
        nm = nm<=1? 1 : nm;
        try {
        for(var i=0; i<features.length; i++) {
            p = features[i].properties;
            eT = p.EventTime;
            if(!eT)
                return null;
            var eventDate = new Date(eT);
            var eventD = eventDate.getDate();
            var eventM = eventDate.getMonth()+1;
            datos[eventM] = datos[eventM]? datos[eventM]: [];
                if(!datos[eventM][eventD]) 
                    datos[eventM][eventD] = 1;
                 else 
                    datos[eventM][eventD]++;
                mayor = datos[eventM][eventD] > mayor? datos[eventM][eventD] : mayor;
        }
        } catch(e) {
            console.log(e);
            return null;
        }
        i=0;
        for(var m=startM; m<endM; m++) {
            var maxd = getDays(m);
            for(var d=1; d<maxd; d++) {
                var altura = ((datos[m][d] || 0) * 1000) / mayor;
                var firstTime = Date.parse(m+"/"+d+"/"+year+" 00:00")/1000, secondTime = Date.parse(m+"/"+(d+1)+"/"+year+" 00:00")/1000;
                var p1 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [firstTime, 0]);
                var p2 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [secondTime, 0]);
                var p3 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [secondTime, altura]);
                var p4 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [firstTime, altura]);
                
                var shape = ShapeFactory.createPolygon(TimeSlider.REFERENCE, [p1, p2, p3, p4]);
                var properties = { Id: i, Mes: m, Dia: d, Cantidad: datos[m][d]};
                elements.push( new Feature(shape, properties, i));
                i++;
            }
            var firstTime = Date.parse(m+"/"+d+"/"+year+" 00:00")/1000, secondTime;
            var altura = ((datos[m][d] || 0) * 1000) / mayor;
            if( m+1 > 12) {
                secondTime = Date.parse("01/01/"+(year+1)+" 00:00")/1000;
            } else 
                secondTime = Date.parse((m+1)+"/01/"+year+" 00:00")/1000;
            
                var p1 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [firstTime, 0]);
                var p2 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [secondTime, 0]);
                var p3 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [secondTime, altura]);
                var p4 = ShapeFactory.createPoint(TimeSlider.REFERENCE, [firstTime, altura]);
                
                var shape = ShapeFactory.createPolygon(TimeSlider.REFERENCE, [p1, p2, p3, p4]);
                var properties = { Id: i, Mes: m, Dia: d, Cantidad: datos[m][d]};
                elements.push( new Feature(shape, properties, i));
                i++;
        }
        return new FeatureModel(
            new MemoryStore( {data:elements}),
            {reference: TimeSlider.REFERENCE}
        );
    }
    function getDays(id) {
        switch(id) {
            case 1: return 31;
            case 2: return 28;
            case 3: return 31;
            case 4: return 30;
            case 5: return 31;
            case 6: return 30;
            case 7: return 31;
            case 8: return 31;
            case 9: return 30;
            case 10: return 31;
            case 11: return 30;
            case 12: return 31;
        }
    }
    
    function painterDay() {
        var Painter = new FeaturePainter();
        Painter.paintBody = function (geocanvas, feature, shape, layer, map, paintState) {
        
            if (!paintState.selected) {
                geocanvas.drawShape(shape, {
                    stroke: {color: "rgb(13, 20, 28)", width: 1},
                    fill: {color: "rgba(255, 174, 102, 0.5)"}
                });
            } else {
                geocanvas.drawShape(shape, {
                    stroke: {color: "rgb(13, 20, 28)", width: 1},
                    fill: {color: "rgba(210, 160, 120, 0.8)"}
                });
            }
        };
        Painter.paintLabel = function (labelcanvas, feature, shape, layer, map, paintState) {
            if (!paintState.selected ) {
                var labelTextS = "<span style='color: rgb(255, 255, 255)' class='label'>" + 
                  feature.properties.Dia+'/'+feature.properties.Mes + '</span>';
                labelcanvas.drawLabel( labelTextS, shape, {positions: (PointLabelPosition.NORTH)} );
            } else {
                var labelTextS = "<span style='color: rgb(255, 255, 255)' class='label'>" + 
                  feature.properties.Cantidad + '</span>';
                labelcanvas.drawLabel( labelTextS, shape, {positions: (PointLabelPosition.NORTH)} );
            }
        };
        return Painter;
    }
    
    function createNewFeatures ( features, selected, mapBounds) {
        var feature, f = [], j=0;
        var crimen = document.getElementById( "empresasFiltro" ).selectedOptions[0].value;
        var zona = document.getElementById( "estadosFiltro" ).selectedOptions[0].value;
        for(var i = 0; i<features.length; i++) {
            feature = features[i];
            var c = feature.properties.TIPODELITO;
            var z = feature.properties.ZONA;
            if(!selected) {
                if((c === crimen || crimen === "Todos") && (z === zona || zona === "Todos")) {
                    f[j] = feature;
                    j++;
                }
            } else {
                var featureBounds = selected.geometry.bounds;
                if(featureBounds.contains2D(feature.shape)) {
                    if((c === crimen || crimen === "Todos") && (z === zona || zona === "Todos")) {
                        f[j] = feature;
                        j++;
                    }
                }
            }
        }
        return f;
    }
    
    return {
        createNewFeatures: createNewFeatures,
        createDaysLayer: function (features, s, e) {
            var model = createDayLineModel(features, s, e);
            var painter = painterDay();
            return new FeatureLayer(
                model, {
                    id: "dias",
                    layerType: LayerType.STATIC,
                    selectable: true,
                    painter: painter
                });
        },
        createMounthLayer: function(features, s, e) {
            var model = createMonthLineModel(features, s, e);
            var painter = painterMonth();
            return new FeatureLayer(
                model, {
                    id: "mes",
                    layerType: LayerType.STATIC,
                    selectable: true,
                    painter: painter
                });
        }
    };
});


