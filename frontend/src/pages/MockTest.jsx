import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { AlertTriangle, Maximize, X } from 'lucide-react';
import { BASE_URL } from '../config';



export default function MockTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [started, setStarted] = useState(false);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
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
        const res = await fetch(`${BASE_URL}/tests/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (res.status === 403) {
          alert(data.error || 'You have already completed this test.');
          navigate('/dashboard');
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

  // Auto-save answers
  useEffect(() => {
    if (started) {
      localStorage.setItem(`test_answers_${id}`, JSON.stringify(answers));
    }
  }, [answers, started, id]);

  // Security & Anti-cheat measures
  useEffect(() => {
    if (!started) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(w => {
          const newW = w + 1;
          setTimeout(() => {
            alert(`Warning ${newW}/3: Tab switching is not allowed during the exam.`);
            if (newW >= 3) {
              const submitBtn = document.getElementById('submit-exam-btn');
              if (submitBtn) submitBtn.click();
            }
          }, 50);
          return newW;
        });
      }
    };

    const preventCopy = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
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
      document.removeEventListener('contextmenu', preventCopy);
      document.removeEventListener('copy', preventCopy);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [started]);

  // Timer
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 601 && !warningsShownRef.current[10]) {
          warningsShownRef.current[10] = true;
          setTimeout(() => alert('Only 10 minutes remaining!'), 0);
        }
        if (prev === 301 && !warningsShownRef.current[5]) {
          warningsShownRef.current[5] = true;
          setTimeout(() => alert('Only 5 minutes remaining!'), 0);
        }
        if (prev === 61 && !warningsShownRef.current[1]) {
          warningsShownRef.current[1] = true;
          setTimeout(() => alert('Final 1 minute remaining! Your test will auto submit.'), 0);
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
    if (!forced && !window.confirm('Are you sure you want to submit the test?')) return;
    
    if (timeLeftRef.current <= 0) {
      submissionType = 'auto';
    }

    // Convert answers to array mapped to questions
    const finalAnswers = test.questions.map((q, i) => answersRef.current[i] !== undefined ? answersRef.current[i] : -1);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/tests/${id}/submit`, {
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
      if (submissionType === 'auto') {
        alert("Test auto submitted because exam time ended.");
      }
      
      navigate(`/results/${data.detailedResult._id}`, { state: { result: data.detailedResult, test: test } });
    } catch (err) {
      console.error(err);
      alert('Failed to submit test. Please try again.');
    }
  }, [test, id, navigate]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Test...</div>;
  if (!test) return <div className="flex justify-center items-center h-screen">Test not found</div>;

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <SEO title="Exam Instructions" />
        <div className="max-w-3xl w-full glass-panel p-6 md:p-10 rounded-3xl animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-3 gradient-text">NTA Mock Test Instructions</h1>
            <p className="text-slate-500 dark:text-slate-400">Please read carefully before starting</p>
          </div>
          
          <div className="space-y-4 mb-8 bg-white/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mt-0.5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div><strong className="block text-slate-800 dark:text-slate-200">Duration</strong><span className="text-slate-600 dark:text-slate-400 text-sm">The exam is of 180 minutes duration.</span></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg mt-0.5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div><strong className="block text-slate-800 dark:text-slate-200">Scoring Scheme</strong><span className="text-slate-600 dark:text-slate-400 text-sm">180 questions in total. +4 marks for correct, -1 for wrong.</span></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg mt-0.5"><AlertTriangle size={20}/></div>
              <div><strong className="block text-slate-800 dark:text-slate-200 text-red-600">Anti-Cheat Enabled</strong><span className="text-slate-600 dark:text-slate-400 text-sm">Do not switch tabs. 3 warnings will lead to auto-submit.</span></div>
            </div>
          </div>
          
          <button onClick={startExam} className="w-full py-4 premium-gradient text-white rounded-xl font-bold text-lg hover:opacity-90 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-95">
            <Maximize size={20} /> I have read the instructions. Begin Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQIndex];

  if (!currentQ) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-xl text-slate-500 font-bold">No questions found in this test.</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-900 select-none animate-fade-in">
      <SEO title="Mock Test Active" />
      
      {/* Overlay for mobile palette */}
      {isPaletteOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsPaletteOpen(false)}
        />
      )}

      {/* Premium Header */}
      <header className="premium-gradient text-white px-4 md:px-6 py-3 shadow-lg z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="font-extrabold text-lg md:text-xl tracking-wide flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
              <span className="text-white">NTA</span>
            </div>
            NEET MOCK
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <div className={`text-xl font-mono font-bold bg-black/20 px-3 py-1 rounded-lg backdrop-blur-md ${timeLeft < 60 ? 'text-red-300 animate-pulse bg-red-900/40' : (timeLeft < 600 ? 'text-yellow-300' : '')}`}>
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-lg text-white backdrop-blur-md shadow-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-auto overflow-x-auto flex gap-2 pb-1 md:pb-0 hide-scrollbar">
          {['Physics', 'Chemistry', 'Botany', 'Zoology'].map(sub => (
            <span key={sub} className={`whitespace-nowrap px-4 py-1.5 text-xs md:text-sm font-semibold rounded-full cursor-pointer transition-all ${currentQ.subject === sub ? 'bg-white text-blue-600 shadow-md transform scale-105' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}>
              {sub}
            </span>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <div className={`flex items-center gap-3 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md border ${timeLeft < 60 ? 'border-red-500/50 bg-red-900/30' : 'border-white/10'}`}>
            <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Time Left</div>
            <div className={`text-2xl font-mono font-bold transition-colors ${timeLeft < 60 ? 'text-red-300 animate-pulse' : (timeLeft < 600 ? 'text-yellow-300' : '')}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative bg-slate-50 dark:bg-slate-900">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 hide-scrollbar relative z-10 bg-slate-50 dark:bg-slate-900">
          <div key={currentQIndex} className="bg-[#BFE9FF] shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-5 md:p-10 min-h-min h-auto flex flex-col max-w-4xl mx-auto animate-fade-in border-2 border-[#87CEEB] relative z-20 overflow-visible break-words">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg md:text-2xl font-extrabold text-[#0F172A] flex items-center gap-3">
                <span className="bg-[#0B2447] text-white w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm md:text-base shadow-md">Q{currentQIndex + 1}</span>
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm">+4</span>
                <span className="text-xs md:text-sm font-bold text-rose-800 bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 shadow-sm">-1</span>
              </div>
            </div>
            <p className="text-lg md:text-xl mb-8 font-black leading-relaxed text-[#0F172A] selection:bg-[#87CEEB]/50" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{currentQ.text}</p>
            <div className="space-y-4 md:space-y-5 flex-grow h-auto min-h-min overflow-visible relative z-30">
              {currentQ.options.map((opt, i) => (
                <label key={i} className={`flex items-start p-5 md:p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group h-auto min-h-min z-40 relative ${answers[currentQIndex] === i ? 'border-[#2563EB] bg-[#A7D8FF] shadow-[0_0_15px_rgba(37,99,235,0.3)] scale-[1.02]' : 'border-[#87CEEB] bg-[#F0F9FF] hover:border-[#2563EB]/50 hover:bg-[#E0F4FF] hover:shadow-md'}`}>
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input type="radio" name={`question-${currentQIndex}`} className="peer sr-only" checked={answers[currentQIndex] === i} disabled={timeLeft <= 0} onChange={() => setAnswers({ ...answers, [currentQIndex]: i })} />
                    <div className={`w-6 h-6 rounded-full border-2 transition-colors ${answers[currentQIndex] === i ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#87CEEB] bg-white group-hover:border-[#2563EB]/50'} peer-disabled:opacity-50`}></div>
                    <div className="absolute inset-0 rounded-full scale-0 peer-checked:scale-[0.4] bg-white transition-transform peer-disabled:opacity-50"></div>
                  </div>
                  <span className={`ml-4 text-base md:text-lg font-extrabold ${answers[currentQIndex] === i ? 'text-[#0B2447]' : 'text-[#1E293B] group-hover:text-[#0F172A]'}`} style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* NTA Palette (Collapsible on mobile) */}
        <div className={`fixed inset-y-0 right-0 transform ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-[85vw] max-w-[320px] md:w-[320px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-50 shadow-2xl`}>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center md:block">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] md:text-xs font-semibold w-full">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-sm">1</div> <span className="text-slate-600 dark:text-slate-300">Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-rose-500 text-white flex items-center justify-center shadow-sm">2</div> <span className="text-slate-600 dark:text-slate-300">Not Ans</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm border border-slate-300 dark:border-slate-600">3</div> <span className="text-slate-600 dark:text-slate-300">Not Visited</span></div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-violet-500 text-white flex items-center justify-center shadow-sm">4</div> <span className="text-slate-600 dark:text-slate-300">Review</span></div>
            </div>
            <button onClick={() => setIsPaletteOpen(false)} className="md:hidden ml-2 p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-300">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto grid grid-cols-5 gap-2 content-start custom-scrollbar bg-white dark:bg-slate-900">
            {test.questions.map((_, i) => {
              let bg = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
              if (answers[i] !== undefined) bg = "bg-emerald-500 text-white border-transparent";
              else if (markedForReview[i]) bg = "bg-violet-500 text-white border-transparent";
              else if (i === currentQIndex) bg = "bg-rose-500 text-white border-2 border-slate-900 dark:border-white shadow-lg scale-110 z-10"; 

              return (
                <button key={i} onClick={() => { setCurrentQIndex(i); setIsPaletteOpen(false); }} className={`w-full aspect-square rounded-lg flex items-center justify-center font-bold text-xs md:text-sm shadow-sm transition-all hover:-translate-y-0.5 ${bg}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Footer Actions - Premium Mobile Bottom Nav */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-4 md:p-5 z-20 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] rounded-t-[24px] relative">
        <div className="flex flex-col justify-between items-stretch gap-3 min-h-[110px] md:min-h-0 md:flex-row md:items-center max-w-5xl mx-auto">
          <div className="grid grid-cols-2 w-full md:w-auto md:flex gap-3">
            <button onClick={() => { setMarkedForReview({ ...markedForReview, [currentQIndex]: true }); setCurrentQIndex(Math.min(test.questions.length-1, currentQIndex+1)); }} className="px-2 py-3.5 bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300 rounded-2xl font-bold text-sm text-center transition-transform active:scale-95 shadow-sm border border-violet-200">Mark for Review</button>
            <button onClick={() => { const newA = {...answers}; delete newA[currentQIndex]; setAnswers(newA); }} className="px-2 py-3.5 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-2xl font-bold text-sm text-center transition-transform active:scale-95 shadow-sm border border-slate-200">Clear</button>
          </div>
          <div className="grid grid-cols-3 w-full md:w-auto md:flex gap-3">
            <button onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))} disabled={currentQIndex === 0} className="px-1 py-3.5 bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 disabled:opacity-50 rounded-2xl font-bold text-sm text-center transition-transform active:scale-95 shadow-sm border border-slate-200">Previous</button>
            <button onClick={() => setCurrentQIndex(Math.min(test.questions.length-1, currentQIndex+1))} className="px-1 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-center transition-transform active:scale-95">Save & Next</button>
            <button id="submit-exam-btn" onClick={(e) => handleSubmit(e.currentTarget.dataset.type === 'auto', e.currentTarget.dataset.type === 'auto' ? 'auto' : 'manual')} className="px-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-extrabold text-sm shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] text-center hover:opacity-90 transition-all disabled:opacity-50 active:scale-95" disabled={timeLeft <= 0}>Submit</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
