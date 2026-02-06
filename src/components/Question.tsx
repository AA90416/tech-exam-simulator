import type { Question as QuestionType } from '../types/exam';
import { useExam } from '../context/ExamContext';
import './Question.css';

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
}

export function Question({ question, questionNumber, totalQuestions }: QuestionProps) {
  const { userAnswers, selectAnswer, showAnswer, mode, isExamFinished } = useExam();

  const currentAnswer = userAnswers.find(a => a.questionId === question.id);
  const selectedAnswerId = currentAnswer?.selectedAnswerId;
  const canShowAnswer = mode === 'practice' || isExamFinished;

  const getAnswerClassName = (answerId: string) => {
    const classes = ['answer'];

    if (selectedAnswerId === answerId) {
      classes.push('answer--selected');
    }

    if (showAnswer && canShowAnswer) {
      if (answerId === question.correctAnswerId) {
        classes.push('answer--correct');
      } else if (selectedAnswerId === answerId) {
        classes.push('answer--incorrect');
      }
    }

    return classes.join(' ');
  };

  return (
    <div className="question">
      <div className="question__header">
        <span className="question__number">
          Question {questionNumber} of {totalQuestions}
        </span>
        {question.category && (
          <span className="question__category">{question.category}</span>
        )}
      </div>

      <h2 className="question__text">{question.text}</h2>

      <div className="answers">
        {question.answers.map((answer, index) => (
          <button
            key={answer.id}
            className={getAnswerClassName(answer.id)}
            onClick={() => !isExamFinished && selectAnswer(answer.id)}
            disabled={isExamFinished && mode === 'real'}
          >
            <span className="answer__letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="answer__text">{answer.text}</span>
            {showAnswer && canShowAnswer && answer.id === question.correctAnswerId && (
              <span className="answer__check">✓</span>
            )}
          </button>
        ))}
      </div>

      {showAnswer && canShowAnswer && question.explanation && (
        <div className="explanation">
          <h4>Explanation:</h4>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
