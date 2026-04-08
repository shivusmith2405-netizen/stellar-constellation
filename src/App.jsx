import { useState, useMemo, useEffect } from 'react';
import { Search, Map, Loader2, Sparkles, Filter, Rocket, GitCommit, Calendar } from 'lucide-react';
import Login from './Login';

const Starfield = () => {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const generated = Array.from({ length: 150 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      glow: Math.random() * 8 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 2
    }));
    setStars(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-1000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px] mix-blend-screen"></div>
      <div className="absolute -inset-[50%] opacity-40 animate-[spin_240s_linear_infinite]">
        {stars.map((s, i) => (
          <div key={i} className="absolute rounded-full bg-slate-800" 
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animation: `pulse ${s.duration}s infinite cubic-bezier(0.4, 0, 0.6, 1) ${s.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [commitData, setCommitData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [hoveredCommit, setHoveredCommit] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Summarize the impact of this code change.');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getCategory = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.startsWith('feat') || lower.startsWith('added') || lower.startsWith('new') || lower.includes('implement')) return 'Feature';
    if (lower.startsWith('fix') || lower.startsWith('bug') || lower.startsWith('resolve') || lower.includes('hotfix')) return 'Bug Fix';
    if (lower.startsWith('docs') || lower.includes('readme')) return 'Documentation';
    if (lower.startsWith('chore') || lower.startsWith('refactor') || lower.startsWith('update') || lower.startsWith('clean') || lower.startsWith('style')) return 'Maintenance';
    return 'Unknown';
  };

  const getColorClasses = (category) => {
    switch(category) {
      case 'Feature': return { text: 'text-emerald-700', stroke: 'stroke-emerald-600', bgBorder: 'bg-emerald-500/20 border-emerald-600/40' };
      case 'Bug Fix': return { text: 'text-rose-700', stroke: 'stroke-rose-600', bgBorder: 'bg-rose-500/20 border-rose-600/40' };
      case 'Documentation': return { text: 'text-blue-700', stroke: 'stroke-blue-600', bgBorder: 'bg-blue-500/20 border-blue-600/40' };
      case 'Maintenance': return { text: 'text-amber-800', stroke: 'stroke-amber-600', bgBorder: 'bg-amber-500/20 border-amber-600/40' };
      default: return { text: 'text-slate-800', stroke: 'stroke-slate-600', bgBorder: 'bg-slate-500/20 border-slate-600/40' };
    }
  };

  const fetchCommits = async () => {
    if (!repoUrl.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      let owner, repo;
      let input = repoUrl.trim();
      
      if (input.startsWith('http://') || input.startsWith('https://')) {
        try {
          const url = new URL(input);
          const pathParts = url.pathname.split('/').filter(Boolean);
          if (pathParts.length >= 2) {
            owner = pathParts[0];
            repo = pathParts[1].replace('.git', '');
          } else throw new Error('Invalid GitHub URL');
        } catch(e) {
          throw new Error('Please enter a valid GitHub URL or owner/repo format');
        }
      } else {
        const parts = input.split('/');
        if (parts.length !== 2) throw new Error('Valid format: owner/repo or full GitHub URL');
        owner = parts[0];
        repo = parts[1];
      }
      
      const headers = {};
      if (apiToken.trim()) {
        headers['Authorization'] = `token ${apiToken.trim()}`;
      }

      const [commitsRes, tagsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`, { headers }),
        fetch(`https://api.github.com/repos/${owner}/${repo}/tags`, { headers })
      ]);
      
      if (!commitsRes.ok) {
        if (commitsRes.status === 404) throw new Error('Repository not found. Check the URL or owner/repo spelling.');
        else if (commitsRes.status === 403) throw new Error('API rate limit exceeded. Please authenticate your API requests or try again later.');
        else throw new Error(`Failed to fetch commits: ${commitsRes.statusText}`);
      }

      const commitsData = await commitsRes.json();
      let tagsData = [];
      if (tagsRes.ok) tagsData = await tagsRes.json();

      const tagMap = {};
      tagsData.forEach(tag => { tagMap[tag.commit.sha] = tag.name; });

      const summarize = (msg) => {
        let firstLine = msg.split('\n')[0];
        if (firstLine.startsWith('Merge pull request')) {
           const mergeMatch = msg.match(/Merge pull request #\d+ from [^\n]*\n\n(.*)/);
           firstLine = mergeMatch && mergeMatch[1] ? mergeMatch[1].split('\n')[0] : 'Merged Branch';
        }
        firstLine = firstLine.replace(/^(feat|fix|chore|docs|refactor|test|style)(\([^)]+\))?:\s*/i, '');
        if (firstLine.length > 0) firstLine = firstLine.charAt(0).toUpperCase() + firstLine.slice(1);
        if (firstLine.length > 60) firstLine = firstLine.substring(0, 57) + '...';
        return firstLine;
      };

      let currentVersion = "Latest (Unassigned)";
      const processedCommits = commitsData.map(c => {
        if (tagMap[c.sha]) currentVersion = tagMap[c.sha];
        else {
           const versionMatch = c.commit.message.match(/(v\d+\.\d+\.\d+)/);
           if (versionMatch) currentVersion = versionMatch[1];
        }
        return { 
          ...c, 
          versionGroup: currentVersion, 
          summarizedMessage: summarize(c.commit.message),
          category: getCategory(c.commit.message)
        };
      });

      setCommitData(processedCommits);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') fetchCommits();
  };

  const handleAiSummarize = () => {
    setIsAiLoading(true);
    setAiResponse('');
    setTimeout(() => {
        setAiResponse(`>> AI Evaluation (${selectedCommit.sha.substring(0,7)}): Analyzing the isolated code structure, this commit introduced critical changes focused on '${selectedCommit.summarizedMessage}'. Recognized category: [${selectedCommit.category}]. No breaking syntax issues detected in diff sequence.\n\n[System Note: This responds interactively to your custom prompt '${aiPrompt}' inside the UI terminal simulation.]`);
        setIsAiLoading(false);
    }, 1800);
  };

  const timelineCommits = useMemo(() => {
    const arr = [...commitData];
    arr.reverse(); 
    
    if (!searchQuery) return arr;
    const lowerQuery = searchQuery.toLowerCase();
    return arr.filter(c => 
      c.commit.message.toLowerCase().includes(lowerQuery) || 
      c.summarizedMessage.toLowerCase().includes(lowerQuery) ||
      c.versionGroup.toLowerCase().includes(lowerQuery) ||
      c.category.toLowerCase().includes(lowerQuery) ||
      new Date(c.commit.author.date).toLocaleDateString().includes(lowerQuery)
    );
  }, [commitData, searchQuery]);

  const versionBoundaries = useMemo(() => {
    const boundaries = [];
    let lastVer = null;
    timelineCommits.forEach((commit, i) => {
      if (commit.versionGroup !== lastVer) {
        const fractionX = timelineCommits.length > 1 ? i / (timelineCommits.length - 1) : 0;
        const x = 100 + fractionX * 800;
        boundaries.push({ version: commit.versionGroup, x });
        lastVer = commit.versionGroup;
      }
    });
    return boundaries;
  }, [timelineCommits]);

  if (!isAuthenticated) {
     return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  if (commitData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#fef9c3] px-4 relative overflow-hidden text-slate-900">
        <Starfield />

        <div className="relative z-10 w-full max-w-2xl p-10 rounded-[3rem] bg-white/40 backdrop-blur-2xl border border-amber-600/20 shadow-[0_0_80px_rgba(245,158,11,0.25)] transition-transform duration-700 hover:scale-[1.01] hover:shadow-[0_0_120px_rgba(245,158,11,0.35)]">
          
          <div className="flex flex-col items-center">
            
            <div className="w-24 h-24 mb-8 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] border border-white/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/30 mix-blend-overlay rotate-45 transform scale-[2] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              <Rocket className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-amber-700 tracking-tight mb-3 text-center drop-shadow-sm">
              PROJECT NEBULA
            </h1>
            <p className="text-slate-800 text-xl text-center mb-12 font-medium tracking-wide">
              Stellar Constellation Code Mapper
            </p>

            <div className="w-full relative flex items-center mb-6 max-w-lg mx-auto">
              <div className="absolute left-5 text-amber-700">
                <Search className="w-6 h-6" />
              </div>
              <input 
                type="text" 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://github.com/owner/repo" 
                className="w-full py-5 pl-14 pr-6 bg-white/70 border border-amber-500/40 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-600 transition-all text-lg shadow-inner font-mono"
              />
            </div>

            <div className="w-full relative flex items-center mb-6 max-w-lg mx-auto">
              <input 
                type="password" 
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Optional: GitHub PAT (Bypass Rate Limits)" 
                className="w-full py-3 px-5 bg-white/50 border border-amber-500/30 rounded-xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-600 transition-all text-sm font-mono shadow-inner text-center"
              />
            </div>

            {error && (
              <div className="w-full max-w-lg mb-6 p-4 rounded-xl bg-rose-100 border border-rose-500/30 text-rose-800 text-center text-sm font-medium animate-pulse">
                {error}
              </div>
            )}

            <button 
              onClick={fetchCommits}
              disabled={isLoading || !repoUrl.trim()}
              className="w-full max-w-lg relative group overflow-hidden rounded-2xl py-5 flex items-center justify-center font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] border border-amber-500/50"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] animate-[gradient-x_3s_linear_infinite]"></div>
              <span className="relative z-10 flex items-center gap-3 text-lg tracking-wide">
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Initializing Thrusters...
                  </>
                ) : (
                  <>
                    <Map className="w-6 h-6" />
                    Commence Scanning
                  </>
                )}
              </span>
            </button>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f59e0b] via-[#fcd34d] to-[#fef9c3] text-slate-900 p-8 relative overflow-hidden">
      <Starfield />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 bg-white/40 p-6 rounded-3xl border border-amber-600/10 backdrop-blur-md shadow-lg">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Map className="w-8 h-8 text-amber-700" />
              Nebula: {repoUrl.split('/').pop()}
            </h2>
            <p className="text-slate-800 mt-2 font-medium">Displaying chronological branch history across {commitData.length} records.</p>
          </div>
          
          <div className="flex w-full lg:w-auto items-center gap-4">
            <div className="relative flex-1 lg:w-80 flex items-center group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Filter className="w-4 h-4 text-amber-700" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query Feature, Bug Fix, Date..."
                className="w-full bg-white/80 border border-amber-600/30 rounded-xl py-3 pl-10 pr-12 text-sm text-slate-900 focus:outline-none focus:border-amber-600 transition-colors shadow-inner font-medium"
               />
               <div className="absolute right-3 focus-within:z-10 flex items-center justify-center">
                 <input 
                   type="date" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   style={{ "colorScheme": "light" }}
                   onChange={(e) => {
                     if (e.target.value) {
                       const [y, m, d] = e.target.value.split('-');
                       setSearchQuery(new Date(y, m-1, d).toLocaleDateString());
                     }
                   }}
                 />
                 <Calendar className="w-5 h-5 text-amber-700 group-focus-within:text-orange-700 transition-colors pointer-events-none relative z-0" />
               </div>
            </div>

            <button 
              onClick={() => setCommitData([])}
              className="px-6 py-3 rounded-xl bg-white/80 hover:bg-white text-slate-900 transition-colors border border-amber-600/20 font-bold whitespace-nowrap shadow-sm hover:shadow-lg"
            >
              Abort Mission
            </button>
          </div>
        </div>
        
        <div className="w-full h-[600px] bg-white/60 rounded-3xl border border-amber-600/20 relative shadow-[0_0_80px_rgba(245,158,11,0.2)] mt-6 backdrop-blur-xl overflow-hidden">
          
          {timelineCommits.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
               <GitCommit className="w-16 h-16 mb-4 opacity-30 text-amber-900" />
               <p className="text-lg font-medium text-amber-900/60">No active commits detected in this filtered sector.</p>
            </div>
          ) : (
            <svg viewBox="0 0 1000 600" className="w-full h-full relative z-10 overflow-visible">
            
              {versionBoundaries.map((b, idx) => {
                const nextX = idx < versionBoundaries.length - 1 ? versionBoundaries[idx+1].x : 1000;
                const width = nextX - b.x;
                return (
                  <g key={`boundary-${idx}`}>
                    <rect x={b.x} y="0" width={width} height="600" fill={idx % 2 === 0 ? "rgba(255,255,255,0)" : "rgba(245,158,11,0.05)"} />
                    <line x1={b.x} y1="0" x2={b.x} y2="600" stroke="#d97706" strokeWidth="2" strokeDasharray="8,8" className="opacity-30" />
                    
                    <rect x={b.x + 10} y="20" width={Math.max(100, b.version.length * 8 + 30)} height="32" rx="16" fill="#fef3c7" stroke="#d97706" strokeWidth="1" className="opacity-90" />
                    <text x={b.x + 10 + Math.max(100, b.version.length * 8 + 30)/2} y="41" fill="#92400e" className="text-[13px] font-bold font-mono tracking-widest" textAnchor="middle">
                      {b.version}
                    </text>
                  </g>
                );
              })}

              {timelineCommits.map((commit, i) => {
                if (i === 0) return null;
                const prevFractionX = (i - 1) / Math.max(1, timelineCommits.length - 1);
                const prevX = 100 + prevFractionX * 800;
                const prevFractionY = (parseInt(timelineCommits[i - 1].sha.substring(0, 5), 16) % 1000) / 1000;
                const prevY = 150 + prevFractionY * 300;

                const fractionX = i / Math.max(1, timelineCommits.length - 1);
                const x = 100 + fractionX * 800;
                const fractionY = (parseInt(commit.sha.substring(0, 5), 16) % 1000) / 1000;
                const y = 150 + fractionY * 300;

                return (
                  <line 
                    key={`line-${commit.sha}`}
                    x1={prevX} y1={prevY} 
                    x2={x} y2={y} 
                    stroke="#92400e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="opacity-30"
                  />
                );
              })}

              {timelineCommits.map((commit, i) => {
                const fractionX = i / Math.max(1, timelineCommits.length - 1);
                const x = 100 + fractionX * 800;
                const fractionY = (parseInt(commit.sha.substring(0, 5), 16) % 1000) / 1000;
                const y = 150 + fractionY * 300;

                const isHovered = hoveredCommit === commit;
                const colors = getColorClasses(commit.category);
                
                return (
                  <g 
                    key={`node-${commit.sha}`} 
                    className="cursor-pointer group" 
                    onClick={() => setSelectedCommit(commit)}
                    onMouseEnter={() => setHoveredCommit(commit)}
                    onMouseLeave={() => setHoveredCommit(null)}
                  >
                    {isHovered && <circle cx={x} cy={y} r="28" className={`fill-transparent border-0 opacity-20 ${colors.stroke.replace('stroke-','fill-')} animate-ping`} />}
                    
                    <circle 
                      cx={x} cy={y} r="20" 
                      className={`fill-white stroke-[4] transition-all duration-300 ${isHovered ? 'stroke-slate-900' : colors.stroke}`} 
                    />
                    <circle 
                      cx={x} cy={y} r="8" 
                      className={`transition-all duration-300 ${isHovered ? 'fill-slate-900' : colors.stroke.replace('stroke-','fill-')}`} 
                    />
                    
                    {isHovered && (
                      <foreignObject x={x - 175} y={y + 35} width="350" height="200" className="pointer-events-none overflow-visible z-50">
                        <div xmlns="http://www.w3.org/1999/xhtml" className="bg-white/95 border border-amber-500/50 p-5 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-xl">
                          <div className="flex gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.bgBorder} ${colors.text}`}>
                              {commit.category}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono">
                              {commit.versionGroup}
                            </span>
                          </div>
                          <p className="text-slate-900 text-base font-bold leading-relaxed mb-2">
                            {commit.summarizedMessage}
                          </p>
                          <p className="text-slate-600 text-xs leading-relaxed overflow-hidden text-ellipsis line-clamp-2">
                            {commit.commit.message}
                          </p>
                          <div className="mt-4 pt-3 border-t border-amber-500/20 text-xs text-slate-500 flex justify-between font-medium">
                            <span className="flex items-center gap-1 text-amber-800">{new Date(commit.commit.author.date).toLocaleDateString()}</span>
                            <span className="font-mono text-amber-700">{commit.sha.substring(0, 7)}</span>
                          </div>
                        </div>
                      </foreignObject>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {selectedCommit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={() => { setSelectedCommit(null); setAiResponse(''); }}>
          <div 
            className="bg-white/95 border border-amber-500/40 p-8 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_150px_rgba(245,158,11,0.15)] relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-amber-200 pb-5 mb-6">
              <h3 className="text-2xl font-bold font-mono text-slate-900 flex items-center gap-4">
                <GitCommit className="w-8 h-8 text-amber-600" />
                Commit Block <span className="text-amber-600">{selectedCommit.sha.substring(0,7)}</span>
              </h3>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getColorClasses(selectedCommit.category).bgBorder} ${getColorClasses(selectedCommit.category).text}`}>
                {selectedCommit.category}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div>
                  <p className="text-amber-800 text-sm font-semibold tracking-wide uppercase mb-2">Architectural Intent</p>
                  <p className="text-slate-900 text-xl font-bold leading-relaxed">
                    {selectedCommit.summarizedMessage}
                  </p>
                </div>
                
                <div>
                  <p className="text-amber-800 text-sm font-semibold tracking-wide uppercase mb-2">Raw Diff Execution Log</p>
                  <p className="text-slate-800 whitespace-pre-wrap bg-amber-50 p-5 rounded-2xl font-mono text-sm leading-relaxed max-h-56 overflow-y-auto border border-amber-200 shadow-inner">
                    {selectedCommit.commit.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-100/50 p-5 rounded-2xl border border-amber-500/20">
                    <p className="text-amber-700 text-xs font-semibold tracking-wide uppercase mb-1">Version Stack</p>
                    <p className="text-slate-900 font-bold font-mono text-lg">{selectedCommit.versionGroup}</p>
                  </div>
                  <div className="bg-amber-100/50 p-5 rounded-2xl border border-amber-500/20">
                    <p className="text-amber-700 text-xs font-semibold tracking-wide uppercase mb-1">Timestamp</p>
                    <p className="text-slate-900 font-bold">{new Date(selectedCommit.commit.author.date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-amber-100/50 p-5 rounded-2xl border border-amber-500/20">
                  <p className="text-amber-700 text-xs font-semibold tracking-wide uppercase mb-3">Deployed By</p>
                  <div className="flex items-center gap-4">
                    {selectedCommit.author?.avatar_url ? (
                      <img src={selectedCommit.author.avatar_url} alt="Committer" className="w-12 h-12 rounded-full border border-amber-500/30 shadow-md" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-700 font-bold">
                        {selectedCommit.commit.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-slate-900 font-bold text-lg">{selectedCommit.commit.author.name}</p>
                      <p className="text-slate-700 text-sm font-mono">{selectedCommit.commit.author.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/80 p-6 rounded-2xl border border-amber-500/30 flex flex-col h-full bg-gradient-to-b from-amber-100/50 to-transparent shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center border border-amber-500/50">
                    <Sparkles className="w-4 h-4 text-amber-600" /> 
                  </div>
                  <p className="text-amber-800 text-sm font-bold uppercase tracking-widest">Nebula AI Core</p>
                </div>
                
                <p className="text-sm text-slate-700 mb-5 leading-relaxed">Issue commands directly to the semantic analyzer matrix to evaluate the raw code trajectory.</p>
                
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex flex-col gap-3">
                    <textarea 
                      value={aiPrompt} 
                      onChange={e => setAiPrompt(e.target.value)} 
                      className="w-full bg-white border border-amber-500/40 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-amber-600 shadow-inner resize-none h-24 leading-relaxed font-medium" 
                      placeholder="Input query paradigm..." 
                    />
                    <button 
                      onClick={handleAiSummarize} 
                      disabled={isAiLoading || !aiPrompt.trim()} 
                      className="self-end bg-amber-600 hover:bg-orange-500 px-8 py-3 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-orange-500/50"
                    >
                      {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "Execute"}
                    </button>
                  </div>
                  
                  <div className={`flex-1 bg-white rounded-xl border border-amber-500/30 p-5 transition-all overflow-y-auto max-h-[250px] shadow-inner ${aiResponse ? 'opacity-100' : 'opacity-0'}`}>
                    {aiResponse && (
                      <p className="text-slate-800 text-sm font-mono leading-loose opacity-90">
                        {aiResponse}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { setSelectedCommit(null); setAiResponse(''); }}
              className="mt-8 w-full py-5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all border border-amber-500/30 font-bold uppercase tracking-widest text-sm shadow-sm"
            >
              Terminate Session Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
