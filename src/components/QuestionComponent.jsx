import React, { useState, useEffect } from 'react'

const QuestionComponent = ({ question, onNext, questionNumber, totalQuestions }) => {
  const [userAnswer, setUserAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [animationClass, setAnimationClass] = useState("")

  // Reset state and trigger a slide-in animation when a new question is loaded
  useEffect(() => {
    setUserAnswer("")
    setShowAnswer(false)
    setAnimationClass("slide-in")
    const timeout = setTimeout(() => {
      setAnimationClass("")
    }, 500)
    return () => clearTimeout(timeout)
  }, [question])

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowAnswer(true)
  }

  const handleChange = (e) => {
    setUserAnswer(e.target.value)
  }

  // On Next, trigger a slide-out animation then call onNext after 500ms
  const handleNextClick = () => {
    setAnimationClass("slide-out")
    setTimeout(() => {
      onNext()
    }, 500)
  }

  const renderInput = () => {
    switch (question.type) {
      case 'multiple_choice':
      case 'true_false':
        return question.options.map(option => (
          <div key={option.ident} style={{ marginBottom: '10px' }}>
            <label>
              <input 
                type="radio" 
                name="answer" 
                value={option.ident} 
                onChange={handleChange}
                checked={userAnswer === option.ident}
                disabled={showAnswer}
                style={{ marginRight: '8px' }}
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
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              marginBottom: '10px'
            }}
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
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              marginBottom: '10px'
            }}
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
        return <div style={{ fontWeight: 'bold', color: 'green', marginBottom: '10px' }}>Correct ✅</div>
      } else {
        return (
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'red' }}>
            Incorrect ❌. The correct answer is: <span style={{ color: 'green' }}>{correctText}</span>
          </div>
        )
      }
    }
    // For fill in the blank questions, compare the text (ignoring case)
    else if (question.type === 'fill_in') {
      if (userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        return <div style={{ fontWeight: 'bold', color: 'green', marginBottom: '10px' }}>Correct ✅</div>
      } else {
        return (
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'red' }}>
            Incorrect ❌. The correct answer is: <span style={{ color: 'green' }}>{question.correctAnswer}</span>
          </div>
        )
      }
    }
  }

  return (
    <div className={`question-container ${animationClass}`}>
      <h2 style={{ textAlign: 'center' }}>Question {questionNumber} of {totalQuestions}</h2>
      <div className="question-prompt" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div dangerouslySetInnerHTML={{ __html: question.prompt }} />
      </div>
      <form onSubmit={handleSubmit}>
        {renderInput()}
        {!showAnswer && (
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
      {renderResult()}
      {showAnswer && (
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleNextClick} 
            style={{
              padding: '10px 20px', 
              borderRadius: '5px', 
              border: 'none', 
              background: '#28a745', 
              color: '#fff', 
              cursor: 'pointer'
            }}
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  )
}

export default QuestionComponent
