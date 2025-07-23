import React, { useState, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function App() {
  const [image, setImage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [results, setResults] = useState([]);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setResults([]);
    }
  };

  const handleDetectObjects = async () => {
    if (!imageRef.current) return;
    setIsDetecting(true);

    const model = await cocoSsd.load();
    const predictions = await model.detect(imageRef.current);
    setResults(predictions);

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(imageRef.current, 0, 0);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      // Draw box
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw label
      ctx.font = "16px sans-serif";
      ctx.fillStyle = "#00FF00";
      ctx.fillText(prediction.class, x, y > 10 ? y - 5 : y + 15);
    });

    setIsDetecting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-4 text-blue-400">📸 MiniScan</h1>
      <p className="text-gray-300 mb-6 text-center max-w-md">
        Upload an image and detect objects in it using TensorFlow.js
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4 file:bg-blue-600 file:text-white file:rounded file:px-4 file:py-2 file:cursor-pointer"
      />

      {image && (
        <div className="relative mt-4 mb-6">
          <img
            src={image}
            alt="Uploaded"
            ref={imageRef}
            onLoad={() => {
              canvasRef.current.width = imageRef.current.width;
              canvasRef.current.height = imageRef.current.height;
            }}
            className="rounded-xl max-w-md"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 z-10 max-w-md"
          />
        </div>
      )}

      {image && (
        <button
          onClick={handleDetectObjects}
          className={`mt-4 px-6 py-2 rounded-lg transition ${
            isDetecting
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={isDetecting}
        >
          {isDetecting ? "Scanning..." : "🚀 Scan Image"}
        </button>
      )}

      {results.length > 0 && (
        <div className="mt-6 text-left max-w-md text-sm text-green-300">
          <h3 className="font-semibold mb-2">Detected Objects:</h3>
          <ul className="list-disc list-inside space-y-1">
            {results.map((item, i) => (
              <li key={i}>
                {item.class} – {Math.round(item.score * 100)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
