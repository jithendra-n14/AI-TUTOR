import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import axios from 'axios';
import './AITutor.css';

function AITutor() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('ask'); // 'ask' or 'quiz'

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');

    const finalPrompt =
      mode === 'quiz'
        ? `You are an AI quiz generator for high school students.

Generate 5 multiple-choice questions (MCQs) with 4 options each on the topic: "${prompt}". Also provide the correct answer and a short explanation for each.

Format:
Q1: ...
a) ...
b) ...
c) ...
d) ...
Answer: ...
Explanation: ...`
        : prompt;

    try {
      const res = await axios.post('http://localhost:5000/ask-groq', { prompt: finalPrompt });
      setResponse(res.data.reply);

if (mode === 'quiz') {
  const stored = JSON.parse(localStorage.getItem('quizProgress')) || [];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const existing = stored.find(
    (item) => item.topic.toLowerCase() === prompt.toLowerCase()
  );

  if (existing) {
    existing.count += 1;
    existing.dates.push(today);
  } else {
    stored.push({ topic: prompt, count: 1, dates: [today] });
  }

  localStorage.setItem('quizProgress', JSON.stringify(stored));
}
    } catch (err) {
      setResponse("⚠️ Error: Could not get response. Check backend or internet.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutor-container">
      <h1>AI Learning Assistant</h1>

      {/* Toggle Mode */}
      <div className="toggle-buttons">
        <button
          className={mode === 'ask' ? 'active' : ''}
          onClick={() => setMode('ask')}
        >
          📘 Ask AI Tutor
        </button>
        <button
          className={mode === 'quiz' ? 'active' : ''}
          onClick={() => setMode('quiz')}
        >
          📝 Generate Quiz
        </button>
      </div>

      <textarea
        placeholder={
          mode === 'ask'
            ? 'Ask a question like "Explain gravity"'
            : 'Enter a topic like "Photosynthesis"'
        }
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button onClick={handleAsk}>
        {mode === 'quiz' ? 'Generate Quiz' : 'Ask'}
      </button>

      {loading && (
        <div className="response-box">
          <em>⏳ Thinking...</em>
        </div>
      )}

{!loading && response && (
  <div className="response-box">
    <strong>{mode === 'quiz' ? '🧪 Quiz Generated:' : '👨‍🏫 AI Tutor Says:'}</strong>

    {mode === 'quiz' ? (
      <div className="quiz">
        {response
          .split(/Q\d+:/g)                   
          .slice(1)                          
          .map((item, idx) => (
            <div className="question-block" key={idx}>
              <p><strong>Q{idx + 1}:</strong> {item.trim()}</p>
            </div>
          ))}
      </div>
    ) : (
        <ReactMarkdown>{response}</ReactMarkdown>
    )}
  </div>
)}

    </div>
  );
}

export default AITutor;
