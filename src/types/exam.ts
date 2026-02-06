export interface Answer {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerId: string;
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
}

export interface UserAnswer {
  questionId: string;
  selectedAnswerId: string | null;
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
