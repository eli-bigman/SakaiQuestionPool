import React, { useState } from 'react'

const QuestionComponent = ({ question, onNext, questionNumber, totalQuestions }) => {
  const [userAnswer, setUserAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowAnswer(true)
  }

  const handleChange = (e) => {
    setUserAnswer(e.target.value)
  }

  const renderInput = () => {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return question.options.map(option => (
          <div key={option.ident}>
            <label>
              <input 
                type="radio" 
                name="answer" 
                value={option.ident} 
                onChange={handleChange}
                disabled={showAnswer}
              />
              {option.text}
            </label>
          </div>
        ))
      case 'fill_in':
        return (
          <input 
            type="text" 
            value={userAnswer} 
            onChange={handleChange}
            disabled={showAnswer}
          />
        )
      case 'essay':
        return (
          <textarea 
            value={userAnswer} 
            onChange={handleChange}
            disabled={showAnswer}
            rows="4" 
            cols="50"
          />
        )
      default:
        return null
    }
  }

  const renderCorrectAnswer = () => {
    if (question.type === 'essay') {
      return <div>No model answer for essay questions.</div>
    }
    return <div><strong>Correct Answer:</strong> {question.correctAnswer}</div>
  }

  return (
    <div className="question-container">
      <h2>Question {questionNumber} of {totalQuestions}</h2>
      <div className="question-prompt">
        {/* using dangerouslySetInnerHTML in case the XML contains HTML formatting */}
        <div dangerouslySetInnerHTML={{ __html: question.prompt }} />
      </div>
      <form onSubmit={handleSubmit}>
        {renderInput()}
        {!showAnswer && <button type="submit">Submit Answer</button>}
      </form>
      {showAnswer && renderCorrectAnswer()}
      {showAnswer && <button onClick={onNext}>Next Question</button>}
    </div>
  )
}

export default QuestionComponent
