#include<Servo.h>
#include <QTRSensors.h>
#include <EEPROMex.h>
#include<NewPing.h>

#define NUM_SENSORS   8
#define TIMEOUT       2500
#define EMITTER_PIN   QTR_NO_EMITTER_PIN
#define enB           11
#define in3           16
#define in4           15
#define servosignal   A0
#define trigger       10
#define triggerR      13
#define triggerL      12
#define echo          A3
#define echoR         A5
#define echoL         A4
#define addrCalibratedMinimumOn 0
#define addrCalibratedMaximumOn 100

#define vmaxconst     90 //90 bei Jonas
#define vplatoon  0.8
#define vplatoonfirst  0.5
#define distanceMinConst 18
#define distanceMinConstPlatooning 10
#define stopDistance 8
#define vstep 5
#define steeringAngleMin 15 //15 bei Jonas
#define steeringAngleMax 75 //75  bei Jonas
#define steeringDiff 30 //30 bei Jonas
#define vSteeringFactor 25
#define minValue 1500 //500 bei Jonas 
#define maxValue  6000 //7000 bei Jonas

#define MaxDistanceSonar   200

NewPing sonarM(trigger, echo, MaxDistanceSonar);
NewPing sonarR(triggerR, echoR, MaxDistanceSonar);
NewPing sonarL(triggerL, echoL, MaxDistanceSonar);
Servo steering;
int velocity = 0;
int vmax = vmaxconst;
int distanceMin = distanceMinConst;
int steeringAngle = 45;

QTRSensorsRC qtrrc((unsigned char[]) {
  2, 3, 4, 5, 6, 7, 8, 9
},
NUM_SENSORS, TIMEOUT, EMITTER_PIN);
unsigned int sensorValues[NUM_SENSORS];


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


void setup() {
  Serial.begin(9600);
  steering.attach(servosignal);
  pinMode(enB, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  analogWrite(enB, 0);

  pinMode(trigger, OUTPUT);
  pinMode(echo, INPUT);
  pinMode(triggerL, OUTPUT);
  pinMode(echoL, INPUT);
  pinMode(triggerR, OUTPUT);
  pinMode(echoR, INPUT);

  recallQTR();
  readQTR();
}

void loop() {
  
  unsigned int position = qtrrc.readLine(sensorValues);
  for (unsigned char i = 0; i < NUM_SENSORS; i++)
    {
    Serial.print(sensorValues[i]);
    Serial.print('\t');
    }
  int p = position ;
  Serial.print("  Pos: ");
  Serial.print(p);
  Serial.println();
  
  //TODO

  if ( p < minValue) {
    p = minValue;
  }
  if (p > maxValue) {
    p = maxValue;
  }
  steeringAngle = map(p, minValue, maxValue, steeringAngleMax, steeringAngleMin);
  steer(steeringAngle);
  
  delay(100);
}
