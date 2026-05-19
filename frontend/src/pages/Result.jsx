import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, MinusCircle, Target, Award, Download, ArrowLeft } from 'lucide-react';

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
      const res = await fetch(`${API_URL}/api/tests/result/${id}`, {
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
      }, 1000); 
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
      <p className="text-slate-500 dark:text-slate-400 font-bold text-lg animate-pulse">Analyzing your performance...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center px-4">
      <XCircle className="w-20 h-20 text-red-500 mb-6" />
      <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">Analysis Failed</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">{error}</p>
      <div className="flex gap-4">
        <button onClick={fetchResultData} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1">Retry</button>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all hover:-translate-y-1">Go to Dashboard</button>
      </div>
    </div>
  );

  if (!result || !test) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">Result not found</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">The requested result data could not be found or has been deleted.</p>
      <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1">Return Home</button>
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

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] py-12 selection:bg-indigo-500/30 relative">
      <div className="fixed top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-500/5 pointer-events-none z-0"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* PDF HIDDEN CONTENT */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={reportRef} style={{ width: '800px', padding: '40px', backgroundColor: '#ffffff', color: '#333333', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '20px' }}>GK NEET MOCK - {test.title}</h1>
            <p style={{ margin: '0 0 10px 0' }}><strong>Student:</strong> {currentUser?.name} ({currentUser?.email})</p>
            <p style={{ margin: '0 0 20px 0' }}><strong>Score:</strong> {data.totalScore} / {data.maxScore}</p>
            <h2 style={{ fontSize: '18px', marginTop: '30px', marginBottom: '15px' }}>Detailed Answer Key</h2>
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
                              let optionBg = 'transparent', optionColor = '#333333', optionWeight = 'normal';
                              if (isThisCorrect) { optionBg = '#d1fae5'; optionColor = '#065f46'; optionWeight = 'bold'; }
                              else if (isThisSelected && !isCorrect) { optionBg = '#fee2e2'; optionColor = '#991b1b'; optionWeight = 'bold'; }
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

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <button onClick={() => navigate('/results')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all w-full sm:w-auto justify-center">
            <ArrowLeft size={18} /> Back to Results
          </button>
          
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 w-full sm:w-auto justify-center">
            <Download size={18} /> Download Report
          </button>
        </div>

        <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6">
          
          {result?.submissionType === 'auto' && (
            <motion.div variants={itemVars} className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 p-6 rounded-[2rem] shadow-sm flex items-start gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 p-2 rounded-xl shrink-0"><AlertTriangle size={24}/></div>
              <div>
                <h3 className="font-bold text-amber-800 dark:text-amber-400 text-lg mb-1">Auto Submitted</h3>
                <p className="text-amber-700 dark:text-amber-300/80 font-medium">Your test was automatically submitted because the time ended or due to an anti-cheat violation.</p>
              </div>
            </motion.div>
          )}

          {/* Primary Score Card */}
          <motion.div variants={itemVars} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center text-center group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{test.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 relative z-10">Attempted on {new Date(result.attemptedAt).toLocaleString()}</p>
            
            <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-slate-50 dark:bg-slate-900/50 border-[8px] border-indigo-100 dark:border-indigo-900/50 flex flex-col items-center justify-center shadow-inner mb-10 mx-auto">
              <div className="absolute inset-0 rounded-full border-[8px] border-indigo-500 opacity-20 animate-spin-slow"></div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
              <span className="text-6xl sm:text-7xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{data.totalScore}</span>
              <span className="text-sm font-bold text-slate-500 mt-2 border-t border-slate-200 dark:border-slate-700 pt-2 w-1/2 mx-auto">/ {data.maxScore}</span>
            </div>

            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-5 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{data.correct}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-500">Correct</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 p-5 rounded-2xl">
                <XCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{data.wrong}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-500">Incorrect</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50 p-5 rounded-2xl">
                <MinusCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-3xl font-black text-slate-600 dark:text-slate-300">{data.unattempted}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Skipped</div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-5 rounded-2xl">
                <Target className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{data.accuracy}%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-500">Accuracy</div>
              </div>
            </div>
          </motion.div>

          {/* Subject Performance */}
          {result.subjectWiseMarks && Object.keys(result.subjectWiseMarks).length > 0 && (
            <motion.div variants={itemVars} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-8 rounded-[2rem]">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <Award className="text-amber-500" /> Subject Analysis
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(result.subjectWiseMarks).map(([subject, marks], i) => (
                  <div key={subject} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl text-center group hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                    <div className="text-4xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{marks}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{subject}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Answer Key */}
          <motion.div variants={itemVars} className="mt-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Detailed Solutions</h2>
            <div className="space-y-6">
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

                let badgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600";
                let badgeText = "Not Attempted";
                
                if (isCorrect) {
                  badgeClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50";
                  badgeText = "Correct";
                } else if (!isUnattempted) {
                  badgeClass = "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50";
                  badgeText = "Incorrect";
                }

                return (
                  <div key={q._id} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex-1">
                        <span className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg text-sm mr-3 border border-indigo-200 dark:border-indigo-800/50">Q{idx + 1}</span> 
                        {q.text}
                      </h3>
                      <span className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>

                    {q.imageUrl && (
                      <div className="mb-6 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                        <img src={q.imageUrl} alt="Question" className="max-h-64 object-contain rounded-xl mx-auto" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {(q.options || []).map((opt, oIdx) => {
                        const isThisCorrect = oIdx === correctIndex;
                        const isThisSelected = oIdx === selectedOption;
                        
                        let optBg = "bg-slate-50 dark:bg-slate-900/50";
                        let optBorder = "border-slate-100 dark:border-slate-700/50";
                        let optText = "text-slate-700 dark:text-slate-300";
                        let icon = null;

                        if (isThisCorrect) {
                          optBg = "bg-emerald-50 dark:bg-emerald-900/20";
                          optBorder = "border-emerald-300 dark:border-emerald-700";
                          optText = "text-emerald-800 dark:text-emerald-300 font-bold";
                          icon = <span className="text-emerald-600 dark:text-emerald-400 ml-auto flex items-center gap-1 text-sm"><CheckCircle2 size={16}/> Correct Answer</span>;
                        } else if (isThisSelected && !isCorrect) {
                          optBg = "bg-rose-50 dark:bg-rose-900/20";
                          optBorder = "border-rose-300 dark:border-rose-700";
                          optText = "text-rose-800 dark:text-rose-300 font-bold";
                          icon = <span className="text-rose-600 dark:text-rose-400 ml-auto flex items-center gap-1 text-sm"><XCircle size={16}/> Your Answer</span>;
                        }

                        return (
                          <div key={oIdx} className={`p-4 rounded-xl border-2 flex items-center gap-4 ${optBg} ${optBorder} ${optText}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0 ${isThisCorrect ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200' : isThisSelected && !isCorrect ? 'bg-rose-200 text-rose-800 dark:bg-rose-800 dark:text-rose-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                              {['A', 'B', 'C', 'D'][oIdx]}
                            </div>
                            <span className="flex-1 break-words">{opt}</span>
                            {icon && <div className="shrink-0">{icon}</div>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-6 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Solution Explanation
                        </h4>
                        <p className="text-sm font-medium text-indigo-900/80 dark:text-indigo-200/80 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}