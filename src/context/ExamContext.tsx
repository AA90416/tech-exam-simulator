import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Exam, ExamMode, UserAnswer, ExamResult, ExamHistory } from '../types/exam';
import { useAuth } from './AuthContext';

function saveExamHistory(username: string, result: ExamResult, exam: Exam, mode: ExamMode) {
  const key = `exam-results-${username}`;
  const existing: ExamHistory[] = JSON.parse(localStorage.getItem(key) || '[]');
  const entry: ExamHistory = {
    id: `hist-${Date.now()}`,
    examId: exam.id,
    examTitle: exam.title,
    score: result.score,
    passed: result.passed,
    correctAnswers: result.correctAnswers,
    totalQuestions: result.totalQuestions,
    timeSpent: result.timeSpent,
    completedAt: new Date().toISOString(),
    mode,
  };
  existing.unshift(entry);
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 50)));
}

interface ExamContextType {
  currentExam: Exam | null;
  mode: ExamMode;
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  showAnswer: boolean;
  timeRemaining: number;
  isExamFinished: boolean;
  result: ExamResult | null;

  startExam: (exam: Exam, mode: ExamMode) => void;
  selectAnswer: (answerId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  toggleShowAnswer: () => void;
  finishExam: () => void;
  updateTimeRemaining: (time: number) => void;
  resetExam: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [mode, setMode] = useState<ExamMode>('practice');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const startExam = useCallback((exam: Exam, examMode: ExamMode) => {
    setCurrentExam(exam);
    setMode(examMode);
    setCurrentQuestionIndex(0);
    setUserAnswers(exam.questions.map(q => ({ questionId: q.id, selectedAnswerId: null })));
    setShowAnswer(false);
    setTimeRemaining(examMode === 'real' ? exam.timeLimit * 60 : 0);
    setIsExamFinished(false);
    setResult(null);
    setStartTime(Date.now());
  }, []);

  const selectAnswer = useCallback((answerId: string) => {
    if (!currentExam || isExamFinished) return;

    setUserAnswers(prev => {
      const newAnswers = [...prev];
      const currentQuestion = currentExam.questions[currentQuestionIndex];
      const answerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
      if (answerIndex !== -1) {
        newAnswers[answerIndex] = { ...newAnswers[answerIndex], selectedAnswerId: answerId };
      }
      return newAnswers;
    });
  }, [currentExam, currentQuestionIndex, isExamFinished]);

  const nextQuestion = useCallback(() => {
    if (!currentExam) return;
    setShowAnswer(false);
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentExam, currentQuestionIndex]);

  const previousQuestion = useCallback(() => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (!currentExam) return;
    setShowAnswer(false);
    if (index >= 0 && index < currentExam.questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [currentExam]);

  const toggleShowAnswer = useCallback(() => {
    setShowAnswer(prev => !prev);
  }, []);

  const finishExam = useCallback(() => {
    if (!currentExam) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctAnswers = userAnswers.filter((ua, index) => {
      const question = currentExam.questions[index];
      return ua.selectedAnswerId === question.correctAnswerId;
    }).length;

    const score = Math.round((correctAnswers / currentExam.questions.length) * 100);

    setResult({
      examId: currentExam.id,
      totalQuestions: currentExam.questions.length,
      correctAnswers,
      score,
      passed: score >= currentExam.passingScore,
      answers: userAnswers,
      timeSpent,
    });
    setIsExamFinished(true);

    if (currentUser) {
      saveExamHistory(currentUser.username, {
        examId: currentExam.id,
        totalQuestions: currentExam.questions.length,
        correctAnswers,
        score,
        passed: score >= currentExam.passingScore,
        answers: userAnswers,
        timeSpent,
      }, currentExam, mode);
    }
  }, [currentExam, userAnswers, startTime, currentUser, mode]);

  const updateTimeRemaining = useCallback((time: number) => {
    setTimeRemaining(time);
    if (time <= 0 && mode === 'real' && !isExamFinished) {
      finishExam();
    }
  }, [mode, isExamFinished, finishExam]);

  const resetExam = useCallback(() => {
    setCurrentExam(null);
    setMode('practice');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowAnswer(false);
    setTimeRemaining(0);
    setIsExamFinished(false);
    setResult(null);
  }, []);

  return (
    <ExamContext.Provider
      value={{
        currentExam,
        mode,
        currentQuestionIndex,
        userAnswers,
        showAnswer,
        timeRemaining,
        isExamFinished,
        result,
        startExam,
        selectAnswer,
        nextQuestion,
        previousQuestion,
        goToQuestion,
        toggleShowAnswer,
        finishExam,
        updateTimeRemaining,
        resetExam,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}
