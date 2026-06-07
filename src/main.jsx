import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { PresetProvider } from "./context/PresetContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <PresetProvider>
      <App />
    </PresetProvider>
  </BrowserRouter>
);
