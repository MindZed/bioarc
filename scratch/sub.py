import paho.mqtt.client as mqtt

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("bioarc/device_01/telemetry")

def on_message(client, userdata, msg):
    print(f"Received from Mosquitto on VPS: {msg.topic} {msg.payload.decode()}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, "BioArc-Test-Subscriber")
client.on_connect = on_connect
client.on_message = on_message

client.connect("droplet.sewen.me", 1777, 60)
client.loop_start()

import time
time.sleep(15)
client.loop_stop()
