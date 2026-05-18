import { isQuestionAnswered } from '../types/exam';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Question } from '../components/Question';
import { Timer } from '../components/Timer';
import { QuestionNav } from '../components/QuestionNav';
import './ExamPage.css';

export function ExamPage() {
  const navigate = useNavigate();
  const {
    currentExam,
    mode,
    currentQuestionIndex,
    nextQuestion,
    previousQuestion,
    toggleShowAnswer,
    showAnswer,
    finishExam,
    isExamFinished,
    userAnswers,
  } = useExam();

  if (!currentExam) {
    navigate('/');
    return null;
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentExam.questions.length - 1;
  const answeredCount = userAnswers.filter(answer => isQuestionAnswered(answer)).length;

  const handleFinish = () => {
    finishExam();
    navigate('/results');
  };

  if (isExamFinished) {
    navigate('/results');
    return null;
  }

  return (
    <div className="exam-page">
      <header className="exam-header">
        <div className="exam-header__info">
          <h1>{currentExam.title}</h1>
          <span className={`mode-badge mode-badge--${mode}`}>
            {mode === 'practice' ? 'Practice Mode' : 'Real Exam'}
          </span>
        </div>
        <div className="exam-header__right">
          <Timer />
          <span className="progress-text">
            {answeredCount} / {currentExam.questions.length} answered
          </span>
        </div>
      </header>

      <div className="exam-content">
        <main className="exam-main">
          <Question
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={currentExam.questions.length}
          />

          <div className="exam-controls">
            <button
              className="control-btn control-btn--secondary"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>

            {mode === 'practice' && (
              <button
                className="control-btn control-btn--show-answer"
                onClick={toggleShowAnswer}
              >
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>
            )}

            {isLastQuestion ? (
              <button
                className="control-btn control-btn--finish"
                onClick={handleFinish}
              >
                Finish Exam
              </button>
            ) : (
              <button
                className="control-btn control-btn--primary"
                onClick={nextQuestion}
              >
                Next
              </button>
            )}
          </div>
        </main>

        <aside className="exam-sidebar">
          <QuestionNav />
          <button
            className="finish-btn"
            onClick={handleFinish}
          >
            Finish Exam
          </button>
        </aside>
      </div>
    </div>
  );
}
