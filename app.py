import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)

# Global variables
MODEL = None
LABEL_ENCODER = LabelEncoder()
FEATURES_CACHE = {}
CACHE_FILE = 'features_cache.pkl'

def extract_features(video_path):
    # Check if features are already cached
    if video_path in FEATURES_CACHE:
        return FEATURES_CACHE[video_path]
    
    cap = cv2.VideoCapture(video_path)
    frames = []
    frame_count = 0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sample_rate = max(1, total_frames // 50)  # Sample ~50 frames per video
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % sample_rate == 0:
            # Convert to grayscale and resize for simplicity
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            frame = cv2.resize(frame, (32, 32))
            frames.append(frame.flatten())
        frame_count += 1
    
    cap.release()
    
    # Take mean of all frames to get a single feature vector
    if len(frames) > 0:
        features = np.mean(frames, axis=0)
        FEATURES_CACHE[video_path] = features
        return features
    return np.zeros(32*32)

def train_model():
    global MODEL, LABEL_ENCODER, FEATURES_CACHE
    
    # Try to load cached features
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'rb') as f:
                FEATURES_CACHE = pickle.load(f)
        except:
            FEATURES_CACHE = {}
    
    # Load and preprocess data
    X = []
    y = []
    total_videos = 0
    processed_videos = 0
    
    # Count total videos
    for path in ['drunk', 'sober']:
        if os.path.exists(path):
            total_videos += len([f for f in os.listdir(path) if f.endswith('.mp4')])
    
    # Process drunk videos
    drunk_path = 'drunk'
    if os.path.exists(drunk_path):
        for video in os.listdir(drunk_path):
            if video.endswith('.mp4'):
                try:
                    video_path = os.path.join(drunk_path, video)
                    features = extract_features(video_path)
                    X.append(features)
                    y.append('drunk')
                    processed_videos += 1
                except Exception as e:
                    print(f'Error processing {video}: {str(e)}')
    
    # Process sober videos
    sober_path = 'sober'
    if os.path.exists(sober_path):
        for video in os.listdir(sober_path):
            if video.endswith('.mp4'):
                try:
                    video_path = os.path.join(sober_path, video)
                    features = extract_features(video_path)
                    X.append(features)
                    y.append('sober')
                    processed_videos += 1
                except Exception as e:
                    print(f'Error processing {video}: {str(e)}')
    
    # Save features cache
    with open(CACHE_FILE, 'wb') as f:
        pickle.dump(FEATURES_CACHE, f)
    
    X = np.array(X)
    y = LABEL_ENCODER.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Create and train model
    MODEL = RandomForestClassifier(n_estimators=100, random_state=42)
    MODEL.fit(X_train, y_train)
    
    # Calculate accuracy
    accuracy = MODEL.score(X_test, y_test)
    return {
        'message': 'Model trained successfully',
        'accuracy': float(accuracy),
        'processed_videos': processed_videos,
        'total_videos': total_videos
    }

@app.route('/train', methods=['POST'])
def train():
    try:
        return jsonify(train_model())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    if MODEL is None:
        return jsonify({'error': 'Model not trained yet'}), 400
    
    try:
        video_file = request.files['video']
        video_path = 'temp_video.mp4'
        video_file.save(video_path)
        
        features = extract_features(video_path)
        features = np.expand_dims(features, axis=0)
        
        prediction = MODEL.predict_proba(features)[0]
        result = 'drunk' if prediction[1] > 0.5 else 'sober'
        confidence = float(prediction[1] if prediction[1] > 0.5 else prediction[0])
        
        os.remove(video_path)
        
        return jsonify({
            'prediction': result,
            'confidence': confidence
        })
    
    except Exception as e:
        if os.path.exists('temp_video.mp4'):
            os.remove('temp_video.mp4')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)