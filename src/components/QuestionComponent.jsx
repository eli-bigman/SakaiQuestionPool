import React, { useState, useEffect } from 'react'

const QuestionComponent = ({ question, onNext, userAnswer, onAnswerChange }) => {
  const [shake, setShake] = useState(false)
  const [animationClass, setAnimationClass] = useState("")

  useEffect(() => {
    setShake(false)
    setAnimationClass("slide-in")
    const timeout = setTimeout(() => setAnimationClass(""), 500)
    return () => clearTimeout(timeout)
  }, [question])

  const isCorrect = () => {
    if (question.type === 'fill_in') {
      return userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
    } else if (question.type === 'multiple_choice' || question.type === 'true_false') {
      return userAnswer === question.correctAnswer
    }
    return false
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isCorrect()) {
      setAnimationClass("slide-out")
      setTimeout(() => {
        onNext()
      }, 700)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
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
                onChange={(e) => onAnswerChange(e.target.value)}
                checked={userAnswer === option.ident}
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
            onChange={(e) => onAnswerChange(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginBottom: '10px' }}
          />
        )
      case 'essay':
        return (
          <textarea
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            rows="4"
            cols="50"
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginBottom: '10px' }}
          />
        )
      default:
        return null
    }
  }

  const renderFeedback = () => {
    if (question.type === 'essay') return null
    if (!userAnswer) return null

    if (isCorrect()) {
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
      <p style={{textAlign:'center', fontSize:'12px', fontStyle:"italic"}}>{question.qNumber} out of {question.maxQ}</p>
      <div className="question-prompt" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{fontWeight:'bold', fontSize:'18px'}} dangerouslySetInnerHTML={{ __html: question.prompt }} />
      </div>
      <form onSubmit={handleSubmit}>
        {renderInput()}
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
      </form>
      {renderFeedback()}
    </div>
  )
}

export default QuestionComponent;