import { isQuestionAnswered, isQuestionCorrect } from '../types/exam';
import { useExam } from '../context/ExamContext';
import './QuestionNav.css';

export function QuestionNav() {
  const {
    currentExam,
    currentQuestionIndex,
    userAnswers,
    goToQuestion,
    mode,
    isExamFinished
  } = useExam();

  if (!currentExam) return null;

  return (
    <div className="question-nav">
      <h4 className="question-nav__title">Questions</h4>
      <div className="question-nav__grid">
        {currentExam.questions.map((question, index) => {
          const answer = userAnswers.find(a => a.questionId === question.id);
          const isAnswered = isQuestionAnswered(answer);
          const isCurrent = index === currentQuestionIndex;
          const isCorrect = isExamFinished && isQuestionCorrect(question, answer);
          const isIncorrect = isExamFinished && isAnswered && !isCorrect;

          let className = 'question-nav__btn';
          if (isCurrent) className += ' question-nav__btn--current';
          if (isAnswered && !isExamFinished) className += ' question-nav__btn--answered';
          if (isCorrect) className += ' question-nav__btn--correct';
          if (isIncorrect) className += ' question-nav__btn--incorrect';

          return (
            <button
              key={question.id}
              className={className}
              onClick={() => goToQuestion(index)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="question-nav__legend">
        <span className="legend-item">
          <span className="legend-dot legend-dot--current"></span> Current
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-dot--answered"></span> Answered
        </span>
        {(mode === 'practice' || isExamFinished) && (
          <>
            <span className="legend-item">
              <span className="legend-dot legend-dot--correct"></span> Correct
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--incorrect"></span> Incorrect
            </span>
          </>
        )}
      </div>
    </div>
  );
}
