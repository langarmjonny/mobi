#include<NewPing.h>

#define trigger       10
#define triggerR      13  
#define triggerL      12 
#define echo          A3 
#define echoR         A5 
#define echoL         A4
#define MaxDistance   100
NewPing sonarM(trigger, echo, MaxDistance);
NewPing sonarR(triggerR, echoR, MaxDistance);
NewPing sonarL(triggerL, echoL, MaxDistance);
double SonarSensor(NewPing sonar) {
  double distance = sonar.ping_cm(); 
  /*if(distance >MaxDistance){
    distance =  MaxDistance; 
  }*/
  if(distance < 0){
    distance = 0; 
  }
  return distance; 
}
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600); 
  
}

void loop() {
  double distanceM = SonarSensor(sonarM);
  double distanceL = SonarSensor(sonarL);
  double distanceR = SonarSensor(sonarR);
  Serial.println("L     M      R"); 
  Serial.print("\t");
  Serial.print(distanceL); 
  Serial.print("\t");
   Serial.print(distanceM); 
  Serial.print("\t");
   Serial.println(distanceR); 
  delay(100); 
  // put your main code here, to run repeatedly:

}
