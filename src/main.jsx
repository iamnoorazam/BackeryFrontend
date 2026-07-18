import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Provider tree (ErrorBoundary > QueryClient > ToastProvider > Auth > Router)
// lives in App.jsx; ToastProvider used to be mounted here too, shadowing it.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
