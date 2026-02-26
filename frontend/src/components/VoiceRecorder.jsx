import { useEffect, useRef, useState } from "react";

import { transcribeVoice } from "../api/voice";

export function VoiceRecorder({ onResult }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startTimer = () => {
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStart = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Your browser does not support microphone recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stopTimer();
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        await sendForTranscription(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      startTimer();
      setIsRecording(true);
    } catch (err) {
      setError("Microphone permission denied or unavailable.");
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const sendForTranscription = async (blob) => {
    setIsProcessing(true);
    try {
      const result = await transcribeVoice(blob);
      if (result && typeof onResult === "function") {
        onResult(result);
      }
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        "Unable to transcribe audio. Check your API key.";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const label = isRecording ? "Tap to stop" : "Hold to record";

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Voice capture (beta)</h2>
        <p>
          Describe your meal out loud. Audio is processed securely and never
          stored.
        </p>
      </div>
      <div className="voice-recorder">
        <button
          type="button"
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onTouchStart={handleStart}
          onTouchEnd={handleStop}
          disabled={isProcessing}
        >
          <span className="mic-dot" />
          <span className="mic-label">
            {isProcessing ? "Processing..." : label}
          </span>
        </button>
        <div className="mic-meta">
          <span className="timer">
            {seconds.toString().padStart(2, "0")}s
          </span>
          <span className="hint">Short clips (5–20s) work best.</span>
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}

