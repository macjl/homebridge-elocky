var Service, Characteristic, GlobalLockState = 0;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-http", "eLocky-acc", eLockyAccessory);
};

function eLockyAccessory(log, config) {
  this.log = log;
  log("DEBUUUUUUUUUUUG: 1" + " 1");
};

eLockyAccessory.prototype = {

  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "My switch manufacturer")
      .setCharacteristic(Characteristic.Model, "My switch model")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

    let service = new Service.LockMechanism("Test");
    service.getCharacteristic(Characteristic.LockTargetState)
      .on('set', this.setCharacteristic.bind(this))
      .on('get', this.getCharacteristic.bind(this));

    service.getCharacteristic(Characteristic.LockCurrentState)
      .on('get', this.getCharacteristic.bind(this));

    this.informationService = informationService;
    this.service = service;
    return [informationService, service];
  },

  getCharacteristic: function (next) {
      this.log("DEBUUUUUUUUUUUG: get " + GlobalLockState);
      next(null, GlobalLockState);
  },

  setCharacteristic: function (on, next) {
      this.log("DEBUUUUUUUUUUUG: set " + on);
      GlobalLockState = on ;
      this.service.setCharacteristic(Characteristic.LockCurrentState, on);
      next(null);
  }
};
