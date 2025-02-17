// src/components/ITExamPoolPage.jsx
import React, { useState } from 'react';
import { parseITExamHTML } from '../utils/ITExamsParser';

const ITExamPoolPage = () => {
  const [url, setUrl] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    setQuestions([]);
    try {
      const res = await fetch(`/api/fetchPage?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Parse the fetched HTML using our utility function
        const parsedQuestions = parseITExamHTML(data.html);
        setQuestions(parsedQuestions);
      }
    } catch (err) {
      setError("Failed to load content");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1>IT Exam Pool</h1>
      <input 
        type="text"
        placeholder="Enter ITExamAnswers URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", padding: "10px", fontSize: "1rem", marginBottom: "10px" }}
      />
      <button onClick={handleLoad} style={{ padding: "10px 20px", fontSize: "1rem" }}>
        Load Questions
      </button>
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="spinner"></div>
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: "20px" }}>{error}</div>}
      {questions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Extracted Questions:</h2>
          {questions.map((q, index) => (
            <div key={index} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
              <div style={{ fontWeight: "bold" }}>
                Q{index + 1}: {q.questionText}
              </div>
              {q.images.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  {q.images.map((src, idx) => (
                    <img key={idx} src={src} alt={`Question ${index + 1} illustration`} style={{ maxWidth: '100%', marginBottom: '10px' }} />
                  ))}
                </div>
              )}
              {q.answerOptions.length > 0 && (
                <ul>
                  {q.answerOptions.map((option, idx) => (
                    <li key={idx} style={{ color: q.correctAnswers.includes(option) ? 'red' : 'inherit' }}>
                      {option}
                    </li>
                  ))}
                </ul>
              )}
              {q.explanation && (
                <div style={{ marginTop: "10px", fontStyle: "italic" }}>
                  Explanation: {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ITExamPoolPage;
