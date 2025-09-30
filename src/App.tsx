import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import PackageView from "./pages/PackageView";
import DocumentDetail from "./pages/DocumentDetail";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard/:department" element={<Dashboard />} />
          <Route path="/package/:id" element={<PackageView />} />
          <Route
            path="/package/:id/document/:docId"
            element={<DocumentDetail />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
