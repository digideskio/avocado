(function() { 'use strict';

  var VERSION = '0.0.2';

  /**
   * AvocadoUnit Class constructor
   */
  var AvocadoUnit = function(options) {
    // Default attributes
    this.Avocado = false;
    this.el = false;
    this.status = false;
    this.targetMatch = [];

    this.options = {
      id: false,
      clickTrack: false,
      content: false
    };

    this.onClick = this.onClick.bind(this);


    this.initialize(options);
  };

  /**
   * initialize
   * Type: Public
   * Description: Creates the individual promo unit!
   */
  AvocadoUnit.prototype.initialize = function(options) {
    // Extend the unit's default options
    this.options = this._extend(this.options, options);

    this.Avocado = this.options.Avocado;
    var id = this.options.id;

    // Avocado and options.id is required
    if (!this.Avocado || !id) {
      return false;
    }

    // Defining the DOM element
    this.getEl();

    // DOM element required
    if (!this.el) {
      return false;
    }

    // Render the unit's content into the DOM
    this.render();

    // Setups tracking
    this.setupTracking();

    return this;
  };

  /**
   * _extend
   * Type: Private
   * Description: Native shallow extend method for objects used in AvocadoUnit.
   */
  AvocadoUnit.prototype._extend = function(object) {
    // Define default object
    object = object || {};

    if (typeof object !== 'object') {
      object = {};
    }

    // Native object extending
    for (var i = 1; i< arguments.length; i++) {
      if (!arguments[i]) {
        continue;
      }

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          object[key] = arguments[i][key];
        }
      }
    }

    return object;
  };

  /**
   * _hasTargetKey
   * Type: Private
   * Description: Loops through the targeting key/value pairs set on Avocado
   * and the individual unit to determine a match.
   */
  AvocadoUnit.prototype._hasTargetKey = function(key) {
    var self = this;
    var _match = {};
    var targeting = self.Avocado.targeting[key];
    var unitTargeting = self.options.targeting[key];

    if (!targeting || !targeting.values) {
      return status;
    }

    // Reassign targeting to get values
    targeting = targeting.values;

    // Normalize unit targeting
    if (typeof unitTargeting === 'string') {
      unitTargeting = unitTargeting.toLowerCase().split(',');
    }

    unitTargeting.forEach(function(value) {
      // Partial matching for URL
      if ( key === 'url') {
        if (targeting[0].indexOf(value) <= -1) {
          return;
        }
      }
      // Exact matching for all other cases
      else {
        if (targeting.indexOf(value) <= -1) {
          return;
        }
      }
      // Add to this.targetMatch array
      _match[key] = value;
      self.targetMatch.push(_match);
    });

    return self.targetMatch;
  };


  /**
   * createEl
   * Type: Public
   * Description: Creates the avocado unit if $el method is initialized
   */
  AvocadoUnit.prototype.createEl = function(query) {
    var _el;
    var _parent;
    var unitElement;

    if (!query) {
      return false;
    }

    // Get the target element from the DOM
    _el = document.querySelector(query);
    if (!_el) {
      return false;
    }

    // Creating the new unit
    unitElement = document.createElement('div');
    unitElement.setAttribute('data-avocado-unit-id', this.options.id);

    // Inserting it after the specified target
    _parent = _el.parentNode;

    if (_parent.lastChild === _el) {
      _parent.appendChild(unitElement);
    }
    else {
      _parent.insertBefore(unitElement, _el.nextSibling);
    }

    // Returning the newly created unit
    return unitElement;
  };

  /**
   * getEl
   * Type: Public
   * Description: Creates / defines the element to target in the DOM
   */
  AvocadoUnit.prototype.getEl = function() {
    // Targeting method 1:
    // jQuery-like targeting
    if (this.options.$el && typeof this.options.$el === 'string') {
      this.el = this.createEl(this.options.$el);
    }

    // Targeting method 2:
    // Finding the avocado ID
    if (this.options.id && typeof this.options.id === 'string') {
      this.el = document.querySelector('[data-avocado-unit-id="' + this.options.id + '"]');
    }


    return this.el;
  };


  /**
   * isActive
   * Type: Public
   * Description: Returns a boolean to indicate if the AvocadoUnit is valid.
   */
  AvocadoUnit.prototype.isActive = function() {
    return this.el && this.options.id;
  };

  /**
   * isTargeted
   * Type: Public
   * Description: Returns a boolean that indicates if the AvocadoUnit
   * can be rendered based on targeting values.
   */
  AvocadoUnit.prototype.isTargeted = function() {
    // Avocado is required
    if (!this.Avocado) {
      return false;
    }

    var status = false;
    var targeting = this.options.targeting;

    // No targeting set on Avocado
    // In this case, always render
    if (!targeting) {
      status = true;
      return status;
    }
    // Cross check all targeting values set on Avocado and the specific unit
    for (var key in targeting) {
      this._hasTargetKey(key);
    }

    // Check if targetMatch items are the same as specified in targeting options
    if (this.targetMatch.length === Object.keys(this.options.targeting).length) {
      status = true;
    }

    return status;
  };

  /**
   * render
   * Type: Public
   * Description: Injects the Unit's content into the DOM, if applicable.
   */
  AvocadoUnit.prototype.render = function() {
    var el = this.el;
    var content = this.options.content;

    if (!el) {
      return false;
    }

    this.status = this.isTargeted();

    if (this.status) {
      // Rendering the content into the DOM
      el.innerHTML = content;
    }

    return this;
  };


  /**
   * setupTracking
   * type: Public
   * description: Sets up Google Analytics tracking
   */
  AvocadoUnit.prototype.setupTracking = function() {
    // Only setup tracking if rendered
    if (!this.status) {
      return this;
    }

    // Return if clickTracking isn't enabled
    if (!this.options.clickTrack) {
      return this;
    }

    var el = this.el;
    if (this.options.clickTrack.$el) {
      var _el = el.querySelector(this.options.clickTrack.$el);
      el = _el ? _el : el;
    }

    // Return if a tracking el is not available
    if (!el) {
      return this;
    }

    el.addEventListener('touchstart', this.onClick);
    el.addEventListener('click', this.onClick);

    return this;
  };


  /**
   * onClick
   * type: Public
   * description: Click event for the unit
   */
  AvocadoUnit.prototype.onClick = function(event) {
    // Return of Google analytics is not present
    if (!window.ga || !window.ga.loaded) {
      return this;
    }

    var data = {
      eventCategory: 'Avocado',
      eventAction: 'click'
    };

    // Merge with options
    if (this.options.clickTrack.eventCategory) {
      data.eventCategory = this.options.clickTrack.eventCategory;
    }
    if (this.options.clickTrack.eventAction) {
      data.eventAction = this.options.clickTrack.eventAction;
    }
    if (this.options.clickTrack.eventLabel) {
      data.eventLabel = this.options.clickTrack.eventLabel;
    }

    // Send the event to Google Analytics
    ga('send', 'event', data);

    return this;
  };



  /**
   * Avocado Class constructor
   */
  var Avocado = function() {
    // Default attributes
    this.version = VERSION;
    this.targeting = {};
    this.units = [];

    this.initialize();
  };

  /**
   * initialize
   * type: public
   * description: Createes Avocado!
   */
  Avocado.prototype.initialize = function() {
    return this;
  };

  /**
   * _parseTargetValues
   * type: private
   * description: Adjusts the value to be accessible by Avocado's key/value
   * targeting methods.
   */
  Avocado.prototype._parseTargetValues = function(value) {
    if (!value) {
      return false;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      value = value.toLowerCase().split(',');
      return value;
    }

    if (typeof value === 'number') {
      return [].push(value);
    }

    return false;
  };


  /**
   * defineUnit
   * type: public
   * description: Creates a promo unit and adds it to the unit collection.
   */
  Avocado.prototype.defineUnit = function(options) {
    if (!options || typeof options !== 'object') {
      return false;
    }

    options.Avocado = this;

    // Create the unit
    var unit = new AvocadoUnit(options);

    // Add unit to the unit collection
    if (unit && unit.isActive()) {
      this.units.push(unit);
    }

    // Returning the unit
    return unit;
  };


  /**
   * getUnitsActive
   * type: public
   * description: Returns an array of all units that have been successfully
   * rendered into the DOM.
   */
  Avocado.prototype.getUnitsActive = function() {
    return this.units.filter(function(unit) {
      return unit.status;
    });
  };


  /**
   * getUnitsNotActive
   * type: public
   * description: Returns an array of all units that have not rendered into
   * the DOM.
   */
  Avocado.prototype.getUnitsNotActive = function() {
    return this.units.filter(function(unit) {
      return !unit.status;
    });
  };


  /**
   * setTargeting
   * type: public
   * description: Used to set key/value targeting keywords for units.
   */
  Avocado.prototype.setTargeting = function(key, value) {
    var values = this._parseTargetValues(value);

    if (!key | !values) {
      return false;
    }

    // Normalize the key
    key = key.toLowerCase();

    if (!this.targeting[key]) {
      this.targeting[key] = {
        key: key,
        values: values
      };
    }
    else {
      this.targeting[key].values = [].concat(this.targeting[key].values, values);
    }

    return this.targeting[key];
  };


  // Starting up Avocado!
  window.Avocado = new Avocado();
})();
