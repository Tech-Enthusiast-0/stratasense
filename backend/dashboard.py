import os
import time
import pandas as pd
import requests
import streamlit as st

# UI Configuration for low-latency operational display
st.set_page_config(
    layout="wide",
    page_title="StrataSense Live Command HUD",
    page_icon="🚨",
    initial_sidebar_state="collapsed"
)

# Custom CSS for high-contrast industrial interface
st.markdown("""
    <style>
    .stApp [data-testid="stToolbar"] {display: none;}
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    div[data-testid="metric-container"] {
        background-color: #121824;
        border: 1px solid #1E293B;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }
    </style>
    """, unsafe_allow_html=True)

st.title("🚨 StrataSense — Field Operations HUD")
st.caption("Underground Telemetry & Rock Deformation Command System | JEC SIH Architecture")

# Isolated display containers to prevent full UI re-renders
status_placeholder = st.empty()

col1, col2, col3, col4 = st.columns(4)
score_ph = col1.empty()
tilt_ph = col2.empty()
gas_ph = col3.empty()
dist_ph = col4.empty()

chart_placeholder = st.empty()

# Rolling telemetry buffer for trend analysis
if 'history' not in st.session_state:
    st.session_state.history = pd.DataFrame(columns=['Time', 'Score'])

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

def update_dashboard():
    try:
        response = requests.get(f"{BACKEND_URL}/api/live-status", timeout=1)
        if response.status_code == 200:
            data = response.json()
            score = data.get('risk_score', 0.0)
            status = data.get('zone_status', "Waiting for Data")
            tilt = data.get('tilt', 0.0)
            gas = data.get('gas_adc', 0)
            dist = data.get('distance', 0.0)

            # 1. Update Evacuation Status Banner
            with status_placeholder.container():
                if "DANGER" in status:
                    st.error(f"🚨 CRITICAL EVACUATION ALERT: {status}")
                elif "WARNING" in status:
                    st.warning(f"⚠️ ELEVATED STRATA RISK: {status}")
                else:
                    st.success(f"✅ NOMINAL STABILITY: {status}")

            # 2. Update Live Sensor Telemetry Cards
            score_ph.metric(label="Overall Risk Score", value=f"{score:.1f}/100")
            tilt_ph.metric(label="Inclinometer Tilt Angle", value=f"{tilt:.1f}°")
            gas_ph.metric(label="MQ-135 Gas Exposure", value=f"{gas} ADC")
            dist_ph.metric(label="Roof Subsidence Clearance", value=f"{dist:.1f} cm")

            # 3. Maintain Rolling Telemetry History
            current_time = time.strftime("%H:%M:%S")
            new_entry = pd.DataFrame({'Time': [current_time], 'Score': [score]})
            st.session_state.history = pd.concat([st.session_state.history, new_entry], ignore_index=True)
            if len(st.session_state.history) > 25:
                st.session_state.history = st.session_state.history.tail(25)

            # Render lightweight real-time deformation curve
            chart_placeholder.line_chart(
                st.session_state.history.set_index('Time'),
                use_container_width=True,
                color="#EF4444"
            )
    except requests.exceptions.RequestException:
        status_placeholder.warning("⚠️ Telemetry stream disconnected. Awaiting gateway connection...")

# High-frequency poll cycle
while True:
    update_dashboard()
    time.sleep(0.5)
