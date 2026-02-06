import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import './Results.css';

export function Results() {
  const navigate = useNavigate();
  const { currentExam, result, userAnswers, resetExam } = useExam();
  const [showAnswers, setShowAnswers] = useState(false);

  if (!currentExam || !result) {
    navigate('/');
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleReturnHome = () => {
    resetExam();
    navigate('/');
  };

  return (
    <div className="results">
      <div className="results-card">
        <div className={`results-header ${result.passed ? 'results-header--passed' : 'results-header--failed'}`}>
          <div className="results-icon">
            {result.passed ? '✓' : '✗'}
          </div>
          <h1>{result.passed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
          <p>
            {result.passed
              ? 'You passed the exam!'
              : `You need ${currentExam.passingScore}% to pass.`}
          </p>
        </div>

        <div className="results-stats">
          <div className="stat">
            <span className="stat__value">{result.score}%</span>
            <span className="stat__label">Score</span>
          </div>
          <div className="stat">
            <span className="stat__value">{result.correctAnswers}/{result.totalQuestions}</span>
            <span className="stat__label">Correct</span>
          </div>
          <div className="stat">
            <span className="stat__value">{formatTime(result.timeSpent)}</span>
            <span className="stat__label">Time</span>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn--secondary" onClick={handleReturnHome}>
            Back to Home
          </button>
          <button
            className="btn btn--primary"
            onClick={() => setShowAnswers(!showAnswers)}
          >
            {showAnswers ? 'Hide Answers' : 'View Answers'}
          </button>
        </div>
      </div>

      {showAnswers && (
        <div className="answer-review">
          <h2>Answer Review</h2>
          {currentExam.questions.map((question, index) => {
            const userAnswer = userAnswers.find(a => a.questionId === question.id);
            const selectedId = userAnswer?.selectedAnswerId;
            const isCorrect = selectedId === question.correctAnswerId;

            return (
              <div key={question.id} className={`review-item ${isCorrect ? 'review-item--correct' : 'review-item--incorrect'}`}>
                <div className="review-header">
                  <span className="review-number">Q{index + 1}</span>
                  <span className={`review-badge ${isCorrect ? 'review-badge--correct' : 'review-badge--incorrect'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                  {question.category && (
                    <span className="review-category">{question.category}</span>
                  )}
                </div>

                <p className="review-question">{question.text}</p>

                <div className="review-answers">
                  {question.answers.map((answer, i) => {
                    const isSelected = answer.id === selectedId;
                    const isCorrectAnswer = answer.id === question.correctAnswerId;

                    let className = 'review-answer';
                    if (isCorrectAnswer) className += ' review-answer--correct';
                    if (isSelected && !isCorrectAnswer) className += ' review-answer--wrong';

                    return (
                      <div key={answer.id} className={className}>
                        <span className="review-answer__letter">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="review-answer__text">{answer.text}</span>
                        {isSelected && <span className="review-answer__tag">Your answer</span>}
                        {isCorrectAnswer && <span className="review-answer__tag review-answer__tag--correct">Correct</span>}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <div className="review-explanation">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
