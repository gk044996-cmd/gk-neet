import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { AlertTriangle, Maximize, X, ChevronLeft, ChevronRight, CheckCircle2, Bookmark, Save, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../components/ErrorBoundary';

function MockTestContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState(() => parseInt(localStorage.getItem(`tab_violations_${id}`)) || 0);
  const [violationSubmit, setViolationSubmit] = useState(false);
  const debounceRef = useRef(false);
  const handleSubmitRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const isSubmittingIntentRef = useRef(false);
  const warningsShownRef = useRef({ 10: false, 5: false, 1: false });

  const timeLeftRef = useRef(timeLeft);
  const answersRef = useRef(answers);
  
  useEffect(() => {
    timeLeftRef.current = timeLeft;
    answersRef.current = answers;
  }, [timeLeft, answers]);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/tests/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.status === 403) {
          if (data.message === 'Premium subscription required') {
            toast.error('This test requires a Premium Subscription.');
            navigate('/premium');
          } else {
            alert(data.error || 'You have already completed this test.');
            navigate('/dashboard');
          }
          return;
        }
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch test');
        
        setTest(data);
        if (data.duration) setTimeLeft(data.duration * 60);
        const savedAnswers = localStorage.getItem(`test_answers_${id}`);
        if (savedAnswers) {
          try { setAnswers(JSON.parse(savedAnswers)); } catch(e){}
        }
      } catch (err) {
        console.error(err);
        alert('Could not load the test.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, navigate]);

  useEffect(() => {
    if (started) {
      localStorage.setItem(`test_answers_${id}`, JSON.stringify(answers));
    }
  }, [answers, started, id]);

  useEffect(() => {
    if (!started || violationSubmit) return;

    const handleViolation = () => {
      if (isSubmittingIntentRef.current) return;
      if (debounceRef.current) return;
      debounceRef.current = true;
      setTimeout(() => debounceRef.current = false, 2000);

      setWarnings(w => {
        const newW = w + 1;
        localStorage.setItem(`tab_violations_${id}`, newW.toString());
        
        if (newW === 1) {
          toast.error('Warning: Tab switching detected (1/3)', { duration: 4000 });
        } else if (newW === 2) {
          toast.error('Final Warning: One more switch will auto submit your test.', { duration: 4000, icon: '⚠️' });
        } else if (newW >= 3) {
          setViolationSubmit(true);
          if (handleSubmitRef.current) {
            handleSubmitRef.current(true, 'auto');
          }
        }
        return newW;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const handleBlur = () => {
      handleViolation();
    };

    const preventCopy = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', preventCopy);
    document.addEventListener('copy', preventCopy);

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Your test is still running. Leaving may auto submit your exam.';
      return 'Your test is still running. Leaving may auto submit your exam.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', preventCopy);
      document.removeEventListener('copy', preventCopy);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [started, violationSubmit, id]);

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 601 && !warningsShownRef.current[10]) {
          warningsShownRef.current[10] = true;
          setTimeout(() => toast('Only 10 minutes remaining!', { icon: '⏰' }), 0);
        }
        if (prev === 301 && !warningsShownRef.current[5]) {
          warningsShownRef.current[5] = true;
          setTimeout(() => toast.error('Only 5 minutes remaining!'), 0);
        }
        if (prev === 61 && !warningsShownRef.current[1]) {
          warningsShownRef.current[1] = true;
          setTimeout(() => toast.error('Final 1 minute remaining! Your test will auto submit.'), 0);
        }
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            const submitBtn = document.getElementById('submit-exam-btn');
            if (submitBtn) {
              submitBtn.dataset.type = 'auto';
              submitBtn.click();
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  const requestFullscreen = () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        const promise = elem.requestFullscreen();
        if (promise) promise.catch(err => console.warn(err));
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen API failed", e);
    }
    setIsFullscreen(true);
  };

  const startExam = () => {
    requestFullscreen();
    setStarted(true);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(async (forced = false, submissionType = 'manual') => {
    if (timeLeftRef.current <= 0) {
      submissionType = 'auto';
    }

    const finalAnswers = test?.questions?.map((q, i) => answersRef.current[i] !== undefined ? answersRef.current[i] : -1) || [];

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/tests/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: finalAnswers, timeTaken: (test.duration * 60) - timeLeftRef.current, submissionType })
      });
      const data = await res.json();
      
      try {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) await document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        }
      } catch (e) {
        console.warn(e);
      }
      
      localStorage.removeItem(`test_answers_${id}`);
      localStorage.removeItem(`tab_violations_${id}`);
      
      if (submissionType === 'auto' && !violationSubmit) {
        toast.error("Test auto submitted because exam time ended.");
      }
      
      navigate(`/results/${data.detailedResult._id}`, { state: { result: data.detailedResult, test: test } });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit test. Please try again.');
    }
  }, [test, id, navigate, violationSubmit]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const handleIntentSubmit = (e, forced) => {
    if (forced) {
      handleSubmit(true, 'auto');
    } else {
      isSubmittingIntentRef.current = true;
      setShowSubmitModal(true);
    }
  };

  const cancelSubmit = () => {
    setShowSubmitModal(false);
    setTimeout(() => {
      isSubmittingIntentRef.current = false;
    }, 200);
  };

  const confirmSubmit = () => {
    setShowSubmitModal(false);
    handleSubmit(true, 'manual');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!test) return <div className="flex justify-center items-center h-screen font-bold text-xl text-slate-500">Test not found</div>;
  
  if (violationSubmit) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-900 px-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-2xl border border-red-100 dark:border-red-900/30 flex flex-col items-center">
          <AlertTriangle className="w-20 h-20 text-red-500 mb-6 animate-pulse" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Anti-Cheat Triggered</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-8">Your test is being auto-submitted due to multiple tab switching violations. Please wait...</p>
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-500 border-t-transparent"></div>
        </motion.div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-4">
        <SEO title="Exam Instructions" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-8 md:p-12 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-widest uppercase mb-4 border border-indigo-100 dark:border-indigo-800/50">NTA Mock Test</span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">{test.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Please read all instructions carefully before beginning your exam.</p>
          </div>
          
          <div className="space-y-4 mb-10">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl shrink-0"><Clock size={24} /></div>
              <div>
                <strong className="block text-lg text-slate-900 dark:text-white mb-1">Duration</strong>
                <span className="text-slate-600 dark:text-slate-400 font-medium">The exam duration is strictly {test.duration} minutes. Timer cannot be paused.</span>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl shrink-0"><CheckCircle2 size={24} /></div>
              <div>
                <strong className="block text-lg text-slate-900 dark:text-white mb-1">Scoring Scheme</strong>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{test?.totalQuestions || test?.questions?.length || 0} questions in total. You get +4 marks for correct and -1 for wrong answers.</span>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 transition-colors hover:bg-red-100 dark:hover:bg-red-900/40">
              <div className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-xl shrink-0"><AlertTriangle size={24}/></div>
              <div>
                <strong className="block text-lg text-red-700 dark:text-red-400 mb-1">Anti-Cheat System Active</strong>
                <span className="text-red-600 dark:text-red-300 font-medium">Do not switch tabs or minimize the window. 3 warnings will lead to automatic submission.</span>
              </div>
            </div>
          </div>
          
          <button onClick={startExam} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white rounded-2xl font-black text-xl flex justify-center items-center gap-3 shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-1 active:scale-95 group">
            <Maximize size={24} className="group-hover:scale-110 transition-transform" /> I am ready to begin
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQ = test?.questions?.[currentQIndex];

  if (!currentQ) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-xl text-slate-500 font-bold">No questions found in this test.</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 dark:bg-[#0f172a] select-none">
      <SEO title="Mock Test Active" />
      
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Submit Exam?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Are you sure you want to finalize your submission? This action cannot be undone.</p>
              <div className="flex gap-4 w-full">
                <button onClick={cancelSubmit} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors">
                  Cancel
                </button>
                <button onClick={confirmSubmit} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/30">
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPaletteOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsPaletteOpen(false)}
        />
      )}

      {/* Modern Header */}
      <header className="bg-white dark:bg-[linear-gradient(145deg,rgba(15,20,30,0.9),rgba(20,10,35,0.95))] backdrop-blur-xl border-b border-slate-200 dark:border-indigo-500/30 px-4 py-3 sm:py-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_30px_rgba(99,102,241,0.15)] z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
        <div className="flex items-center justify-between w-full md:w-auto relative z-10">
          <div className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-xl flex items-center justify-center text-sm shadow-lg shadow-indigo-500/30 border border-white/10 shrink-0">
              NTA
            </div>
            <span className="truncate max-w-[200px] sm:max-w-[300px]">{test?.title || 'Mock Test'}</span>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <div className={`text-lg sm:text-xl font-mono font-black px-3 py-1.5 rounded-xl border-2 shadow-inner ${timeLeft < 60 ? 'text-red-500 border-red-500/50 bg-red-500/10 dark:bg-red-900/20 animate-pulse' : (timeLeft < 600 ? 'text-amber-500 border-amber-500/50 bg-amber-500/10 dark:bg-amber-900/20' : 'text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-900/20 shadow-[inset_0_0_15px_rgba(6,182,212,0.15)]')}`}>
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-white/10 shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-auto overflow-x-auto flex gap-2 sm:gap-3 pb-1 md:pb-0 hide-scrollbar relative z-10 snap-x">
          {['Physics', 'Chemistry', 'Botany', 'Zoology'].map(sub => (
            <span key={sub} className={`snap-start whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-full cursor-pointer transition-all border ${currentQ.subject === sub ? 'bg-[linear-gradient(90deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))] dark:bg-[linear-gradient(90deg,rgba(99,102,241,0.3),rgba(168,85,247,0.3))] text-indigo-700 dark:text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-white/10'}`}>
              {sub}
            </span>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-4 relative z-10">
          <div className={`flex items-center gap-4 px-6 py-2.5 rounded-2xl border-2 shadow-inner backdrop-blur-md ${timeLeft < 60 ? 'border-red-500/50 bg-red-500/10 dark:bg-red-900/20' : 'border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-900/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]'}`}>
            <div className={`text-xs font-black uppercase tracking-widest ${timeLeft < 60 ? 'text-red-500' : 'text-cyan-600 dark:text-cyan-400'}`}>Time Left</div>
            <div className={`text-3xl font-mono font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : (timeLeft < 600 ? 'text-amber-500' : 'text-slate-900 dark:text-white')}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar relative z-10">
          <motion.div 
            key={currentQIndex} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800/80 backdrop-blur-xl shadow-xl dark:shadow-2xl rounded-[2rem] p-6 md:p-10 min-h-min h-auto flex flex-col max-w-4xl mx-auto border border-slate-200 dark:border-slate-700/50 relative overflow-visible"
          >
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100 dark:border-slate-700/50">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm border border-indigo-200 dark:border-indigo-800/50">
                  Q{currentQIndex + 1}
                </span>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{currentQ?.subject || ''}</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 shadow-sm">+4</span>
                <span className="text-sm font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/50 shadow-sm">-1</span>
              </div>
            </div>
            
            <p className="text-xl md:text-2xl mb-10 font-bold leading-relaxed text-slate-800 dark:text-slate-200" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {currentQ?.text || ''}
            </p>
            
            <div className="space-y-4 flex-grow relative z-20">
              {currentQ?.options?.map((opt, i) => {
                const isSelected = answers[currentQIndex] === i;
                return (
                  <label 
                    key={i} 
                    className={`flex items-start p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 group relative ${isSelected ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-400 shadow-md shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                  >
                    <div className="relative flex items-center justify-center mt-1 shrink-0">
                      <input type="radio" name={`question-${currentQIndex}`} className="peer sr-only" checked={isSelected} disabled={timeLeft <= 0} onChange={() => setAnswers({ ...answers, [currentQIndex]: i })} />
                      <div className={`w-6 h-6 rounded-full border-2 transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400' : 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-indigo-400'} peer-disabled:opacity-50`}></div>
                      <div className="absolute inset-0 rounded-full scale-0 peer-checked:scale-[0.4] bg-white transition-transform peer-disabled:opacity-50"></div>
                    </div>
                    <span className={`ml-5 text-lg font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'}`} style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* NTA Palette */}
        <div className={`fixed inset-y-0 right-0 transform ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-[85vw] max-w-[340px] md:w-[340px] bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col z-50 shadow-2xl`}>
          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center md:block">
            <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-xs font-bold w-full">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm"></div> <span className="text-slate-600 dark:text-slate-300">Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-sm"></div> <span className="text-slate-600 dark:text-slate-300">Not Ans</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-inner border border-slate-300 dark:border-slate-600"></div> <span className="text-slate-600 dark:text-slate-300">Not Visited</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-violet-500 text-white flex items-center justify-center shadow-sm"></div> <span className="text-slate-600 dark:text-slate-300">Review</span></div>
            </div>
            <button onClick={() => setIsPaletteOpen(false)} className="md:hidden ml-4 p-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto grid grid-cols-5 gap-2.5 content-start custom-scrollbar bg-white dark:bg-slate-800">
            {test?.questions?.map((_, i) => {
              let bg = "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600";
              if (answers[i] !== undefined) bg = "bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/20";
              else if (markedForReview[i]) bg = "bg-violet-500 text-white border-transparent shadow-md shadow-violet-500/20";
              else if (i === currentQIndex) bg = "bg-rose-500 text-white border-transparent shadow-lg shadow-rose-500/30 scale-110 z-10 ring-2 ring-rose-200 dark:ring-rose-900"; 

              return (
                <button key={i} onClick={() => { setCurrentQIndex(i); setIsPaletteOpen(false); }} className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all hover:scale-110 ${bg}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Bottom Controls */}
      <footer className="bg-white dark:bg-[linear-gradient(145deg,rgba(15,20,30,0.9),rgba(20,10,35,0.95))] backdrop-blur-xl border-t border-slate-200 dark:border-indigo-500/30 p-3 sm:p-4 md:p-6 z-20 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_30px_rgba(99,102,241,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-cyan-500/5 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 md:gap-4 max-w-7xl mx-auto w-full relative z-10">
          
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
            <button onClick={() => { setMarkedForReview({ ...markedForReview, [currentQIndex]: true }); setCurrentQIndex(Math.min((test?.questions?.length || 1)-1, currentQIndex+1)); }} className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2.5 sm:py-4 bg-[linear-gradient(145deg,rgba(139,92,246,0.1),rgba(139,92,246,0.05))] hover:bg-[linear-gradient(145deg,rgba(139,92,246,0.2),rgba(139,92,246,0.1))] text-violet-700 dark:text-violet-300 rounded-xl sm:rounded-2xl font-bold transition-all border border-violet-200 dark:border-violet-500/30 shadow-[inset_0_0_10px_rgba(139,92,246,0.05)] active:scale-95">
              <Bookmark size={18} className="hidden sm:block" /> <span className="text-xs sm:text-base leading-tight">Review</span>
            </button>
            <button onClick={() => { const newA = {...answers}; delete newA[currentQIndex]; setAnswers(newA); }} className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-2.5 sm:py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl sm:rounded-2xl font-bold transition-all border border-slate-200 dark:border-white/10 active:scale-95">
              <X size={18} className="hidden sm:block" /> <span className="text-xs sm:text-base leading-tight">Clear</span>
            </button>
          </div>
          
          <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
            <button onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))} disabled={currentQIndex === 0} className="flex-1 md:flex-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-5 py-2.5 sm:py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 rounded-xl sm:rounded-2xl font-bold transition-all border border-slate-200 dark:border-white/10 active:scale-95">
              <ChevronLeft size={20} className="hidden sm:block" /> <span className="text-xs sm:text-base leading-tight">Prev</span>
            </button>
            <button onClick={() => setCurrentQIndex(Math.min((test?.questions?.length || 1)-1, currentQIndex+1))} className="flex-[2] md:flex-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-8 py-2.5 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 active:scale-95 border border-indigo-400/50">
               <span className="text-xs sm:text-base leading-tight text-center">Save & Next</span> <ChevronRight size={20} className="hidden sm:block" />
            </button>
            <button id="submit-exam-btn" onClick={(e) => handleIntentSubmit(e, e.currentTarget.dataset.type === 'auto')} className="flex-[2] md:flex-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-8 py-2.5 sm:py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-white rounded-xl sm:rounded-2xl font-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] transform hover:-translate-y-0.5 active:scale-95 border border-emerald-300/50" disabled={timeLeft <= 0}>
              <CheckCircle2 size={20} className="hidden sm:block" /> <span className="text-xs sm:text-base leading-tight uppercase tracking-wider text-center">Submit</span>
            </button>
          </div>
          
        </div>
      </footer>
    </div>
  );
}

export default function MockTest() {
  return (
    <ErrorBoundary>
      <MockTestContent />
    </ErrorBoundary>
  );
}
