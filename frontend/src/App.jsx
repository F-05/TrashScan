import { StrictMode } from "react";
import "./App.css";
import HomePage from "./components/Home/HomePage.jsx";
import GuidePage from "./components/Guide/GuidePage.jsx";
import CameraView from "./components/Camera/CameraView.jsx";
import Footer from "./components/Footer/Footer.jsx";

export default function App() {
  return (
    <main>
      <HomePage />
      <GuidePage />
      <CameraView />
      <Footer />
    </main>
  );
}
