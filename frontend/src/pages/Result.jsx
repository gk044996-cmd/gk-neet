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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading your detailed result...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center px-4">
      <div className="text-red-500 mb-4"><svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Failed to load result</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
      <div className="flex gap-4">
        <button onClick={fetchResultData} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Retry</button>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-xl hover:bg-slate-300">Go Back</button>
      </div>
    </div>
  );

  if (!result || !test) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Result not found</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">The requested result data could not be found or has been deleted.</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Go to Dashboard</button>
    </div>
  );

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
                      const selectedOption = studentAnswer?.selectedOption;
                      const isUnattempted = selectedOption === null || selectedOption === undefined || selectedOption === -1;
                      
                      let correctIndex = q.correctAnswerIndex;
                      if (correctIndex === undefined || correctIndex === null) {
                        const correctStr = String(q.correctAnswer || '').trim().toLowerCase();
                        if (['a','1'].includes(correctStr)) correctIndex = 0;
                        else if (['b','2'].includes(correctStr)) correctIndex = 1;
                        else if (['c','3'].includes(correctStr)) correctIndex = 2;
                        else if (['d','4'].includes(correctStr)) correctIndex = 3;
                        else {
                          correctIndex = (q.options || []).findIndex(o => String(o).trim().toLowerCase() === correctStr || String((q.options || []).indexOf(o)) === correctStr);
                        }
                      }
                      const isCorrect = !isUnattempted && selectedOption === correctIndex;

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
                                <p style={{ margin: 0, color: '#059669', fontSize: '14px', fontWeight: 'bold' }}>💡 Correct Answer: {['A','B','C','D'][correctIndex]} - {q.options ? q.options[correctIndex] : q.correctAnswer}</p>
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

        {/* Detailed Answer Review Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Detailed Answer Review</h2>
          <div className="space-y-8">
            {test.questions.map((q, idx) => {
              const studentAnswer = result.selectedAnswers?.find(sa => {
                const saId = typeof sa.questionId === 'object' ? sa.questionId._id : sa.questionId;
                const qId = typeof q === 'object' ? q._id : q;
                return saId === qId;
              });
              
              const selectedOption = studentAnswer?.selectedOption;
              const isUnattempted = selectedOption === null || selectedOption === undefined || selectedOption === -1;

              let correctIndex = q.correctAnswerIndex;
              if (correctIndex === undefined || correctIndex === null) {
                const correctStr = String(q.correctAnswer || '').trim().toLowerCase();
                if (['a','1'].includes(correctStr)) correctIndex = 0;
                else if (['b','2'].includes(correctStr)) correctIndex = 1;
                else if (['c','3'].includes(correctStr)) correctIndex = 2;
                else if (['d','4'].includes(correctStr)) correctIndex = 3;
                else {
                  correctIndex = (q.options || []).findIndex(o => String(o).trim().toLowerCase() === correctStr || String((q.options || []).indexOf(o)) === correctStr);
                }
              }
              const isCorrect = !isUnattempted && selectedOption === correctIndex;

              let borderClass = "border-slate-200 dark:border-slate-700";
              let badgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
              let badgeText = "Not Attempted";
              
              if (isCorrect) {
                borderClass = "border-emerald-500 dark:border-emerald-500";
                badgeClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400";
                badgeText = "Correct Answer";
              } else if (!isUnattempted) {
                borderClass = "border-red-500 dark:border-red-500";
                badgeClass = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
                badgeText = "Incorrect Answer";
              }

              return (
                <div key={q._id} className={`p-6 rounded-2xl border-2 ${borderClass} bg-white dark:bg-slate-800 shadow-sm transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex-1 pr-4">
                      <span className="text-indigo-600 dark:text-indigo-400 mr-2">Q{idx + 1}.</span> 
                      {q.text}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>

                  {q.imageUrl && (
                    <div className="mb-6">
                      <img src={q.imageUrl} alt="Question" className="max-h-64 object-contain rounded-lg border border-slate-200 dark:border-slate-700" />
                    </div>
                  )}

                  <div className="space-y-3">
                    {(q.options || []).map((opt, oIdx) => {
                      const isThisCorrect = oIdx === correctIndex;
                      const isThisSelected = oIdx === selectedOption;
                      
                      let optBg = "bg-slate-50 dark:bg-slate-900/50";
                      let optBorder = "border-slate-200 dark:border-slate-700";
                      let optText = "text-slate-700 dark:text-slate-300";
                      let icon = null;

                      if (isThisCorrect) {
                        optBg = "bg-emerald-50 dark:bg-emerald-900/20";
                        optBorder = "border-emerald-400 dark:border-emerald-500";
                        optText = "text-emerald-800 dark:text-emerald-300 font-semibold";
                        icon = <span className="text-emerald-500 dark:text-emerald-400 ml-auto">✓ Correct</span>;
                      } else if (isThisSelected && !isCorrect) {
                        optBg = "bg-red-50 dark:bg-red-900/20";
                        optBorder = "border-red-400 dark:border-red-500";
                        optText = "text-red-800 dark:text-red-300 font-semibold";
                        icon = <span className="text-red-500 dark:text-red-400 ml-auto">✗ Your Ans</span>;
                      }

                      return (
                        <div key={oIdx} className={`p-4 rounded-xl border-2 flex items-center ${optBg} ${optBorder} ${optText} transition-all`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0 ${isThisCorrect ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200' : isThisSelected && !isCorrect ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </div>
                          <span className="flex-1 break-words">{opt}</span>
                          {icon && <div className="text-sm font-bold pl-2">{icon}</div>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Explanation
                      </h4>
                      <p className="text-sm text-blue-900 dark:text-blue-200">{q.explanation}</p>
                    </div>
                  )}
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