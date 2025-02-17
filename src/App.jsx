import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QuestionSelector from "./components/QuestionSelector";
import QuestionComponent from "./components/QuestionComponent";
import ITExamPoolPage from "./components/ITExamPoolPage"; // Separate page for IT Exams Pool
import parseXML from "./utils/parseXML";

function App() {
  const [questions, setQuestions] = useState(() => {
    return JSON.parse(localStorage.getItem("questions")) || [];
  });
  const [selectedFile, setSelectedFile] = useState(
    () => localStorage.getItem("selectedFile") || null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    return parseInt(localStorage.getItem("currentQuestionIndex"), 10) || 0;
  });
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode")) || false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <Router>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <h1>Sakai Question Pool</h1>

          {/* Navigation Links */}
          <div className="header-buttons">
            <Link to="/itexamspool" className="nav-button">
              IT Exams Pool
            </Link>

            <span style={{ marginRight: "8px" }}>Dark Mode</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </header>

        {/* Main Content Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <div className="content">
                <QuestionSelector setSelectedFile={setSelectedFile} />
                {questions.length > 0 ? (
                  <QuestionComponent
                    question={questions[currentQuestionIndex]}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                  />
                ) : (
                  <p>Please select a question pool.</p>
                )}
              </div>
            }
          />
          <Route path="/itexamspool" element={<ITExamPoolPage />} />
        </Routes>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-left">
            by{" "}
            <a
              href="https://github.com/eli-bigman"
              target="_blank"
              rel="noopener noreferrer"
            >
              eli-bigman
            </a>
          </div>
          <div className="footer-right">
            <a
              href="https://github.com/eli-bigman/SakaiQuestionPool"
              target="_blank"
              rel="noopener noreferrer"
            >
              See Code
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
