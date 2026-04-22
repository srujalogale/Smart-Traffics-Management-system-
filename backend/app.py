import cv2
import numpy as np
import threading
import time
import random
from ultralytics import YOLO
from flask import Flask, Response, jsonify, request
from flask_cors import CORS

# ─── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ─── Load YOLOv8 Model ────────────────────────────────────────────────────────
print("🔄 Loading YOLOv8 model...")
model = YOLO("yolov8n.pt")
print("✅ YOLOv8 model loaded.")

VEHICLE_CLASSES = ['car', 'bus', 'truck', 'motorcycle', 'motorbike']

# ─── Camera Setup ─────────────────────────────────────────────────────────────
cap = cv2.VideoCapture(0)
CAMERA_AVAILABLE = cap.isOpened()
print(f"📷 Camera: {'Connected ✅' if CAMERA_AVAILABLE else 'Not found ⚠️'}")

# ─── Constants ────────────────────────────────────────────────────────────────
CORRIDOR_LENGTH        = 6      # total signals in the corridor
AMBULANCE_ADVANCE_SECS = 8      # seconds before ambulance moves to next signal
PRE_GREEN_COUNT        = 3      # how many signals AHEAD to pre-clear green

# ─── Shared State ─────────────────────────────────────────────────────────────
state_lock = threading.Lock()

lane_counts = {
    'lane1': 0,
    'lane2': 0,
    'lane3': 0,
    'lane4': 0,
}

# Round-Robin 4-Lane Scheduler
scheduler_state = {
    'current_lane': 'lane1',
    'green_time_remaining': 10,
    'phase': 'GREEN',  # GREEN, YELLOW, RED
    'last_tick': time.time(),
}

# 6-signal corridor state (Emergency Override)
corridor_state = {
    'detected':          False,
    'vehicle_type':      'ambulance',
    'start_signal':      1,          # signal where ambulance was first detected
    'current_position':  0,          # signal ambulance is currently AT (1-indexed, 0 = not started)
    'cleared_signals':   [],         # signal IDs ambulance has already PASSED
    'active_greens':     [],         # signal IDs currently GREEN for corridor
    'timestamp':         None,
    'advance_timer':     None,       # time of last advance
    'consecutive_frames': 0          # frame buffer for detection robustenss
}

# System Configuration (Admin overrides)
system_config = {
    'weather': 'clear',  # 'clear', 'rain', 'fog'
    'min_green': 10,
    'max_green': 60,
    'yellow_time': 3,
}

# ─── Helper Functions ──────────────────────────────────────────────────────────

def calculate_green_time(vehicle_count: int) -> int:
    """Calculates green time based on count and current weather conditions."""
    base_time = vehicle_count * 2
    
    with state_lock:
        weather = system_config['weather']
        min_g   = system_config['min_green']
        max_g   = system_config['max_green']

    if weather == 'rain':
        # Rain: slower speeds require longer green phases, higher minimum
        base_time = vehicle_count * 2.5
        min_g = max(15, min_g)
    elif weather == 'fog':
        # Fog: poor visibility, restrict max green to prevent long high-speed periods
        max_g = min(40, max_g)

    return int(max(min_g, min(max_g, base_time)))


def compute_corridor_greens(current_pos: int) -> list:
    """
    Returns list of signal IDs that should be GREEN.
    Includes current position + up to PRE_GREEN_COUNT ahead.
    """
    if current_pos <= 0:
        return []
    greens = []
    for i in range(PRE_GREEN_COUNT + 1):
        sig = current_pos + i
        if sig <= CORRIDOR_LENGTH:
            greens.append(sig)
    return greens


