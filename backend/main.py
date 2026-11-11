import asyncio
import json
import logging
import os
import threading
import time
from typing import List, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import paho.mqtt.client as mqtt
import requests

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("StrataSense-Core")

app = FastAPI(
    title="StrataSense API",
    description="Real-Time Underground Strata Deformation & IoT Telemetry Ingestion Engine",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from environment
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8846727943:AAGxpWnESVUXnFPVeTMKWme3zvQ6Y0h-ETs")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "-1004430425473")
MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "stratasense/mine/sensor1")

# Global Telemetry State
latest_sensor_data: Dict[str, Any] = {
    "node_id": "NODE-01",
    "tilt": 0.0,
    "vibration": 0.0,
    "distance": 0.0,
    "gas_adc": 0,
    "risk_score": 0.0,
    "zone_status": "🟢 SAFE",
    "zone": "Zone A1",
    "timestamp": time.time()
}

active_alerts: List[Dict[str, Any]] = []
last_alert_time: float = 0.0
active_websockets: List[WebSocket] = []


def _dispatch_telegram_alert(message: str) -> None:
    """Asynchronous worker for dispatching critical Telegram alert webhooks."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("Telegram credentials not configured; alert skipped.")
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
        response = requests.post(url, json=payload, timeout=3)
        if response.status_code == 200:
            logger.info("Emergency Telegram broadcast successfully delivered.")
        else:
            logger.error("Failed to send Telegram alert: HTTP %d", response.status_code)
    except Exception as exc:
        logger.error("Telegram webhook dispatch error: %s", exc)


def send_emergency_alert(message: str) -> None:
    """Spawns an isolated background thread to prevent blocking the MQTT pipeline."""
    thread = threading.Thread(target=_dispatch_telegram_alert, args=(message,), daemon=True)
    thread.start()


def on_mqtt_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT Broker at %s:%d. Subscribed to '%s'", MQTT_BROKER, MQTT_PORT, MQTT_TOPIC)
        client.subscribe(MQTT_TOPIC)
    else:
        logger.error("MQTT connection failed with return code %d", rc)


def on_mqtt_message(client, userdata, msg):
    """Parses incoming IoT telemetry, evaluates mathematical risk matrix, and classifies safety zones."""
    global latest_sensor_data, last_alert_time, active_alerts
    try:
        raw_payload = json.loads(msg.payload.decode("utf-8"))
        node_id = str(raw_payload.get("node_id", "NODE-01"))
        tilt = float(raw_payload.get("tilt", 0.0))
        vib = float(raw_payload.get("vibration", 0.0))
        dist = float(raw_payload.get("distance", 0.0))
        gas = int(raw_payload.get("gas_adc", 0))

        # Core Strata Deformation Risk Formula
        # Weighted aggregate of angular displacement (tilt) and high-frequency seismic amplitude (vibration)
        risk_score = round((tilt * 0.4) + (vib * 6.0), 2)

        # Risk Classification and Evacuation Dispatch
        if risk_score > 85.0:
            zone_status = "🔴 DANGER: EVACUATE"
            now = time.time()
            if (now - last_alert_time) > 10.0:
                alert_text = (
                    f"🚨 *CRITICAL STRATA ALERT: ZONE A1*\n"
                    f"• *Node ID:* `{node_id}`\n"
                    f"• *Risk Score:* `{risk_score}/100`\n"
                    f"• *Angular Tilt:* `{tilt}°`\n"
                    f"• *Vibration Amplitude:* `{vib} mm/s`\n"
                    f"• *Immediate Action:* Trigger Evacuation Alarm!"
                )
                send_emergency_alert(alert_text)
                last_alert_time = now

                active_alerts.insert(0, {
                    "id": f"ALT-{int(now)}",
                    "type": "EVACUATION",
                    "zone": "Zone A1",
                    "node_id": node_id,
                    "risk": risk_score,
                    "message": f"Critical rock displacement detected ({risk_score}/100)",
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                })
                if len(active_alerts) > 50:
                    active_alerts.pop()

        elif risk_score > 60.0:
            zone_status = "🟡 WARNING: ELEVATED RISK"
        else:
            zone_status = "🟢 SAFE: NORMAL ACTIVITY"

        latest_sensor_data = {
            "node_id": node_id,
            "tilt": tilt,
            "vibration": vib,
            "distance": dist,
            "gas_adc": gas,
            "risk_score": risk_score,
            "zone_status": zone_status,
            "zone": "Zone A1",
            "timestamp": time.time()
        }
        logger.debug("Ingested telemetry frame: %s | Risk: %f", node_id, risk_score)

    except json.JSONDecodeError as err:
        logger.warning("Malformed JSON telemetry rejected: %s", err)
    except Exception as exc:
        logger.error("Telemetry processing failure: %s", exc)


# Initialize MQTT Client
mqtt_client = mqtt.Client(client_id="StrataSense-Core-Gateway")
mqtt_client.on_connect = on_mqtt_connect
mqtt_client.on_message = on_mqtt_message

try:
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
    mqtt_client.loop_start()
except Exception as e:
    logger.error("Could not initiate MQTT loop: %s", e)


# --- REST API ROUTES ---

@app.get("/")
def root():
    return {
        "system": "StrataSense Core Gateway",
        "status": "ONLINE",
        "version": "1.0.0",
        "endpoints": ["/api/live-status", "/api/sensors", "/api/zones", "/api/alerts", "/api/health", "/ws"]
    }


@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "mqtt_connected": mqtt_client.is_connected(),
        "active_ws_clients": len(active_websockets),
        "timestamp": time.time()
    }


@app.get("/api/live-status")
def get_live_status():
    """Provides current telemetry snapshot for HTTP polling clients."""
    return latest_sensor_data


@app.get("/api/sensors")
def get_sensors():
    """Returns active IoT sensor nodes across mine extraction zones."""
    return [
        {
            "id": latest_sensor_data.get("node_id", "NODE-01"),
            "name": "Primary Inclinometer & Geo-Probe",
            "zone": "Zone A1",
            "tilt": latest_sensor_data.get("tilt", 0.0),
            "vibration": latest_sensor_data.get("vibration", 0.0),
            "distance": latest_sensor_data.get("distance", 0.0),
            "gas_adc": latest_sensor_data.get("gas_adc", 0),
            "risk": latest_sensor_data.get("risk_score", 0.0),
            "status": "ACTIVE"
        },
        {
            "id": "NODE-02",
            "name": "Sub-level Roof Subsidence Array",
            "zone": "Zone B2",
            "tilt": 4.2,
            "vibration": 1.1,
            "distance": 142.5,
            "gas_adc": 210,
            "risk": 18.5,
            "status": "ACTIVE"
        },
        {
            "id": "NODE-03",
            "name": "Exhaust Shaft Gas & Acoustic Mon.",
            "zone": "Zone C1",
            "tilt": 2.1,
            "vibration": 0.8,
            "distance": 189.0,
            "gas_adc": 340,
            "risk": 12.4,
            "status": "ACTIVE"
        }
    ]


@app.get("/api/zones")
def get_zones():
    """Returns aggregated status of mine galleries and operational zones."""
    return [
        {
            "id": "Zone A1",
            "name": "Main Extraction Shaft",
            "status": latest_sensor_data.get("zone_status", "🟢 SAFE"),
            "risk_score": latest_sensor_data.get("risk_score", 0.0),
            "sensor_count": 4,
            "workers_present": 18
        },
        {
            "id": "Zone B2",
            "name": "Secondary Drift Section",
            "status": "🟢 SAFE",
            "risk_score": 18.5,
            "sensor_count": 3,
            "workers_present": 12
        },
        {
            "id": "Zone C1",
            "name": "Ventilation & Ingress Shaft",
            "status": "🟢 SAFE",
            "risk_score": 12.4,
            "sensor_count": 2,
            "workers_present": 4
        }
    ]


@app.get("/api/alerts")
def get_alerts():
    """Returns history of trigger events and critical thresholds."""
    return active_alerts


# --- REAL-TIME WEBSOCKET ROUTE ---

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """High-frequency real-time telemetry stream powering the React GIS Command Center."""
    await websocket.accept()
    active_websockets.append(websocket)
    logger.info("New WebSocket connection established. Total clients: %d", len(active_websockets))
    try:
        while True:
            # Broadcast telemetry snapshot every second to connected frontends
            await websocket.send_json(latest_sensor_data)
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        active_websockets.remove(websocket)
        logger.info("WebSocket client disconnected. Remaining clients: %d", len(active_websockets))
    except Exception as exc:
        logger.warning("WebSocket exception: %s", exc)
        if websocket in active_websockets:
            active_websockets.remove(websocket)
