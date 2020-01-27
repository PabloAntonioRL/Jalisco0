/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

defina(["samples/common/store/RestStore",
    "luciad/view/tileset/WMSTileSetLayer",
    "luciad/model/tileset/UrlTileSetModel",
    "luciad/view/tileset/RasterTileSetLayer",
    "luciad/model/feature/FeatureModel",
    "luciad/view/feature/FeatureLayer",
    "luciad/view/LayerType"
    ], function (RestStore, WMSTileSetLayer, UrlTileSetModel, RasterTileSetLayer, FeatureModel, FeatureLayer, LayerType) {
    
    function createMapImage(reference, url, label, image) {
        var x = (image.x - image.x2), y = (image.y - image.y2);
        if(x<0)
            x = x*(-1);
        if(y<0)
            y = y*(-1);
        var options = {
            baseURL: url+"/{z}_{x}_{y}.png", // "../recursos/Maps/SanPedro/{z}_{x}_{y}.png",
            name: "Massachusetts image@terrain",
            forma: "image/png",
            levelCount:1,
            level0Rows:1,
            level0Columns:1,
            tileWidth: image.width ? image.width : 256,
            tileHeight:image.heigth ? image.height : 256,
            reference: reference,
            bounds:[image.x, x, image.y, y],
            elevation: true
        };
        //options.bounds = ShapeFactory.createBounds(options.reference, options.bounds);
        var model = new UrlTileSetModel(options);
        return new RasterTileSetLayer(model, //WMSTileSetLayer   RasterTileSetLayer
                {label: label, layerType: LayerType.BASE}
        );
    }
    
    function rest() {
        $.getJSON('https://1.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/13/4400/2686/256/png8', {
            app_id: "JQTnn49UvGQ9L6BHfNbA",
            app_code: "EAFjL4u3AEU7gp4vSS1iTQ"
        })
        .done(function(data, textStatus, jqXHR) {
            
        });
    }
    
});