def detect_ambulance_in_rois(frame: np.ndarray, vehicle_boxes: list) -> bool:
    """
    Improved ambulance detection:
    Instead of checking the WHOLE frame, we check each detected
    vehicle's bounding-box ROI individually.

    A vehicle is flagged as ambulance if:
      - Its ROI is >40% white  (large white body)
      - AND its ROI has >3% red pixels  (red cross / stripe)
    OR
      - Its ROI is >45% white AND box height/width ratio matches an ambulance profile

    This is far more accurate than the full-frame approach because
    even a small ambulance in corner of frame will be flagged correctly.
    """
    for (x1, y1, x2, y2) in vehicle_boxes:
        roi = frame[max(0, y1):max(0, y2), max(0, x1):max(0, x2)]
        if roi.size == 0 or roi.shape[0] < 10 or roi.shape[1] < 10:
            continue

        hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        total   = roi.shape[0] * roi.shape[1]

        # --- White body ---
        lower_white = np.array([0,   0,   170])
        upper_white = np.array([180, 50,  255])
        white_ratio = cv2.countNonZero(cv2.inRange(hsv_roi, lower_white, upper_white)) / total

        # --- Red markings (red cross / stripe) ---
        red_mask = cv2.bitwise_or(
            cv2.inRange(hsv_roi, np.array([0,  120, 100]), np.array([10,  255, 255])),
            cv2.inRange(hsv_roi, np.array([160,120, 100]), np.array([180, 255, 255])),
        )
        red_ratio = cv2.countNonZero(red_mask) / total

        # --- Blue markings (police/fire lights) ---
        blue_mask  = cv2.inRange(hsv_roi, np.array([100, 150, 100]), np.array([130, 255, 255]))
        blue_ratio = cv2.countNonZero(blue_mask) / total

        # Primary check: white body + red cross (stricter ratio)
        if white_ratio > 0.40 and red_ratio > 0.05:
            print(f"🚨 Ambulance ROI match: white={white_ratio:.2f} red={red_ratio:.2f}")
            return True

        # Secondary check: white body + blue lights (police/fire)
        if white_ratio > 0.45 and blue_ratio > 0.04:
            print(f"🚨 Emergency vehicle (blue lights) ROI match: white={white_ratio:.2f} blue={blue_ratio:.2f}")
            return True

    return False


def advance_ambulance_position():
    """
    Background thread: advances ambulance one signal every AMBULANCE_ADVANCE_SECS.
    Simulates ambulance moving through the corridor.
    When it passes all CORRIDOR_LENGTH signals, emergency is auto-cleared.
    """
    while True:
        time.sleep(AMBULANCE_ADVANCE_SECS)
        with state_lock:
            if not corridor_state['detected']:
                continue

            pos = corridor_state['current_position']

            if pos >= CORRIDOR_LENGTH:
                # Ambulance has cleared all signals — reset
                print("✅ Ambulance has cleared all corridor signals. Resuming normal operation.")
                corridor_state['detected']         = False
                corridor_state['current_position'] = 0
                corridor_state['cleared_signals']  = []
                corridor_state['active_greens']    = []
            else:
                # Mark current signal as cleared, advance
                if pos > 0:
                    corridor_state['cleared_signals'].append(pos)
                corridor_state['current_position'] = pos + 1
                corridor_state['active_greens']    = compute_corridor_greens(pos + 1)
                print(f"🚑 Ambulance advanced to Signal {pos + 1}  |  Green corridor: {corridor_state['active_greens']}")


_advance_thread = threading.Thread(target=advance_ambulance_position, daemon=True)
_advance_thread.start()


def traffic_scheduler_thread():
    """Background thread to manage the sequential 1->2->3->4 cycle based on dynamic durations."""
    lanes = ['lane1', 'lane2', 'lane3', 'lane4']
    
    while True:
        time.sleep(1)
        with state_lock:
            if corridor_state['detected']:
                continue
                
            now = time.time()
            dt = now - scheduler_state['last_tick']
            scheduler_state['last_tick'] = now
            
            if scheduler_state['green_time_remaining'] > 0:
                scheduler_state['green_time_remaining'] -= dt
            else:
                if scheduler_state['phase'] == 'GREEN':
                    scheduler_state['phase'] = 'YELLOW'
                    scheduler_state['green_time_remaining'] = system_config['yellow_time']
                elif scheduler_state['phase'] == 'YELLOW':
                    idx = lanes.index(scheduler_state['current_lane'])
                    next_idx = (idx + 1) % 4
                    next_lane = lanes[next_idx]
                    
                    scheduler_state['current_lane'] = next_lane
                    scheduler_state['phase'] = 'GREEN'
                    
                    current_count = lane_counts[next_lane]
                    scheduler_state['green_time_remaining'] = calculate_green_time(current_count)

threading.Thread(target=traffic_scheduler_thread, daemon=True).start()

