<?xml version="1.0" encoding="UTF-8"?><sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0">
  <sld:NamedLayer>
    <sld:Name/>
    <sld:UserStyle>
      <sld:Name>Default Styler</sld:Name>
      <sld:FeatureTypeStyle>
        <sld:Name>name</sld:Name>
        <sld:Rule>
          <sld:Name>Luminaria encendida</sld:Name>
          <sld:Title/>
          <sld:Abstract/>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="file:/D:/Luciad/LuciadLightspeed_2017.0/LuciadRIA_2017.0.03/web/proyecto/Leon1/data/icons/street-light.png"/>
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Size>35.0</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
        <sld:Rule>
          <sld:Name>Luminaria apagada</sld:Name>
          <sld:Title/>
          <sld:Abstract/>
          <ogc:Filter>
            <ogc:PropertyIsEqualTo>
              <ogc:Function name="PropertyExists">
                <ogc:Literal>state</ogc:Literal>
              </ogc:Function>
              <ogc:Literal>false</ogc:Literal>
            </ogc:PropertyIsEqualTo>
          </ogc:Filter>
          <sld:PointSymbolizer>
            <sld:Graphic>
              <sld:ExternalGraphic>
                <sld:OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="file:/D:/Luciad/LuciadLightspeed_2017.0/LuciadRIA_2017.0.03/web/proyecto/Leon1/data/icons/street-light0.png"/>
                <sld:Format>image/png</sld:Format>
              </sld:ExternalGraphic>
              <sld:Size>35.0</sld:Size>
            </sld:Graphic>
          </sld:PointSymbolizer>
        </sld:Rule>
      </sld:FeatureTypeStyle>
    </sld:UserStyle>
  </sld:NamedLayer>
</sld:StyledLayerDescriptor>

