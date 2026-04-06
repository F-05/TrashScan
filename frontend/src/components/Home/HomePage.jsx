import React from "react";
import logo from "../../assets/LOGO.png";
import earth from "../../assets/earth.png";
import hands from "../../assets/hand.png";
import "./HomePage.css";
import "../../App.css";

export default function HomePage() {
  return (
    <section className="hero" id="top">
      <div className="hero__container">
        {/* Logo */}
        <div className="hero__logo-row">
          <img src={logo} alt="Trash Scan Logo" className="hero__logo-img" />
          <span className="hero__wordmark">
            TRASH <span className="accent">SCAN</span>
          </span>
        </div>

        {/* Content Grid */}
        <div className="hero__grid">
          {/* Left: Illustration */}
          <div className="hero__illustration">
            <div className="hero__earth-stack" aria-label="Earth in hands">
              <img src={hands} alt="Hands holding Earth" className="hero__hands-img" />
              <img src={earth} alt="Earth" className="hero__earth-img" />
            </div>
          </div>

          {/* Right: Messaging */}
          <div className="hero__content">
            <h1 className="hero__headline">
              Scan. Sort.<br />
              <span className="underline">Save the PLANET.</span>
            </h1>
            <p className="hero__subhead">
              Bins that see. AI that sorts. A planet that thrives.
            </p>
            <a href="#camera" className="hero__cta">
              <span className="hero__cta-icon">↓</span>
              Try the demo view
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
