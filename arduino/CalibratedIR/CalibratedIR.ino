#include <EEPROMex.h>
#include <QTRSensors.h>
#include<Servo.h>

#define NUM_SENSORS   8     
#define TIMEOUT       2500  
#define EMITTER_PIN   QTR_NO_EMITTER_PIN
#define servosignal   A0
#define addrCalibratedMinimumOn 0
#define addrCalibratedMaximumOn 100

Servo steering;
QTRSensorsRC qtrrc((unsigned char[]) {2, 3, 4, 5, 6, 7, 8, 9},
  NUM_SENSORS, TIMEOUT, EMITTER_PIN);
unsigned int sensorValues[NUM_SENSORS];

void steer(int angle){
  if(angle >= 0 && angle <= 90){
    steering.write(angle);
  }
}

void storeQTR()
{
  Serial.println();
  Serial.println("Storing Calibration Data into EEPROM...");

  EEPROM.writeBlock<unsigned int>(addrCalibratedMinimumOn, qtrrc.calibratedMinimumOn, 8);
  EEPROM.writeBlock<unsigned int>(addrCalibratedMaximumOn, qtrrc.calibratedMaximumOn, 8);

  Serial.println("EEPROM Storage Complete");
}
void calibrateIR(){
  steer(0); 
  for (int i = 0; i < 400; i++) {
    qtrrc.calibrate();       
  }
  
  for (int i = 0; i < NUM_SENSORS; i++){
    Serial.print(qtrrc.calibratedMinimumOn[i]);
    Serial.print(' ');
  }
  Serial.println();
  for (int i = 0; i < NUM_SENSORS; i++){
    Serial.print(qtrrc.calibratedMaximumOn[i]);
    Serial.print(' ');
  }
  Serial.println();
  Serial.println();
  storeQTR();
  steer(45);
}
void setup() {
  Serial.begin(9600);
  steering.attach(servosignal);  
  calibrateIR();
  // put your setup code here, to run once:
}

void loop() {
  unsigned int position = qtrrc.readLine(sensorValues, QTR_EMITTERS_ON, true);
  for (unsigned char i = 0; i < NUM_SENSORS; i++)
  {
    Serial.print(sensorValues[i]);
    Serial.print('\t');
  }
  int p = position ;
  //TODO
  p -= 2250; 
  if( p< 0){
    p = 0;
  }
  if(p>5000){
    p = 5000; 
  } 
  int steeringAngle = p * 9; 
  steeringAngle /= 300; //Eigtl 500 TODO
  steer(steeringAngle); 
  Serial.println(steeringAngle); 


}
