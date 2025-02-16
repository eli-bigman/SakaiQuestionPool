import React, { useState, useEffect } from 'react'
import QuestionSelector from './components/QuestionSelector'
import QuestionComponent from './components/QuestionComponent'
import parseXML from './utils/parseXML'

function App() {
  const [questions, setQuestions] = useState(() => {
    return JSON.parse(localStorage.getItem('questions')) || []
  })
  const [selectedFile, setSelectedFile] = useState(() => localStorage.getItem('selectedFile') || null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    return parseInt(localStorage.getItem('currentQuestionIndex'), 10) || 0
  })
  const [userAnswers, setUserAnswers] = useState(() => {
    return JSON.parse(localStorage.getItem('userAnswers')) || {}
  })
  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem('darkMode')) || false
  })

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    if (!selectedFile) return

    const storedQuestions = JSON.parse(localStorage.getItem('questions'))
    if (storedQuestions && storedQuestions.length > 0) {
      // Load questions from localStorage instead of re-fetching
      setQuestions(storedQuestions)
    } else {
      // If no cached questions, fetch from XML
      handleFileSelect(selectedFile)
    }
  }, [selectedFile])

  const handleFileSelect = async (fileName) => {
    setSelectedFile(fileName)
    localStorage.setItem('selectedFile', fileName)

    try {
      const response = await fetch(`/xml_files/${fileName}`)
      const xmlText = await response.text()
      const parsedQuestions = parseXML(xmlText)
      setQuestions(parsedQuestions)

      // Store in localStorage for persistence
      localStorage.setItem('questions', JSON.stringify(parsedQuestions))

      // Reset progress only if loading a new file
      setCurrentQuestionIndex(0)
      setUserAnswers({})
      localStorage.setItem('currentQuestionIndex', 0)
      localStorage.setItem('userAnswers', JSON.stringify({}))
    } catch (error) {
      console.error('Error fetching XML file:', error)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(newIndex)
      localStorage.setItem('currentQuestionIndex', newIndex)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(newIndex)
      localStorage.setItem('currentQuestionIndex', newIndex)
    }
  }

  const handleAnswerChange = (answer) => {
    const newAnswers = { ...userAnswers, [currentQuestionIndex]: answer }
    setUserAnswers(newAnswers)
    localStorage.setItem('userAnswers', JSON.stringify(newAnswers))
  }

  return (
    <div className="app-container">
      <div className="content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '800px', marginBottom: '20px' }}>
          <h1>Sakai Question Pool</h1>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>Dark Mode</span>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
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
              userAnswer={userAnswers[currentQuestionIndex] || ""}
              onAnswerChange={handleAnswerChange}
            />
            <div className="navigator-container">
              <button className="navigator-btn" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                Previous
              </button>
              <button className="navigator-btn" onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
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
