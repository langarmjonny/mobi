const iotaHelper = require('./lib/iotaHelper.js');
const arduino = require('./lib/arduino.js');
const express = require('express');
const cors = require('cors');
var config = require(__dirname + '/config.json');
const bodyParser = require('body-parser');

var PORT = 8040;
var HOST = config.active.ip;

const dgram = require('dgram');
const client = dgram.createSocket('udp4');

let zmq = require('zeromq');
let sock = zmq.socket('sub');
let tcp = 'tcp://' + config.compass.ip + ':5555';
sock.connect(tcp);
sock.subscribe('tx');
sock.subscribe('sn');

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.set('json spaces', 40);

var costPerData = 1;
var platoonBool = true;
var seed = "SEEDA9999999999999999999999999999999999999999999999999999999999999999999999999999";
var addressNbr = 0;
var receivingAddress;
var receivingAddressBalance;
var activePlatooner = 0;
var platoonInfo = [{}];
var version = 0.1;
var driving = false;
var openRequest = {
  bool: false,
  hash: null,
  value: null
}

let drive = () => {
  driving = !driving;
  if(driving)
    arduino.startVehicle();
  else
    arduino.stopVehicle();
  console.log("Driving:", driving)
}

app.listen(8030, function () {
  console.log('Active Platooner listening on port 8030!');
});

app.post('/commands', function(req, res, next) {
    console.log(req.body);
    if(req.body.command == "drive")
      drive();
    if(req.body.command == "acceptPlatooning" && driving == true)
      closeOpenRequest();

    res.json({driving: driving});
});

app.get("/platoon", (req, res) => {
  var json = {
    "platooning": platoonBool,
    "length": activePlatooner,
    "receivingAddress": receivingAddress
  };
  res.send(json);
});

client.bind(8030, HOST);

function sendingData(position) {
  var json = {
    "counter": platoonInfo[position].counter,
    "leftBudget": (platoonInfo[position].payment - platoonInfo[position].counter),
    "break": platoonInfo[position].break,
    "speed": 10,
    "sensor1": 5,
    "sensor2": 4,
  };
  var data = new Buffer(JSON.stringify(json));
  client.send(data, 0, data.length, platoonInfo[position].platoon.port, platoonInfo[position].platoon.host, function(err, bytes) {
    if (err) throw err;
    //console.log('UDP message sent to ' + HOST +':'+ PORT);
  });
}

let platooning = async (position) => {
  sendingData(position);
  platoonInfo[position].counter++;
  let balance = await iotaHelper.getBalances(receivingAddress);
  console.log(balance);
  if(platoonInfo[position].counter <= platoonInfo[position].payment &&  platoonInfo[position].platoon.platooning)
    setTimeout(() => platooning(position), 1000);
  else{
    arduino.stopPlatooningActive();
    activePlatooner--;
    platoonInfo[position].platoon.platooning = false;
  }
}

function initializePlatoon(hash, value) {
  iotaHelper.getMessageOfTransaction(hash, (res) => {
    var json = JSON.parse(res);
    if(json.position == activePlatooner && json.version == version && json.platoonRequest == true){
      platoonInfo[json.position] = {
        "platoon": json,
        "counter": 0,
        "payment": Number(value),
        "break": false
      };
      arduino.startPlatooningActive();
      activePlatooner++;
      platooning(json.position);
    }
  });
}

function paymentPlatoon(hash, value, index) {
  iotaHelper.getMessageOfTransaction(hash, (res) => {
    console.log(res);
    var json = JSON.parse(res);
    if(json.position <= activePlatooner && json.version == version && json.platoonRequest == false){
      platoonInfo[json.position].payment += Number(value);
    }
    if(json.platooning == false){
      platoonInfo[json.position].platoon.platooning = json.platooning;
      openRequest.bool = false;
    }
  });
}



sock.on('message', msg => {
  const data = msg.toString().split(' ');
  var index = undefined;
  for(var i = 0; i < receivingAddress.length; i++){
    if(data[2] == receivingAddress[i])
      index = i;
  }
  if(index != undefined){
    var hash = [data[1]];
    var value = data[3];
    if(activePlatooner > index) {
      console.log("got Payment");
      paymentPlatoon(hash, value, index);
    } else {
      openRequest = {
        bool: true,
        hash: hash,
        value: value
      }
      //initializePlatoon(hash, value);
    }

  }
});

let closeOpenRequest = () => {
  if(openRequest.bool) {
    initializePlatoon(openRequest.hash, openRequest.value);
  }
  openRequest.bool = false;
}

let start = async () => {
  receivingAddress = await iotaHelper.getNewAddress(seed, 0, 3);
  app.get("/address", (req, res) => {
    var json = {receivingAddress, openRequests: openRequest, driving: driving, activePlatooner: activePlatooner, platooner: platoonInfo}
    res.send(json);
  });
}
start();
