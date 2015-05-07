// #ifndef __STORAGECONTROLLER__
// #define __STORAGECONTROLLER__

// #include "Controller.js"
// #include "../Storage.js"

synth.controller.Storage = function (opt_options) {
  opt_options = opt_options || {};

  this.className_ = opt_options.className || "synth-storage";

  synth.controller.Controller.call(this);

  this.storageKey_ = opt_options.storageKey;
  this.storedStates_ = synth.Storage.load(this.storageKey_) || {};
  this.stateExchangable_ = opt_options.stateExchangable;

  var listid = this.className_ + "-" + this.storageKey_;
  this.$inputField_ = $('<input type="text">').attr('list', listid).addClass(this.className_ + "-input");
  this.$loadButton_ = $('<button>').text('Load').addClass(this.className_ + "-button-load");
  this.$saveButton_ = $('<button>').text('Save').addClass(this.className_ + "-button-save");
  this.$dataList_ = $('<datalist>').attr('id', listid).addClass(this.className_ + "-datalist");

  var addOption = function (key) {
    var $option = $('<option>').text(key);
    this.$dataList_.append($option);
  }.bind(this);

  for (k in this.storedStates_) {
    addOption(k);
  }

  this.$dataList_.on("change", function (e) {
    this.$inputField_.val(this.$dataList_.val());
  }.bind(this));

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

  this.$element_.append(this.$inputField_);
  this.$element_.append(this.$loadButton_);
  this.$element_.append(this.$saveButton_);
  this.$element_.append(this.$dataList_);
};
synth.inherits(synth.controller.Storage, synth.controller.Controller);

// #endif
