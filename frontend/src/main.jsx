import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Providers from "./app/providers.jsx";
import { Toaster } from "react-hot-toast";
import "./styles/index.css";
import App from "./app/App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Providers>
      <App />
      <Toaster position="top-right" />
    </Providers>
  </StrictMode>,
);
