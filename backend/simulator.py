import json
import logging
import os
import random
import time
import paho.mqtt.client as mqtt

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [IoT-Simulator]: %(message)s"
)
logger = logging.getLogger("HardwareSimulator")

# Broker configuration
BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")
PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = os.getenv("MQTT_TOPIC", "stratasense/mine/sensor1")

client = mqtt.Client(client_id="StrataSense-Node-Virtual-ESP32")

try:
    client.connect(BROKER, PORT, 60)
    logger.info("Virtual ESP32 Inclinometer Array connected to %s:%d. Publishing on '%s'", BROKER, PORT, TOPIC)
except Exception as e:
    logger.error("Failed to connect to MQTT broker: %s", e)
    exit(1)

def generate_telemetry_frame():
    """Simulates multi-parameter sensor readings from an underground IoT node."""
    # Simulates tilt variations (degrees), vibration velocity (mm/s), ultrasonic roof clearance (cm), and gas ADC
    return {
        "node_id": "NODE-01",
        "tilt": round(random.uniform(15.0, 75.0), 2),
        "vibration": round(random.uniform(2.5, 12.0), 2),
        "distance": round(random.uniform(60.0, 180.0), 2),
        "gas_adc": random.randint(180, 520)
    }

def run_simulation(interval_seconds: float = 2.0):
    logger.info("Initiating sensor telemetry broadcast cycle (Interval: %.1fs)...", interval_seconds)
    try:
        while True:
            payload = generate_telemetry_frame()
            serialized = json.dumps(payload)
            client.publish(TOPIC, serialized)
            logger.info("Broadcasted Telemetry -> Node: %s | Tilt: %s° | Vib: %s mm/s | Dist: %s cm",
                        payload["node_id"], payload["tilt"], payload["vibration"], payload["distance"])
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        logger.info("Simulation halted by operator.")
        client.disconnect()

if __name__ == "__main__":
    run_simulation()
