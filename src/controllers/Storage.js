// #ifndef __STORAGECONTROLLER__
// #define __STORAGECONTROLLER__

// #include "Controller.js"
// #include "../Storage.js"

synth.controller.Storage = function (opt_options) {
  opt_options = opt_options || {};

  this.className_ = opt_options.className || "synth-storage";

  synth.controller.Controller.call(this);

  this.storageKey_ = opt_options.storageKey;
  this.stateExchangable_ = opt_options.stateExchangable;
  this.storedStates_ = {};

  // create DOM-Elements
  var listid = this.className_ + "-" + this.storageKey_;
  this.$inputField_ = $('<input type="text">').attr('list', listid).addClass(this.className_ + "-input");
  this.$loadButton_ = $('<button>').text('Load').addClass(this.className_ + "-button-load");
  this.$saveButton_ = $('<button>').text('Save').addClass(this.className_ + "-button-save");
  this.$dataList_ = $('<datalist>').attr('id', listid).addClass(this.className_ + "-datalist");

  var addOption = function (text) {
    var $option = $('<option>').text(text);
    this.$dataList_.append($option);
  }.bind(this);

  var addOptions = function (anObject) {
    for (k in anObject) {
      addOption(k);
    }
  }.bind(this);

  // load and select presets
  var selectPreset = function() {
    // selecting the first preset
    var key = Object.keys(this.storedStates_)[0];

    // selecting a random preset
    //var key = _.sample(Object.keys(this.storedStates_));

    var state = this.storedStates_[key];

    this.$inputField_.val(key);
    this.stateExchangable_.setState(state);
  }.bind(this);

  this.selectFirst_ = opt_options.selectFirst;

  var presets = synth.Storage.load(this.storageKey_ + "-presets");
  if (!presets) {
    $.getJSON("files/" + this.storageKey_ + "-presets.json").done(function (data) {
      addOptions(data);
      this.storedStates_ = _.merge({}, data, this.storedStates_);
      if (this.selectFirst_) {
        selectPreset();
      }
    }.bind(this)).fail(function () {
      throw new Error("failed to get/parse " + this.storageKey_ + "-presets.json");
    }.bind(this));
  } else {
    this.storedStates_ = presets;
    if (this.selectFirst_) {
      selectPreset();
    }
  }

  // load custom presets (overwrite global presets with same name)
  _.merge(this.storedStates_, synth.Storage.load(this.storageKey_));
  addOptions(this.storedStates_);

  // binding event-handlers
  //this.$dataList_.on("change", function (e) {
  //  this.$inputField_.val(this.$dataList_.val());
  //}.bind(this));

  // #warning "StorageController does not have error output"
  this.$saveButton_.on('click touch', function (e) {
    var text = this.$inputField_.val().trim();
    if (text != "" ) {
      this.storedStates_[text] = this.stateExchangable_.getState();
      synth.Storage.save(this.storageKey_, this.storedStates_);
      addOption(text);
    }
  }.bind(this));

  this.$loadButton_.on('click touch', function (e) {
    var text = this.$inputField_.val().trim();
    if (this.storedStates_.hasOwnProperty(text)) {
      this.stateExchangable_.setState(this.storedStates_[text]);
    }
  }.bind(this));

  // adding DOM-Elements to the Page
  this.$element_.append(this.$inputField_);
  this.$element_.append(this.$loadButton_);
  this.$element_.append(this.$saveButton_);
  this.$element_.append(this.$dataList_);
};
synth.inherits(synth.controller.Storage, synth.controller.Controller);

// #endif
