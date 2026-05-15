import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  
  const [result, setResult] = useState(location.state?.result || null);
  const [test, setTest] = useState(location.state?.test || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState(null);
  
  const reportRef = useRef();
  const autoDownloadTriggered = useRef(false);

  useEffect(() => {
    if (!result || !test) {
      fetchResultData();
    }
  }, [id]);

  const fetchResultData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/tests/result/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch result details.');
      }
      const data = await res.json();
      setResult(data);
      setTest(data.testId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && result && test && searchParams.get('download') === 'true' && !autoDownloadTriggered.current) {
      autoDownloadTriggered.current = true;
      setTimeout(() => {
        handleDownloadPDF();
      }, 1000); // Small delay to ensure images/fonts load
    }
  }, [loading, result, test, searchParams]);

  const handleDownloadPDF = async () => {
    try {
      const element = reportRef.current;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `GK_NEET_RESULT_${test.title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF Generation Failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xl text-red-600">{error}</div>;
  if (!result || !test) return <div className="flex justify-center items-center h-screen text-xl">Result not found.</div>;

  const data = {
    totalScore: result.score,
    maxScore: test.totalMarks,
    correct: result.correctCount || 0,
    wrong: result.wrongCount || 0,
    unattempted: result.unattemptedCount || 0,
    accuracy: result.accuracy ? result.accuracy.toFixed(1) : 0,
    rank: 'N/A'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Performance Analysis</h1>
        <p className="text-slate-500 text-lg">Detailed review of your mock test attempt.</p>
      </div>

      <div ref={reportRef} className="bg-white p-8 rounded-3xl mb-8 border border-slate-200 shadow-sm relative overflow-hidden" id="pdf-content">
        {/* PDF Header - Visible mostly in PDF or explicitly styled */}
        <div className="border-b-2 border-indigo-100 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">GK NEET MOCK</h1>
              <h2 className="text-xl font-bold text-slate-800">{test.title}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-600">{currentUser?.name}</p>
              <p className="text-sm text-slate-500">{currentUser?.email}</p>
              <p className="text-xs text-slate-400 mt-1">Attempted on: {new Date(result.attemptedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Total Score</h2>
            <div className="text-6xl font-black text-indigo-600 mb-2">
              {data.totalScore} <span className="text-2xl text-slate-400 font-medium">/ {data.maxScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{data.correct}</div>
              <div className="text-sm text-emerald-800 uppercase tracking-wider font-semibold">Correct</div>
            </div>
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{data.wrong}</div>
              <div className="text-sm text-red-800 uppercase tracking-wider font-semibold">Incorrect</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{data.accuracy}%</div>
              <div className="text-sm text-indigo-800 uppercase tracking-wider font-semibold">Accuracy</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-slate-600 mb-1">{data.unattempted}</div>
              <div className="text-sm text-slate-700 uppercase tracking-wider font-semibold">Unattempted</div>
            </div>
          </div>
        </div>

        {/* Subject-wise Performance */}
        {result.subjectWiseMarks && Object.keys(result.subjectWiseMarks).length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Subject Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(result.subjectWiseMarks).map(([subject, marks]) => (
                <div key={subject} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-slate-800 mb-1">{marks}</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{subject}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer Key Section (For PDF Download) */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Question Review</h2>
          <div className="space-y-6">
            {test.questions.map((q, idx) => {
              // Extract question id from populated selectedAnswers or from plain ID
              const studentAnswer = result.selectedAnswers?.find(sa => {
                const saId = typeof sa.questionId === 'object' ? sa.questionId._id : sa.questionId;
                const qId = typeof q === 'object' ? q._id : q;
                return saId === qId;
              });
              
              const isCorrect = studentAnswer?.isCorrect;
              const isUnattempted = studentAnswer?.selectedOption === null || studentAnswer?.selectedOption === undefined || studentAnswer?.selectedOption === -1;
              
              return (
              <div key={q._id} className={`p-5 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200' : isUnattempted ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <p className="font-semibold text-slate-800 flex-1">
                    <span className="text-slate-500 mr-2">Q{idx + 1}.</span> 
                    {q.text}
                  </p>
                  <div className="ml-4 flex-shrink-0">
                    {isCorrect && <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded">✅ Correct</span>}
                    {!isCorrect && !isUnattempted && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">❌ Wrong</span>}
                    {isUnattempted && <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded">⚪ Skipped</span>}
                  </div>
                </div>
                
                {q.imageUrl && <img src={q.imageUrl} alt="Question" className="max-h-48 mb-4 rounded border border-slate-300" />}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {q.options.map((opt, i) => {
                    const isStudentChoice = studentAnswer?.selectedOption === i;
                    const isActualCorrect = i === q.correctAnswerIndex;
                    
                    let bgClass = "bg-white border-slate-200";
                    if (isActualCorrect) bgClass = "bg-emerald-100 border-emerald-300 font-medium text-emerald-900";
                    else if (isStudentChoice && !isActualCorrect) bgClass = "bg-red-100 border-red-300 font-medium text-red-900";

                    return (
                      <div key={i} className={`p-3 border rounded-lg text-sm flex items-center ${bgClass}`}>
                        <span className="w-6 h-6 flex items-center justify-center bg-white border border-slate-300 rounded-full mr-3 text-xs font-bold">{['A','B','C','D'][i]}</span>
                        <span className="flex-1">{opt}</span>
                        {isStudentChoice && <span className="text-xs font-bold uppercase ml-2 bg-slate-800 text-white px-2 py-0.5 rounded">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-sm bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-slate-800">
                    <strong>Correct Answer:</strong> {q.options[q.correctAnswerIndex]}
                  </p>
                  {q.explanation && (
                    <p className="mt-2 text-slate-600 pt-2 border-t border-slate-100">
                      <strong className="text-indigo-600">Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 sticky bottom-4 z-10">
        <button onClick={() => navigate('/results')} className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-900/20">
          Back to History
        </button>
        <button onClick={handleDownloadPDF} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download PDF Report
        </button>
      </div>
    </div>
  );
}