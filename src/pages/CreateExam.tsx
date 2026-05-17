import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { generateQuestions } from '../services/openai';
import type { Question, Exam } from '../types/exam';
import './CreateExam.css';

type CreationMode = 'ai' | 'manual';
type AISourceType = 'topic' | 'text' | 'url';

const createEmptyQuestion = (): Question => ({
  id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  text: '',
  answers: [
    { id: 'a', text: '' },
    { id: 'b', text: '' },
    { id: 'c', text: '' },
    { id: 'd', text: '' },
  ],
  correctAnswerId: 'a',
  explanation: '',
  category: '',
});

export function CreateExam() {
  const navigate = useNavigate();
  const { settings, isApiKeySet } = useSettings();

  // Mode selection
  const [creationMode, setCreationMode] = useState<CreationMode>('manual');

  // AI mode state
  const [activeTab, setActiveTab] = useState<AISourceType>('topic');
  const [topic, setTopic] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [questionCount, setQuestionCount] = useState(settings.defaultQuestionCount);
  const [difficulty, setDifficulty] = useState(settings.defaultDifficulty);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Shared state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [showPreview, setShowPreview] = useState(false);

  // Manual mode - editing state
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(createEmptyQuestion());

  const getContent = () => {
    switch (activeTab) {
      case 'topic': return topic;
      case 'text': return text;
      case 'url': return url;
    }
  };

  const isAIValid = () => {
    const content = getContent();
    return content.trim().length > 0 && isApiKeySet;
  };

  const handleGenerate = async () => {
    if (!isAIValid()) return;

    setIsGenerating(true);
    setError('');

    try {
      const generatedQuestions = await generateQuestions({
        apiKey: settings.openaiApiKey,
        source: activeTab,
        content: getContent(),
        questionCount,
        difficulty,
      });

      setQuestions(prev => [...prev, ...generatedQuestions]);
      if (!examTitle) {
        setExamTitle(activeTab === 'topic' ? topic : 'Custom Exam');
      }
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
      description: examDescription || `Custom exam with ${questions.length} questions`,
      timeLimit: Math.ceil(questions.length * 1.5),
      passingScore,
      questions,
    };

    const savedExams = JSON.parse(localStorage.getItem('custom-exams') || '[]');
    savedExams.push(newExam);
    localStorage.setItem('custom-exams', JSON.stringify(savedExams));

    navigate('/');
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setCurrentQuestion(createEmptyQuestion());
    }
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: string) => {
    setQuestions(prev =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleUpdateAnswer = (questionIndex: number, answerIndex: number, text: string) => {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const newAnswers = [...q.answers];
        newAnswers[answerIndex] = { ...newAnswers[answerIndex], text };
        return { ...q, answers: newAnswers };
      })
    );
  };

  // Manual mode handlers
  const handleAddQuestion = () => {
    if (!currentQuestion.text.trim()) return;

    if (editingQuestionIndex !== null) {
      setQuestions(prev =>
        prev.map((q, i) => (i === editingQuestionIndex ? currentQuestion : q))
      );
      setEditingQuestionIndex(null);
    } else {
      setQuestions(prev => [...prev, { ...currentQuestion, id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]);
    }
    setCurrentQuestion(createEmptyQuestion());
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingQuestionIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingQuestionIndex(null);
    setCurrentQuestion(createEmptyQuestion());
  };

  const updateCurrentAnswer = (answerIndex: number, text: string) => {
    setCurrentQuestion(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[answerIndex] = { ...newAnswers[answerIndex], text };
      return { ...prev, answers: newAnswers };
    });
  };

  // Preview/Edit mode for both AI and Manual
  if (showPreview || (creationMode === 'manual' && questions.length > 0)) {
    return (
      <div className="create-exam">
        <header className="create-exam__header">
          <button className="back-btn" onClick={() => {
            if (creationMode === 'ai') {
              setShowPreview(false);
            } else {
              navigate('/');
            }
          }}>
            ← {creationMode === 'ai' ? 'Back to Generator' : 'Back to Home'}
          </button>
          <h1>{creationMode === 'ai' ? 'Preview & Edit Questions' : 'Create Exam Manually'}</h1>
        </header>

        <div className="preview-section">
          <div className="exam-details">
            <div className="form-group">
              <label htmlFor="examTitle">Exam Title *</label>
              <input
                id="examTitle"
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Enter exam title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="examDescription">Description</label>
              <textarea
                id="examDescription"
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                placeholder="Enter exam description (optional)"
                rows={2}
              />
            </div>
            <div className="form-group">
              <label htmlFor="passingScore">Passing Score (%)</label>
              <input
                id="passingScore"
                type="number"
                min={1}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Manual question form */}
          {creationMode === 'manual' && (
            <div className="add-question-form">
              <h3>{editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}</h3>

              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Category (optional)</label>
                <input
                  type="text"
                  value={currentQuestion.category || ''}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Security, Networking, etc."
                />
              </div>

              <div className="form-group">
                <label>Answer Options</label>
                <div className="answers-grid">
                  {currentQuestion.answers.map((answer, idx) => (
                    <div key={answer.id} className="answer-input">
                      <span className={`answer-letter ${answer.id === currentQuestion.correctAnswerId ? 'correct' : ''}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <input
                        type="text"
                        value={answer.text}
                        onChange={(e) => updateCurrentAnswer(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      />
                      <button
                        type="button"
                        className={`correct-btn ${answer.id === currentQuestion.correctAnswerId ? 'active' : ''}`}
                        onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswerId: answer.id }))}
                        title="Set as correct answer"
                      >
                        ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Explanation (optional)</label>
                <textarea
                  value={currentQuestion.explanation || ''}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why the correct answer is right..."
                  rows={2}
                />
              </div>

              <div className="add-question-actions">
                {editingQuestionIndex !== null && (
                  <button className="btn btn--secondary" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
                <button
                  className="btn btn--add"
                  onClick={handleAddQuestion}
                  disabled={!currentQuestion.text.trim() || currentQuestion.answers.some(a => !a.text.trim())}
                >
                  {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </div>
          )}

          {questions.length > 0 && (
            <>
              <h3 className="questions-header">
                Questions ({questions.length})
              </h3>
              <div className="questions-list">
                {questions.map((question, index) => (
                  <div key={question.id} className="preview-question">
                    <div className="preview-question__header">
                      <span className="question-number">Question {index + 1}</span>
                      <div className="question-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditQuestion(index)}
                        >
                          Edit
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          Remove
                        </button>
                      </div>
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
                            onChange={(e) => handleUpdateAnswer(index, ansIndex, e.target.value)}
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
            </>
          )}

          <div className="preview-actions">
            {creationMode === 'ai' && (
              <button className="btn btn--secondary" onClick={() => setShowPreview(false)}>
                Generate More
              </button>
            )}
            <button
              className="btn btn--primary"
              onClick={handleSaveExam}
              disabled={questions.length === 0 || !examTitle.trim()}
            >
              Save Exam ({questions.length} questions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode selection and creation forms
  return (
    <div className="create-exam">
      <header className="create-exam__header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Create Exam</h1>
        <p>Create exam questions manually or generate them with AI</p>
      </header>

      <div className="mode-selector">
        <button
          className={`mode-btn ${creationMode === 'manual' ? 'mode-btn--active' : ''}`}
          onClick={() => setCreationMode('manual')}
        >
          <span className="mode-icon">✏️</span>
          <span className="mode-label">Manual</span>
          <span className="mode-hint">Create questions yourself</span>
        </button>
        <button
          className={`mode-btn ${creationMode === 'ai' ? 'mode-btn--active' : ''}`}
          onClick={() => setCreationMode('ai')}
        >
          <span className="mode-icon">🤖</span>
          <span className="mode-label">AI Generated</span>
          <span className="mode-hint">Generate with OpenAI</span>
        </button>
      </div>

      {creationMode === 'manual' && (
        <div className="generator-card">
          <div className="manual-start">
            <h3>Create Your Exam</h3>
            <p>Start by adding your exam details, then add questions one by one.</p>

            <div className="form-group">
              <label htmlFor="manualTitle">Exam Title *</label>
              <input
                id="manualTitle"
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="Enter exam title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="manualDescription">Description</label>
              <textarea
                id="manualDescription"
                value={examDescription}
                onChange={(e) => setExamDescription(e.target.value)}
                placeholder="Enter exam description (optional)"
                rows={2}
              />
            </div>

            <button
              className="btn btn--generate"
              onClick={() => setQuestions([createEmptyQuestion()])}
              disabled={!examTitle.trim()}
            >
              Start Adding Questions
            </button>
          </div>
        </div>
      )}

      {creationMode === 'ai' && (
        <div className="generator-card">
          {!isApiKeySet ? (
            <div className="no-api-key-inline">
              <p>You need to configure your OpenAI API key to use AI exam generation.</p>
              <button className="btn btn--primary" onClick={() => navigate('/admin')}>
                Go to Settings
              </button>
            </div>
          ) : (
            <>
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
                    <p className="help-text">AI will analyze the page and generate questions</p>
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
                  disabled={!isAIValid() || isGenerating}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
