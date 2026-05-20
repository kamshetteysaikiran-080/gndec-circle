import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Search, Download, Filter, RefreshCw, Folder, ChevronDown, ChevronRight, Layers, MapPin, Calendar, Award, Compass, ShieldCheck } from 'lucide-react';
import AdminPanel from './AdminPanel'; 

// ========================================================
// CORRECTED ASSET IMPORTS (Matching your exact folder structure)
// ========================================================
import collegeLogo from './assets/logo.png';
import campusHero from './assets/hero.png';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
// ... any other import statements you have ...

// 👇 PASTE IT EXACTLY HERE (Outside the function)
const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
function App() {
  const [viewMode, setViewMode] = useState('student'); 
  const [activeTab, setActiveTab] = useState('notes'); 
  const [notes, setNotes] = useState([]);
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  const [expandedSubjects, setExpandedSubjects] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'notes') {
        let url = 'http://127.0.0.1:5000/api/notes'; 
        const params = [];
        if (selectedDept) params.push(`dept=${selectedDept}`);
        if (selectedSem) params.push(`sem=${selectedSem}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const res = await fetch(url);
        const json = await res.json();
        if (json.success) setNotes(json.data);
      } else {
        const res = await fetch('http://127.0.0.1:5000/api/circulars'); 
        const json = await res.json();
        if (json.success) setCirculars(json.data);
      }
    } catch (err) {
      console.error("Error connecting to backend server:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedDept, selectedSem]);

  const toggleSubject = (subjectCode) => {
    setExpandedSubjects(prev => ({ ...prev, [subjectCode]: !prev[subjectCode] }));
  };

  const getGroupedNotes = () => {
    const filtered = notes.filter(note => 
      note.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groups = {};
    filtered.forEach(note => {
      const code = note.subjectCode.toUpperCase().trim();
      if (!groups[code]) {
        groups[code] = {
          subjectName: note.subjectName,
          subjectCode: code,
          department: note.department,
          semester: note.semester,
          units: {}
        };
      }
      const unit = note.unitNumber || 1;
      if (!groups[code].units[unit]) groups[code].units[unit] = [];
      groups[code].units[unit].push(note);
    });
    return Object.values(groups);
  };

  if (viewMode === 'admin') {
    return <AdminPanel onBack={() => setViewMode('student')} />;
  }

  const groupedNotesResult = getGroupedNotes();
  const filteredCirculars = circulars.filter(circ => 
    circ.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    circ.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden bg-cover bg-center bg-no-repeat bg-fixed"
         style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96)), url(${campusHero})` }}>
      
      {/* BRANDED HEADER */}
      <header className="bg-slate-900/70 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {/* OFFICIAL EMBLEM CONTAINER */}
            <div className="bg-white p-1 rounded-xl shadow-md border border-slate-200 shrink-0">
              <img src={collegeLogo} alt="GNDEC Emblem" className="h-11 w-11 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white bg-clip-text">GNDEC CIRCLE</h1>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                <MapPin className="h-3 w-3 text-rose-500" />
                <span>Mailoor Road, Bidar</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewMode('admin')} 
              className="text-xs font-bold bg-slate-950/60 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Faculty Upload Panel
            </button>

            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => { setActiveTab('notes'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <BookOpen className="h-4 w-4" />
                Notes
              </button>
              <button 
                onClick={() => { setActiveTab('circulars'); setSearchQuery(''); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'circulars' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <FileText className="h-4 w-4" />
                Circulars
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* RE-DESIGNED INSTITUTIONAL HERO BOX */}
      <section className="max-w-5xl mx-auto px-4 pt-8">
        <div className="bg-gradient-to-r from-slate-900/80 via-indigo-950/20 to-slate-900/80 rounded-3xl p-6 md:p-8 border border-slate-800/80 backdrop-blur-md shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" /> NBA Accredited Programs
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                ★ NAAC A+ Grade
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Guru Nanak Dev <br />Engineering College, Bidar
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Official reference portal for the Departments of CSE, ECE, EEE, Civil and Mechanical Engineering. Affiliated to Visvesvaraya Technological University (VTU), Belagavi.
            </p>
          </div>
          
          {/* STATS TILES */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl min-w-[125px] text-center backdrop-blur-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Folders</p>
              <p className="text-3xl font-black text-indigo-400 mt-0.5">{groupedNotesResult.length}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl min-w-[125px] text-center backdrop-blur-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Official Notices</p>
              <p className="text-3xl font-black text-purple-400 mt-0.5">{circulars.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN DATA FEED GRID */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* FILTERS TOOLBAR */}
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/60 mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-xl backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder={activeTab === 'notes' ? "Search by subject name or catalog code..." : "Search board notifications..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          {activeTab === 'notes' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
                <Filter className="h-4 w-4 text-slate-500" />
                <select 
                  value={selectedDept} 
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="" className="bg-slate-950">All Branches</option>
                  <option value="CSE" className="bg-slate-950">CSE</option>
                  <option value="ECE" className="bg-slate-950">ECE</option>
                  <option value="EEE" className="bg-slate-950">EEE</option>
                  <option value="ME" className="bg-slate-950">Mechanical</option>
                  <option value="CIVIL" className="bg-slate-955">Civil</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-xl border border-slate-800">
                <select 
                  value={selectedSem} 
                  onChange={(e) => setSelectedSem(e.target.value)}
                  className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer font-medium"
                >
                  <option value="" className="bg-slate-950">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num} className="bg-slate-950">Semester {num}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* LOADING HANDLER */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
            <p className="text-slate-500 text-xs tracking-wider">Syncing secure campus repository...</p>
          </div>
        ) : (
          <>
            {/* GROUPED INTERACTIVE FOLDER ACCORDIONS */}
            {activeTab === 'notes' ? (
              groupedNotesResult.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-sm">No folders found matching criteria.</div>
              ) : (
                <div className="space-y-3.5">
                  {groupedNotesResult.map((subject) => {
                    const isOpen = !!expandedSubjects[subject.subjectCode];
                    return (
                      <div key={subject.subjectCode} className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden transition-all shadow-lg hover:border-slate-700/50">
                        
                        {/* ACCORDION TRIGGER ROW */}
                        <div 
                          onClick={() => toggleSubject(subject.subjectCode)}
                          className="p-4.5 flex justify-between items-center cursor-pointer hover:bg-slate-900/30 select-none transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-11 w-11 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                              <Folder className="h-5 w-5 fill-indigo-500/5" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm md:text-base font-bold text-slate-100 tracking-wide capitalize truncate">{subject.subjectName}</h3>
                              <p className="text-xs text-slate-400 font-medium mt-0.5 font-mono">
                                <span className="text-indigo-400 font-bold">{subject.subjectCode}</span> • {subject.department} • Semester {subject.semester}
                              </p>
                            </div>
                          </div>
                          <div className="text-slate-500 hover:text-slate-300 transition-colors pl-2">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                        </div>

                        {/* EXPANDED CONTENT LISTINGS */}
                        {isOpen && (
                          <div className="bg-slate-950/60 p-5 border-t border-slate-900/80 space-y-6">
                            {Object.keys(subject.units).sort().map((unitNum) => (
                              <div key={unitNum} className="space-y-2">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-1 bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-md w-max">
                                  <Layers className="h-3.5 w-3.5" /> Unit {unitNum}
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {subject.units[unitNum].map((note, index) => (
                                    <div key={note._id} className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl flex justify-between items-center gap-4 hover:border-indigo-500/30 transition-all group">
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-300 truncate group-hover:text-indigo-400 transition-colors">Study Material Bundle #{index + 1}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                                          <Calendar className="h-3 w-3" />
                                          <span>Uploaded: {new Date(note.uploadedAt).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</span>
                                        </p>
                                      </div>
                                      <a 
                                        href={note.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="h-8.5 px-3.5 bg-slate-950 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shadow cursor-pointer"
                                      >
                                        <Download className="h-3.5 w-3.5" />
                                        Get PDF
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* BULLETIN TIMELINE NOTICE ENTRIES */
              filteredCirculars.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-slate-500 text-sm">No office board announcements found.</div>
              ) : (
                <div className="space-y-3.5">
                  {filteredCirculars.map((circ) => (
                    <div key={circ._id} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700/60 transition-all">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 rounded-md text-[9px] font-black tracking-wider uppercase border ${
                            circ.category === 'Exam' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            circ.category === 'Academic' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            circ.category === 'Fee' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>{circ.category} Board</span>
                          <span className="text-[11px] text-slate-500 font-medium">Issued: {new Date(circ.publishedDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 leading-snug">{circ.title}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Compass className="h-3 w-3 text-indigo-400" />
                          <span>Scope Target: <span className="text-slate-300 font-semibold">{Array.isArray(circ.targetSemesters) ? circ.targetSemesters.join(', ') : circ.targetSemesters}</span></span>
                        </p>
                      </div>
                      <a 
                        href={circ.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-slate-950 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white px-4.5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap self-stretch sm:self-auto justify-center cursor-pointer shadow-md"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Open File
                      </a>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 pb-12 mt-12 text-center border-t border-slate-900 pt-6">
        <p className="text-xs text-slate-600 font-medium">Guru Nanak Dev Engineering College • Mailoor Road, Bidar, Karnataka 585403</p>
        <p className="text-[11px] text-slate-700 mt-1 font-mono">GNDEC Circle Academic Engine v2.5</p>
      </footer>

    </div>
  );
}

export default App;