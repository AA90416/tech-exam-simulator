import {
  getCorrectAnswerIds,
  isMultiSelectQuestion,
} from '../types/exam';
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
  const selectedAnswerIds = currentAnswer?.selectedAnswerIds ?? [];
  const correctAnswerIds = getCorrectAnswerIds(question);
  const isMultiSelect = isMultiSelectQuestion(question);
  const canShowAnswer = mode === 'practice' || isExamFinished;

  const getAnswerClassName = (answerId: string) => {
    const classes = ['answer'];
    const isSelected = selectedAnswerIds.includes(answerId);
    const isCorrectAnswer = correctAnswerIds.includes(answerId);

    if (isSelected) {
      classes.push('answer--selected');
    }

    if (showAnswer && canShowAnswer) {
      if (isCorrectAnswer) {
        classes.push('answer--correct');
      } else if (isSelected) {
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
      {isMultiSelect && (
        <p className="question__selection-hint">Select all that apply.</p>
      )}

      <div className="answers">
        {question.answers.map((answer, index) => (
          <button
            key={answer.id}
            type="button"
            className={getAnswerClassName(answer.id)}
            onClick={() => !isExamFinished && selectAnswer(answer.id)}
            disabled={isExamFinished && mode === 'real'}
            aria-pressed={selectedAnswerIds.includes(answer.id)}
          >
            <span className="answer__letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="answer__text">{answer.text}</span>
            {showAnswer && canShowAnswer && correctAnswerIds.includes(answer.id) && (
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
