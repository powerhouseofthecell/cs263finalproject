//const bleno = require('@abandonware/bleno');
const bleno = require('@notjosh/bleno-mac');

function exitHandler(options, err) {
  console.log('\rUser exited...goodbye');
  process.exit();
}

let name = 'HAHAHA';
let serviceUuids = ['fffffffffffffffffffffffffffffff0']

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising(name, serviceUuids, (error) => {
      if (error) {
        console.warn("error: " + error);
        return;
      }  
    });
  } else {
    console.warn("state changed, powering off: " + state);
    process.exit();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log("began advertising")
});

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
