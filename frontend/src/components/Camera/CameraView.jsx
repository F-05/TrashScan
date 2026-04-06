// src/components/Camera/CameraViewWS.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./CameraView.css";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/detect";

export default function CameraViewWS() {
  const videoRef = useRef(null);
  const captureRef = useRef(null);
  const overlayRef = useRef(null);
  const wsRef = useRef(null);
  const sendingRef = useRef(false);
  const timeoutRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [fpsValue, setFpsValue] = useState(0);
  const lastSentAtRef = useRef(null);
  const frameCounterRef = useRef(0);
  const lastFpsAtRef = useRef(performance.now());

  useEffect(() => {
    let stream = null;
    let cancelled = false;

    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled || !videoRef.current) return;

        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        try {
          await video.play();
        } catch (err) {
          if (!cancelled && err.name !== "AbortError") {
            console.error("Video play failed:", err);
          }
        }

        if (cancelled || !videoRef.current) return;

        const setupCanvasSizes = () => {
          if (!videoRef.current) return;
          const w = videoRef.current.videoWidth || 640;
          const h = videoRef.current.videoHeight || 480;

          [captureRef.current, overlayRef.current].forEach((c) => {
            if (!c) return;
            c.width = w;
            c.height = h;
          });
        };

        video.onloadedmetadata = setupCanvasSizes;
        setupCanvasSizes();

        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => setConnected(true);
        wsRef.current.onclose = () => setConnected(false);
        wsRef.current.onerror = () => setConnected(false);

        wsRef.current.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (lastSentAtRef.current !== null) {
              setLatencyMs(Math.round(performance.now() - lastSentAtRef.current));
              lastSentAtRef.current = null;
            }
            if (data.detections && overlayRef.current) {
              drawDetections(data);
            }
          } catch (e) {
            console.error("WS parse error:", e);
          }
        };

        startSendLoop(10);
      } catch (err) {
        console.error("Camera init failed:", err);
      }
    };

    init();

    return () => {
      cancelled = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      try {
        wsRef.current?.close();
      } catch (e) {
        console.error("WebSocket close error:", e);
      }

      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const drawDetections = (data) => {
    const canvas = overlayRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { detections, width, height } = data;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sx = canvas.width / width;
    const sy = canvas.height / height;

    ctx.lineWidth = 2;
    ctx.font = "14px Poppins, sans-serif";

    detections.forEach((d) => {
      const x = d.x1 * sx;
      const y = d.y1 * sy;
      const w = (d.x2 - d.x1) * sx;
      const h = (d.y2 - d.y1) * sy;

      ctx.strokeStyle = "hsl(10, 89%, 55%)";
      ctx.strokeRect(x, y, w, h);

      const label = `${d.label} ${Math.round(d.conf * 100)}%`;
      const pad = 4;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      const tw = ctx.measureText(label).width + pad * 2;
      const th = 18 + pad * 2;
      ctx.fillRect(x, Math.max(0, y - th), tw, th);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x + pad, Math.max(14 + pad, y - th + 14 + pad - 2));
    });
  };

  const captureFrameBlob = useCallback(() => {
    const video = videoRef.current;
    const canvas = captureRef.current;

    if (!video || !canvas || video.readyState < 2) return null;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.6);
    });
  }, []);

  const startSendLoop = useCallback((fps = 8) => {
    const interval = Math.max(1, Math.floor(1000 / fps));

    const loop = async () => {
      if (wsRef.current?.readyState === WebSocket.OPEN && !sendingRef.current) {
        try {
          sendingRef.current = true;
          const blob = await captureFrameBlob();

          if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
            lastSentAtRef.current = performance.now();
            const buf = await blob.arrayBuffer();
            wsRef.current.send(buf);
            frameCounterRef.current += 1;

            const now = performance.now();
            const elapsed = now - lastFpsAtRef.current;
            if (elapsed >= 1000) {
              setFpsValue(Math.round((frameCounterRef.current * 1000) / elapsed));
              frameCounterRef.current = 0;
              lastFpsAtRef.current = now;
            }
          }
        } catch (e) {
          console.error("Frame send error:", e);
        } finally {
          sendingRef.current = false;
        }
      }

      timeoutRef.current = setTimeout(loop, interval);
    };

    loop();
  }, [captureFrameBlob]);

  return (
    <div
      id="camera"
      style={{
        position: "relative",
        width: "min(100%, 1300px)",
        margin: "0 auto",
        padding: "100px",
        height: "840px",
      }}
    >
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "100%", borderRadius: 12 }}
        />
        <canvas
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      <canvas ref={captureRef} style={{ display: "none" }} />

      <p style={{ textAlign: "center", marginTop: 12 }}>
        WebSocket: {connected ? "Connected" : "Disconnected"}
      </p>
      <p style={{ textAlign: "center", marginTop: 8 }}>
        Round-trip latency: {latencyMs !== null ? `${latencyMs} ms` : "Measuring..."}
      </p>
      <p style={{ textAlign: "center", marginTop: 8}}>
        Camera send rate: {fpsValue} FPS
      </p>
    </div>
  );
}

