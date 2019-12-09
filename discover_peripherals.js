var noble = require('@abandonware/noble');
const bleno = require('@abandonware/bleno');

// once we have performed sniffing via ubertooth, these are targets
const targetDevices = [
  "d0-c5-f3-da-50-1e",  // Nick's iPhone
  "e7-7b-15-c6-07-13",  // Tile
  "eb-88-da-59-69-d3",  // Tile
  "d6-11-dc-91-c4-2e"   // Tile
];

let connectedPeripherals = [];

// connects to a given peripheral and displays information about it
function connectToPeripheral(peripheral) {
  peripheral.connect(function(error) {
    try {    
      let peripheralAddrName = peripheral.address + ' (' + JSON.stringify(peripheral.advertisement.localName) + ')';
      peripheral.addrName = peripheralAddrName;
      if (targetDevices.indexOf(peripheral.address) < 0) {
        peripheral.disconnect((error) => {
          console.log("disconnected from non-target peripheral: " + peripheralAddrName);
        });
        return;
      } else {
        console.log('connected to target peripheral: ' + peripheralAddrName);
        connectedPeripherals.push(peripheral);
      }

      // display manufacturer data for this peripheral
      console.log(peripheral.advertisement.manufacturerData);

      peripheral.once('rssiUpdate', (rssi) => {
        console.log('[' + peripheralAddrName + ']: rssi: ' + rssi);
      });

      peripheral.discoverServices(['180a'], function(error, services) {
        var deviceInformationService = services[0];
        console.log('discovered device information service');
        console.log(peripheral.advertisement);

        if (deviceInformationService != null) {
          deviceInformationService.discoverCharacteristics(null, function(error, characteristics) {
            console.log('discovered the following characteristics:');
            for (var i in characteristics) {
              console.log('\t  ' + i + ' uuid: ' + characteristics[i]);
            }
          });
        }

      });
    } catch {
      console.warn('connection error: continuing');
    }
  });
}

function exitHandler(options, err) {
  console.log('\rUser exited...goodbye');
  noble.stopScanning();
  process.exit();
}

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    console.warn("state changed, powering off: " + state);
    noble.stopScanning();
    process.exit();
  }
});

// upon discover of a new device, connect to it
noble.on('discover', connectToPeripheral);


// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
