import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { generateQuestions } from '../services/openai';
import type { Question, Exam } from '../types/exam';
import './CreateExam.css';

type SourceType = 'topic' | 'text' | 'url';

export function CreateExam() {
  const navigate = useNavigate();
  const { settings, isApiKeySet } = useSettings();

  const [activeTab, setActiveTab] = useState<SourceType>('topic');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [questionCount, setQuestionCount] = useState(settings.defaultQuestionCount);
  const [difficulty, setDifficulty] = useState(settings.defaultDifficulty);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const getContent = () => {
    switch (activeTab) {
      case 'topic':
        return topic;
      case 'text':
        return text;
      case 'url':
        return url;
    }
  };

  const isValid = () => {
    const content = getContent();
    return content.trim().length > 0 && isApiKeySet;
  };

  const handleGenerate = async () => {
    if (!isValid()) return;

    setIsGenerating(true);
    setError('');

    try {
      const questions = await generateQuestions({
        apiKey: settings.openaiApiKey,
        source: activeTab,
        content: getContent(),
        questionCount,
        difficulty,
      });

      setGeneratedQuestions(questions);
      setExamTitle(activeTab === 'topic' ? topic : 'Custom Exam');
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveExam = () => {
    const newExam: Exam = {
      id: `custom-${Date.now()}`,
      title: examTitle,
      description: `AI-generated exam with ${generatedQuestions.length} questions`,
      timeLimit: Math.ceil(generatedQuestions.length * 1.5),
      passingScore: 70,
      questions: generatedQuestions,
    };

    // Save to localStorage
    const savedExams = JSON.parse(localStorage.getItem('custom-exams') || '[]');
    savedExams.push(newExam);
    localStorage.setItem('custom-exams', JSON.stringify(savedExams));

    navigate('/');
  };

  const handleRemoveQuestion = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: string) => {
    setGeneratedQuestions(prev =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  if (!isApiKeySet) {
    return (
      <div className="create-exam">
        <header className="create-exam__header">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <h1>Create Exam with AI</h1>
        </header>
        <div className="no-api-key">
          <h2>API Key Required</h2>
          <p>You need to configure your OpenAI API key to use AI exam generation.</p>
          <button className="btn btn--primary" onClick={() => navigate('/admin')}>
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="create-exam">
        <header className="create-exam__header">
          <button className="back-btn" onClick={() => setShowPreview(false)}>
            ← Back to Generator
          </button>
          <h1>Preview & Edit Questions</h1>
        </header>

        <div className="preview-section">
          <div className="exam-title-input">
            <label htmlFor="examTitle">Exam Title</label>
            <input
              id="examTitle"
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Enter exam title"
            />
          </div>

          <div className="questions-list">
            {generatedQuestions.map((question, index) => (
              <div key={question.id} className="preview-question">
                <div className="preview-question__header">
                  <span className="question-number">Question {index + 1}</span>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveQuestion(index)}
                  >
                    Remove
                  </button>
                </div>

                <div className="form-group">
                  <label>Question</label>
                  <textarea
                    value={question.text}
                    onChange={(e) => handleUpdateQuestion(index, 'text', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="answers-grid">
                  {question.answers.map((answer, ansIndex) => (
                    <div key={answer.id} className="answer-input">
                      <span className={`answer-letter ${answer.id === question.correctAnswerId ? 'correct' : ''}`}>
                        {String.fromCharCode(65 + ansIndex)}
                      </span>
                      <input
                        type="text"
                        value={answer.text}
                        onChange={(e) => {
                          const newAnswers = [...question.answers];
                          newAnswers[ansIndex] = { ...answer, text: e.target.value };
                          setGeneratedQuestions(prev =>
                            prev.map((q, i) => (i === index ? { ...q, answers: newAnswers } : q))
                          );
                        }}
                      />
                      <button
                        className={`correct-btn ${answer.id === question.correctAnswerId ? 'active' : ''}`}
                        onClick={() => handleUpdateQuestion(index, 'correctAnswerId', answer.id)}
                        title="Set as correct answer"
                      >
                        ✓
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Explanation</label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(index, 'explanation', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="preview-actions">
            <button className="btn btn--secondary" onClick={() => setShowPreview(false)}>
              Generate More
            </button>
            <button
              className="btn btn--primary"
              onClick={handleSaveExam}
              disabled={generatedQuestions.length === 0 || !examTitle.trim()}
            >
              Save Exam ({generatedQuestions.length} questions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-exam">
      <header className="create-exam__header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Create Exam with AI</h1>
        <p>Generate exam questions using AI from various sources</p>
      </header>

      <div className="generator-card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'topic' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('topic')}
          >
            From Topic
          </button>
          <button
            className={`tab ${activeTab === 'text' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            From Text
          </button>
          <button
            className={`tab ${activeTab === 'url' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            From URL
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'topic' && (
            <div className="form-group">
              <label htmlFor="topic">Topic or Subject</label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AWS Lambda, Docker containers, React hooks"
              />
              <p className="help-text">Enter a topic and AI will generate relevant exam questions</p>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="form-group">
              <label htmlFor="text">Documentation or Notes</label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your documentation, notes, or study material here..."
                rows={8}
              />
              <p className="help-text">AI will generate questions based on this content</p>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="form-group">
              <label htmlFor="url">URL</label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.example.com/topic"
              />
              <p className="help-text">AI will analyze the page and generate questions (works best with documentation pages)</p>
            </div>
          )}

          <div className="options-row">
            <div className="form-group">
              <label htmlFor="questionCount">Number of Questions</label>
              <select
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              >
                <option value={5}>5 questions</option>
                <option value={10}>10 questions</option>
                <option value={15}>15 questions</option>
                <option value={20}>20 questions</option>
                <option value={25}>25 questions</option>
                <option value={50}>50 questions</option>
                <option value={60}>60 questions</option>
                <option value={100}>100 questions</option>
                <option value={120}>120 questions</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="btn btn--generate"
            onClick={handleGenerate}
            disabled={!isValid() || isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating Questions...
              </>
            ) : (
              'Generate Questions'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
