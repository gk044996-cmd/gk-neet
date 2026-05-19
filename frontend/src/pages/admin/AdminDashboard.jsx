import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, DocumentPlusIcon, ArrowUpTrayIcon, 
  QueueListIcon, AcademicCapIcon, TrashIcon, 
  PencilSquareIcon, CheckCircleIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminResults from '../../components/admin/AdminResults';
import Leaderboard from '../../components/Leaderboard';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('admin_home');
  const [stats, setStats] = useState({ totalQuestions: 0, totalTests: 0, publishedTests: 0 });
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null, success: null });
  const [newTest, setNewTest] = useState({ title: '', description: '', duration: 180, totalMarks: 720, published: false, type: 'Custom Test', accessType: 'free' });
  const [newTestQuestions, setNewTestQuestions] = useState('');
  const [createTestStatus, setCreateTestStatus] = useState({ loading: false, error: null, success: null });
  const [previewData, setPreviewData] = useState(null);

  // Question browsing & selection states
  const [qSearch, setQSearch] = useState('');
  const [qSubject, setQSubject] = useState('');
  const [qUsageStatus, setQUsageStatus] = useState('');
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [allowRepeated, setAllowRepeated] = useState(true);
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswerIndex: 0, subject: 'Physics', chapter: '', explanation: '', imageUrl: '' });
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [createQuestionStatus, setCreateQuestionStatus] = useState({ loading: false, error: null, success: null });


  useEffect(() => {
    fetchStats();
    if (activeTab === 'manage_tests' || activeTab === 'published_tests') fetchTests();
    if (activeTab === 'manage_questions' || activeTab === 'create_test') fetchQuestions();
  }, [activeTab, qPage, qSearch, qSubject, qUsageStatus]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats({
        totalQuestions: data.totalQuestions || 0,
        totalTests: data.totalTests || 0,
        totalUsers: data.totalUsers || 0,
        totalAttempts: data.totalAttempts || 0,
        averageScore: data.averageScore || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/tests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({ page: qPage, limit: 15 });
      if (qSearch) query.append('search', qSearch);
      if (qSubject) query.append('subject', qSubject);
      if (qUsageStatus) query.append('usageStatus', qUsageStatus);

      const res = await fetch(`${API_URL}/api/questions?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setQTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadStatus({ loading: true, error: null, success: null });
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('preview', 'true'); // Send preview flag

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/upload-questions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setPreviewData(data.previewData);
      setUploadStatus({ loading: false, error: data.hasErrors ? 'Validation failed. Check the report below.' : null, success: null });
    } catch (err) {
      setUploadStatus({ loading: false, error: err.message, success: null });
    }
  };

  const handleFinalImport = async () => {
    if (!uploadFile) return;
    setUploadStatus({ loading: true, error: null, success: null });
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('preview', 'false'); // Send final flag
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/upload-questions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setUploadStatus({ loading: false, error: null, success: data.message });
      toast.success(data.message);
      setUploadFile(null);
      setPreviewData(null);
      fetchStats();
    } catch (err) {
      setUploadStatus({ loading: false, error: err.message, success: null });
    }
  };

  const toggleTestPublish = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/tests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ published: !currentStatus })
      });
      fetchTests();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/tests/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTests();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/questions/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchQuestions();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    
    // Front-end validation for Full NEET Mock
    if (newTest.type === 'Full NEET Mock') {
      const phy = selectedQuestions.filter(q => q.subject === 'Physics').length;
      const chem = selectedQuestions.filter(q => q.subject === 'Chemistry').length;
      const bio = selectedQuestions.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length;
      if (phy !== 45 || chem !== 45 || bio !== 90) {
        setCreateTestStatus({ loading: false, error: `NEET Full Mock must contain exactly: 45 Physics, 45 Chemistry, 90 Biology questions. Current: Phy(${phy}), Chem(${chem}), Bio(${bio})`, success: null });
        return;
      }
    }

    setCreateTestStatus({ loading: true, error: null, success: null });
    try {
      const token = localStorage.getItem('token');
      const questionIds = selectedQuestions.map(q => q._id);
      const totalMarks = selectedQuestions.length * 4;
      const duration = newTest.type === 'Full NEET Mock' ? 180 : newTest.duration;
      
      const res = await fetch(`${API_URL}/api/tests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newTest, questions: questionIds, totalMarks, duration })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create test');
      
      setCreateTestStatus({ loading: false, error: null, success: 'Test created successfully!' });
      toast.success('Test created successfully!');
      setNewTest({ title: '', description: '', duration: 180, totalMarks: 720, published: false, type: 'Custom Test', accessType: 'free' });
      setSelectedQuestions([]);
      fetchStats();
    } catch (err) {
      setCreateTestStatus({ loading: false, error: err.message, success: null });
    }
  };


  const handleBulkDelete = async () => {
    if (selectedForDelete.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedForDelete.length} questions?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/questions/bulk-delete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ids: selectedForDelete })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete questions');
      
      setSelectedForDelete([]);
      toast.success('Questions deleted successfully!');
      fetchQuestions();
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Failed to delete questions');
      console.error(err);
    }
  };

  const handleGenerateRandomMock = async () => {
    try {
      setCreateTestStatus({ loading: true, error: null, success: null });
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/questions/random-neet-mock`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch random questions');
      setSelectedQuestions(data);
      setNewTest(prev => ({ ...prev, type: 'Full NEET Mock', duration: 180 }));
      setCreateTestStatus({ loading: false, error: null, success: 'Random questions loaded successfully!' });
      toast.success('Random questions loaded successfully!');
    } catch (err) {
      setCreateTestStatus({ loading: false, error: err.message, success: null });
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setCreateQuestionStatus({ loading: true, error: null, success: null });
    try {
      const token = localStorage.getItem('token');
      const payload = {
        text: newQuestion.text,
        options: [newQuestion.option1, newQuestion.option2, newQuestion.option3, newQuestion.option4],
        correctAnswerIndex: newQuestion.correctAnswerIndex,
        subject: newQuestion.subject,
        chapter: newQuestion.chapter,
        explanation: newQuestion.explanation,
        imageUrl: newQuestion.imageUrl
      };

      const url = editQuestionId ? `${API_URL}/api/questions/${editQuestionId}` : `${API_URL}/api/questions`;
      const method = editQuestionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save question');
      
      setCreateQuestionStatus({ loading: false, error: null, success: `Question ${editQuestionId ? 'updated' : 'created'} successfully!` });
      toast.success(`Question ${editQuestionId ? 'updated' : 'created'} successfully!`);
      
      setNewQuestion({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswerIndex: 0, subject: 'Physics', chapter: '', explanation: '', imageUrl: '' });
      if (editQuestionId) {
        setEditQuestionId(null);
        setActiveTab('manage_questions');
        fetchQuestions();
      }
      fetchStats();
    } catch (err) {
      setCreateQuestionStatus({ loading: false, error: err.message, success: null });
      toast.error(err.message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'admin_home':
        return (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.4}}>
            <h2 className="text-2xl font-black mb-6 text-slate-800 dark:text-white tracking-tight">Admin Home</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: AcademicCapIcon, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20' },
                { label: 'Premium Users', value: stats.premiumUsersCount || 0, icon: AcademicCapIcon, color: 'from-amber-500 to-orange-400', shadow: 'shadow-amber-500/20' },
                { label: 'Est. Revenue', value: stats.revenueEstimate ? `₹${stats.revenueEstimate}` : '₹0', icon: ChartBarIcon, color: 'from-green-500 to-emerald-400', shadow: 'shadow-green-500/20' },
                { label: 'Total Tests', value: stats.totalTests, icon: DocumentPlusIcon, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20' },
                { label: 'Total Questions', value: stats.totalQuestions, icon: QueueListIcon, color: 'from-indigo-500 to-blue-500', shadow: 'shadow-indigo-500/20' },
                { label: 'Total Attempts', value: stats.totalAttempts, icon: ChartBarIcon, color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
                { label: 'Avg Score', value: stats.averageScore, icon: CheckCircleIcon, color: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/20' }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`relative overflow-hidden bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700/50 ${stat.shadow}`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10`} />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{stat.label}</h3>
                      <p className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                      <stat.icon className="w-6 h-6 stroke-[2.5]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      
      case 'upload':
        return (
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50">
            <h2 className="text-2xl sm:text-3xl font-black mb-6 text-slate-800 dark:text-white tracking-tight">Bulk Upload Questions</h2>
            <div className="mb-6 p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400">
              <p className="mb-2"><strong className="text-indigo-500 dark:text-indigo-400">Supported formats:</strong> .csv, .xlsx</p>
              <p className="mb-2"><strong className="text-cyan-500 dark:text-cyan-400">Columns:</strong> questionType, questionText, statement1, statement2, statement3, statement4, assertion, reason, leftColumn, rightColumn, imageReference, option1, option2, option3, option4, correctAnswer, subject</p>
              <p><strong className="text-purple-500 dark:text-purple-400">questionType:</strong> MCQ, STATEMENT, ASSERTION_REASON, MATCH, IMAGE_BASED, SEQUENCE, TRUE_FALSE, MULTI_CORRECT</p>
            </div>
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <label className="relative flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed rounded-2xl cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-slate-300 dark:border-slate-600 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <ArrowUpTrayIcon className="w-12 h-12 mb-4 text-indigo-500 dark:text-indigo-400" />
                    </motion.div>
                    <p className="mb-2 text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300"><span className="font-bold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop</p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">CSV or Excel (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => setUploadFile(e.target.files[0])} />
                </label>
              </div>
              {uploadFile && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 truncate">{uploadFile.name}</span>
                </div>
              )}
              <button 
                type="submit" 
                disabled={uploadStatus.loading || !uploadFile}
                className="w-full px-4 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl hover:from-indigo-600 hover:to-cyan-600 focus:ring-4 focus:ring-cyan-500/30 shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {uploadStatus.loading ? 'Parsing File...' : 'Preview Upload'}
              </button>
            </form>
            
            {uploadStatus.error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{uploadStatus.error}</div>}
            {uploadStatus.success && <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">{uploadStatus.success}</div>}

            {previewData && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Upload Preview</h3>
                <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl mb-4">
                  <table className="min-w-[600px] w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-bold uppercase text-xs">Row</th>
                        <th className="px-4 py-3 font-bold uppercase text-xs">Question</th>
                        <th className="px-4 py-3 font-bold uppercase text-xs">Subject</th>
                        <th className="px-4 py-3 font-bold uppercase text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
                      {previewData.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${row.status === 'Error' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                          <td className="px-4 py-3 text-slate-500 font-semibold">{row.rowNum}</td>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={row.question}>{row.question}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-semibold text-xs">{row.subject}</span>
                          </td>
                          <td className="px-4 py-3">
                            {row.status === 'Error' ? (
                              <span className="text-red-500 font-bold" title={row.reason}>❌ {row.reason}</span>
                            ) : (
                              <span className="text-emerald-500 font-bold">✅ Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 50 && (
                    <div className="p-3 text-center text-slate-500 font-semibold text-sm bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">Showing first 50 rows of {previewData.length}</div>
                  )}
                </div>

                {previewData.some(r => r.status === 'Error') ? (
                  <div className="p-4 bg-red-100 text-red-800 rounded-xl font-medium flex items-center justify-between">
                    <span>Please fix the errors shown above before importing.</span>
                    <button 
                      onClick={() => {
                        const errorRows = previewData.filter(r => r.status === 'Error').map(r => `Row ${r.rowNum}: ${r.reason}`).join('\n');
                        const blob = new Blob([errorRows], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'Upload_Errors_Report.txt';
                        a.click();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Download Error Report
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleFinalImport} 
                    disabled={uploadStatus.loading}
                    className="w-full px-4 py-3 text-white bg-emerald-600 font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    {uploadStatus.loading ? 'Importing...' : `✅ Import ${previewData.length} Questions`}
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 'manage_tests':
        return (
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Manage Tests</h2>
            </div>
            <div className="overflow-x-auto custom-scrollbar w-full">
              <table className="min-w-[800px] w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                  {tests.map(test => (
                    <tr key={test._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                        {test.accessType === 'premium' && <span className="mr-2 text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">PREMIUM</span>}
                        {test.accessType === 'free' && <span className="mr-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 shadow-sm">FREE</span>}
                        {test.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-400">{test.duration} mins</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${test.published ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                          {test.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold flex space-x-4">
                        <button onClick={() => toggleTestPublish(test._id, test.published)} className={`${test.published ? 'text-amber-500 hover:text-amber-600' : 'text-indigo-500 hover:text-indigo-600'} transition-colors`}>
                          {test.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => deleteTest(test._id)} className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
                          <TrashIcon className="w-4 h-4"/> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'manage_questions':
        return (
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Manage Questions</h2>
              <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
                {selectedForDelete.length > 0 && (
                  <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 text-sm font-bold shadow-lg shadow-red-500/20 transform hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                    Delete Selected ({selectedForDelete.length})
                  </button>
                )}
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">Total: {stats.totalQuestions}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="col-span-2 relative group">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                <input type="text" placeholder="Search questions or chapters..." value={qSearch} onChange={e => setQSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm" />
              </div>
              <select value={qSubject} onChange={e => setQSubject(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm cursor-pointer">
                <option value="">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Botany">Botany</option>
                <option value="Zoology">Zoology</option>
              </select>
              <select value={qUsageStatus} onChange={e => setQUsageStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm cursor-pointer">
                <option value="">All Statuses</option>
                <option value="fresh">Fresh Questions</option>
                <option value="used">Used Questions</option>
                <option value="frequent">Frequently Used</option>
              </select>
            </div>

            <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl w-full">
              <table className="min-w-[1000px] w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left w-12">
                      <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                        onChange={e => {
                          if (e.target.checked) setSelectedForDelete(questions.map(q => q._id));
                          else setSelectedForDelete([]);
                        }}
                        checked={questions.length > 0 && selectedForDelete.length === questions.length}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
                  {questions.map(q => (
                    <tr key={q._id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedForDelete.includes(q._id) ? 'bg-cyan-50 dark:bg-cyan-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                          checked={selectedForDelete.includes(q._id)}
                          onChange={e => {
                            if (e.target.checked) setSelectedForDelete([...selectedForDelete, q._id]);
                            else setSelectedForDelete(selectedForDelete.filter(id => id !== q._id));
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white max-w-[400px]">
                        <div className="line-clamp-2">{q.text}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md font-bold text-xs">{q.subject}</span>
                          {q.usageCount === 0 ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-bold">🟢 Fresh</span>
                          ) : q.usageCount > 2 ? (
                            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-bold">🔴 Frequent ({q.usageCount}x)</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-xs font-bold">🟡 Used {q.usageCount}x</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold flex space-x-3">
                        <button onClick={() => setPreviewQuestion(q)} className="p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 dark:text-cyan-400 rounded-lg transition-colors" title="Preview"><EyeIcon className="w-5 h-5"/></button>
                        <button onClick={() => {
                          setEditQuestionId(q._id);
                          setNewQuestion({
                            text: q.text || '',
                            option1: q.options && q.options[0] ? q.options[0] : '',
                            option2: q.options && q.options[1] ? q.options[1] : '',
                            option3: q.options && q.options[2] ? q.options[2] : '',
                            option4: q.options && q.options[3] ? q.options[3] : '',
                            correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : 0,
                            subject: q.subject || 'Physics',
                            chapter: q.chapter || '',
                            explanation: q.explanation || '',
                            imageUrl: q.imageUrl || ''
                          });
                          setActiveTab('create_question');
                        }} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:text-indigo-400 rounded-lg transition-colors" title="Edit"><PencilSquareIcon className="w-5 h-5"/></button>
                        <button onClick={() => deleteQuestion(q._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-bold text-lg">No questions found matching your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button type="button" disabled={qPage === 1} onClick={() => setQPage(p => p - 1)} className="px-6 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">Previous</button>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">Page {qPage} of {qTotalPages}</span>
              <button type="button" disabled={qPage === qTotalPages} onClick={() => setQPage(p => p + 1)} className="px-6 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm">Next</button>
            </div>
          </div>
        );

      case 'create_test':
        return (
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-4 sm:p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50 w-full overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-black mb-6 text-slate-800 dark:text-white tracking-tight px-2 sm:px-0">Create Manual Test</h2>
            <form onSubmit={handleCreateTest} className="space-y-5 max-w-full lg:max-w-3xl px-2 sm:px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Test Type</label>
                  <select value={newTest.type} onChange={e => setNewTest({...newTest, type: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm cursor-pointer">
                    <option value="Full NEET Mock">Full NEET Mock</option>
                    <option value="Physics Test">Physics Test</option>
                    <option value="Chemistry Test">Chemistry Test</option>
                    <option value="Biology Test">Biology Test</option>
                    <option value="Chapter Test">Chapter Test</option>
                    <option value="Custom Test">Custom Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Access Type</label>
                  <select value={newTest.accessType} onChange={e => setNewTest({...newTest, accessType: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm cursor-pointer">
                    <option value="free">Free Test</option>
                    <option value="premium">Premium Test</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Title</label>
                  <input required type="text" value={newTest.title} onChange={e => setNewTest({...newTest, title: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm" placeholder="e.g. NEET Full Mock Test 2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Description</label>
                <textarea required value={newTest.description} onChange={e => setNewTest({...newTest, description: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm" rows="3" placeholder="Test description..." />
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Duration (mins)</label>
                  {newTest.type === 'Full NEET Mock' ? (
                    <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">180</p>
                  ) : (
                    <input type="number" min="1" max="500" value={newTest.duration} onChange={e => setNewTest({...newTest, duration: parseInt(e.target.value) || 1})} className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none font-black text-lg" />
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Total Marks</label>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{selectedQuestions.length * 4}</p>
                </div>
              </div>
              
              <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Select Questions</h3>
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-stretch sm:items-center">
                    <button type="button" onClick={handleGenerateRandomMock} className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 text-sm font-black shadow-lg shadow-purple-500/30 transform hover:-translate-y-0.5 transition-all">
                      ✨ Auto-Select NEET Mock
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold">Physics: {selectedQuestions.filter(q => q.subject === 'Physics').length}/45</span>
                  <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-bold">Chemistry: {selectedQuestions.filter(q => q.subject === 'Chemistry').length}/45</span>
                  <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-bold">Biology: {selectedQuestions.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length}/90</span>
                  <span className="px-3 py-1.5 bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg text-sm font-black">Total: {selectedQuestions.length}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="col-span-1 sm:col-span-2 relative group">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                    <input type="text" placeholder="Search questions..." value={qSearch} onChange={e => setQSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none font-medium shadow-sm" />
                  </div>
                  <select value={qSubject} onChange={e => setQSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none font-medium shadow-sm cursor-pointer">
                    <option value="">All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                  </select>
                  <select value={qUsageStatus} onChange={e => setQUsageStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none font-medium shadow-sm cursor-pointer">
                    <option value="">All Statuses</option>
                    <option value="fresh">Fresh Only</option>
                    <option value="used">Used Only</option>
                  </select>
                </div>
                
                <div className="flex justify-end mb-4">
                  <label className="flex items-center space-x-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={allowRepeated} onChange={(e) => setAllowRepeated(e.target.checked)} className="w-5 h-5 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500/50" />
                    <span>Allow selecting previously used questions</span>
                  </label>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {questions.map(q => {
                    const isSelected = selectedQuestions.some(sq => sq._id === q._id);
                    const isUsed = q.usageCount > 0;
                    const disabledCheckbox = !allowRepeated && isUsed;
                    return (
                      <div key={q._id} className={`flex items-start p-4 sm:p-5 rounded-2xl border-2 transition-all ${isSelected ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-900/10 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'} ${disabledCheckbox ? 'opacity-60 bg-slate-50 grayscale' : ''}`}>
                        <input type="checkbox" disabled={disabledCheckbox} checked={isSelected} onChange={(e) => {
                          if (e.target.checked) setSelectedQuestions([...selectedQuestions, q]);
                          else setSelectedQuestions(selectedQuestions.filter(sq => sq._id !== q._id));
                        }} className="mt-1 w-5 h-5 text-cyan-500 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed focus:ring-cyan-500/50" />
                        <div className="ml-4 flex-1">
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">{q.text}</p>
                          <div className="flex gap-2 mt-3 text-xs items-center flex-wrap">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-md font-bold border border-slate-200 dark:border-slate-600">{q.subject}</span>
                            {q.chapter && <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-md font-bold border border-slate-200 dark:border-slate-600 truncate max-w-[150px]">{q.chapter}</span>}
                            {isUsed ? (
                                <span className={`px-2.5 py-1 rounded-md font-bold border ${q.usageCount > 2 ? 'bg-red-50 text-red-700 border-red-200 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                  {q.usageCount > 2 ? `🔴 Frequent (${q.usageCount}x)` : `🟡 Used ${q.usageCount}x`}
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md font-bold">🟢 Fresh</span>
                            )}
                          </div>
                        </div>
                        <button type="button" onClick={() => setPreviewQuestion(q)} className="ml-2 p-2.5 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-all">
                          <EyeIcon className="w-6 h-6" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button type="button" disabled={qPage === 1} onClick={() => setQPage(p => p - 1)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">Previous</button>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">Page {qPage} of {qTotalPages}</span>
                  <button type="button" disabled={qPage === qTotalPages} onClick={() => setQPage(p => p + 1)} className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors">Next</button>
                </div>
              </div>

              {/* Smart Warning System */}
              {(() => {
                const reusedCount = selectedQuestions.filter(q => q.usageCount > 0).length;
                if (reusedCount > 0) {
                  return (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                      <span className="text-yellow-600 mt-0.5">⚠️</span>
                      <div>
                        <p className="text-sm font-bold text-yellow-800">Smart Warning System</p>
                        <p className="text-sm text-yellow-700">This test contains {reusedCount} previously used question{reusedCount > 1 ? 's' : ''}.</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex items-center gap-3 mt-6 p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <input type="checkbox" id="published" checked={newTest.published} onChange={e => setNewTest({...newTest, published: e.target.checked})} className="w-5 h-5 text-cyan-500 rounded border-slate-300 focus:ring-cyan-500/50 cursor-pointer" />
                <label htmlFor="published" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">Publish immediately and make visible to students</label>
              </div>

              {newTest.type === 'Full NEET Mock' && (selectedQuestions.filter(q => q.subject === 'Physics').length !== 45 || selectedQuestions.filter(q => q.subject === 'Chemistry').length !== 45 || selectedQuestions.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length !== 90) && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mt-4 text-sm text-red-600 dark:text-red-400 font-bold flex gap-3">
                  <span className="text-xl">⚠️</span>
                  <span>Full NEET Mock requires exactly 45 Physics, 45 Chemistry, and 90 Biology questions. Please adjust your selection.</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={createTestStatus.loading || (newTest.type === 'Full NEET Mock' && (selectedQuestions.filter(q => q.subject === 'Physics').length !== 45 || selectedQuestions.filter(q => q.subject === 'Chemistry').length !== 45 || selectedQuestions.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length !== 90))} 
                className="w-full px-4 py-4 mt-6 text-xl font-black text-white bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all disabled:transform-none"
              >
                {createTestStatus.loading ? 'Creating Test...' : 'Create Mock Test'}
              </button>
              {createTestStatus.error && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 mt-4 bg-red-500/10 border border-red-500/30 text-red-500 font-bold rounded-xl">{createTestStatus.error}</motion.div>}
              {createTestStatus.success && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 mt-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold rounded-xl">{createTestStatus.success}</motion.div>}
            </form>
          </div>
        );

      case 'create_question':
        return (
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-4 sm:p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
            {editQuestionId && (
              <button 
                type="button" 
                onClick={() => {
                  setEditQuestionId(null);
                  setNewQuestion({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswerIndex: 0, subject: 'Physics', chapter: '', explanation: '', imageUrl: '' });
                  setActiveTab('manage_questions');
                }}
                className="absolute top-4 sm:top-8 right-4 sm:right-8 text-slate-500 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 font-bold bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 stroke-[2.5]" /> Cancel
              </button>
            )}
            <h2 className="text-2xl sm:text-3xl font-black mb-6 text-slate-800 dark:text-white tracking-tight mt-10 sm:mt-0">{editQuestionId ? 'Edit Question' : 'Create Question'}</h2>
            <form onSubmit={handleCreateQuestion} className="space-y-6 max-w-full lg:max-w-3xl">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Question Text</label>
                <textarea required value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm" rows="3" placeholder="Enter complete question text..." />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Options & Correct Answer</label>
                {[0, 1, 2, 3].map((idx) => (
                  <motion.div whileHover={{scale: 1.01}} key={idx} className={`flex items-center p-2 rounded-xl border-2 transition-all ${newQuestion.correctAnswerIndex === idx ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-sm' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                    <div className="pl-3 flex items-center h-full">
                      <input type="radio" name="correctAnswer" checked={newQuestion.correctAnswerIndex === idx} onChange={() => setNewQuestion({...newQuestion, correctAnswerIndex: idx})} className="w-5 h-5 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer" />
                    </div>
                    <input required type="text" value={newQuestion[`option${idx+1}`]} onChange={e => setNewQuestion({...newQuestion, [`option${idx+1}`]: e.target.value})} className="ml-3 flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium py-2.5 outline-none" placeholder={`Enter Option ${idx+1}`} />
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Subject</label>
                  <select value={newQuestion.subject} onChange={e => setNewQuestion({...newQuestion, subject: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm cursor-pointer">
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Chapter</label>
                  <input type="text" value={newQuestion.chapter} onChange={e => setNewQuestion({...newQuestion, chapter: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm" placeholder="e.g. Thermodynamics" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Image URL (optional)</label>
                <input type="text" value={newQuestion.imageUrl} onChange={e => setNewQuestion({...newQuestion, imageUrl: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Explanation (optional)</label>
                <textarea value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all font-medium shadow-sm" rows="3" placeholder="Provide explanation for the correct answer..." />
              </div>
              
              <button type="submit" disabled={createQuestionStatus.loading} className="w-full px-4 py-4 text-xl font-black text-white bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 transition-all disabled:transform-none mt-4">
                {createQuestionStatus.loading ? 'Saving...' : (editQuestionId ? 'Update Question' : 'Create Question')}
              </button>
              {createQuestionStatus.error && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 font-bold rounded-xl">{createQuestionStatus.error}</motion.div>}
              {createQuestionStatus.success && <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold rounded-xl">{createQuestionStatus.success}</motion.div>}
            </form>
          </div>
        );

      case 'users':
        return <AdminUsers />;
      case 'test_results':
        return <AdminResults />;
      case 'leaderboard':
        return <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm"><Leaderboard isAdmin={true} /></div>;

      // Other cases like create manual test can be added similarly
      default:
        return <div>Coming soon...</div>;
    }
  };

  const adminLinks = [
    { id: 'admin_home', icon: ChartBarIcon, label: 'Admin Home' },
    { id: 'upload', icon: ArrowUpTrayIcon, label: 'Bulk Upload' },
    { id: 'create_test', icon: DocumentPlusIcon, label: 'Create Test' },
    { id: 'create_question', icon: PencilSquareIcon, label: 'Create Question' },
    { id: 'manage_questions', icon: QueueListIcon, label: 'Manage Questions' },
    { id: 'manage_tests', icon: QueueListIcon, label: 'Manage Tests' },
    { id: 'users', icon: AcademicCapIcon, label: 'Users' },
    { id: 'test_results', icon: CheckCircleIcon, label: 'Test Results' },
    { id: 'leaderboard', icon: ChartBarIcon, label: 'Leaderboard' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 w-full">
      {/* Admin Header */}
      <header className="flex justify-between items-center h-16 px-4 md:px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">GK NEET MOCK</span>
          <span className="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full hidden sm:inline-block">Admin</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={logout} className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-800 dark:text-white">Logout</button>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-black dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 focus:outline-none">
            {isMobileMenuOpen ? <XMarkIcon className="w-7 h-7 stroke-[2.5]" /> : <Bars3Icon className="w-7 h-7 stroke-[2.5]" />}
          </button>
        </div>
      </header>

      {/* Mobile Admin Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xl absolute w-full top-16 left-0 z-50">
          <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-4rem)] custom-scrollbar">
            {adminLinks.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-colors ${
                  activeTab === item.id 
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
                    : 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.label}
              </button>
            ))}
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
            <button onClick={logout} className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold rounded-xl border-2 border-black text-black dark:border-white dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </button>
          </nav>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative bg-slate-100 dark:bg-slate-900">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 dark:bg-slate-950 border-r border-slate-800 hidden md:flex flex-col h-[calc(100vh-4rem)] overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.1)] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-indigo-500/5 pointer-events-none" />
          <div className="p-6 relative z-10">
            <h2 className="text-xl font-black text-white tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              Admin Panel
            </h2>
          </div>
          <nav className="px-3 space-y-1.5 flex-1 pb-6 relative z-10">
            {adminLinks.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 group ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? 'stroke-[2.5] text-cyan-400' : 'stroke-2'}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-4rem)] relative">
        <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05]" />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
        
        {/* Preview Modal */}
        {previewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Question Preview</h3>
                <button onClick={() => setPreviewQuestion(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex gap-2 mb-4 text-xs font-semibold">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">{previewQuestion.subject}</span>
                  {previewQuestion.chapter && <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded">{previewQuestion.chapter}</span>}
                </div>
                <p className="text-lg font-medium text-slate-900 dark:text-white mb-6 leading-relaxed">{previewQuestion.text}</p>
                {previewQuestion.imageUrl && <img src={previewQuestion.imageUrl} alt="Question Graphic" className="mb-6 rounded-lg max-h-64 object-contain" />}
                
                <div className="space-y-3 mb-6">
                  {previewQuestion.options.map((opt, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${idx === previewQuestion.correctAnswerIndex ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                      {idx === previewQuestion.correctAnswerIndex && <span className="mr-2">✓</span>} {opt}
                    </div>
                  ))}
                </div>
                
                {previewQuestion.explanation && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-6">
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-900 dark:text-blue-100">{previewQuestion.explanation}</p>
                  </div>
                )}

                {previewQuestion.usedInTests && previewQuestion.usedInTests.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-xl">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                      <span>📊</span> Usage History ({previewQuestion.usageCount} tests)
                    </p>
                    <ul className="space-y-1 pl-6 list-disc text-sm text-slate-600 dark:text-slate-400">
                      {previewQuestion.usedInTests.map((t, idx) => (
                        <li key={idx}>{t.testTitle} <span className="text-xs text-slate-400">({new Date(t.createdAt).toLocaleDateString()})</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
    </div>
  );
};

export default AdminDashboard;
