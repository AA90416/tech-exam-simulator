export interface Answer {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerId: string;
  correctAnswerIds?: string[];
  explanation?: string;
  category?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: Question[];
  group?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswerIds: string[];
}

export interface ExamResult {
  examId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  answers: UserAnswer[];
  timeSpent: number; // in seconds
}

export type ExamMode = 'practice' | 'real';

export interface ExamHistory {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string; // ISO date string
  mode: ExamMode;
}

export function getCorrectAnswerIds(question: Question): string[] {
  const answerIds = question.correctAnswerIds?.length
    ? question.correctAnswerIds
    : [question.correctAnswerId];

  return Array.from(new Set(answerIds));
}

export function isMultiSelectQuestion(question: Question): boolean {
  return getCorrectAnswerIds(question).length > 1;
}

export function isQuestionAnswered(userAnswer?: UserAnswer): boolean {
  return (userAnswer?.selectedAnswerIds?.length ?? 0) > 0;
}

export function isQuestionCorrect(question: Question, userAnswer?: UserAnswer): boolean {
  const selectedAnswerIds = Array.from(new Set(userAnswer?.selectedAnswerIds ?? [])).sort();
  const correctAnswerIds = [...getCorrectAnswerIds(question)].sort();

  return selectedAnswerIds.length === correctAnswerIds.length
    && selectedAnswerIds.every((answerId, index) => answerId === correctAnswerIds[index]);
}
