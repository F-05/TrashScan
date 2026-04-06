import React from "react";
import "./GuidePage.css";
import "../../App.css";

export default function GuidePage() {
    return ( 
        <main id="how-it-works" className="how"> 

        {/* ===== HOW IT WORKS ===== */} 
            <div className="how-wrap"> 
                <p className="eyebrow">Demo Prototype</p> 
                <h2 className="how-title">How this demo works</h2> 
                <p className="how-lead"> This is a <strong>prototype</strong>. In the real product, a camera module is mounted on each bin. When an object is brought near a bin, our YOLO model classifies it, and the screen (or bin indicator) lights up the correct colour. </p> 
                {/* colour legend */} 
                <ul className="legend"> 
                    <li><span className="dot red" /> Red = General Waste</li> 
                    <li><span className="dot yellow" /> Yellow = Mixed Recycling</li> 
                    <li><span className="dot green" /> Green/Lime = Organics (FOGO)</li> 
                </ul> 
                {/* steps */} 
                <ol className="steps"> 
                    <li> 
                        <h3>1) Grant camera access</h3> 
                        <p>When prompted, allow camera permissions so the model can see the object.</p> 
                    </li> 
                    <li> 
                        <h3>2) Hold an item up</h3> 
                        <p>Move the item into view. When it’s close and steady, the model runs detection.</p> 
                    </li>
                    <li> 
                        <h3>3) Watch the signal</h3> 
                        <p>The on-screen background flashes the recommended bin colour. In hardware, the corresponding bin’s light strip would also illuminate.</p> 
                        </li> <li> <h3>4) Drop it in</h3> <p>Place the item into the highlighted bin. Repeat to test multiple items.</p> 
                    </li> 
                </ol> 
                <div className="note"> 
                    <strong>Heads up:</strong> the model here is tuned for a demo environment. Real-world deployments will add continuous re-training and contamination checks.
                </div> 
            </div> 
        </main> 
    );
}