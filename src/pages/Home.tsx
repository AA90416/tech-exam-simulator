import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { allExams } from '../data/exams';
import { useExam } from '../context/ExamContext';
import { useSettings } from '../context/SettingsContext';
import type { Exam, ExamMode } from '../types/exam';
import './Home.css';

export function Home() {
  const navigate = useNavigate();
  const { startExam } = useExam();
  const { isApiKeySet } = useSettings();
  const [customExams, setCustomExams] = useState<Exam[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('custom-exams');
    if (saved) {
      try {
        setCustomExams(JSON.parse(saved));
      } catch {
        setCustomExams([]);
      }
    }
  }, []);

  const handleStartExam = (exam: Exam, mode: ExamMode) => {
    startExam(exam, mode);
    navigate('/exam');
  };

  const handleDeleteCustomExam = (examId: string) => {
    const updated = customExams.filter(e => e.id !== examId);
    setCustomExams(updated);
    localStorage.setItem('custom-exams', JSON.stringify(updated));
  };

  const allAvailableExams = [...allExams, ...customExams];

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__header-top">
          <h1>Tech Exam Simulator</h1>
          <button className="admin-btn" onClick={() => navigate('/admin')}>
            Settings
          </button>
        </div>
        <p>Practice for your certification exams with realistic questions</p>
        {!isApiKeySet && (
          <div className="api-key-notice">
            <span>Configure your OpenAI API key in </span>
            <button onClick={() => navigate('/admin')}>Settings</button>
            <span> to enable AI exam generation</span>
          </div>
        )}
      </header>

      <div className="create-exam-banner" onClick={() => navigate('/create')}>
        <div className="create-exam-banner__content">
          <span className="create-exam-banner__icon">+</span>
          <div>
            <h3>Create Exam with AI</h3>
            <p>Generate custom exams from topics, text, or URLs</p>
          </div>
        </div>
        <span className="create-exam-banner__arrow">→</span>
      </div>

      <div className="exam-list">
        {allAvailableExams.map(exam => {
          const isCustom = exam.id.startsWith('custom-');
          return (
            <div key={exam.id} className="exam-card">
              <div className="exam-card__content">
                <div className="exam-card__title-row">
                  <h2 className="exam-card__title">{exam.title}</h2>
                  {isCustom && (
                    <span className="custom-badge">AI Generated</span>
                  )}
                </div>
                <p className="exam-card__description">{exam.description}</p>
                <div className="exam-card__meta">
                  <span>{exam.questions.length} questions</span>
                  <span>{exam.timeLimit} minutes</span>
                  <span>Pass: {exam.passingScore}%</span>
                </div>
              </div>
              <div className="exam-card__actions">
                <button
                  className="btn btn--practice"
                  onClick={() => handleStartExam(exam, 'practice')}
                >
                  Practice Mode
                  <span className="btn__hint">View answers as you go</span>
                </button>
                <button
                  className="btn btn--real"
                  onClick={() => handleStartExam(exam, 'real')}
                >
                  Real Exam
                  <span className="btn__hint">Timed, see results at end</span>
                </button>
                {isCustom && (
                  <button
                    className="btn btn--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCustomExam(exam.id);
                    }}
                    title="Delete exam"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