def generate_frames():
    global corridor_state
    
    while True:
        if not CAMERA_AVAILABLE:
            placeholder = np.zeros((500, 1020, 3), dtype=np.uint8)
            cv2.putText(placeholder, "No Camera — Simulation Mode", (250, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 140, 255), 3)
            ret, buf = cv2.imencode('.jpg', placeholder)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buf.tobytes() + b'\r\n')
            time.sleep(0.1)
            continue

        success, frame = cap.read()
        if not success:
            time.sleep(0.05)
            continue
            
        frame = cv2.resize(frame, (640, 480))
        
        # Simulate 4 cameras from 1 webcam by flipping
        frame1 = frame.copy()
        frame2 = cv2.flip(frame, 1)   # horizontal flip
        frame3 = cv2.flip(frame, 0)   # vertical flip
        frame4 = cv2.flip(frame, -1)  # both flip
        
        frames = [frame1, frame2, frame3, frame4]
        lane_keys = ['lane1', 'lane2', 'lane3', 'lane4']
        
        emergency_triggered_this_frame = False
        emergency_lane_id = None
        
        # Process all 4 lanes
        for i, f in enumerate(frames):
            results = model(f, verbose=False)
            vehicle_boxes = []
            
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    if model.names[cls_id] in VEHICLE_CLASSES:
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        vehicle_boxes.append((x1, y1, x2, y2))
                        cv2.rectangle(f, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            with state_lock:
                lane_counts[lane_keys[i]] = len(vehicle_boxes)
            
            if detect_ambulance_in_rois(f, vehicle_boxes) and not emergency_triggered_this_frame:
                emergency_triggered_this_frame = True
                emergency_lane_id = i + 1
            
            cv2.putText(f, f"LANE {i+1} - Count: {len(vehicle_boxes)}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,255), 2)

        # Stitch 2x2 Grid
        top_row = cv2.hconcat([frame1, frame2])
        bottom_row = cv2.hconcat([frame3, frame4])
        grid_frame = cv2.vconcat([top_row, bottom_row])
        grid_frame = cv2.resize(grid_frame, (1024, 768))

        with state_lock:
            if emergency_triggered_this_frame:
                corridor_state['consecutive_frames'] += 1
                if corridor_state['consecutive_frames'] >= 3 and not corridor_state['detected']:
                    corridor_state['detected'] = True
                    corridor_state['vehicle_type'] = "ambulance"
                    corridor_state['start_signal'] = emergency_lane_id
                    corridor_state['current_position'] = 1
                    corridor_state['cleared_signals'] = []
                    corridor_state['active_greens'] = compute_corridor_greens(1)
                    corridor_state['timestamp'] = time.time()
                    print(f"🚨 EMERGENCY DEPLOYED: Lane {emergency_lane_id} Priority")
            else:
                corridor_state['consecutive_frames'] = 0

            if corridor_state['detected']:
                cv2.rectangle(grid_frame, (0,0), (1024, 60), (0,0,255), -1)
                cv2.putText(grid_frame, f"EMERGENCY OVERRIDE - LANE {corridor_state['start_signal']} PRIORITY", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255,255,255), 3)
            else:
                curr = scheduler_state['current_lane']
                rem = int(scheduler_state['green_time_remaining'])
                ph = scheduler_state['phase']
                color = (0,255,0) if ph == 'GREEN' else (0,255,255) if ph == 'YELLOW' else (0,0,255)
                cv2.rectangle(grid_frame, (0,0), (1024, 60), (0,0,0), -1)
                cv2.putText(grid_frame, f"ACTIVE: {curr.upper()} | {ph} | Time: {rem}s", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3)

        ret, buffer = cv2.imencode('.jpg', grid_frame, [cv2.IMWRITE_JPEG_QUALITY, 82])
        if not ret: continue
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')


# ─── REST API ─────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return jsonify({'message': '🚦 Smart Traffic Management API v2.2',
                    'endpoints': ['/status', '/count', '/video_feed',
                                  '/emergency', '/emergency/trigger', '/emergency/clear', '/config']})


