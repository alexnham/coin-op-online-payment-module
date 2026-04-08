/*
  Huebsch Laundry Pulse Controller — Polling Mode
  Freenove ESP32-WROVER

  Instead of hosting a web server, the ESP32 polls your cloud app
  every 2 seconds for pending jobs. No port forwarding needed.

  Wiring:
    GPIO5 → Relay IN
    5V    → Relay VCC
    GND   → Relay GND
    Relay COM → Start Pulse wire (washer control board)
    Relay NO  → GND/return wire

  Setup:
     1. Fill in WIFI_SSID, WIFI_PASS, SERVER_URL, and MACHINE_API_KEY below
     2. Get MACHINE_API_KEY from the admin panel after adding your machine
    3. Flash and open Serial Monitor at 115200 baud
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── CONFIG — fill these in ──────────────────────────────
const char* WIFI_SSID       = "wifi_ssid";
const char* WIFI_PASS       = "wifi_password";
const char* SERVER_URL      = "server_url"; // no trailing slash
const char* MACHINE_API_KEY = "machine_api_key";
const int   RELAY_PIN       = 5;
const int   PULSE_MS        = 40;   // relay on duration in ms
const int   POLL_INTERVAL   = 2000;  // poll every 2 seconds
// ────────────────────────────────────────────────────────

unsigned long lastPoll = 0;

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  Serial.println("\n[BOOT] Huebsch Laundry Controller");
  Serial.println("[BOOT] Connecting to WiFi...");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (++attempts > 40) {
      Serial.println("\n[ERROR] WiFi failed — rebooting");
      ESP.restart();
    }
  }

  Serial.println();
  Serial.print("[WiFi] Connected. IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("[READY] Polling for jobs...");
}

void firePulse() {

  Serial.println("[RELAY] Firing pulse");

  for(int i = 0; i < 3; i ++) {
    digitalWrite(RELAY_PIN, HIGH);
    delay(500); // settle

    // Simulate coin interrupting beam
    digitalWrite(RELAY_PIN, LOW);
    delay(PULSE_MS);   // coin crossing first sensor
    digitalWrite(RELAY_PIN, HIGH);

    delay(400);
        
  }
 
  
  delay(500);
  Serial.println("[RELAY] Done");
}

void sendAck(const String& jobId, bool success) {
  HTTPClient http;
  String url = String(SERVER_URL) + "/api/machines/ack";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"key\":\"" + String(MACHINE_API_KEY) + "\",\"jobId\":\"" + jobId + "\",\"success\":" + (success ? "true" : "false") + "}";

  int code = http.POST(body);
  Serial.printf("[ACK] Job %s → %s (HTTP %d)\n", jobId.c_str(), success ? "DONE" : "FAILED", code);
  http.end();
}

void pollForJob() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARN] WiFi disconnected — reconnecting");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/machines/poll?key=" + String(MACHINE_API_KEY);
  http.begin(url);
  http.setTimeout(5000);

  int code = http.GET();

  if (code != 200) {
    Serial.printf("[POLL] HTTP %d\n", code);
    http.end();
    return;
  }

  String payload = http.getString();
  http.end();

  // Parse JSON
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload);
  if (err) {
    Serial.println("[POLL] JSON parse error");
    return;
  }

  // null job = nothing to do (silent, happens every 2s)
  if (doc["job"].isNull()) return;

  String jobId = doc["job"]["id"].as<String>();
  Serial.printf("[POLL] Got job: %s\n", jobId.c_str());

  // Fire the relay
  firePulse();

  // Report back
  sendAck(jobId, true);
}

void loop() {
  unsigned long now = millis();
  if (now - lastPoll >= POLL_INTERVAL) {
    lastPoll = now;
    pollForJob();
  }
}
