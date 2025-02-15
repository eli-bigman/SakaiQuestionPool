import React, { useState } from 'react'
import QuestionSelector from './components/QuestionSelector'
import QuestionComponent from './components/QuestionComponent'
import parseXML from './utils/parseXML'

function App() {
  const [questions, setQuestions] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const handleFileSelect = async (fileName) => {
    setSelectedFile(fileName)
    try {
      // Updated path reflecting the xml_files directory
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
    setCurrentQuestionIndex((prev) => prev + 1)
  }

  return (
    <div className="App">
      <h1>Sakai Question Pool</h1>
      <QuestionSelector onSelect={handleFileSelect} />
      {questions.length > 0 && currentQuestionIndex < questions.length ? (
        <QuestionComponent 
          question={questions[currentQuestionIndex]}
          onNext={handleNextQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      ) : selectedFile ? (
        <div>No more questions.</div>
      ) : (
        <div>Please select a question pool.</div>
      )}
    </div>
  )
}

export default App
