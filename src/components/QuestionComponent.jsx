// src/components/QuestionComponent.jsx
import React, { useState, useEffect } from 'react'

const QuestionComponent = ({ question, onNext, questionNumber, totalQuestions, direction }) => {
  const [userAnswer, setUserAnswer] = useState("")
  const [shake, setShake] = useState(false)
  const [animationClass, setAnimationClass] = useState("")
  const [autoAdvanced, setAutoAdvanced] = useState(false)
  const [autoProceedEnabled, setAutoProceedEnabled] = useState(false) // default off

  // Reset state when a new question is loaded
  useEffect(() => {
    setUserAnswer("")
    setShake(false)
    setAutoAdvanced(false)
    // Set slide-in animation based on direction
    if (direction === "prev") {
      setAnimationClass("slide-in-left")
    } else {
      setAnimationClass("slide-in-right")
    }
    const timeout = setTimeout(() => setAnimationClass(""), 500)
    return () => clearTimeout(timeout)
  }, [question, direction])

  // Checks if the given answer is correct for non-essay questions
  const isAnswerCorrect = (value) => {
    if (question.type === 'fill_in') {
      return value.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
    } else if (question.type === 'multiple_choice' || question.type === 'true_false') {
      return value === question.correctAnswer
    } else {
      return false
    }
  }

  // When the user changes the input, update the answer and auto-advance if conditions are met
  const handleChange = (e) => {
    const value = e.target.value
    setUserAnswer(value)
    // Auto-advance only for non-essay questions and if auto-proceed is enabled
    if (
      autoProceedEnabled &&
      !autoAdvanced &&
      question.type !== 'essay' &&
      isAnswerCorrect(value)
    ) {
      setAutoAdvanced(true)
      setAnimationClass(direction === "prev" ? "slide-out-right" : "slide-out-left")
      setTimeout(() => {
        onNext()
      }, 700)
    }
  }

  // For essay questions or manual submission when auto-proceed is disabled
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isAnswerCorrect(userAnswer)) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } else {
      setAnimationClass(direction === "prev" ? "slide-out-right" : "slide-out-left")
      setTimeout(() => {
        onNext()
      }, 700)
    }
  }

  const renderInput = () => {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <div style={{ paddingTop: '20px' }}>
            {question.options.map(option => (
              <div key={option.ident} style={{ marginBottom: '10px' }}>
                <label>
                  <input
                    type="radio"
                    name="answer"
                    value={option.ident}
                    onChange={handleChange}
                    onClick={handleChange} // immediate detection on click
                    checked={userAnswer === option.ident}
                    style={{ marginRight: '8px' }}
                  />
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        )
      case 'fill_in':
        return (
          <div style={{ paddingTop: '20px' }}>
            <input
              type="text"
              value={userAnswer}
              onChange={handleChange}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
                marginBottom: '10px'
              }}
            />
          </div>
        )
      case 'essay':
        return (
          <div style={{ paddingTop: '20px' }}>
            <textarea
              value={userAnswer}
              onChange={handleChange}
              rows="4"
              cols="50"
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '100%',
                marginBottom: '10px'
              }}
            />
          </div>
        )
      default:
        return null
    }
  }

  const renderFeedback = () => {
    if (question.type === 'essay' || !userAnswer) return null

    if (isAnswerCorrect(userAnswer)) {
      return <div style={{ fontWeight: 'bold', color: 'green', marginBottom: '10px' }}>Correct ✅</div>
    } else {
      let correctText = question.correctAnswer
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const correctOption = question.options.find(opt => opt.ident === question.correctAnswer)
        correctText = correctOption ? correctOption.text : question.correctAnswer
      }
      return (
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'red' }}>
          Incorrect ❌. The correct answer is: <span style={{ color: 'green' }}>{correctText}</span>
        </div>
      )
    }
  }

  return (
    <div className={`question-container ${animationClass} ${shake ? 'shake' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '50px' }}>
        <div>
          <h2 style={{ margin: 0, textAlign: 'center' }}>
            Question {questionNumber} / {totalQuestions}
          </h2>
        </div>
        {question.type !== 'essay' && (
          <div style={{ marginLeft: '10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '4px' }}>Auto-Advance</label>
            <input 
              type="checkbox"
              checked={autoProceedEnabled}
              onChange={() => setAutoProceedEnabled(!autoProceedEnabled)}
              style={{ transform: 'scale(0.7)' }}
            />
          </div>
        )}
      </div>
      <div className="question-prompt" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div dangerouslySetInnerHTML={{ __html: question.prompt }} />
      </div>
      <form onSubmit={handleSubmit}>
        {renderInput()}
        {(question.type === 'essay' || !autoProceedEnabled) && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                border: 'none',
                background: '#007bff',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Submit Answer
            </button>
          </div>
        )}
      </form>
      {renderFeedback()}
    </div>
  )
}

export default QuestionComponent
