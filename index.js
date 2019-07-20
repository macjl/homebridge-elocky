var Service, Characteristic, GlobalLockState = 0;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-http", "eLocky-acc", eLockyAccessory);
};

function eLockyAccessory(log, config) {
  this.log = log;
  log("Init of accessory");
  webListener(this);
};

function webListener(accessory) {

  var my_http = require("http");
  my_http.createServer(function(request,response){

    response.writeHeader(200, {"Content-Type": "text/plain"});
    response.write("Unlocking Door for 20s");
    response.end();

    accessory.log("Unlock Door for 20s");
    accessory.service.setCharacteristic(Characteristic.LockTargetState, 0);
    setTimeout(function(){
      accessory.log("Locking Door");
      accessory.service.setCharacteristic(Characteristic.LockTargetState, 1)
    }   , 20000);

  }).listen(8080);

  accessory.log("Server Running on 8080");
  accessory.log("Locking Door in 10s");

  setTimeout(function(){
    accessory.log("Locking Door");
    accessory.service.setCharacteristic(Characteristic.LockTargetState, 1)
  }, 10000);

}

eLockyAccessory.prototype = {

  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "My switch manufacturer")
      .setCharacteristic(Characteristic.Model, "My switch model")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

    let service = new Service.LockMechanism("Door");
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
      this.log("Get Door lock status : " + GlobalLockState);
      next(null, GlobalLockState);
  },

  setCharacteristic: function (on, next) {
      this.log("Set Door lock status : " + on);
      GlobalLockState = on ;
      this.service.setCharacteristic(Characteristic.LockCurrentState, on);
      next(null);
  }
};
