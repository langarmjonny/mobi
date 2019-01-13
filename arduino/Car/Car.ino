#include<Servo.h>
#include <QTRSensors.h>

#define NUM_SENSORS   8     
#define TIMEOUT       2500  
#define EMITTER_PIN   QTR_NO_EMITTER_PIN//TODO */
#define enB           11
#define in3           16
#define in4           15
#define servosignal   A0
#define trigger    10
#define triggerR   13
#define  triggerL  12 
#define echo  A3 
#define  echoR A5 
#define  echoL A4

Servo lenkung;

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
  return distance; 
}
void lenke(int winkel){
  if(winkel >= 0 && winkel <= 90){
    lenkung.write(winkel);
  }
} 
void fahre(bool vor, int v){
   digitalWrite(in4, !vor);
   digitalWrite(in3, vor); 
   analogWrite(enB, v);
}
void stoppe(){
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  analogWrite(enB, 0); 
}
void setup() {
 Serial.begin(9600); 
 lenkung.attach(servosignal);                             
 lenke(45); 
 pinMode(enB,OUTPUT); 
 pinMode(in3, OUTPUT);
 pinMode(in4, OUTPUT);
 digitalWrite(in3, HIGH);
 digitalWrite(in4, LOW); 
 analogWrite(enB, 0);
 
 pinMode(trigger, OUTPUT); 
 pinMode(echo, INPUT);
 pinMode(triggerL, OUTPUT);
 pinMode(echoL, INPUT);
 pinMode(triggerR, OUTPUT);
 pinMode(echoR, INPUT);
 
  delay(500);
  pinMode(13, OUTPUT);
  
  digitalWrite(13, HIGH);    // turn on Arduino's LED to indicate we are in calibration mode
  for (int i = 0; i < 400; i++)  // make the calibration take about 10 seconds
  {
    qtrrc.calibrate();       // reads all sensors 10 times at 2500 us per read (i.e. ~25 ms per call)
  }
  digitalWrite(13, LOW);     // turn off Arduino's LED to indicate we are through with calibration

  // print the calibration minimum values measured when emitters were on
  Serial.begin(9600);
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
  Serial.println();
  delay(500);

  
}

void loop() {
  fahre(true, 250); 
  /*for (int i = 0; i< 250; i = i +10){
    fahre(true, 255); 
    delay(1000); 
  }*/
  double entfernung = SonarSensor(trigger , echo);
  double entfernungL = SonarSensor(triggerL, echoL);
  double entfernungR = SonarSensor(triggerR, echoR);
  
  unsigned int position = qtrrc.readLine(sensorValues);
  for (unsigned char i = 0; i < NUM_SENSORS; i++)
  {
    Serial.print(sensorValues[i]);
    Serial.print('\t');
  }
  int p = position ;
  //TODO
  p -= 2250; 
  if ( p< 0){
    p = 0;
  }
  if(p> 5000){
    p = 5000; 
  } 
  int lenkgrad  = p * 9; 
  lenkgrad /= 300; //Eigtl 500 TODO
  lenke(lenkgrad); 
  Serial.println(lenkgrad); 
  delay(250); 
 
  
}


