/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define(["recursos/js/Shapes", "recursos/js/LayerFactory", "./painters/HeatPolygon"], function (Shapes, LayerFactory, HeatPolygon) {
    
    function createLayer(map, layer, reference, grid) {
        //var queryFinishedHandle = layer.workingSet.on("QueryFinished", function() {
            //if(layer.bounds) {
                            //map.mapNavigator.fit({bounds: luminariasTramos.bounds, animate: true});
                var featuresPromise = layer.model.query();
                if(featuresPromise.array) {
                    return createGridLayer(map, layer, reference, featuresPromise.array, grid);
                } else {
                Promise.when(featuresPromise, function (cursor) {
                    var index = 0;
                    var features = [];
                    while(cursor.hasNext()) {
                        var feature = cursor.next();
                        features[index] = feature;
                    }

                    createGridLayer(map, layer, reference, features);
                });
            }
            
            //}
       //     queryFinishedHandle.remove();
       // });
        
    }
    
    function createGridLayer(map, layer, reference, features, grid) {
        if(grid) {
            map.layerTree.removeChild(grid);
        } 
        var layerBounds = layer.bounds;
        var grid = [[]], featuresGrid = [];
        var centerX = layerBounds.focusPoint.x, centerY = layerBounds.focusPoint.y;
        var fullWidth = layerBounds.width, fullHeight = layerBounds.height;
        var width = fullWidth / 2, height = fullHeight / 2;
        var coords = layerBounds._coords;
        var tLeft = [centerX - width, centerY + height] ;
        var bRight = [centerX + width, centerY - height];
        coords = [tLeft, [centerX + width, centerY + height], bRight, [centerX - width, centerY - height]];
        tLeft = Shapes.createPoint(reference, tLeft[0], tLeft[1], 0, 0, {name: 1});
        bRight = Shapes.createPoint(reference, bRight[0], bRight[1], 0, 1, {name: 2});
        
        var line = Shapes.createPolygonCoordinates(reference, coords, 2, {});
        var nc = parseInt($("#gridSize").val()) || 17;
        var r = fullWidth / nc;
        var k=0;
        var lx = centerX - width-(r/10), rx=centerX + width, ty=centerY + height+(r/10), by=centerY - height;
        var tl, tr, bl, br, x, y, xs=[], ys=[], i=0, j=0;
        for(y=ty; y>by-r; y-=r) {
            if(!grid[j])
                grid[j] = [];
            for(x=lx; x<rx+r; x+=r) {
                tl = [x, y];
                tr = [x, y+r];
                br = [x+r, y+r];
                bl = [x+r, y];
                
                grid[j][i] = Shapes.createPolygonCoordinates(reference, [tl, tr, br, bl], k, {value:0, power: 0});
                k++;
                if(!xs[i]) {
                    xs[i] = x;
                }
                i++;
            }
            if(!xs[i]) {
                xs[i] = x;
            }
            i=0;
            
            if(!ys[j]) {
                ys[j] = y;
            }
            j++;
        }
        ys[j] = y;
        var l=0;
        
        for(i=0; i<features.length; i++) {
            var geometry = features[i].geometry;
            x = geometry.x || geometry.focusPoint.x;
            y = geometry.y || geometry.focusPoint.y;
            var poder = features[i].properties.total_power;
            var inX=false;
            for(j=0; j<xs.length-1; j++) {
                if(x>xs[j] && x<xs[j+1]) {
                    inX = true;
                    break;
               }
            }
            var inY=false;
            for(k=0; k<ys.length-1; k++) {
                if(y<=ys[k] && y>ys[k+1]) {
                    inY = true;
                    k++;
                    break;
               }
            }
            if(inX===true && inY===true) {
                var newPoint=true;
                for(l=0; l<featuresGrid.length; l++) {
                    if(grid[k][j].id === featuresGrid[l].id) {
                        featuresGrid[l].properties.value ++;
                        featuresGrid[l].properties.power += poder;
                        newPoint=false;
                        featuresGrid[l].properties.features[featuresGrid[l].properties.features.length] = features[i];
                        break;
                    }
                }
                if(newPoint) {
                    featuresGrid[l] = grid[k][j];
                    featuresGrid[l].properties.value = 1;
                    featuresGrid[l].properties.power = poder;
                    featuresGrid[l].properties.features = [features[i]];
                }
            }
        }
        //layer.visible = false;
        var gridLayer = LayerFactory.createMemoryLayer(reference, {label: layer.label, painter: HeatPolygon.crearPainter(layer.label)}, featuresGrid);
        map.layerTree.addChild(gridLayer);
        return gridLayer;
    }
    
    return {
        createLayer: createLayer
    };
});
