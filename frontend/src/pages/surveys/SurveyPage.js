import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { surveysAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiTrash2, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SurveyPage = () => {
  const { eventId, id } = useParams();
  const activeEventId = eventId || id;
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [resultsData, setResultsData] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', questions: [{ text: '', type: 'text', options: [] }] });

  useEffect(() => { fetchSurveys(); }, [eventId]);

  const fetchSurveys = async () => {
    if (!activeEventId) {
      setSurveys([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await surveysAPI.getSurveys(activeEventId);
      setSurveys(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const addQuestion = () => {
    setFormData({ ...formData, questions: [...formData.questions, { text: '', type: 'text', options: [] }] });
  };

  const removeQuestion = (index) => {
    setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) });
  };

  const updateQuestion = (index, key, value) => {
    const updated = [...formData.questions];
    updated[index] = { ...updated[index], [key]: value };
    if (key === 'type' && value !== 'text' && updated[index].options.length === 0) {
      updated[index].options = ['Option 1', 'Option 2'];
    }
    setFormData({ ...formData, questions: updated });
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    try {
      await surveysAPI.createSurvey(activeEventId, formData);
      toast.success('Survey created!');
      setShowCreate(false);
      setFormData({ title: '', description: '', questions: [{ text: '', type: 'text', options: [] }] });
      fetchSurveys();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create survey'); }
  };

  const handleDeleteSurvey = async (id) => {
    if (!window.confirm('Delete this survey?')) return;
    try {
      await surveysAPI.deleteSurvey(id);
      toast.success('Survey deleted');
      fetchSurveys();
    } catch (err) { toast.error('Failed to delete'); }
  };

  const handleFillSurvey = (survey) => {
    setActiveSurvey(survey);
    setAnswers(survey.questions.map(() => ({ answer: '', selectedOptions: [] })));
  };

  const handleSubmitResponse = async () => {
    try {
      await surveysAPI.submitResponse(activeSurvey._id, {
        answers: answers.map((a, i) => ({ questionIndex: i, answer: a.answer, selectedOptions: a.selectedOptions }))
      });
      toast.success('Response submitted!');
      setActiveSurvey(null);
      fetchSurveys();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
  };

  const handleViewResults = async (surveyId) => {
    try {
      const res = await surveysAPI.getResults(surveyId);
      setResultsData(res.data.data || res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load results');
    }
  };

  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin';

  if (loading) return <LoadingSpinner text="Loading surveys..." />;

  // Results view
  if (resultsData) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>📊 Survey Results</h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>Total responses: {resultsData.totalResponses || 0}</p>
        {resultsData.questions?.map((q, qi) => (
          <div key={qi} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>{qi + 1}. {q.text}</p>
            {q.answers && q.answers.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.3rem' }}>
                {q.answers.map((a, ai) => (
                  <div key={ai} style={{ fontSize: '0.85rem', color: '#475569', padding: '0.3rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    {a.answer || a.selectedOptions?.join(', ') || 'No answer'}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No responses yet</p>
            )}
          </div>
        ))}
        <button onClick={() => setResultsData(null)} style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Back to Surveys</button>
      </div>
    );
  }

  // Fill survey view
  if (activeSurvey) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{activeSurvey.title}</h2>
        {activeSurvey.description && <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{activeSurvey.description}</p>}
        {activeSurvey.questions.map((q, qi) => (
          <div key={qi} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>{qi + 1}. {q.text}</p>
            {q.type === 'text' && (
              <textarea value={answers[qi]?.answer || ''} onChange={(e) => { const a = [...answers]; a[qi] = { ...a[qi], answer: e.target.value }; setAnswers(a); }} placeholder="Your answer..." rows={2} style={{ width: '100%', padding: '0.65rem', border: '2px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }} />
            )}
            {q.type === 'radio' && q.options.map((opt, oi) => (
              <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name={`q-${qi}`} checked={answers[qi]?.answer === opt} onChange={() => { const a = [...answers]; a[qi] = { ...a[qi], answer: opt }; setAnswers(a); }} />
                {opt}
              </label>
            ))}
            {q.type === 'checkbox' && q.options.map((opt, oi) => (
              <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={answers[qi]?.selectedOptions?.includes(opt)} onChange={(e) => {
                  const a = [...answers];
                  const opts = a[qi].selectedOptions || [];
                  a[qi] = { ...a[qi], selectedOptions: e.target.checked ? [...opts, opt] : opts.filter((o) => o !== opt) };
                  setAnswers(a);
                }} />
                {opt}
              </label>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSubmitResponse} style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Submit Response</button>
          <button onClick={() => setActiveSurvey(null)} style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: '2px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>📋 Surveys</h1>
        {isOrganizer && (
          <button onClick={() => setShowCreate(!showCreate)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
            <FiPlus /> Create Survey
          </button>
        )}
      </div>

      {/* Create Survey Form */}
      {showCreate && (
        <form onSubmit={handleCreateSurvey} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Survey Title *" required style={{ width: '100%', padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.95rem' }} />
          <input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" style={{ width: '100%', padding: '0.65rem 1rem', border: '2px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }} />
          <h4 style={{ color: '#475569', marginBottom: '0.75rem' }}>Questions</h4>
          {formData.questions.map((q, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input value={q.text} onChange={(e) => updateQuestion(i, 'text', e.target.value)} placeholder={`Question ${i + 1}`} required style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} />
                <select value={q.type} onChange={(e) => updateQuestion(i, 'type', e.target.value)} style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <option value="text">Text</option>
                  <option value="radio">Single Choice</option>
                  <option value="checkbox">Multiple Choice</option>
                </select>
                {formData.questions.length > 1 && <button type="button" onClick={() => removeQuestion(i)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>}
              </div>
              {q.type !== 'text' && (
                <div style={{ marginLeft: '1rem' }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <input value={opt} onChange={(e) => { const opts = [...q.options]; opts[oi] = e.target.value; updateQuestion(i, 'options', opts); }} style={{ flex: 1, padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.85rem' }} />
                      <button type="button" onClick={() => updateQuestion(i, 'options', q.options.filter((_, j) => j !== oi))} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => updateQuestion(i, 'options', [...q.options, `Option ${q.options.length + 1}`])} style={{ fontSize: '0.8rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }}>+ Add Option</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={addQuestion} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#6366f1', background: 'none', border: '1px dashed #c7d2fe', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '1rem' }}>
            <FiPlus /> Add Question
          </button>
          <button type="submit" style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Create Survey</button>
        </form>
      )}

      {/* Survey List */}
      {surveys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px' }}>
          <p>No surveys available for this event.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {surveys.map((survey) => (
            <div key={survey._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>{survey.title}</h3>
                  {survey.description && <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>{survey.description}</p>}
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                    {survey.questions?.length || 0} questions · {survey.responseCount || survey.responses?.length || 0} responses
                    {!survey.isActive && ' · Closed'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {survey.isActive && (
                    <button onClick={() => handleFillSurvey(survey)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                      <FiCheckCircle style={{ marginRight: '0.2rem' }} /> Fill Survey
                    </button>
                  )}
                  {isOrganizer && (
                    <>
                      <button onClick={() => handleViewResults(survey._id)} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#475569' }}>
                        <FiBarChart2 style={{ marginRight: '0.2rem' }} /> Results
                      </button>
                      <button onClick={() => handleDeleteSurvey(survey._id)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#ef4444' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyPage;
