// HomeKit dependencies
var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
// Raspberry Pi GPIO access dependencies
var gpio = require('rpi-gpio');

/** ************************ **/
/** Hardware interface       **/
/** ************************ **/
var GARAGE_DOOR = {
  doorOpen: false,
  gpioSensorPin: 0,
  initialise: function(sensorPinNum) {
    console.log("Initialising Raspbery PI Garage Door Controller HomeKit Interface");
    // Set up the pin numbering format we're going to use
    gpio.setMode(gpio.MODE_RPI);
    // Set up the GPIO pins
    GARAGE_DOOR.gpioSensorPin = sensorPinNum;
    gpio.setup(GARAGE_DOOR.gpioSensorPin, gpio.DIR_IN);
    // Make sure the door status is initialised
    GARAGE_DOOR.updateStatus();
  }
  updateStatus: function() {
    console.log("Checking whether the garage door is open");
    gpio.read(GARAGE_DOOR.gpioSensorPin, function(err, value) {
      if (err) throw err;
      GARAGE_DOOR.doorOpen = value;
    });
  }
  identify: function() {
    // Identify the garage controller this device is referring to
    console.log("Identifying garage - turn light on and off");
    // TODO identify the garage by controlling the garage light (or something!)
  }
};

/** ************************ **/
/** HomeKit Service Setup    **/
/** ************************ **/
// Initialise the hardware
var sensorPinArg = process.argv[2];
if isNaN(sensorPinArg) {
  console.error("Expected usage: node Core.js <garage controller Raspberry Pi GPIO door status sensor pin number>");
  return new Error("Invalid pin number specified: %s", pinArg);
}
GARAGE_DOOR.initialise(sensorPinArg);
// Create the garage door HomeKit identifier
var gdcUUID = uuid.generate('hap-nodejs:accessories:'+'gdc');
// Create the accessory
var gdc = exports.accessory = new Accessory('Garage Door', garageUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
gdc.username = "gdcUser"; //edit this if you use Core.js
gdc.pincode = "010808";

// Set up some characteristics
gdc
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "rcjcooke")
  .setCharacteristic(Characteristic.Model, "1");

/** ************************ **/
/** HomeKit Events           **/
/** ************************ **/
// Note: Complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`

// Listen for the identify event
gdc.on('identify', function(paired, callback) {
  GARAGE_DOOR.identify();
  callback();
});

// Garage control
gdc
  .addService(Service.GarageDoorOpener, "Garage Door")
  .getCharacteristic(Characteristic.TargetDoorState)
  .on('set', function(value, callback) {
    console.log("Change door state called - not currently supported");
  });

// Garage status
gdc
  .getService(Service.GarageDoorOpener)
  .getCharacteristic(Characteristic.CurrentDoorState)
  .on('get', function(callback) {
    var err = null;
    GARAGE_DOOR.updateStatus();
    console.log("Is garage door open: %s", GARAGE_DOOR.doorOpen);

    if (GARAGE_DOOR.doorOpen) {
      callback(err, Characteristic.CurrentDoorState.OPEN);
    } else {
      callback(err, Characteristic.CurrentDoorState.CLOSED);
    }
  });
