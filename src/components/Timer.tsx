import { useEffect, useRef } from 'react';
import { useExam } from '../context/ExamContext';
import './Timer.css';

export function Timer() {
  const { timeRemaining, updateTimeRemaining, mode, isExamFinished } = useExam();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode !== 'real' || isExamFinished) return;

    intervalRef.current = window.setInterval(() => {
      updateTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mode, timeRemaining, updateTimeRemaining, isExamFinished]);

  if (mode !== 'real') return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className={`timer ${isLowTime ? 'timer--low' : ''}`}>
      <span className="timer__icon">⏱</span>
      <span className="timer__time">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