@app.route('/status')
def status():
    with state_lock:
        cfg = dict(system_config)
    return jsonify({'running': True, 'backend': 'ok',
                    'model': 'YOLOv8n', 'camera': CAMERA_AVAILABLE,
                    'corridor_length': CORRIDOR_LENGTH,
                    'system_config': cfg})


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/count')
def get_count():
    with state_lock:
        counts = dict(lane_counts)
    return jsonify({
        'lane1': counts['lane1'], 'lane2': counts['lane2'],
        'lane3': counts['lane3'], 'lane4': counts['lane4'],
        'total': sum(counts.values()),
        'green_times': {
            f'lane{i}': calculate_green_time(counts[f'lane{i}']) for i in range(1, 5)
        },
        'source': {'lane1': 'yolo_live', 'lane2': 'yolo_live',
                   'lane3': 'yolo_live', 'lane4': 'yolo_live'},
    })

@app.route('/scheduler')
def get_scheduler():
    with state_lock:
        return jsonify(scheduler_state)


@app.route('/emergency')
def get_emergency():
    with state_lock:
        cs = dict(corridor_state)
        pos = cs['current_position']
        total = CORRIDOR_LENGTH
        progress = round((pos / total) * 100) if cs['detected'] and total > 0 else 0

    return jsonify({
        'detected':          cs['detected'],
        'vehicle_type':      cs['vehicle_type'],
        'current_position':  pos,
        'start_signal':      cs['start_signal'],
        'cleared_signals':   list(cs['cleared_signals']),
        'active_greens':     list(cs['active_greens']),
        'corridor_length':   CORRIDOR_LENGTH,
        'progress_percent':  progress,
        'timestamp':         cs['timestamp'],
    })


@app.route('/emergency/trigger', methods=['POST'])
def trigger_emergency():
    data       = request.get_json(silent=True) or {}
    start_lane = int(data.get('lane', 1))
    v_type     = data.get('vehicle_type', 'ambulance')

    with state_lock:
        corridor_state['detected']         = True
        corridor_state['vehicle_type']     = v_type
        corridor_state['start_signal']     = start_lane
        corridor_state['current_position'] = start_lane
        corridor_state['cleared_signals']  = list(range(1, start_lane))  # lanes before start already "cleared"
        corridor_state['active_greens']    = compute_corridor_greens(start_lane)
        corridor_state['timestamp']        = time.time()

    print(f"🚨 Manual trigger: {v_type} at Signal {start_lane}  →  Greens: {corridor_state['active_greens']}")
    return jsonify({'success': True,
                    'message': f'Emergency triggered from Signal {start_lane}',
                    'active_greens': corridor_state['active_greens']})


@app.route('/emergency/clear', methods=['POST'])
def clear_emergency():
    with state_lock:
        corridor_state['detected']         = False
        corridor_state['current_position'] = 0
        corridor_state['cleared_signals']  = []
        corridor_state['active_greens']    = []
        corridor_state['timestamp']        = None
        corridor_state['consecutive_frames'] = 0
    print("✅ Emergency cleared — resuming normal density-based operation.")
    return jsonify({'success': True, 'message': 'Emergency cleared'})


@app.route('/config', methods=['GET', 'POST'])
def handle_config():
    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        with state_lock:
            if 'weather' in data:
                system_config['weather'] = data['weather']
            if 'min_green' in data:
                system_config['min_green'] = int(data['min_green'])
            if 'max_green' in data:
                system_config['max_green'] = int(data['max_green'])
            if 'yellow_time' in data:
                system_config['yellow_time'] = int(data['yellow_time'])
        print(f"⚙️ System config updated: {system_config}")
        return jsonify({'success': True, 'config': system_config})
    
    with state_lock:
        return jsonify(system_config)


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("\n" + "═" * 60)
    print("  🚦 Smart Traffic Management System v2.1")
    print("═" * 60)
    print(f"  📡 API:      http://0.0.0.0:5000")
    print(f"  📷 Camera:   {'Connected ✅' if CAMERA_AVAILABLE else 'Not found ⚠️ (placeholder mode)'}")
    print(f"  🤖 Model:    YOLOv8n (COCO 80 classes)")
    print(f"  🚨 Corridor: {CORRIDOR_LENGTH} signals  |  advance every {AMBULANCE_ADVANCE_SECS}s")
    print("═" * 60 + "\n")
    app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
