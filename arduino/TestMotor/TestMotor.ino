#define enB           11
#define in3           16
#define in4           15

void drive(bool vor, int v){
   digitalWrite(in4, !vor);
   digitalWrite(in3, vor); 
   analogWrite(enB, v);
}
void brakeLow() {
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  analogWrite(enB, 0);
  delay(5000); 
}
void brakeHigh() {
  digitalWrite(in3, HIGH);
  digitalWrite(in4, HIGH);
  analogWrite(enB, 0);
  delay(5000); 
}
void setup() {
  // put your setup code here, to run once:
Serial.begin(9600); 
  pinMode(enB,OUTPUT); 
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);
  drive(true, 0);
}

void loop() {
  /*for(int i=0;i<= 255; i=i+10){
    drive(true,i );
    Serial.println(i); 
    delay(500);
  }
  for(int i=250;i >= 0; i=i-10){
    drive(true, i); 
    Serial.println(i); 
    delay(500);
  }*/
  drive(true, 255);
  while (Serial.available() > 0) {
    char message = Serial.read();
    switch (message) {
      case '0': drive(true, 0); delay(5000); break;
      case 'f':
      case 'F': brakeHigh(); break;
      case 's':
      case 'S': brakeLow(); break;
      default: Serial.println("Invalid serial message");
    }
  }
  // put your main code here, to run repeatedly:

}
