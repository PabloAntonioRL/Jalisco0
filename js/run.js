//#snippet runrequire
require({
  baseUrl: "../../",

  packages: [
    {name: "dojo", location: "./samples/lib/dojo"},
    //{name: "dojox", location: "./samples/lib/dojox"},
    //{name: "dijit", location: "./samples/lib/dijit"},
    {name: "luciad", location: "./luciad"},
    
    {name: "demo", location: "./proyecto/Jalisco0/js"},
    {name: "datos", location: "./proyecto/Jalisco0/data"},
    {name: "recursos", location: "./proyecto/recursos"},
    {name: "time", location: "./proyecto/recursos/js/AdvancedTimeSlider/js/time"},
    
    //{name: "template", location: "./samples/template"},
    //{name: "samplecommon", location: "./samples/common"},
    {name: "samples", location: "./samples"},
    {name: "file", location: "./samples/model/File/js/file"}
  ]
//#endsnippet runrequire
  , cache: {}
//#snippet runrequirecont
}, ["demo"]);