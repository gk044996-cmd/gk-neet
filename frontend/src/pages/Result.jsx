import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          ignoreElements: (node) => node.nodeName === 'STYLE' || node.nodeName === 'LINK'
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF Downloaded successfully!');
    } catch (err) {
      console.error('PDF Generation Failed:', err);
      toast.error('Failed to generate PDF. Please try again.');
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
      {/* Hidden container specifically for PDF to avoid OKLCH color crashes with html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={reportRef} style={{ width: '800px', padding: '40px', backgroundColor: '#ffffff', color: '#333333', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px' }}>GK NEET MOCK - {test.title}</h1>
          <p style={{ margin: '0 0 10px 0' }}><strong>Student:</strong> {currentUser?.name} ({currentUser?.email})</p>
          <p style={{ margin: '0 0 20px 0' }}><strong>Score:</strong> {data.totalScore} / {data.maxScore}</p>
          {/* Detailed Questions Section */}
          <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px' }}>Questions with Correct Answers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {test.questions.map((q, idx) => {
              let correctOptLetter = ['A','B','C','D'][q.correctAnswerIndex];
              if (!correctOptLetter && q.correctAnswer) correctOptLetter = String(q.correctAnswer).trim();

              return (
                <div key={`det-${q._id}`} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', pageBreakInside: 'avoid' }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Q{idx + 1}. {q.text}</p>
                  {q.imageUrl && <img src={q.imageUrl} alt="Question" style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }} />}
                  <div style={{ paddingLeft: '15px', marginBottom: '10px' }}>
                    {(() => {
                      const studentAnswer = result.selectedAnswers?.find(sa => {
                        const saId = typeof sa.questionId === 'object' ? sa.questionId._id : sa.questionId;
                        const qId = typeof q === 'object' ? q._id : q;
                        return saId === qId;
                      });
                      const isUnattempted = studentAnswer?.selectedOption === null || studentAnswer?.selectedOption === undefined || studentAnswer?.selectedOption === -1;
                      const isCorrect = studentAnswer?.isCorrect;
                      const selectedOption = studentAnswer?.selectedOption;
                      
                      let correctIndex = q.correctAnswerIndex;
                      if (correctIndex === undefined || correctIndex === null) {
                        const correctStr = String(q.correctAnswer).trim().toLowerCase();
                        correctIndex = q.options.findIndex(o => String(o).trim().toLowerCase() === correctStr || String(q.options.indexOf(o)) === correctStr);
                      }

                      return (
                        <>
                          {q.options?.map((opt, oIdx) => {
                            const isThisCorrect = oIdx === correctIndex;
                            const isThisSelected = oIdx === selectedOption;
                            
                            let optionBg = 'transparent';
                            let optionColor = '#333333';
                            let optionWeight = 'normal';
                            
                            if (isThisCorrect) {
                              optionBg = '#d1fae5';
                              optionColor = '#065f46';
                              optionWeight = 'bold';
                            } else if (isThisSelected && !isCorrect) {
                              optionBg = '#fee2e2';
                              optionColor = '#991b1b';
                              optionWeight = 'bold';
                            }

                            return (
                              <div key={oIdx} style={{ padding: '8px 12px', margin: '6px 0', borderRadius: '6px', backgroundColor: optionBg, color: optionColor, fontWeight: optionWeight, fontSize: '14px', border: isThisSelected ? `2px solid ${isCorrect ? '#10b981' : '#ef4444'}` : '2px solid transparent' }}>
                                {['A','B','C','D'][oIdx]}. {opt} {isThisCorrect ? ' ✓' : ''} {isThisSelected && !isCorrect ? ' ✗' : ''}
                              </div>
                            )
                          })}
                          
                          <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            {isUnattempted ? (
                              <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>⚪ Status: Not Attempted</p>
                            ) : isCorrect ? (
                              <p style={{ margin: 0, color: '#059669', fontSize: '14px', fontWeight: 'bold' }}>✅ Your Answer: Correct</p>
                            ) : (
                              <>
                                <p style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px', fontWeight: 'bold' }}>❌ Your Answer: Incorrect</p>
                                <p style={{ margin: 0, color: '#059669', fontSize: '14px', fontWeight: 'bold' }}>💡 Correct Answer: {['A','B','C','D'][correctIndex]} - {q.options[correctIndex]}</p>
                              </>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {q.explanation && (
                    <div style={{ padding: '10px', backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', marginTop: '10px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a' }}><strong>Explanation:</strong> {q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <h2 style={{ fontSize: '18px', marginTop: '40px', marginBottom: '15px' }}>Quick Answer Key</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {test.questions.map((q, idx) => {
              const studentAnswer = result.selectedAnswers?.find(sa => {
                const saId = typeof sa.questionId === 'object' ? sa.questionId._id : sa.questionId;
                const qId = typeof q === 'object' ? q._id : q;
                return saId === qId;
              });
              const isCorrect = studentAnswer?.isCorrect;
              const isUnattempted = studentAnswer?.selectedOption === null || studentAnswer?.selectedOption === undefined || studentAnswer?.selectedOption === -1;
              let correctIndex = q.correctAnswerIndex;
              if (correctIndex === undefined || correctIndex === null) {
                const correctStr = String(q.correctAnswer).trim().toLowerCase();
                correctIndex = q.options.findIndex(o => String(o).trim().toLowerCase() === correctStr || String(q.options.indexOf(o)) === correctStr);
              }
              const correctOptLetter = ['A','B','C','D'][correctIndex] || '-';
              const studentOptLetter = isUnattempted ? '-' : ['A','B','C','D'][studentAnswer?.selectedOption];
              
              let bgColor = '#f8f9fa';
              let borderColor = '#e2e8f0';
              let textColor = '#333333';
              
              if (isCorrect) { bgColor = '#ecfdf5'; borderColor = '#a7f3d0'; textColor = '#065f46'; } 
              else if (!isUnattempted) { bgColor = '#fef2f2'; borderColor = '#fecaca'; textColor = '#991b1b'; }
              
              return (
                <div key={q._id} style={{ width: '150px', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '8px', backgroundColor: bgColor, color: textColor, fontSize: '13px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: 'bold', borderBottom: `1px solid ${borderColor}`, paddingBottom: '4px' }}>
                    <span>Q{idx + 1}</span>
                    {isUnattempted ? <span style={{ color: '#64748b' }}>Not Attempted</span> : isCorrect ? <span style={{ color: '#059669' }}>Correct</span> : <span style={{ color: '#dc2626' }}>Wrong</span>}
                  </div>
                  {!isUnattempted && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ opacity: 0.8 }}>Your Ans:</span>
                      <strong style={{ color: isCorrect ? '#059669' : '#dc2626' }}>{studentOptLetter}</strong>
                    </div>
                  )}
                  {(!isCorrect || isUnattempted) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ opacity: 0.8 }}>Correct:</span>
                      <strong style={{ color: '#059669' }}>{correctOptLetter}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Performance Analysis</h1>
        <p className="text-slate-500 text-lg">Detailed review of your mock test attempt.</p>
        
        {result?.submissionType === 'auto' && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-xl inline-flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="font-bold">Test auto submitted because exam time ended.</span>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl mb-8 border border-slate-200 shadow-sm relative overflow-visible h-auto min-h-min z-10 break-words" id="pdf-content">
        {/* PDF Header - Visible mostly in PDF or explicitly styled */}
        <div className="border-b-2 border-indigo-100 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">GK NEET MOCK</h1>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{test.title}</h2>
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
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Subject Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(result.subjectWiseMarks).map(([subject, marks]) => (
                <div key={subject} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                  <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{marks}</div>
                  <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{subject}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer Key Section (For PDF Download) */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Answer Key</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {test.questions.map((q, idx) => {
              const studentAnswer = result.selectedAnswers?.find(sa => {
                const saId = typeof sa.questionId === 'object' ? sa.questionId._id : sa.questionId;
                const qId = typeof q === 'object' ? q._id : q;
                return saId === qId;
              });
              
              const isCorrect = studentAnswer?.isCorrect;
              const isUnattempted = studentAnswer?.selectedOption === null || studentAnswer?.selectedOption === undefined || studentAnswer?.selectedOption === -1;
              let correctIndex = q.correctAnswerIndex;
              if (correctIndex === undefined || correctIndex === null) {
                const correctStr = String(q.correctAnswer).trim().toLowerCase();
                correctIndex = q.options.findIndex(o => String(o).trim().toLowerCase() === correctStr || String(q.options.indexOf(o)) === correctStr);
              }
              const correctOptLetter = ['A','B','C','D'][correctIndex] || '-';
              const studentOptLetter = isUnattempted ? '-' : ['A','B','C','D'][studentAnswer?.selectedOption];
              
              let bgClass = "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
              if (isCorrect) bgClass = "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300";
              else if (!isUnattempted) bgClass = "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
              
              return (
                <div key={q._id} className={`p-4 rounded-xl border shadow-sm ${bgClass} flex flex-col transition-all hover:shadow-md`}>
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200 dark:border-slate-700/50">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-base">Q{idx + 1}.</span>
                    {isUnattempted ? (
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">Not Attempted</span>
                    ) : isCorrect ? (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400 px-2.5 py-1 rounded-md">Correct</span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-400 px-2.5 py-1 rounded-md">Incorrect</span>
                    )}
                  </div>
                  <div className="text-sm font-semibold space-y-1.5">
                    {!isUnattempted && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Your Ans:</span>
                        <span className={`text-base font-black px-2 py-0.5 rounded-md ${isCorrect ? 'text-emerald-700 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-red-700 bg-red-100/50 dark:text-red-400 dark:bg-red-900/30'}`}>{studentOptLetter}</span>
                      </div>
                    )}
                    {(!isCorrect || isUnattempted) && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Correct:</span>
                        <span className="text-base font-black px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/30">{correctOptLetter}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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