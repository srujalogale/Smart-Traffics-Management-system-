# 🚦 AI-Based Predictive Smart Traffic Management System

An intelligent traffic management system that uses **Computer Vision and Machine Learning** to monitor traffic, predict congestion, and dynamically control traffic signals in real-time.

---

## 📌 Overview

This project addresses the limitations of traditional fixed-timing traffic signals by introducing a **software-based smart system** that:

- Detects vehicles using **YOLO (Computer Vision)**
- Estimates traffic density in real-time
- Predicts future congestion using **Machine Learning**
- Dynamically adjusts signal timings
- Supports **emergency vehicle prioritization**

---

## 🎯 Key Features

- 🔍 **Real-Time Vehicle Detection** using YOLOv8
- 📊 **Lane-wise Traffic Density Analysis**
- 🧠 **Predictive Model (Random Forest)** for traffic forecasting
- 🚦 **Dynamic Signal Control Algorithm**
- 🚑 **Emergency Vehicle Priority (Green Corridor)**
- 🖥️ **Live Monitoring Dashboard**
- 📈 **Traffic Analytics & Visualization**
- 🎥 **Multi-Lane Simulation (Webcam + Synthetic Inputs)**

---

## 🏗️ System Architecture
Input (Webcam / Images)
↓
Vehicle Detection (YOLO)
↓
Vehicle Counting & Density Estimation
↓
ML Prediction Model
↓
Signal Optimization Logic
↓
Dashboard + Traffic Control Output

## ⚙️ Tech Stack

### 🔹 Backend
- Python
- Flask (API)
- OpenCV
- YOLOv8 (Ultralytics)
- Scikit-learn

### 🔹 Frontend
- HTML / CSS / JavaScript
- React (optional)

### 🔹 Machine Learning
- Random Forest Regression

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/traffic-management-system.git
cd traffic-management-system

python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)


Install Dependencies
pip install -r requirements.txt
Run Backend Server
python backend/app.py
Open Dashboard
http://localhost:5000
