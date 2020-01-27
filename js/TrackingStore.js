define([
  "luciad/util/Evented"
], function(Evented) {

  const UPDATED = "UPDATED";
  const CLEARED = "CLEARED";

  function ArrayCursor(array) {
    // make a shallow clone of the array.
    this.array = array.slice(0);
    this.index = 0;
  }

  ArrayCursor.prototype.hasNext = function() {
    return this.index < this.array.length;
  };

  ArrayCursor.prototype.next = function() {
    if (this.index >= this.array.length) {
      throw new Error("No more elements in cursor:  next() should only be called when hasNext() returns true");
    }
    return this.array[this.index++];
  };


  /**
   */
  function TrackingStore(options) {
    this.features = [];
    this.indexedFeatures = {};
  }

  TrackingStore.prototype = Object.create(Evented.prototype);
  TrackingStore.prototype.constructor = TrackingStore;

  /**
   * @name get
   * @function
   * @description Retrieve a {@link luciad.model.feature.Feature Feature} from this store by id.
   * @param {String | Number} id The identifier of the <code>Feature</code>.
   * @param {Object} [options] an options object
   * @param {Object} [options.headers] optional headers. These will be added to the HTTP request headers.
   * @returns {luciad.util.Promise} A promise for the <code>Feature</code> with the given id.
   */
  TrackingStore.prototype.get = function(id, options) {
    return this.indexedFeatures[id];
  };


  /**
   * Not implemented
   */
  TrackingStore.prototype.put = function(object, options) {
    return "Not implemented";
  };

  /**
   * Not implemented
   */
  TrackingStore.prototype.add = function(feature, options) {
    return false;
  };

  /**
   * Add an array of features.
   */
  TrackingStore.prototype.addFeatures = function(moreFeatures) {
    for (let i = 0; i < moreFeatures.length; i++) {
      const feature = moreFeatures[i];
      this.features.push( feature );
      this.indexedFeatures[feature.id] = feature;
    }
    this.emit(UPDATED);
  };

  /**
   * Not implemented
   */
  TrackingStore.prototype.remove = function(id) {
    // not implemented
    return false;
  };

  /**
   * Remove all objects in the store
   */
  TrackingStore.prototype.clear = function() {
    // not implemented
    this.features = [];
    this.indexedFeatures = {};
    this.emit(CLEARED);
    return true;
  };

  /**
   * @name query
   * @description Query the store for objects.
   * @function
   * @returns cursor A cursor over the result set.
   */
  TrackingStore.prototype.query = function(query, options) {
    return new ArrayCursor(this.features);
  };

  return TrackingStore;
});
