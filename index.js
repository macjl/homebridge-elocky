var Service, Characteristic ;
var GlobalDoorAccessory, GlobalAlarmAccessory ;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-elocky", "elocky-door", doorAccessory);
    homebridge.registerAccessory("homebridge-elocky", "elocky-alarm", alarmAccessory);
    webListener(8085);
};

//################## WEB SERVER ########################

function webListener(port) {

  var my_http = require("http");
  my_http.createServer(function(request,response){

    console.log("Webserver called by : " + request.url);
    response.writeHeader(200, {"Content-Type": "text/plain"});

    response.write("Welcome\n");

    if ( request.url == "/unlock20")
    {
      response.write("Unlocking Door for 20s\n");
      GlobalDoorAccessory.log("Unlock Door for 20s");
      GlobalDoorAccessory.service.setCharacteristic(Characteristic.LockTargetState, 0);
      setTimeout(function(){
        GlobalDoorAccessory.log("Locking Door");
        GlobalDoorAccessory.service.setCharacteristic(Characteristic.LockTargetState, 1)
      }   , 20000);
    };

    if ( request.url == "/motion")
    {
      response.write("Motion for 10s\n");
      GlobalAlarmAccessory.log("Motion for 10s");
      GlobalAlarmAccessory.service.setCharacteristic(Characteristic.MotionDetected, true);
      setTimeout(function(){
        GlobalAlarmAccessory.log("Stop Motion");
        GlobalAlarmAccessory.service.setCharacteristic(Characteristic.MotionDetected, false)
      }   , 10000);
    };

    response.end();

  }).listen(port);

  console.log("Server Running on " + port);
}

//################## DOOR LOCK ########################

function doorAccessory(log, config) {
  this.log = log;
  log("Init of accessory type Door Lock");
  GlobalDoorAccessory = this ;
  var lockState = 0 ;
};

doorAccessory.prototype = {

  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "elocky")
      .setCharacteristic(Characteristic.Model, "evy")
      .setCharacteristic(Characteristic.SerialNumber, "xxxx");

    let service = new Service.LockMechanism("Door Lock");
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
      this.log("Get Door lock status : " + this.lockState);
      next(null, this.lockState);
  },

  setCharacteristic: function (on, next) {
      this.log("Set Door lock status : " + on);
      this.lockState = on ;
      this.service.setCharacteristic(Characteristic.LockCurrentState, on);
      next(null);
  }
};


//################## ALARM ########################

function alarmAccessory(log, config) {
  this.log = log;
  log("Init of accessory type Alarm");
  var motionState = false ;
  GlobalAlarmAccessory = this ;
};

alarmAccessory.prototype = {

  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
    .setCharacteristic(Characteristic.Manufacturer, "elocky")
    .setCharacteristic(Characteristic.Model, "evy")
    .setCharacteristic(Characteristic.SerialNumber, "xxxx");

    let service = new Service.MotionSensor("Door Alarm");
    service.getCharacteristic(Characteristic.MotionDetected)
      .on('set', this.setCharacteristic.bind(this))
      .on('get', this.getCharacteristic.bind(this));

    this.informationService = informationService;
    this.service = service;
    return [informationService, service];
  },

  getCharacteristic: function (next) {
      this.log("Get motion status : " + this.motionState);
      next(null, this.motionState);
  },

  setCharacteristic: function (on, next) {
      this.log("Set motion status : " + on);
      this.motionState = on ;
      next(null);
  }
};
