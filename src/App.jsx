import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { CloudArrowUpIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainProgress, setTrainProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPrediction(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "An error occurred while processing the video"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
    },
    maxFiles: 1,
  });

  const trainModel = async () => {
    setTraining(true);
    setError(null);

    try {
      await axios.post("http://localhost:5000/train");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "An error occurred while training the model"
      );
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Drunk Detection System
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload a video to analyze behavior patterns and detect signs of
              intoxication using advanced AI technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col space-y-4">
              <button
                onClick={trainModel}
                disabled={training}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200 w-full justify-center"
              >
                {training ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Training Model...
                  </>
                ) : (
                  "Train Model"
                )}
              </button>
              {training && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${trainProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            <div className="max-w-md text-left text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium text-gray-900 mb-2">
                Training Process
              </h3>
              <p>
                The model processes video data from both drunk and sober
                folders, extracting key features from sampled frames to learn
                patterns and make predictions. The training includes:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-gray-500">
                <li>Video frame sampling and feature extraction</li>
                <li>Data splitting into training and testing sets</li>
                <li>Model training and optimization</li>
                <li>Accuracy evaluation on test data</li>
              </ul>
            </div>
          </div>

          <div
            {...getRootProps()}
            className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
              isDragActive
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-400"
            }`}
          >
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center text-sm text-gray-600">
                <input {...getInputProps()} />
                <button
                  type="button"
                  className="mb-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Select Video
                </button>
                <p>or drag and drop a video file here</p>
              </div>
              <p className="text-xs text-gray-500">MP4 up to 50MB</p>
            </div>
          </div>

          {loading && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <ArrowPathIcon className="animate-spin h-6 w-6 text-indigo-600" />
                <p className="text-sm text-gray-700 font-medium">
                  Processing video...
                </p>
              </div>
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {prediction && (
            <div className="mt-8 p-6 bg-white shadow-lg rounded-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Prediction Result
              </h2>
              <div className="text-lg">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    prediction.prediction === "drunk"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {prediction.prediction.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Confidence: {Math.round(prediction.confidence * 100)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
