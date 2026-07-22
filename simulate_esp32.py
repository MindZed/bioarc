import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime

MQTT_BROKER = "droplet.sewen.me"
MQTT_PORT = 1777

TOPIC_TELEMETRY = "bioarc/device_01/telemetry"

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[MQTT Simulator] Connected to broker successfully!")
    else:
        print(f"[MQTT Simulator] Failed to connect, return code {rc}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, "BioArc-ESP32-Simulator")
client.username_pw_set("bioarc_device", "bioarc_secure_2026")
client.on_connect = on_connect

print(f"[MQTT Simulator] Connecting to {MQTT_BROKER}:{MQTT_PORT}...")
try:
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    print("[MQTT Simulator] Started sending telemetry packets every 5 seconds...")
    while True:
        now = datetime.now()
        
        payload = {
            "state": "IDLE",
            "water_temp": round(26.5 + random.uniform(-0.5, 0.5), 1),
            "air_temp": round(24.2 + random.uniform(-0.3, 0.3), 1),
            "humidity": round(60.0 + random.uniform(-2.0, 2.0), 0),
            "pressure": 1013.0,
            "level_cm": 12,
            "TCS34725_R": random.randint(480, 520),
            "TCS34725_G": random.randint(1180, 1220),
            "TCS34725_B": random.randint(440, 460),
            "TCS34725_C": random.randint(4900, 5100),
            "Photoperiod_Active": 1,
            "Actuator_AirPump": 1,
            "Hour_of_Day": now.hour,
            "relays": {
                "intake": False,
                "outtake": False,
                "air": True,
                "light": True,
                "agitator": False
            }
        }
        
        message_json = json.dumps(payload)
        client.publish(TOPIC_TELEMETRY, message_json)
        print(f"[{now.strftime('%H:%M:%S')}] Published: {message_json}")
        time.sleep(5)

except Exception as e:
    print(f"[MQTT Simulator] Error: {e}")
