import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, Navigate } from "react-router-dom";
import "./index.css";

import { ThemeProvider } from "@material-tailwind/react";
import Dashboard from "./pages/Directories";
import Articles from "./pages/Articles";
import Article from "./pages/Article";


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/directories" replace={true} />} />
          <Route path="/directories" element={<Dashboard />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<Article />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);
