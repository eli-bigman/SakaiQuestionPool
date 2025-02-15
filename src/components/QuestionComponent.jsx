import React, { useState, useEffect } from 'react'

const QuestionComponent = ({ question, onNext, questionNumber, totalQuestions }) => {
  const [userAnswer, setUserAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)

  // Reset state when a new question is loaded
  useEffect(() => {
    setUserAnswer("")
    setShowAnswer(false)
  }, [question])

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
                checked={userAnswer === option.ident}
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

  const renderResult = () => {
    if (question.type === 'essay') {
      return <div>No model answer for essay questions.</div>
    }
    if (!showAnswer) return null

    // For multiple choice and true/false, map the correct answer ident to its text.
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      const correctOption = question.options.find(opt => opt.ident === question.correctAnswer)
      const correctText = correctOption ? correctOption.text : question.correctAnswer
      if (userAnswer === question.correctAnswer) {
        return <div>Correct ✅</div>
      } else {
        return <div>Incorrect ❌. The correct answer is: {correctText}</div>
      }
    }
    // For fill in the blank, compare the text (ignoring case)
    else if (question.type === 'fill_in') {
      if (userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        return <div>Correct ✅</div>
      } else {
        return <div>Incorrect ❌. The correct answer is: {question.correctAnswer}</div>
      }
    }
  }

  return (
    <div className="question-container">
      <h2>Question {questionNumber} of {totalQuestions}</h2>
      <div className="question-prompt">
        <div dangerouslySetInnerHTML={{ __html: question.prompt }} />
      </div>
      <form onSubmit={handleSubmit}>
        {renderInput()}
        {!showAnswer && <button type="submit">Submit Answer</button>}
      </form>
      {renderResult()}
      {showAnswer && <button onClick={onNext}>Next Question</button>}
    </div>
  )
}

export default QuestionComponent
