int cRx, cRy, cLx, cLy; // center values

void setup() {
  Serial.begin(9600);
  delay(500);
  cRx = analogRead(A2);
  cRy = analogRead(A3);
  cLx = analogRead(A1);
  cLy = analogRead(A0);
}

void loop() {
  int rx = analogRead(A2) - cRx; // right x
  int ry = analogRead(A3) - cRy; // right z
  int lx = analogRead(A1) - cLx; // left  rotation
  int ly = analogRead(A0) - cLy; // left  y

  if (abs(rx) < 40)
    rx = 0;
  if (abs(ry) < 40)
    ry = 0;
  if (abs(lx) < 40)
    lx = 0;
  if (abs(ly) < 40)
    ly = 0;

  Serial.print("{\"left\":{\"x\":");
  Serial.print(lx);
  Serial.print(",\"y\":");
  Serial.print(ly);
  Serial.print("},\"right\":{\"x\":");
  Serial.print(rx);
  Serial.print(",\"y\":");
  Serial.print(ry);
  Serial.println("}}");
  delay(20);
}