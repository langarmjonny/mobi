#include<Servo.h>
#include <QTRSensors.h>

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

#define vmaxconst     140
#define vplatoon  0.8 
#define vplatoonfirst  0.5 
#define distanceMinConst 10
#define distanceMinConstPlatooning 5
#define vstep 20

Servo steering;
int velocity = 0;
int vmax = vmaxconst;
int distanceMin = distanceMinConst; 
int steeringAngle = 45; 

QTRSensorsRC qtrrc((unsigned char[]) {2, 3, 4, 5, 6, 7, 8, 9},
  NUM_SENSORS, TIMEOUT, EMITTER_PIN);
unsigned int sensorValues[NUM_SENSORS];

double SonarSensor(int trigPin,int echoPin) {
  long duration = 0;
  double distance = 0; 
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW); 
  duration = pulseIn(echoPin, HIGH);
  distance  = (duration/2) * 0.03432; 
  if(distance >500){
    distance =  500; 
  }
  if(distance == 0){
    distance = 0; 
  }
  return distance; 
}
void steer(int angle){
  if(angle >= 0 && angle <= 90){
    steering.write(angle);
  }
  else if(angle < 0){
    steering.write(0); 
  }
  else if(angle > 90){
    steering.write(90);
  }
} 
void drive(bool vor, int v){
   digitalWrite(in4, !vor);
   digitalWrite(in3, vor); 
   if(v >= 255){
    analogWrite(enB, 255);

   }
   else if(v<= 0){
    analogWrite(enB,abs(v)); 
    digitalWrite(in4, vor);
   digitalWrite(in3, !vor); 
   }
   else{
    analogWrite(enB, v);
   }
}
void stopCar(){
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  analogWrite(enB, 0); 
}


void setup() {
  Serial.begin(9600); 
  steering.attach(servosignal);                             
  pinMode(enB,OUTPUT); 
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
}

void loop() {

  

  steer(steeringAngle); 
  //Serial.println(steeringAngle); 
  while(Serial.available()>0){
    char message = Serial.read();
    switch(message){
      case 'V':
      case 'v': velocity += vstep; break; 
      case 'h': 
      case 'H': velocity -= vstep;break; 
      case 'r': 
      case 'R': steeringAngle -= 10;break;
      case 'l': 
      case 'L': steeringAngle += 10;break;
      default: Serial.println("Invalid serial message"); 
    }
  }
  steer( steeringAngle); 
  drive(true, velocity ); 
}
