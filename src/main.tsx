import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ ESTO ES LO QUE HOY TE FALTA EN PRODUCCIÓN (o está apuntando a otro CSS)
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
