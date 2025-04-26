# Drunk-Detection-System
The Drunk Detection System (updated version of previous Sip-Step-AI-Drunk-People-Detection model) is a web-based application that uses machine learning to analyze video footage and detect signs of intoxication based on behavior patterns. It allows users to upload videos and receive a classification of whether the individual in the video appears drunk or sober. The system is designed for applications such as safety monitoring, law enforcement, or public health initiatives, providing an automated tool to detect intoxication through visual cues.

The system offers the following key features:

Video Upload: Users can upload MP4 videos (up to 50MB) for analysis via a user-friendly interface.
Classification: The system classifies the video as "Drunk" or "Sober" using a machine learning model, providing results with confidence scores.
Model Training: The system supports training on new data via the /train endpoint, allowing for customization with user-provided datasets.
Responsive Design: Built with React and Tailwind CSS, ensuring a modern, responsive user interface accessible on various devices.

To set up and run the Drunk Detection System, follow these steps:

Prerequisites
Python 3.x for the backend.
Node.js and npm for the frontend.
Git for cloning the repository.
Clone the Repository
bash

Copy
git clone https://github.com/ambuj-7474/Drunk-Detection-System.git
cd Drunk-Detection-System
Install Dependencies
For the backend (Flask), navigate to the backend directory and install requirements:

bash

Copy
cd backend
pip install -r requirements.txt
Note: Ensure requirements.txt includes dependencies like Flask, OpenCV, numpy, scikit-learn, and pickle, as inferred from app.py.

For the frontend (React with Vite), navigate to the frontend directory and install npm packages:

bash

Copy
cd frontend
npm install
The package.json lists dependencies including React, Axios, Heroicons, and react-dropzone, ensuring a modern development environment.

Run the Application
Start the backend:
bash

Copy
cd backend
python app.py
The Flask server runs in debug mode on port 5000 by default.
Start the frontend:
bash

Copy
cd ../frontend
npm run dev
The Vite development server, configured in vite.config.js, runs on port 3000, making the frontend available at localhost:3000.
Usage
To use the system:

Navigate to localhost:3000 in your browser.
Upload a video file (MP4 format, up to 50MB) via the interface.
Wait for the system to process the video and display the classification result (e.g., "Drunk" or "Sober" with confidence).
To train the model with new data:

Place video files in 'drunk' and 'sober' directories within the backend folder.
Send a POST request to /train to trigger training, which will process the videos, extract features, and train the Random Forest Classifier.

This system helps identify intoxication from video footage, useful for safety or law enforcement. It’s built with modern web technologies and machine learning, making it accessible for users to upload and analyze videos.

![Screenshot 2025-04-26 001038](https://github.com/user-attachments/assets/13a5a9df-7732-48ce-b768-194bc3dfdd28)
