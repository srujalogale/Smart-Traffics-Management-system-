
import cv2
import pandas as pd
import numpy as np

#get the mouse coordinates
def RGB(event, x, y, flags, param):
    if event == cv2.EVENT_MOUSEMOVE:
        colorsBGR = [x, y]
        print(colorsBGR)


cv2.namedWindow('TMS')
cv2.setMouseCallback('TMS', RGB)

#read Video

import cv2
from ultralytics import YOLO

# Load YOLOv8 model (pretrained on COCO dataset)
model = YOLO("yolov8n.pt")  # You can also try yolov8s.pt for better accuracy

# Open webcam (0 = default camera)
cap = cv2.VideoCapture(0)

# Vehicle classes we want to count
vehicle_classes = ['car', 'bus', 'truck', 'motorbike']

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (1020, 500))

    # Run YOLO detection
    results = model(frame, verbose=False)

    count = 0

    # Loop through detections
    for r in results:
        boxes = r.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]

            if cls_name in vehicle_classes:
                count += 1
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, cls_name, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Display vehicle count on screen
    cv2.putText(frame, f"Vehicle Count: {count}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 3)

    # Show the result
    cv2.imshow("Traffic Monitoring System", frame)

    # Exit when 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

