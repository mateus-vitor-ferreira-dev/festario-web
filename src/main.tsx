import { initSentry } from "./config/sentry";
initSentry();

import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { env } from "./config/env";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={env.googleClientId}>
        <App />
        <ToastContainer position="top-right" autoClose={2500} />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);