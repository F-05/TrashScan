# backend/app.py
import io
import json
import uvicorn
from PIL import Image
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("last.pt")

@app.get("/")
def root():
    return {"status": "ok"}

async def run_inference_pil(pil_img: Image.Image):
    loop = asyncio.get_running_loop()
    results = await loop.run_in_executor(None, model, pil_img)
    return results

def pack_results(results):
    r = results[0]
    boxes = r.boxes
    names = r.names
    detections = []

    if boxes is not None and boxes.xyxy is not None:
        xyxy = boxes.xyxy.cpu().numpy()
        cls = boxes.cls.cpu().numpy().astype(int)
        conf = boxes.conf.cpu().numpy()

        for (x1, y1, x2, y2), c, p in zip(xyxy, cls, conf):
            detections.append({
                "x1": float(x1),
                "y1": float(y1),
                "x2": float(x2),
                "y2": float(y2),
                "cls": int(c),
                "label": names[int(c)],
                "conf": float(round(p, 3)),
            })

    h, w = r.orig_shape[:2]
    return {
        "width": int(w),
        "height": int(h),
        "detections": detections,
    }

@app.websocket("/ws/detect")
async def ws_detect(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")

    try:
        while True:
            # If client disconnects, this should exit to outer except
            frame_bytes = await websocket.receive_bytes()

            try:
                pil_img = Image.open(io.BytesIO(frame_bytes)).convert("RGB")
                results = await run_inference_pil(pil_img)
                payload = pack_results(results)
                await websocket.send_text(json.dumps(payload))
            except Exception as e:
                print("Frame processing error:", repr(e))
                try:
                    await websocket.send_text(json.dumps({"error": str(e)}))
                except Exception:
                    break

    except WebSocketDisconnect:
        print("WebSocket disconnected by client")
    except RuntimeError as e:
        if 'disconnect message' in str(e):
            print("WebSocket already disconnected")
        else:
            print("Runtime error:", repr(e))
    except Exception as e:
        print("Fatal WebSocket error:", repr(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)