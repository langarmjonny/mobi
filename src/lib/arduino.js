	//Communication with Arduino
const serialport = require('serialport');
const Readline = require('@serialport/parser-readline');
// Open the port
const port = new serialport("/dev/ttyS0", {
    baudRate: 9600
});
const parser = port.pipe(new Readline({delimiter: '\r\n'}));
// Read the port data

port.on("open", function () {
    console.log('Port open');
    start();
});

const start = async () => {
  let data = await listenSensorData();
  console.log(data);
}

const getResponse  = async () => {
	return new Promise((resolve, reject) => {
		parser.on('data', function (data) {
    		resolve(data);
		});
	});
}

const startPlatooningActive = async () => {
  console.log("startPlaA");
	port.write('f');
	let ret = await getResponse();
	return new Promise((resolve, reject) => {
		resolve(ret);
	});
}

const startPlatooningPassive = async () => {
  console.log("startPlaP");
	port.write('p');
	let ret = await getResponse();
	return new Promise((resolve, reject) => {
		resolve(ret);
	});
}

const stopPlatooningActive = async () => {
  console.log("stoptPlaA");
	port.write('n');
	let ret = await getResponse();
	return new Promise((resolve, reject) => {
		resolve(ret);
	});
}

const stopPlatooningPassive = async () => {
  console.log("startPlaP");
	port.write('n');
	let ret = await getResponse();
  console.log(ret);
	return new Promise((resolve, reject) => {
		resolve(ret);
	});
}
const listenSensorData = async () => {
	port.write('d');
	let ret = await getResponse();
	return new Promise((resolve, reject) => {
		resolve(ret);
	});

}
const startVehicle = async() => {
	port.write('s');
	let ret = await getResponse();
	return new Promise((resolve, reject) => {
		resolve(ret);
	});

}
const stopVehicle = async() => {
	console.log("Stop");
	//port.write('b');
	port.write('b');
	console.log("should be stopped");
	let ret = await getResponse();
	console.log(ret);
	return new Promise((resolve, reject) => {
		resolve(ret);
	});

}

module.exports = {
	startPlatooningPassive,
	startPlatooningActive,
	stopPlatooningPassive,
	stopPlatooningActive,
	listenSensorData,
	startVehicle,
	stopVehicle,
	listenSensorData
};
