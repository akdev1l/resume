import "@picocss/pico/css/pico.min.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { legacyHashPath } from "../core/route";
import { App } from "./App";

// old #/... links: swap in the path before the router reads the location
const legacy = legacyHashPath(window.location.hash);
if (legacy) {
  window.history.replaceState(null, "", legacy);
}

createRoot(document.getElementById("app-root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
