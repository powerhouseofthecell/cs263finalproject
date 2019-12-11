var bleno = require('@abandonware/bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var EchoCharacteristic = require('./characteristic');

function exitHandler(options, err) {
  console.log('\rUser exited...goodbye');
  bleno.stopAdvertising();
  process.exit();
}

process.env["BLENO_DEVICE_NAME"] = 'FUCKBLUETOOTH';
process.env["BLENO_ADVERTISING_INTERVAL"] = 20;
console.log('bleno - echo');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('EchoThisMF', ['ec00']);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error - ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'ec00',
        characteristics: [
          new EchoCharacteristic()
        ]
      })
    ]);
  }
});

bleno.on('accept', (clientAddress) => {
  console.log('accepted - ' + clientAddress);
});

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));