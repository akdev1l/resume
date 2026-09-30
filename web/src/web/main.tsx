import "@picocss/pico/css/pico.min.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

createRoot(document.getElementById("app-root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
