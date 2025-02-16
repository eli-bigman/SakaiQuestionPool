// src/App.jsx
import React, { useState, useEffect } from 'react'
import QuestionSelector from './components/QuestionSelector'
import QuestionComponent from './components/QuestionComponent'
import parseXML from './utils/parseXML'

function App() {
  const [questions, setQuestions] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  const handleFileSelect = async (fileName) => {
    setSelectedFile(fileName)
    try {
      const response = await fetch(`/xml_files/${fileName}`)
      const xmlText = await response.text()
      const parsedQuestions = parseXML(xmlText)
      setQuestions(parsedQuestions)
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error('Error fetching XML file:', error)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  return (
    <div className="app-container">
      <div className="content">
        <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '800px', 
            marginBottom: '20px' 
          }}>
          <h1>Sakai Question Pool</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>Dark Mode</span>
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
        <QuestionSelector onSelect={handleFileSelect} />
        {questions.length > 0 ? (
          <>
            <QuestionComponent 
              question={questions[currentQuestionIndex]}
              onNext={handleNextQuestion}
            />
            <div className="navigator-container">
              <button 
                className="navigator-btn" 
                onClick={handlePrevQuestion} 
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button 
                className="navigator-btn" 
                onClick={handleNextQuestion} 
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
              </button>
            </div>
          </>
        ) : selectedFile ? (
          <div>Please select another question pool or check back later.</div>
        ) : (
          <div>Please select a question pool.</div>
        )}
      </div>
      <footer className="app-footer">
        <div className="footer-left">
          by <a href="https://github.com/eli-bigman" target="_blank" rel="noopener noreferrer">eli-bigman</a>
        </div>
        <div className="footer-right">
          <a href="https://github.com/eli-bigman/SakaiQuestionPool" target="_blank" rel="noopener noreferrer">See Code</a>
        </div>
      </footer>
    </div>
  )
}

export default App
