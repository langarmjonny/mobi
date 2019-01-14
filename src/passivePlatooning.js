const express = require('express');
const cors = require('cors');
var request = require('request');
const Converter = require('@iota/converter');
const iotaHelper = require(__dirname + '/lib/iotaHelper.js');
const arduino = require(__dirname + '/lib/arduino.js');
const config = require(__dirname + '/config.json');
const bodyParser = require('body-parser');
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('json spaces', 40);

const LEADING_PORT = 8030;
const LEADING_HOST = config.active.ip;

const PORT = 8040;
const HOST = config.passive.ip;

const BUDGETTRIGGER = 30;
const PAY = 40;

let seed = "SEEDB9999999999999999999999999999999999999999999999999999999999999999999999999999";
let addresses;
let receivingAddress;
let receivedData = [];
let position = 0;
let version = 0.1;
let platooningBool = false;
let platooningRequested = false;
let isPlatooning = false;
let driving = false;
let platooningPossible = false;
let paying = false;

app.listen(8031, function () {
  console.log('Passive Platooner listening on port 8031!');
});

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

app.get("/car", (req, res) => {
  var json = {
    "platooning": platooningBool,
    "possible": platooningPossible,
    "driving": driving,
  };
  res.send(json);
});

app.post('/commands', function(req, res, next) {
  console.log(req.body);
    if(req.body.command == "drive") {
      drive();
      console.log("START DRVINGING");
    }
    if(req.body.command == "startPlatooning" && driving == true) {
      startPlatooning();
      console.log("START PLATOONING");
    }
    if(req.body.command == "stopPlatooning" && platooningBool == true) {
      stopPlatooning();
      console.log("STOP DRVINGING");
    }
    if(req.body.command == "getResponse"){
      arduino.listenSensorData().then((r) => {res.send(r)});
    }
    //res.json({driving: driving, platooningPossible: platooningPossible, platooningBool: platooningBool});
});



server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    if(remote.address == LEADING_HOST && remote.port == LEADING_PORT){
      receivedData.push(JSON.parse(message));
      platooningPossible = true;
      if(!isPlatooning && platooningBool) {
        console.log("startPlatooning");
        isPlatooning = true;
        arduino.startPlatooningPassive();
      }
    }
});

let drive = async () => {
  driving = !driving;
  let res;
  if(driving)
    res = await arduino.startVehicle();
  else {
    res = await arduino.stopVehicle();
  }
  console.log(res);
  console.log("Driving:", driving)
}

let startPlatooning = async () => {
  request('http://' + LEADING_HOST + ':8030/platoon', (err, res, body) => {
    if(err) throw err;
    var platoon =  JSON.parse(body);
    if(platoon.platooning){
      position = platoon.length;
      receivingAddress = platoon.receivingAddress[position];
      console.log("I'm on position:", position, "and sending Iotas to:", receivingAddress);
      platooningRequested = false;
      platooningBool = true;
      platooning(0);
    }
  });
}

let stopPlatooning = async () => {
  platooningPossible = false;
  platooningBool = false;
  isPlatooning = false;
  payForPlatooning(false, false, 1);
}

let platooning = async (index) => {
  while(addresses == undefined || receivingAddress == undefined) {}
  if(!platooningRequested) {
    payForPlatooning(true, true, PAY);
    platooningRequested = true;
  }
  if(receivedData.length > 0){
    if(receivedData[receivedData.length - 1].leftBudget == BUDGETTRIGGER && platooningBool == true && paying == false) {
      paying = true;
      payForPlatooning(false, true, PAY);
  }
}
  setTimeout((index) => {platooning(index)}, 1000);
}

let payForPlatooning = async (platoonRequest, platooning, value) => {
  //console.log("paying");
  var json = {
    "platoonRequest": platoonRequest,
    "platooning": platooning,
    "position": position,
    "version": version,
    "port": PORT,
    "host": HOST,
  };
  //console.log(JSON.stringify(json));
  console.log("PAYING 40 IOTAS TO:", receivingAddress);
  iotaHelper.transfer(seed, value, receivingAddress, JSON.stringify(json), addresses, 1).then(res => {paying = false;});
}

let start = async () => {
  addresses = await iotaHelper.getNewAddress(seed, 0, 2);
  //let info = await iotaHelper.getNodeInfo();
  //console.log(info);
}

server.bind(PORT, HOST);
start();
