#include<NewPing.h>
#include<Wire.h>

#define trigger       11
#define triggerR      12
#define triggerL      10
#define echo          8
#define echoR         9
#define echoL         7
#define hall  14 //A0

#define MaxDistanceSonar   30
#define ADDRESSUNO 0x00

NewPing sonarM(trigger, echo, MaxDistanceSonar);
NewPing sonarR(triggerR , echoR, MaxDistanceSonar);
NewPing sonarL(triggerL, echoL, MaxDistanceSonar);

int distanceM = 0;
int distanceL = 0;
int distanceR = 0; 
unsigned long startMillis = 0; 
unsigned long currentMillis = 0; 

int SonarSensor(NewPing sonar) {
  int distance = sonar.ping_cm(); 
  if(distance >MaxDistanceSonar){
    distance =  MaxDistanceSonar; 
  }
  if(distance <= 0){
    distance = MaxDistanceSonar ; 
  }
  return distance; 
}
void getRotation(){
  unsigned long m = millis(); 
  unsigned long diff = m - currentMillis;
  currentMillis = m;
  diff;
  Wire.beginTransmission(ADDRESSUNO);
  Wire.write(diff); 
  Wire.endTransmission(); 
}
void setup() {
  Wire.begin();
  pinMode(trigger, OUTPUT);
  pinMode(echo, INPUT);
  pinMode(triggerL, OUTPUT);
  pinMode(echoL, INPUT);
  pinMode(triggerR, OUTPUT);
  pinMode(echoR, INPUT);
  startMillis = millis(); 
  attachInterrupt(hall, getRotation, RISING); 
}

void loop() {
  distanceM = SonarSensor(sonarM);
  distanceL = SonarSensor(sonarL);
  distanceR = SonarSensor(sonarR);
  int minimalDistance = min(distanceM, min(distanceR, distanceL));
  Wire.beginTransmission(ADDRESSUNO);
  Wire.write(minimalDistance); 
  Wire.endTransmission(); 
  
}
