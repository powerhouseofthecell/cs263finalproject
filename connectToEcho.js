var noble = require('@abandonware/noble');
const bleno = require('@abandonware/bleno');

// once we have performed sniffing via ubertooth, these are targets
const targetDevices = [
  "84-ef-18-66-6f-15" // EchoThisMF service
];

const data = Buffer.from([0xde, 0xad, 0xbe, 0xef]);

// reads and writes to the provided characteristic 1000 times
function readWrite(characteristic, peripheral, i=10) {
  if (i > 0) {
    characteristic.write(data, true);
      
    characteristic.read((error, resp) => {
      if (error) {
        console.warn('error: ' + error);
        return;
      }
      readWrite(characteristic, peripheral, i - 1);
    });
  } else {
    console.log('readWrites complete, disconnecting');
    peripheral.disconnect((error) => {
      console.log('disconnected from peripheral: ' + peripheral.addrName);

      // now reconnect and do it again!
      connectToPeripheral(peripheral);
    });
  }
}

// connects to a given peripheral and displays information about it
function connectToPeripheral(peripheral) {
  peripheral.connect(function(error) {
    try {    
      let peripheralAddrName = peripheral.address + ' (' + JSON.stringify(peripheral.advertisement.localName) + ')';
      peripheral.addrName = peripheralAddrName;
      if (targetDevices.indexOf(peripheral.address) < 0) {
        peripheral.disconnect((error) => {
          if (error) {
            console.warn('disconnect from unwanted peripheral error: ' + error);
          }
        });
        return;
      } else {
        console.log('connected to target peripheral: ' + peripheralAddrName);
      }

      // display manufacturer data for this peripheral
      console.log(peripheral.advertisement.manufacturerData);

      peripheral.discoverAllServicesAndCharacteristics(function(error, services) {
        console.log('discovered services:');
        
        // try to read and write to and from each characteristic
        services.forEach((service) => {
          console.log('\tcharacteristics: ' + service.characteristics);

          // perform a write and read for each characteristic
          service.characteristics.forEach((characteristic) => readWrite(characteristic, peripheral));
        });

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
