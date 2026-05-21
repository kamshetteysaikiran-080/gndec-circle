import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft, CheckCircle2, AlertCircle, Trash2, BookOpen, FileText, RefreshCw, KeyRound } from 'lucide-react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

function AdminPanel({ onBack }) {
  const [facultyKey, setFacultyKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [uploadType, setUploadType] = useState('note'); 
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const [liveNotes, setLiveNotes] = useState([]);
  const [liveCirculars, setLiveCirculars] = useState([]);
  const [fetchingRepo, setFetchingRepo] = useState(false);

  const [noteForm, setNoteForm] = useState({
    subjectName: '', subjectCode: '', department: 'CSE', semester: '1', unitNumber: '1', pdf: null
  });

  const [circularForm, setCircularForm] = useState({
    title: '', category: 'General', targetSemesters: 'All', pdf: null
  });

  const fetchAdminRepository = async () => {
    setFetchingRepo(true);
    try {
      const notesRes = await fetch(`${baseUrl}/api/notes`);
      const notesJson = await notesRes.json();
      if (notesJson.success) setLiveNotes(notesJson.data);

      const circsRes = await fetch(`${baseUrl}/api/circulars`);
      const circsJson = await circsRes.json();
      if (circsJson.success) setLiveCirculars(circsJson.data);
    } catch (err) {
      console.error("Failed to load admin repository data:", err);
    } finally { 
      setFetchingRepo(false); 
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAdminRepository();
    }
  }, [isAuthorized]);

 const handleKeyVerification = (e) => {
    e.preventDefault();
    if (facultyKey.trim() === "") {
      setStatus({ type: 'error', message: 'Passcode cannot be blank.' });
      return;
    }
    // Updated verification token to match your new passcode
    if (facultyKey !== "23CS080") {
      setStatus({ type: 'error', message: 'Invalid institutional access key.' });
      return;
    }
    setIsAuthorized(true);
    setStatus({ type: '', message: '' });
  };

  const handleFileChange = (e) => {
    if (uploadType === 'note') {
      setNoteForm({ ...noteForm, pdf: e.target.files[0] });
    } else {
      setCircularForm({ ...circularForm, pdf: e.target.files[0] });
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete this ${type}?`)) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-key': facultyKey
        }
      });
      const result = await response.json();

      if (result.success || response.ok) {
        setStatus({ type: 'success', message: `Asset deleted successfully.` });
        fetchAdminRepository();
      } else {
        setStatus({ type: 'error', message: result.error || 'Purge rejected.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Delete pipeline blocked by gateway authority.' });
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    let endpoint = '';
    
    // Clean trailing slashes dynamically to avoid routing bugs
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    if (uploadType === 'note') {
      if (!noteForm.pdf) { setStatus({ type: 'error', message: 'Select a PDF file.' }); setLoading(false); return; }
      formData.append('subjectName', noteForm.subjectName);
      formData.append('subjectCode', noteForm.subjectCode);
      formData.append('department', noteForm.department);
      formData.append('semester', noteForm.semester);
      formData.append('unitNumber', noteForm.unitNumber);
      formData.append('pdf', noteForm.pdf);
      endpoint = `${cleanBaseUrl}/api/note`;
    } else {
      if (!circularForm.pdf) { setStatus({ type: 'error', message: 'Select a PDF file.' }); setLoading(false); return; }
      formData.append('title', circularForm.title);
      formData.append('category', circularForm.category);
      formData.append('targetSemesters', circularForm.targetSemesters);
      formData.append('pdf', circularForm.pdf);
      endpoint = `${cleanBaseUrl}/api/circular`;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'x-auth-key': facultyKey
          // NOTE: Do NOT set Content-Type here! The browser must set boundary markers for multipart files.
        }
      });
      const result = await response.json();

      if (result.success || response.ok) {
        setStatus({ type: 'success', message: 'Resource published and synced successfully!' });
        if (uploadType === 'note') setNoteForm({ ...noteForm, subjectName: '', subjectCode: '', pdf: null });
        else setCircularForm({ ...circularForm, title: '', pdf: null });
        fetchAdminRepository();
      } else {
        setStatus({ type: 'error', message: result.error || 'The backend engine rejected this payload.' });
      }
    } catch (err) {
      console.error("Transmission error details:", err);
      setStatus({ type: 'error', message: 'Network breakdown. Check authority state structures.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600/10 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-4">
              <KeyRound className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Faculty Authorization Gate</h2>
            <p className="mt-2 text-sm text-slate-400">Please enter your institutional access key to drop academic materials.</p>
          </div>

          {status.message && (
            <div className="p-4 rounded-xl flex items-start gap-3 border bg-rose-500/10 text-rose-400 border-rose-500/20">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleKeyVerification} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">GNDEC Secret Token</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••••••••••" 
                value={facultyKey}
                onChange={(e) => setFacultyKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm text-center tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onBack}
                className="w-1/3 border border-slate-700 text-slate-300 hover:bg-slate-750 font-semibold py-2.5 rounded-xl transition-all text-sm cursor-pointer"
              >
                Go Back
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg text-sm cursor-pointer"
              >
                Unlock Management
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6 group cursor-pointer">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Student Dashboard
        </button>

        <div className="bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl mb-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Faculty Management Console</h2>
            <p className="text-sm text-slate-400">Deploy clean academic study assets and office notices to the GNDEC network.</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700/60 mb-8 max-w-md">
            <button 
              type="button"
              onClick={() => { setUploadType('note'); setStatus({ type: '', message: '' }); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${uploadType === 'note' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Upload Class Notes
            </button>
            <button 
              type="button"
              onClick={() => { setUploadType('circular'); setStatus({ type: '', message: '' }); }}
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${uploadType === 'circular' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Issue Circular
            </button>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl flex items-start gap-3 border mb-6 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {uploadType === 'note' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Subject Name</label>
                  <input type="text" required placeholder="e.g., Object Oriented Programming" value={noteForm.subjectName} onChange={(e) => setNoteForm({...noteForm, subjectName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Subject Code</label>
                  <input type="text" required placeholder="e.g., BCS-302" value={noteForm.subjectCode} onChange={(e) => setNoteForm({...noteForm, subjectCode: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Department Scale</label>
                  <select value={noteForm.department} onChange={(e) => setNoteForm({...noteForm, department: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer text-sm">
                    <option value="CSE">CSE</option><option value="ECE">ECE</option><option value="EEE">EEE</option><option value="ME">Mechanical</option><option value="CIVIL">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Target Semester</label>
                  <select value={noteForm.semester} onChange={(e) => setNoteForm({...noteForm, semester: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer text-sm">
                    {[1,2,3,4,5,6,7,8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Unit Target</label>
                  <select value={noteForm.unitNumber} onChange={(e) => setNoteForm({...noteForm, unitNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer text-sm">
                    {[1,2,3,4,5].map(num => <option key={num} value={num}>Unit {num}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Notice Title Header</label>
                  <input type="text" required placeholder="e.g., Nov/Dec End Semester Practical Dates" value={circularForm.title} onChange={(e) => setCircularForm({...circularForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Circular Classification</label>
                    <select value={circularForm.category} onChange={(e) => setCircularForm({...circularForm, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer text-sm">
                      <option value="General">General Notice</option><option value="Exam">Exam Branch</option><option value="Academic">Academic Affairs</option><option value="Fee">Accounts & Fees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Scope Scope (Semesters split via comma)</label>
                    <input type="text" placeholder="e.g., All or 3, 5, 7" value={circularForm.targetSemesters} onChange={(e) => setCircularForm({...circularForm, targetSemesters: e.target.value})} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Attach Document File (PDF Only)</label>
              <div className="relative border border-dashed border-slate-600 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-900/40 cursor-pointer group">
                <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
                <p className="text-sm font-semibold text-slate-200">
                  {uploadType === 'note' ? (noteForm.pdf ? noteForm.pdf.name : 'Select or drop notes document') : (circularForm.pdf ? circularForm.pdf.name : 'Select or drop official circular')}
                </p>
                <p className="text-xs text-slate-500 mt-1">Maximum recommended file payload limit: 10MB</p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 border-2 border-slate-300 border-t-white rounded-full animate-spin"></div>
                  <span>Uploading to Cloud Infrastructure...</span>
                </>
              ) : (
                <span>Publish Resource Document</span>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white">Active Portal Repository</h3>
              <p className="text-xs text-slate-400 mt-0.5">Wipe outdated assets immediately from database and cloud buckets.</p>
            </div>
            {fetchingRepo && <RefreshCw className="h-4 w-4 text-indigo-400 animate-spin" />}
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> Published Study Notes ({liveNotes.length})
              </h4>
              {liveNotes.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">No database notes found.</p>
              ) : (
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 divide-y divide-slate-800">
                  {liveNotes.map((note) => (
                    <div key={note._id} className="p-3.5 flex justify-between items-center gap-4 hover:bg-slate-850 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{note.subjectName}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{note.subjectCode} • Sem {note.semester} • Unit {note.unitNumber}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(note._id, 'note')}
                        className="p-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all group cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-indigo-400" /> Issued Office Notices ({liveCirculars.length})
              </h4>
              {liveCirculars.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">No institutional circular records found.</p>
              ) : (
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60 divide-y divide-slate-800">
                  {liveCirculars.map((circ) => (
                    <div key={circ._id} className="p-3.5 flex justify-between items-center gap-4 hover:bg-slate-850 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{circ.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Scope: {Array.isArray(circ.targetSemesters) ? circ.targetSemesters.join(', ') : circ.targetSemesters} • Type: {circ.category}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(circ._id, 'circular')}
                        className="p-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all group cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminPanel;