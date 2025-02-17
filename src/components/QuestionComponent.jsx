// src/components/QuestionComponent.jsx
import React, { useState, useEffect, useRef } from 'react';

const QuestionComponent = ({
  question,
  onNext,
  questionNumber,
  totalQuestions,
  direction,
  onQuestionNumberChange
}) => {
  const [userAnswer, setUserAnswer] = useState(
    localStorage.getItem('userAnswers')
      ? JSON.parse(localStorage.getItem('userAnswers'))[question.ident] || ""
      : ""
  );
  const [shake, setShake] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [autoProceedEnabled, setAutoProceedEnabled] = useState(
    JSON.parse(localStorage.getItem('autoProceedEnabled')) || false
  );
  // Local state for the editable question number field
  const [questionNumberInput, setQuestionNumberInput] = useState(questionNumber.toString());

  const autoAdvancedRef = useRef(false);

  // Update local question number field when prop changes
  useEffect(() => {
    setQuestionNumberInput(questionNumber.toString());
  }, [questionNumber]);

  // Reset state when the question or direction changes
  useEffect(() => {
    setUserAnswer(
      localStorage.getItem('userAnswers')
        ? JSON.parse(localStorage.getItem('userAnswers'))[question.ident] || ""
        : ""
    );
    setShake(false);
    setAnimationClass("");
    autoAdvancedRef.current = false;
    setSubmitted(false);
    // Set slide-in animation based on direction
    if (direction === "prev") {
      setAnimationClass("slide-in-left");
    } else {
      setAnimationClass("slide-in-right");
    }
    const timeout = setTimeout(() => setAnimationClass(""), 500);
    return () => clearTimeout(timeout);
  }, [question, direction]);

  const isAnswerCorrect = (value) => {
    if (question.type === 'fill_in') {
      return value.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    } else if (question.type === 'multiple_choice' || question.type === 'true_false') {
      return value === question.correctAnswer;
    }
    return false;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setUserAnswer(value);

    // Persist answer in localStorage
    const storedAnswers = JSON.parse(localStorage.getItem('userAnswers')) || {};
    storedAnswers[question.ident] = value;
    localStorage.setItem('userAnswers', JSON.stringify(storedAnswers));

    if (autoProceedEnabled && question.type !== 'essay') {
      // If answer is correct, auto-advance
      if (isAnswerCorrect(value)) {
        autoAdvancedRef.current = true;
        setAnimationClass(direction === "prev" ? "slide-out-right" : "slide-out-left");
        setSubmitted(true);
        setTimeout(() => {
          onNext();
          autoAdvancedRef.current = false;
        }, 700);
      } else {
        // If wrong, show feedback so the correct answer is visible
        setSubmitted(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isAnswerCorrect(userAnswer)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      setAnimationClass(direction === "prev" ? "slide-out-right" : "slide-out-left");
      setTimeout(() => {
        onNext();
      }, 700);
    }
  };

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
                    onClick={handleChange}
                    checked={userAnswer === option.ident}
                    style={{ marginRight: '8px' }}
                  />
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );
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
        );
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
        );
      default:
        return null;
    }
  };

  const renderFeedback = () => {
    if (!submitted || question.type === 'essay' || !userAnswer) return null;
    if (isAnswerCorrect(userAnswer)) {
      return <div style={{ fontWeight: 'bold', color: 'green', marginBottom: '10px' }}>Correct ✅</div>;
    } else {
      let correctText = question.correctAnswer;
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const correctOption = question.options.find(opt => opt.ident === question.correctAnswer);
        correctText = correctOption ? correctOption.text : question.correctAnswer;
      }
      return (
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'red', textAlign: "center"}}>
          Incorrect ❌. The correct answer is: <span style={{ color: 'green' }}>{correctText}</span>
        </div>
      );
    }
  };

  // Handle number field editing: clear field on focus, and on blur validate and update
  const handleNumberBlur = () => {
    let val = parseInt(questionNumberInput, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
    } else if (val > totalQuestions) {
      val = totalQuestions;
    }
    setQuestionNumberInput(val.toString());
    onQuestionNumberChange({ target: { value: val } });
  };

  const handleNumberKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const handleNumberFocus = () => {
    // Clear the field to allow new input
    setQuestionNumberInput("");
  };

  return (
    <div className={`question-container ${animationClass} ${shake ? 'shake' : ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '20px', fontWeight: 'bold', fontSize: "20px" }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Question </span>
          <input
            type="number"
            value={questionNumberInput}
            onChange={(e) => setQuestionNumberInput(e.target.value)}
            onBlur={handleNumberBlur}
            onKeyDown={handleNumberKeyDown}
            onFocus={handleNumberFocus}
            style={{
              width: '50px',
              margin: '0 5px',
              textAlign: 'center',
              fontSize: 'inherit'
            }}
            min="1"
            max={totalQuestions}
          />
          <span> / {totalQuestions}</span>
        </div>
      </div>

      <div className="question-prompt" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '18px' }} dangerouslySetInnerHTML={{ __html: question.prompt }} />
      </div>

      <form onSubmit={handleSubmit}>
        {renderInput()}

        {renderFeedback()}
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
      
      
      
      {question.type !== 'essay' && (
        <div style={{ textAlign: 'center', fontSize: '0.7rem', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <label style={{ marginRight: '4px' }}>Auto-Advance</label>
          <input 
            type="checkbox"
            checked={autoProceedEnabled}
            onChange={() => { 
              const newValue = !autoProceedEnabled;
              setAutoProceedEnabled(newValue);
              localStorage.setItem('autoProceedEnabled', JSON.stringify(newValue));
            }}
            style={{ transform: 'scale(0.7)' }}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionComponent;
