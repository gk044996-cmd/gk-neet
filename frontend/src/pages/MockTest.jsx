import React, { useState, useEffect, useCallback } from 'react';
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

  // Security & Anti-cheat measures
  useEffect(() => {
    if (!started) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(w => {
          const newW = w + 1;
          alert(`Warning ${newW}/3: Tab switching is not allowed during the exam.`);
          if (newW >= 3) handleSubmit(true);
          return newW;
        });
      }
    };

    const preventCopy = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', preventCopy);
    document.addEventListener('copy', preventCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', preventCopy);
      document.removeEventListener('copy', preventCopy);
    };
  }, [started]);

  // Timer
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  const requestFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
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

  const handleSubmit = useCallback(async (forced = false) => {
    if (!forced && !window.confirm('Are you sure you want to submit the test?')) return;
    
    // Convert answers to array mapped to questions
    const finalAnswers = test.questions.map((q, i) => answers[i] !== undefined ? answers[i] : -1);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/tests/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: finalAnswers, timeTaken: (test.duration * 60) - timeLeft })
      });
      const data = await res.json();
      
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(console.error);
      }
      
      navigate(`/results/${data.detailedResult._id}`, { state: { result: data.detailedResult, test: test } });
    } catch (err) {
      console.error(err);
      alert('Failed to submit test. Please try again.');
    }
  }, [answers, test, timeLeft, id, navigate]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Test...</div>;
  if (!test) return <div className="flex justify-center items-center h-screen">Test not found</div>;

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SEO title="Exam Instructions" />
        <div className="glass-panel p-8 rounded-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center">NTA Mock Test Instructions</h1>
          <div className="space-y-4 mb-8 text-slate-600 dark:text-slate-300">
            <p>1. The exam is of 180 minutes duration.</p>
            <p>2. There are 180 questions in total. Each correct answer awards 4 marks, wrong answer deducts 1 mark.</p>
            <p className="text-red-500 font-bold flex items-center gap-2"><AlertTriangle size={20}/> 3. Do not switch tabs. 3 warnings will lead to auto-submit.</p>
            <p>4. Exam will run in fullscreen mode.</p>
          </div>
          <button onClick={startExam} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 flex justify-center items-center gap-2 shadow-lg shadow-primary/30">
            <Maximize size={20} /> I have read the instructions. Begin Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQIndex];
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  if (!currentQ) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="text-xl text-slate-500 font-bold">No questions found in this test.</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-900 select-none">
      <SEO title="Mock Test Active" />
      
      {/* Overlay for mobile palette */}
      {isPaletteOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsPaletteOpen(false)}
        />
      )}

      {/* NTA Header */}
      <header className="bg-[#1e40af] text-white px-3 md:px-6 py-2 md:py-3 flex flex-wrap justify-between items-center shadow-md gap-y-2 z-10">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="font-bold text-base md:text-xl tracking-wider">NTA NEET MOCK</div>
          <div className="flex items-center gap-3 md:hidden">
            <div className={`text-lg font-mono font-bold ${timeLeft < 600 ? 'text-red-300 animate-pulse' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            <button 
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="bg-white/20 p-1.5 rounded-md text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        <div className="w-full md:w-auto overflow-x-auto flex gap-1.5 md:gap-2 pb-1 md:pb-0 custom-scrollbar hide-scrollbar">
          {['Physics', 'Chemistry', 'Botany', 'Zoology'].map(sub => (
            <span key={sub} className={`whitespace-nowrap px-2.5 py-1 text-xs md:text-sm rounded cursor-pointer transition-colors ${currentQ.subject === sub ? 'bg-white text-[#1e40af] font-bold' : 'hover:bg-blue-700 bg-blue-800/50'}`}>
              {sub}
            </span>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm opacity-80">Time Left</div>
            <div className={`text-2xl font-mono font-bold ${timeLeft < 600 ? 'text-red-300 animate-pulse' : ''}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-8 custom-scrollbar">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-8 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 md:mb-6 border-b pb-3 md:pb-4">
              <h2 className="text-lg md:text-xl font-bold">Question {currentQIndex + 1}</h2>
              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-xs md:text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">+4 marks</span>
                <span className="text-xs md:text-sm font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">-1 mark</span>
              </div>
            </div>
            <p className="text-base md:text-lg mb-6 md:mb-8 font-medium leading-relaxed">{currentQ.text}</p>
            <div className="space-y-3 md:space-y-4 flex-grow">
              {currentQ.options.map((opt, i) => (
                <label key={i} className={`flex items-start p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all ${answers[currentQIndex] === i ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 hover:border-blue-200'}`}>
                  <input type="radio" name={`question-${currentQIndex}`} className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 shrink-0" checked={answers[currentQIndex] === i} onChange={() => setAnswers({ ...answers, [currentQIndex]: i })} />
                  <span className="ml-3 text-base md:text-lg break-words">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* NTA Palette (Collapsible on mobile) */}
        <div className={`fixed inset-y-0 right-0 transform ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-[280px] md:w-[320px] bg-slate-50 dark:bg-slate-800 border-l border-slate-200 flex flex-col z-50 shadow-2xl md:shadow-none`}>
          <div className="p-3 md:p-4 bg-white dark:bg-slate-800 border-b flex justify-between items-center md:block">
            <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-[10px] md:text-xs font-semibold w-full">
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 md:w-6 md:h-6 rounded bg-green-500 text-white flex items-center justify-center">1</div> Ans</div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 md:w-6 md:h-6 rounded bg-red-500 text-white flex items-center justify-center">2</div> Not Ans</div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 md:w-6 md:h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center">3</div> Not Visited</div>
              <div className="flex items-center gap-1.5"><div className="w-5 h-5 md:w-6 md:h-6 rounded bg-purple-500 text-white flex items-center justify-center">4</div> Review</div>
            </div>
            <button onClick={() => setIsPaletteOpen(false)} className="md:hidden ml-2 p-2 bg-slate-100 rounded-md text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="p-3 md:p-4 flex-1 overflow-y-auto grid grid-cols-5 gap-1.5 md:gap-2 content-start bg-slate-100 dark:bg-slate-900 custom-scrollbar">
            {test.questions.map((_, i) => {
              let bg = "bg-slate-200 text-slate-700";
              if (answers[i] !== undefined) bg = "bg-green-500 text-white";
              else if (markedForReview[i]) bg = "bg-purple-500 text-white";
              else if (i === currentQIndex) bg = "bg-red-500 text-white border-2 border-black"; 

              return (
                <button key={i} onClick={() => { setCurrentQIndex(i); setIsPaletteOpen(false); }} className={`w-10 h-10 md:w-12 md:h-12 rounded-md flex items-center justify-center font-bold text-xs md:text-sm shadow-sm transition-transform hover:scale-105 ${bg}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* NTA Footer Controls */}
      <footer className="bg-slate-200 dark:bg-slate-800 p-2 md:p-3 flex flex-wrap md:flex-nowrap justify-between items-center gap-2 md:gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
        <div className="flex w-full md:w-auto gap-2">
          <button onClick={() => { setMarkedForReview({ ...markedForReview, [currentQIndex]: true }); setCurrentQIndex(Math.min(test.questions.length-1, currentQIndex+1)); }} className="flex-1 md:flex-none px-2 py-2 md:py-2.5 bg-purple-600 text-white rounded font-semibold text-[11px] md:text-sm hover:bg-purple-700 whitespace-nowrap text-center shadow-sm">Mark Review</button>
          <button onClick={() => { const newA = {...answers}; delete newA[currentQIndex]; setAnswers(newA); }} className="flex-1 md:flex-none px-2 py-2 md:py-2.5 bg-white text-slate-700 border border-slate-300 rounded font-semibold text-[11px] md:text-sm hover:bg-slate-50 whitespace-nowrap text-center shadow-sm">Clear</button>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <button onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))} disabled={currentQIndex === 0} className="flex-1 md:flex-none px-2 md:px-6 py-2 md:py-2.5 bg-white border border-slate-300 rounded font-semibold text-[11px] md:text-sm disabled:opacity-50 hover:bg-slate-50 text-center shadow-sm">Previous</button>
          <button onClick={() => setCurrentQIndex(Math.min(test.questions.length-1, currentQIndex+1))} className="flex-1 md:flex-none px-2 md:px-8 py-2 md:py-2.5 bg-green-600 text-white rounded font-semibold text-[11px] md:text-sm hover:bg-green-700 shadow-md whitespace-nowrap text-center">Save & Next</button>
          <button onClick={() => handleSubmit(false)} className="flex-1 md:flex-none px-3 md:px-6 py-2 md:py-2.5 bg-[#1e40af] text-white rounded font-bold text-[11px] md:text-sm hover:bg-blue-800 shadow-md text-center">Submit</button>
        </div>
      </footer>
    </div>
  );
}
