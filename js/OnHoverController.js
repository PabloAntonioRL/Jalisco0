define([
  "luciad/view/input/GestureEventType",
  "luciad/view/controller/Controller",
  "luciad/dojo/_base/declare"
], function(GestureEventType, Controller, declare) {
/*
  var tipCanvas = document.getElementById("tip");
  var graph = document.getElementById("map");
  var tipCanvas = document.getElementById("tip");
  var tipCtx = tipCanvas.getContext("2d");
  tipCtx.fillStyle = "black";
  tipCtx.textAlign = "center";
*/
  var canvasOffset = $("#map").offset();
  var offsetX = canvasOffset.left;
  var offsetY = canvasOffset.top;

  var default_HoverStyle = {
    /*fill: {
      color: "rgba(250,250,250, 0.3)"
    },*/
    stroke: {
      color: "white",
      width: 1
    }
  };
  /*
   * Implementar:
   *    var onHoverController = new OnHoverController();
   *    map.controller = onHoverController;
   */
  return declare(Controller, {

    _onMove: function(event) {
      var hits = this._map.pickClosestObject(event.viewPosition[0], event.viewPosition[1], 0);
//      if (hits && hits.objects[0] !== this._closests && typeof hits.objects[0]._shape.HoverStyle !== 'undefined') {
      if (hits && hits.objects[0] !== this._closests) {
          this._hit = hits.objects[0];
        this.invalidate();
      } else {
        if ( this._hit != null) this.invalidate();
        this._hit = null;
       // tipCanvas.style.left = "-200px";
      }
    },

    onGestureEvent: function(event) {
      if (event.type === GestureEventType.MOVE) {
        return this._onMove(event);
      }
    },

    onDraw: function(geoCanvas) {
      if (this._hit) {
        if (typeof this._hit.shape.HoverStyle !== 'undefined') {
           geoCanvas.drawShape(this._hit.shape, this._hit.shape.HoverStyle);
        } else if (typeof this._hit.shape.paintOnHover !== 'undefined') {
          this._hit.shape.paintOnHover(geoCanvas, this._hit.shape);
        } else {
          geoCanvas.drawShape(this._hit.shape, default_HoverStyle);
        }
      }
    },

    onActivate: function(map) {
      if (this._map && this._map !== map) {
        throw "A single instance of a OnHoverController may not be active on multiple maps at the same time. Create new instances of the OnHoverController with 'new OnHoverController()'-syntax";
      }
      this._map = map;
      this.inherited(arguments);
    },

    onDeactivate: function() {
      this._text = "";
      this._map = null;
      this.inherited(arguments);
    }
  });

});