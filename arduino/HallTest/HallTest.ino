
void setup() {
  Serial.begin( 9600); 
  pinMode(A0, INPUT); 
  // put your setup code here, to run once:

}

void loop() {
  delay( 10);
  Serial.println(analogRead(A0));
  // put your main code here, to run repeatedly:

}
