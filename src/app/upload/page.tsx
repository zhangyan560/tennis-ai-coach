"use client";

import { useState, useRef } from "react";

type AnalysisResult = {
  id?: string;
  error?: string;
  tip?: string;
  swing_type?: string;
  twinity_score?: number;
  feedback?: {
    area: string;
    severity: "high" | "medium" | "low";
    issue: string;
    fix: string;
  }[];
  drills?: string[];
  overall_assessment?: string;
};

function extractFrames(videoFile: File, count = 6): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error("Video loading timed out. Try a shorter video."));
    }, 15000);

    const frames: string[] = [];

    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      const scale = 0.4;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
      if (dataUrl && dataUrl.length > 100) {
        frames.push(dataUrl);
      }
    };

    const finish = () => {
      URL.revokeObjectURL(url);
      if (frames.length === 0) {
        reject(new Error("Could not extract frames. Try MP4 format."));
      } else {
        resolve(frames);
      }
    };

    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const duration = video.duration;
      if (!duration || !isFinite(duration) || duration < 0.5) {
        URL.revokeObjectURL(url);
        reject(new Error("Video too short or format not supported"));
        return;
      }

      const interval = duration / (count + 1);
      let currentFrame = 0;

      video.onseeked = () => {
        captureFrame();
        currentFrame++;
        if (currentFrame < count) {
          video.currentTime = interval * (currentFrame + 1);
        } else {
          finish();
        }
      };

      // Fallback: if seek stalls
      setTimeout(() => {
        if (frames.length === 0 && currentFrame === 0) {
          captureFrame();
          finish();
        }
      }, 5000);

      video.currentTime = interval;
    };

    video.onerror = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video. Try MP4 format."));
    };
  });
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "extracting" | "analyzing" | "done" | "error"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 60 * 1024 * 1024) {
      setErrorMsg("Video must be under 60MB");
      return;
    }

    if (!f.type.startsWith("video/")) {
      setErrorMsg("Please select a video file");
      return;
    }

    setFile(f);
    setErrorMsg("");
    setStatus("idle");
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    try {
      // Step 1: Extract frames
      setStatus("extracting");
      setProgress(10);
      const frames = await extractFrames(file, 6);
      setProgress(30);

      // Step 2: Send frames to API
      setStatus("analyzing");
      setProgress(40);

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 8, 90));
      }, 1000);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data: AnalysisResult = await res.json();

      if (!res.ok || data.error) {
        setStatus("error");
        setErrorMsg(data.error || "Analysis failed");
        if (data.tip) setErrorMsg((prev) => prev + `. ${data.tip}`);
        return;
      }

      setResult(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const severityColor = (s: string) => {
    switch (s) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-tennis-ball-dark";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <a href="/" className="text-lg font-bold text-tennis-green">
          AI Tennis Coach
        </a>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {!result && status !== "done" && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Your Swing
            </h1>
            <p className="text-gray-500 mb-8">
              Record a 10-30 second video of your tennis swing. Side angle works
              best. AI will analyze your technique in about 60 seconds.
            </p>

            {/* Upload area */}
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-tennis-green-light hover:bg-green-50/30 transition-colors"
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">&#127909;</div>
                  <p className="text-lg font-medium text-gray-700">
                    Click to select a video
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    MP4, MOV, WebM. Max 60MB.
                  </p>
                </div>
              )}
            </div>

            {/* Filming tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
              <p className="font-medium text-gray-700 mb-2">
                Tips for best results:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Film from the side, full body visible</li>
                <li>Good lighting, no backlight</li>
                <li>One person in frame</li>
                <li>Include the full swing: preparation to follow-through</li>
              </ul>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm">
                {errorMsg}
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={
                !file ||
                status === "extracting" ||
                status === "analyzing"
              }
              className="mt-8 w-full py-4 bg-tennis-green text-white font-semibold rounded-xl hover:bg-tennis-green-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {!file
                ? "Select a video first"
                : status === "extracting" || status === "analyzing"
                ? "Analyzing..."
                : "Analyze My Swing"}
            </button>
          </>
        )}

        {/* Progress */}
        {(status === "extracting" || status === "analyzing") && (
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>
                {status === "extracting"
                  ? "Extracting key frames from video..."
                  : "AI is analyzing your swing..."}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-tennis-green rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {status === "extracting"
                ? "Extracting 6 key frames from your swing..."
                : "This takes about 30-60 seconds. The AI is watching every frame."}
            </p>
          </div>
        )}

        {/* Results */}
        {result && status === "done" && (
          <div className="space-y-8">
            {/* Score */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Swing Analysis
              </h2>
              <div className="inline-block">
                <div className="text-6xl font-bold mb-1">
                  <span className={scoreColor(result.twinity_score || 0)}>
                    {result.twinity_score}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  Twinity Score
                  {result.swing_type && ` / ${result.swing_type}`}
                </p>
              </div>
            </div>

            {/* Feedback */}
            {result.feedback && result.feedback.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  What to Fix
                </h3>
                <div className="space-y-3">
                  {result.feedback.map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${severityColor(
                        item.severity
                      )}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{item.area}</span>
                        <span className="text-xs font-medium uppercase">
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-sm opacity-80 mb-2">{item.issue}</p>
                      <p className="text-sm font-medium">{item.fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drills */}
            {result.drills && result.drills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Practice Drills
                </h3>
                <div className="space-y-3">
                  {result.drills.map((drill, i) => (
                    <div
                      key={i}
                      className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800"
                    >
                      {drill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall */}
            {result.overall_assessment && (
              <div className="p-4 bg-gray-50 rounded-xl text-gray-700 text-sm">
                {result.overall_assessment}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center">
              AI-generated feedback. Not a substitute for professional coaching.
              Consult a certified coach for injury prevention.
            </p>

            {/* Actions */}
            <div className="flex gap-4">
              <a
                href="/upload"
                className="flex-1 py-3 text-center bg-tennis-green text-white font-semibold rounded-xl hover:bg-tennis-green-light transition-colors"
              >
                Analyze Another Swing
              </a>
              <a
                href="/"
                className="flex-1 py-3 text-center border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
