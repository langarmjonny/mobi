#include<Servo.h>
#include <QTRSensors.h>
#include <EEPROMex.h>
#include<NewPing.h>
#include <PID_v1.h>
#include <Wire.h>


#define NUM_SENSORS   8
#define TIMEOUT       2500
#define EMITTER_PIN   QTR_NO_EMITTER_PIN
#define enB           11
#define in3           16
#define in4           15
#define servosignal   A0
#define addrCalibratedMinimumOn 0
#define addrCalibratedMaximumOn 100

#define vmaxconst     110//85 bei Jonas //100 Nico //105 Girl
#define vplatoon  1
#define vplatoonfirst  0.9
#define stopDistance 5
#define vstep 5
#define steeringAngleMin 15 //15 bei Jonas Nico //Girl 10
#define steeringAngleMax 75 //75  bei Jonas Nico //girl 80
#define steeringDiff 30//30 bei Jonas Nico //35 Girl
#define vSteeringFactor 30// 30 Jonas //23 Nico //38 Girl
#define vSteeringFactorPlatooning 37
#define minValue 500 //500 bei Jonas 
#define maxValue  7000 //7000 bei Jonas


#define SETPOINTCONST 6
#define SETPOINTPLATOON 6
#define OUTPUTMIN 80
#define KP 2 //2
#define KI 4 //5
#define KD 1.3//1

#define ADDRESSNANO 0x01


Servo steering;
int velocity = 0;
int vmax = vmaxconst;
int steeringAngle = 45;
boolean start = true; 
int steeringFactor = vSteeringFactor; 

QTRSensorsRC qtrrc((unsigned char[]) {
  2, 3, 4, 5, 6, 7, 8, 9
},
NUM_SENSORS, TIMEOUT, EMITTER_PIN);
unsigned int sensorValues[NUM_SENSORS];

double Setpoint =SETPOINTCONST; 
double Input, Output;
int minimalDistance = 0; 
//Specify the links and initial tuning parameters

PID pid(&Input, &Output, &Setpoint,KP,KI, KD, REVERSE);

void readQTR()
{
  Serial.println();
  Serial.println("Reading Calibration Data...");

   for (int i = 0; i < NUM_SENSORS; i++)
  {
    Serial.print(qtrrc.calibratedMinimumOn[i]);
    Serial.print(' ');
  }
  Serial.println();
  
  // print the calibration maximum values measured when emitters were on
  for (int i = 0; i < NUM_SENSORS; i++)
  {
    Serial.print(qtrrc.calibratedMaximumOn[i]);
    Serial.print(' ');
  }
  Serial.println();
  
}
void recallQTR()
{
  Serial.println();
  Serial.println("Recalling Calibration Data from EEPROM...");

  qtrrc.calibrate(); 
  EEPROM.readBlock<unsigned int>(addrCalibratedMinimumOn, qtrrc.calibratedMinimumOn, 8);
  EEPROM.readBlock<unsigned int>(addrCalibratedMaximumOn, qtrrc.calibratedMaximumOn, 8);

  Serial.println("EEPROM Recall Complete");
}
void steer(int angle) {
  if (angle >= steeringAngleMin && angle <= steeringAngleMax) {
    steering.write(angle);
  }
  else if (angle < steeringAngleMin) {
    steering.write(steeringAngleMin);
  }
  else if (angle > steeringAngleMax) {
    steering.write(steeringAngleMax);
  }
}
void drive(bool vor, int v) {
  if(start){
    digitalWrite(in4, !vor);
    digitalWrite(in3, vor);
    if (v >= 255) {
      analogWrite(enB, 255);
    }
    else if (v <= 0) {
     //stopCar(); 
     analogWrite(enB, 0);
    }
    else {
      analogWrite(enB, v);
    }
  }
  else{
    digitalWrite(in3, LOW);
    digitalWrite(in4, LOW);
    analogWrite(enB, 0);
  }
}
void stopCar() {
  start = false; 
}
void togglePlatoon(bool start, bool first) {
  if (start && !first) {
    vmax =  vplatoon * vmaxconst;
    Setpoint = SETPOINTPLATOON;
    pid.SetOutputLimits(OUTPUTMIN, vmax);
    steeringFactor = vSteeringFactor;
    
  }
  else if (start && first) {
    vmax = vplatoonfirst * vmaxconst;
     Setpoint = SETPOINTPLATOON;
     pid.SetOutputLimits(OUTPUTMIN, vmax);
     steeringFactor = vSteeringFactorPlatooning; 
    
  }
  else {
     Setpoint = SETPOINTCONST;
     vmax = vmaxconst; 
     pid.SetOutputLimits(OUTPUTMIN, vmax); 
     steeringFactor = vSteeringFactor;
  }
}
void startCar(){
  start = true ; 
}
void receiveEvent(int bytes) {
  minimalDistance = Wire.read();    // read one character from the I2C
}
void setup() {
  Wire.begin();
  //Wire.beginTransmission(ADDRESSNANO);
  Wire.onReceive(receiveEvent);
  Serial.begin(9600);
  steering.attach(servosignal);
  pinMode(enB, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  analogWrite(enB, 0);

 

  recallQTR();
  readQTR();

  pid.SetMode(AUTOMATIC); 
  pid.SetOutputLimits(OUTPUTMIN, vmax);
  //stopCar(); 
  togglePlatoon(true,false); 
}

void loop() {

  double deltav = pow(abs(steeringAngle -steeringDiff)/steeringDiff, 2) * steeringFactor ;    
  Input = minimalDistance;
  pid.Compute();
  //Serial.println(Output); 
  deltav *= Output/vmax; 
  drive(true, Output + deltav);
  
  unsigned int p = qtrrc.readLine(sensorValues);
  //Serial.print(p);
  if ( p < minValue) {
    p = minValue;
  }
  if (p > maxValue) {
    p = maxValue;
  }
  steeringAngle = map(p, minValue, maxValue, steeringAngleMax, steeringAngleMin);
  //Serial.print("\t");
  //q   qxaSerial.println(steeringAngle);
  steer(steeringAngle);
  while (Serial.available() > 0) {
    char message = Serial.read();
    switch (message) {
      case 'p':
      case 'P': togglePlatoon(true, false);Serial.println("Start Platoon"); break;
      case 'f':
      case 'F': togglePlatoon(true, true);Serial.println("Start Platoon Leadership");  break;
      case 'n':
      case 'N': togglePlatoon(false, false);Serial.println("Stop Platoon");  break;
      case 's':
      case 'S': startCar();Serial.println("Start Vehicle");  break;
      case 'b':
      case 'B': stopCar();Serial.println("Stop Vehicle");  break;
      case 'D':
      case 'd': Serial.println(Output); break; 
      default: Serial.println("Invalid serial message");
    }
  }
}

