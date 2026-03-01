import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Square, Loader2, Sparkles, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      if (timerRef.current) clearInterval(timerRef.current);
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
        if (event.data.size > 0) chunksRef.current.push(event.data);
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

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const sendForTranscription = async (blob) => {
    setIsProcessing(true);
    try {
      const result = await transcribeVoice(blob);
      if (result && typeof onResult === "function") {
        onResult(result);
        if (result.items?.length > 0) {
          const names = result.items.map(i => i.name).join(", ");
          speak(`Recognized: ${names}. Adding to your log.`);
        } else {
          speak("I couldn't catch that. Please try again.");
        }
      }
    } catch (err) {
      setError("Transcription failed. Verify your backend status.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-recorder-container">
      <div className="voice-interface" style={{ position: "relative" }}>
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-vibrant)', zIndex: 0 }}
            />
          )}
        </AnimatePresence>

        <button
          type="button"
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? handleStop : handleStart}
          disabled={isProcessing}
          style={{ position: "relative", zIndex: 1 }}
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={40} />
          ) : isRecording ? (
            <Square size={32} fill="white" />
          ) : (
            <Mic size={40} />
          )}
        </button>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "800", color: isRecording ? "var(--accent-vibrant)" : "var(--text-primary)" }}>
            {isProcessing ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <Sparkles size={20} color="var(--accent-active)" /> AI Syncing...
              </span>
            ) : isRecording ? (
              `0:0${seconds}`
            ) : (
              "Tap to Speak"
            )}
          </div>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginTop: "0.5rem", fontWeight: "500" }}>
            {isRecording ? "Listening to your meal description..." : "AI Voice Analysis Ready"}
          </p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-banner"
          style={{ marginTop: "2rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
