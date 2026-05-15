import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, DocumentPlusIcon, ArrowUpTrayIcon, 
  QueueListIcon, AcademicCapIcon, TrashIcon, 
  PencilSquareIcon, CheckCircleIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon 
} from '@heroicons/react/24/outline';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminResults from '../../components/admin/AdminResults';
import Leaderboard from '../../components/Leaderboard';
import { BASE_URL } from '../../config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('admin_home');
  const [stats, setStats] = useState({ totalQuestions: 0, totalTests: 0, publishedTests: 0 });
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null, success: null });
  const [newTest, setNewTest] = useState({ title: '', description: '', duration: 180, totalMarks: 720, published: false, type: 'Custom Test' });
  const [newTestQuestions, setNewTestQuestions] = useState('');
  const [createTestStatus, setCreateTestStatus] = useState({ loading: false, error: null, success: null });
  const [previewData, setPreviewData] = useState(null);

  // Question browsing & selection states
  const [qSearch, setQSearch] = useState('');
  const [qSubject, setQSubject] = useState('');
  const [qDifficulty, setQDifficulty] = useState('');
  const [qUsageStatus, setQUsageStatus] = useState('');
  const [qPage, setQPage] = useState(1);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [allowRepeated, setAllowRepeated] = useState(true);
  const [newQuestion, setNewQuestion] = useState({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswerIndex: 0, subject: 'Physics', chapter: '', difficulty: 'medium', explanation: '', imageUrl: '' });
  const [createQuestionStatus, setCreateQuestionStatus] = useState({ loading: false, error: null, success: null });


  useEffect(() => {
    fetchStats();
    if (activeTab === 'manage_tests' || activeTab === 'published_tests') fetchTests();
    if (activeTab === 'manage_questions' || activeTab === 'create_test') fetchQuestions();
  }, [activeTab, qPage, qSearch, qSubject, qDifficulty, qUsageStatus]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/admin/stats`, {
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
      const res = await fetch(`${BASE_URL}/tests`, {
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
      if (qDifficulty) query.append('difficulty', qDifficulty);
      if (qUsageStatus) query.append('usageStatus', qUsageStatus);

      const res = await fetch(`${BASE_URL}/questions?${query.toString()}`, {
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
      const res = await fetch(`${BASE_URL}/admin/upload-questions`, {
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
      const res = await fetch(`${BASE_URL}/admin/upload-questions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setUploadStatus({ loading: false, error: null, success: data.message });
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
      await fetch(`${BASE_URL}/tests/${id}`, {
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
      await fetch(`${BASE_URL}/tests/${id}`, { 
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
      await fetch(`${BASE_URL}/questions/${id}`, { 
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
      
      const res = await fetch(`${BASE_URL}/tests`, {
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
      setNewTest({ title: '', description: '', duration: 180, totalMarks: 720, published: false, type: 'Custom Test' });
      setSelectedQuestions([]);
      fetchStats();
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
        difficulty: newQuestion.difficulty,
        explanation: newQuestion.explanation,
        imageUrl: newQuestion.imageUrl
      };

      const res = await fetch(`${BASE_URL}/questions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create question');
      
      setCreateQuestionStatus({ loading: false, error: null, success: 'Question created successfully!' });
      setNewQuestion({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswerIndex: 0, subject: 'Physics', chapter: '', difficulty: 'medium', explanation: '', imageUrl: '' });
      fetchStats();
    } catch (err) {
      setCreateQuestionStatus({ loading: false, error: err.message, success: null });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'admin_home':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Admin Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Total Users</h3>
                <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Total Tests</h3>
                <p className="text-4xl font-bold text-emerald-600 mt-2">{stats.totalTests}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Total Questions</h3>
                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalQuestions}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Total Attempts</h3>
                <p className="text-4xl font-bold text-purple-600 mt-2">{stats.totalAttempts}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">Avg Score</h3>
                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.averageScore}</p>
              </div>
            </div>
          </div>
        );
      
      case 'upload':
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Bulk Upload Questions</h2>
            <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              <p>Supported formats: .csv, .xlsx</p>
              <p>Required columns: questionText, option1, option2, option3, option4, correctAnswer, subject</p>
              <p>correctAnswer format: 0 for option1, 1 for option2, 2 for option3, 3 for option4</p>
            </div>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-700 hover:bg-slate-100 border-slate-300 dark:border-slate-600">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ArrowUpTrayIcon className="w-10 h-10 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">CSV or Excel (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept=".csv, .xlsx, .xls" onChange={(e) => setUploadFile(e.target.files[0])} />
                </label>
              </div>
              {uploadFile && <p className="text-sm text-slate-600 dark:text-slate-300">Selected file: {uploadFile.name}</p>}
              <button 
                type="submit" 
                disabled={uploadStatus.loading || !uploadFile}
                className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {uploadStatus.loading ? 'Parsing...' : 'Preview Upload'}
              </button>
            </form>
            
            {uploadStatus.error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{uploadStatus.error}</div>}
            {uploadStatus.success && <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">{uploadStatus.success}</div>}

            {previewData && (
              <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Upload Preview</h3>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl mb-4">
                  <table className="min-w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Row</th>
                        <th className="px-4 py-3 font-semibold">Question</th>
                        <th className="px-4 py-3 font-semibold">Subject</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
                      {previewData.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className={row.status === 'Error' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                          <td className="px-4 py-3 text-slate-500">{row.rowNum}</td>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={row.question}>{row.question}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs">{row.subject}</span>
                          </td>
                          <td className="px-4 py-3">
                            {row.status === 'Error' ? (
                              <span className="text-red-600 font-semibold" title={row.reason}>❌ {row.reason}</span>
                            ) : (
                              <span className="text-emerald-600 font-semibold">✅ Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 50 && (
                    <div className="p-3 text-center text-slate-500 text-sm bg-slate-50 dark:bg-slate-900/50">Showing first 50 rows of {previewData.length}</div>
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {tests.map(test => (
                  <tr key={test._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{test.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{test.duration} mins</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {test.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                      <button onClick={() => toggleTestPublish(test._id, test.published)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">
                        {test.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => deleteTest(test._id)} className="text-red-600 hover:text-red-900 dark:text-red-400">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'manage_questions':
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Questions</h2>
              <span className="text-sm font-medium text-slate-500">Total: {stats.totalQuestions}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="col-span-2 relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Search questions or chapters..." value={qSearch} onChange={e => setQSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
              </div>
              <select value={qSubject} onChange={e => setQSubject(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                <option value="">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Botany">Botany</option>
                <option value="Zoology">Zoology</option>
              </select>
              <select value={qDifficulty} onChange={e => setQDifficulty(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select value={qUsageStatus} onChange={e => setQUsageStatus(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                <option value="">All Statuses</option>
                <option value="fresh">Fresh Questions</option>
                <option value="used">Used Questions</option>
                <option value="frequent">Frequently Used</option>
              </select>
            </div>

            <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  {questions.map(q => (
                    <tr key={q._id}>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white max-w-md">
                        <div className="line-clamp-2">{q.text}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded text-xs">{q.subject}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded text-xs">{q.difficulty}</span>
                          {q.usageCount === 0 ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">🟢 Fresh</span>
                          ) : q.usageCount > 2 ? (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-semibold">🔴 Frequent ({q.usageCount}x)</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">🟡 Used {q.usageCount}x</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                        <button onClick={() => setPreviewQuestion(q)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400" title="Preview"><EyeIcon className="w-5 h-5"/></button>
                        <button onClick={() => alert('Edit question coming soon!')} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400" title="Edit"><PencilSquareIcon className="w-5 h-5"/></button>
                        <button onClick={() => deleteQuestion(q._id)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-slate-500">No questions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button type="button" disabled={qPage === 1} onClick={() => setQPage(p => p - 1)} className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 text-sm font-medium bg-white dark:bg-slate-800">Previous</button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Page {qPage} of {qTotalPages}</span>
              <button type="button" disabled={qPage === qTotalPages} onClick={() => setQPage(p => p + 1)} className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 text-sm font-medium bg-white dark:bg-slate-800">Next</button>
            </div>
          </div>
        );

      case 'create_test':
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Create Manual Test</h2>
            <form onSubmit={handleCreateTest} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Test Type</label>
                <select value={newTest.type} onChange={e => setNewTest({...newTest, type: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                  <option value="Full NEET Mock">Full NEET Mock</option>
                  <option value="Physics Test">Physics Test</option>
                  <option value="Chemistry Test">Chemistry Test</option>
                  <option value="Biology Test">Biology Test</option>
                  <option value="Chapter Test">Chapter Test</option>
                  <option value="Custom Test">Custom Test</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input required type="text" value={newTest.title} onChange={e => setNewTest({...newTest, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" placeholder="e.g. NEET Full Mock Test 2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea required value={newTest.description} onChange={e => setNewTest({...newTest, description: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" rows="3" placeholder="Test description..." />
              </div>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Calculated Duration</label>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{newTest.type === 'Full NEET Mock' ? '180' : newTest.duration} mins</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Calculated Total Marks</label>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{selectedQuestions.length * 4}</p>
                </div>
              </div>
              
              <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Select Questions</h3>
                  <div className="flex space-x-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Physics: {selectedQuestions.filter(q => q.subject === 'Physics').length} / 45</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">Chemistry: {selectedQuestions.filter(q => q.subject === 'Chemistry').length} / 45</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">Biology: {selectedQuestions.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length} / 90</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold">Total: {selectedQuestions.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="col-span-2 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Search questions or chapters..." value={qSearch} onChange={e => setQSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                  </div>
                  <select value={qSubject} onChange={e => setQSubject(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    <option value="">All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                  </select>
                  <select value={qDifficulty} onChange={e => setQDifficulty(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <select value={qUsageStatus} onChange={e => setQUsageStatus(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    <option value="">All Statuses</option>
                    <option value="fresh">Fresh Questions Only</option>
                    <option value="used">Used Questions</option>
                  </select>
                </div>
                
                <div className="flex justify-end mb-4">
                  <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={allowRepeated} onChange={(e) => setAllowRepeated(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                    <span>Allow selecting previously used questions</span>
                  </label>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {questions.map(q => {
                    const isSelected = selectedQuestions.some(sq => sq._id === q._id);
                    const isUsed = q.usageCount > 0;
                    const disabledCheckbox = !allowRepeated && isUsed;
                    return (
                      <div key={q._id} className={`flex items-start p-4 rounded-xl border transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'} ${disabledCheckbox ? 'opacity-60 bg-slate-50' : ''}`}>
                        <input type="checkbox" disabled={disabledCheckbox} checked={isSelected} onChange={(e) => {
                          if (e.target.checked) setSelectedQuestions([...selectedQuestions, q]);
                          else setSelectedQuestions(selectedQuestions.filter(sq => sq._id !== q._id));
                        }} className="mt-1 w-5 h-5 text-indigo-600 rounded border-slate-300 cursor-pointer disabled:cursor-not-allowed" />
                        <div className="ml-4 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{q.text}</p>
                          <div className="flex gap-2 mt-2 text-xs items-center flex-wrap">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">{q.subject}</span>
                            {q.chapter && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded truncate max-w-[150px]">{q.chapter}</span>}
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded uppercase">{q.difficulty}</span>
                            {isUsed ? (
                                <span className={`px-2 py-1 rounded font-semibold ${q.usageCount > 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {q.usageCount > 2 ? `🔴 Frequent (${q.usageCount}x)` : `🟡 Used ${q.usageCount}x`}
                                </span>
                            ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">🟢 Fresh</span>
                            )}
                          </div>
                        </div>
                        <button type="button" onClick={() => setPreviewQuestion(q)} className="ml-4 p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button type="button" disabled={qPage === 1} onClick={() => setQPage(p => p - 1)} className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 text-sm font-medium bg-white dark:bg-slate-800">Previous</button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Page {qPage} of {qTotalPages}</span>
                  <button type="button" disabled={qPage === qTotalPages} onClick={() => setQPage(p => p + 1)} className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 text-sm font-medium bg-white dark:bg-slate-800">Next</button>
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

              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="published" checked={newTest.published} onChange={e => setNewTest({...newTest, published: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                <label htmlFor="published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Publish immediately</label>
              </div>

              {newTest.type === 'Full NEET Mock' && (selectedQuestions.filter(q => q.subject === 'Physics').length !== 45 || selectedQuestions.filter(q => q.subject === 'Chemistry').length !== 45 || selectedQuestions.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length !== 90) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl mt-4 text-sm text-red-800 font-medium">
                  Full NEET Mock requires exactly 45 Physics, 45 Chemistry, and 90 Biology questions.
                </div>
              )}

              <button 
                type="submit" 
                disabled={createTestStatus.loading || (newTest.type === 'Full NEET Mock' && (selectedQuestions.filter(q => q.subject === 'Physics').length !== 45 || selectedQuestions.filter(q => q.subject === 'Chemistry').length !== 45 || selectedQuestions.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length !== 90))} 
                className="w-full px-4 py-3 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-indigo-600/30"
              >
                {createTestStatus.loading ? 'Creating...' : 'Create Test'}
              </button>
              {createTestStatus.error && <div className="p-4 mt-4 bg-red-100 text-red-700 rounded-lg">{createTestStatus.error}</div>}
              {createTestStatus.success && <div className="p-4 mt-4 bg-green-100 text-green-700 rounded-lg">{createTestStatus.success}</div>}
            </form>
          </div>
        );

      case 'create_question':
        return (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Create Manual Question</h2>
            <form onSubmit={handleCreateQuestion} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Question Text</label>
                <textarea required value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" rows="3" placeholder="Enter question..." />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Options & Correct Answer</label>
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className={`flex items-center p-3 rounded-lg border ${newQuestion.correctAnswerIndex === idx ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 dark:border-slate-600'}`}>
                    <input type="radio" name="correctAnswer" checked={newQuestion.correctAnswerIndex === idx} onChange={() => setNewQuestion({...newQuestion, correctAnswerIndex: idx})} className="w-5 h-5 text-green-600" />
                    <input required type="text" value={newQuestion[`option${idx+1}`]} onChange={e => setNewQuestion({...newQuestion, [`option${idx+1}`]: e.target.value})} className="ml-4 flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white" placeholder={`Option ${idx+1}`} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select value={newQuestion.subject} onChange={e => setNewQuestion({...newQuestion, subject: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Botany">Botany</option>
                    <option value="Zoology">Zoology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
                  <select value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chapter</label>
                  <input type="text" value={newQuestion.chapter} onChange={e => setNewQuestion({...newQuestion, chapter: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" placeholder="e.g. Thermodynamics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL (optional)</label>
                  <input type="text" value={newQuestion.imageUrl} onChange={e => setNewQuestion({...newQuestion, imageUrl: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Explanation (optional)</label>
                <textarea value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" rows="3" placeholder="Explanation for correct answer..." />
              </div>
              
              <button type="submit" disabled={createQuestionStatus.loading} className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-md">
                {createQuestionStatus.loading ? 'Creating...' : 'Create Question'}
              </button>
              {createQuestionStatus.error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{createQuestionStatus.error}</div>}
              {createQuestionStatus.success && <div className="p-4 bg-green-100 text-green-700 rounded-lg">{createQuestionStatus.success}</div>}
            </form>
          </div>
        );

      case 'users':
        return <AdminUsers BASE_URL={BASE_URL} />;
      case 'test_results':
        return <AdminResults BASE_URL={BASE_URL} />;
      case 'leaderboard':
        return <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm"><Leaderboard BASE_URL={BASE_URL} /></div>;

      // Other cases like create manual test can be added similarly
      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {[
            { id: 'admin_home', icon: ChartBarIcon, label: 'Admin Home' },
            { id: 'upload', icon: ArrowUpTrayIcon, label: 'Bulk Upload' },
            { id: 'create_test', icon: DocumentPlusIcon, label: 'Create Test' },
            { id: 'create_question', icon: PencilSquareIcon, label: 'Create Question' },
            { id: 'manage_questions', icon: QueueListIcon, label: 'Manage Questions' },
            { id: 'manage_tests', icon: QueueListIcon, label: 'Manage Tests' },
            { id: 'users', icon: AcademicCapIcon, label: 'Users' },
            { id: 'test_results', icon: CheckCircleIcon, label: 'Test Results' },
            { id: 'leaderboard', icon: ChartBarIcon, label: 'Leaderboard' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' 
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
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
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded uppercase">{previewQuestion.difficulty}</span>
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
  );
};

export default AdminDashboard;
