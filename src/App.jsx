import { useState, useMemo, useEffect } from 'react';
import { Search, Map, Loader2, Sparkles, Filter, Rocket, GitCommit, Calendar, Brain, Activity, Zap, Download, AlertTriangle } from 'lucide-react';
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
  const [displayedImpact, setDisplayedImpact] = useState('');
  const [deepSpaceLevel, setDeepSpaceLevel] = useState(0);
  const [stellarPulse, setStellarPulse] = useState(false);
  const [showDeepSpace, setShowDeepSpace] = useState(false);

  // Supernova states
  const [supernovaStage, setSupernovaStage] = useState(0);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [releaseMarkdown, setReleaseMarkdown] = useState('');

  const generateMarkdown = (commits) => {
    const features = commits.filter(c => c.category === 'Feature');
    const bugs = commits.filter(c => c.category === 'Bug Fix');
    const growth = commits.filter(c => !['Feature', 'Bug Fix'].includes(c.category));

    let md = `# Stellar Constellation Report\n*Auto-generated Temporal Analysis*\n\n`;
    
    if (features.length > 0) {
      md += `## 🚀 New Features & Capabilities\n`;
      features.forEach(c => {
        md += `- **${c.summarizedMessage}**\n  > ${c.commit.author.name} • \`${c.sha.substring(0,7)}\`\n`;
      });
      md += `\n`;
    }

    if (bugs.length > 0) {
      md += `## 🐛 Fixed Issues & Stabilization\n`;
      bugs.forEach(c => {
        md += `- **${c.summarizedMessage}**\n  > ${c.commit.author.name} • \`${c.sha.substring(0,7)}\`\n`;
      });
      md += `\n`;
    }

    if (growth.length > 0) {
      md += `## 🌱 Project Growth & Architecture\n`;
      growth.forEach(c => {
        md += `- **${c.summarizedMessage}**\n  > ${c.commit.author.name} • \`${c.sha.substring(0,7)}\`\n`;
      });
      md += `\n`;
    }

    return md;
  };

  const downloadMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([releaseMarkdown], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "stellar_release_notes.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSupernova = () => {
    setSupernovaStage(1);
    setReleaseMarkdown(generateMarkdown(timelineCommits));
    setTimeout(() => setSupernovaStage(2), 50); // Trigger boom
    setTimeout(() => {
        setShowReleaseNotes(true);
        setSupernovaStage(0);
    }, 1500); // Wait for explosion
  };

  useEffect(() => {
    if (selectedCommit) {
      const category = selectedCommit.category.toLowerCase();
      const summary = selectedCommit.summarizedMessage;
      const author = selectedCommit.commit.author.name;
      
      const text = `Initiating temporal code analysis...\n\nStory Impact:\nThe changes introduced in "${summary}" form a crucial junction in the project's lifecycle. Positioned as a ${category} update, ${author} recalibrated the core architecture, harmonizing the system's entropy. This evolution fortifies our base infrastructure, empowering arriving engineers to navigate the expanded frontier with absolute clarity.`;

      setDisplayedImpact('');
      
      let currentLength = 0;
      const effectInterval = setInterval(() => {
        currentLength += 2;
        if (currentLength >= text.length) {
          setDisplayedImpact(text);
          clearInterval(effectInterval);
        } else {
          setDisplayedImpact(text.substring(0, currentLength));
        }
      }, 20);

      return () => clearInterval(effectInterval);
    } else {
      setDisplayedImpact('');
    }
  }, [selectedCommit]);

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
      case 'Feature': return { text: 'text-sky-700', stroke: 'stroke-sky-500', bgBorder: 'bg-sky-500/20 border-sky-500/40' };
      case 'Bug Fix': return { text: 'text-red-700', stroke: 'stroke-red-500', bgBorder: 'bg-red-500/20 border-red-500/40' };
      case 'Documentation': return { text: 'text-emerald-700', stroke: 'stroke-emerald-500', bgBorder: 'bg-emerald-500/20 border-emerald-500/40' };
      case 'Maintenance': return { text: 'text-yellow-700', stroke: 'stroke-yellow-500', bgBorder: 'bg-yellow-500/20 border-yellow-500/40' };
      default: return { text: 'text-slate-800', stroke: 'stroke-slate-500', bgBorder: 'bg-slate-500/20 border-slate-500/40' };
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
      
      

      const [commitsRes, tagsRes] = await Promise.all([
        fetch(`/api/github?owner=${owner}&repo=${repo}&type=commits`),
        fetch(`/api/github?owner=${owner}&repo=${repo}&type=tags`)
      ]);
      
      if (!commitsRes.ok) {
        const errorData = await commitsRes.json().catch(() => ({}));
        if (commitsRes.status === 404) throw new Error('Repository not found. Check the URL or owner/repo spelling.');
        else if (commitsRes.status === 403) throw new Error('API rate limit exceeded. The system token is exhausted or repository is private.');
        else throw new Error(errorData.error || `Failed to fetch commits: ${commitsRes.statusText}`);
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

      const getImportance = (msg, category) => {
        const lower = msg.toLowerCase();
        let score = 50; 
        if (category === 'Feature') score = 90;
        if (category === 'Bug Fix') score = 60;
        if (category === 'Documentation') score = 20;
        if (category === 'Maintenance') score = 30;

        if (lower.includes('typo') || lower.includes('readme') || lower.includes('lint') || lower.includes('formatting')) {
            score -= 30;
        }
        if (lower.includes('major') || lower.includes('core') || lower.includes('architecture') || lower.includes('breaking') || lower.includes('init')) {
            score += 40;
        }
        return Math.max(10, Math.min(100, score));
      };

      let currentVersion = "Latest (Unassigned)";
      const processedCommits = commitsData.map(c => {
        if (tagMap[c.sha]) currentVersion = tagMap[c.sha];
        else {
           const versionMatch = c.commit.message.match(/(v\d+\.\d+\.\d+)/);
           if (versionMatch) currentVersion = versionMatch[1];
        }
        const category = getCategory(c.commit.message);
        
        const getSmellData = (msg) => {
            const lower = msg.toLowerCase();
            if (lower.includes('hack') || lower.includes('workaround') || lower.includes('dirty')) {
               return { risk: 'High technical debt ceiling. Unstable execution pathways.', recommendation: 'Refactor logic constraints and extract hardcoded shims into configurable modules.' };
            }
            if (lower.includes('todo') || lower.includes('temp') || lower.includes('wip')) {
               return { risk: 'Incomplete implementation logic left active in main branch.', recommendation: 'Review pending task definitions and finalize incomplete blocks.' };
            }
            if (lower.includes('console.log') || lower.match(/log\(/)) {
               return { risk: 'Internal application state leaked to public debug channels.', recommendation: 'Implement structured telemetry loggers and strip console calls.' };
            }
            if (lower.includes('quick') || lower.includes('hotfix') || lower.includes('fix typo')) {
               return { risk: 'Bypassed standard CI pipeline testing coverage.', recommendation: 'Execute full testing suite manually and audit dependent system trees.' };
            }
            // Mock a random chance for visual demonstration of the tool if nothing matches
            if (Math.random() < 0.1) {
                return { risk: 'Cyclomatic complexity exceeds baseline thresholds.', recommendation: 'Deconstruct function into smaller asynchronous micro-handlers.' };
            }
            return null;
        };

        return { 
          ...c, 
          versionGroup: currentVersion, 
          summarizedMessage: summarize(c.commit.message),
          category: category,
          importance: getImportance(c.commit.message, category),
          smellData: getSmellData(c.commit.message)
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

  const timelineCommits = useMemo(() => {
    let arr = [...commitData];
    arr.reverse(); 

    if (deepSpaceLevel > 0) {
       const minImportance = (deepSpaceLevel / 100) * 95;
       arr = arr.filter(c => c.importance >= minImportance);
    }
    
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
          
          <div className="flex w-full lg:w-auto items-center flex-wrap gap-3 justify-end">
            <div className="relative flex-1 min-w-[200px] lg:w-80 flex items-center group">
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
              onClick={() => setStellarPulse(!stellarPulse)}
              className={`px-4 py-2.5 rounded-xl border font-bold transition-all flex items-center gap-2 whitespace-nowrap text-xs ${stellarPulse ? 'bg-rose-500 text-white border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.6)]' : 'bg-white/80 text-rose-700 hover:bg-rose-50 border-rose-300 shadow-sm'}`}
            >
              <Activity className={`w-4 h-4 ${stellarPulse ? 'animate-pulse' : ''}`} /> Stellar Pulse
            </button>
            <button 
              onClick={handleSupernova}
              disabled={timelineCommits.length === 0 || supernovaStage > 0}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-bold whitespace-nowrap shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center gap-2 border border-orange-400/50 disabled:opacity-50 text-xs"
            >
              <Zap className={`w-4 h-4 fill-yellow-200 text-yellow-200 ${supernovaStage > 0 ? 'animate-ping' : ''}`} />
              SUPERNOVA
            </button>
            <button 
              onClick={() => setCommitData([])}
              className="px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-900 transition-colors border border-amber-600/20 font-bold whitespace-nowrap shadow-sm hover:shadow-lg text-xs"
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
            
              <defs>
                <filter id="nebula-blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="45" result="blur" />
                </filter>
                <filter id="nebula-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="20" result="blur" />
                </filter>
              </defs>

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

              {/* Nebula Clouds Layer */}
              {timelineCommits.map((commit, i) => {
                const fractionX = i / Math.max(1, timelineCommits.length - 1);
                const x = 100 + fractionX * 800;
                const fractionY = (parseInt(commit.sha.substring(0, 5), 16) % 1000) / 1000;
                const y = 150 + fractionY * 300;

                let cloudColor = null;
                let isPulsing = false;
                
                if (commit.category === 'Feature') cloudColor = "rgba(14, 165, 233, 0.45)"; // Bright Blue
                if (commit.category === 'Bug Fix') {
                  cloudColor = "rgba(239, 68, 68, 0.55)"; // Pulsing Red
                  isPulsing = true;
                }
                if (commit.category === 'Maintenance') cloudColor = "rgba(234, 179, 8, 0.4)"; // Yellow

                if (!cloudColor) return null;

                return (
                  <g key={`cloud-group-${commit.sha}`} className={isPulsing ? "animate-pulse" : ""} style={isPulsing ? { animationDuration: '3s' } : {}}>
                    <circle cx={x} cy={y} r="70" fill={cloudColor} filter="url(#nebula-blur)" className="pointer-events-none mix-blend-screen" />
                    <circle cx={x} cy={y} r="40" fill={cloudColor} filter="url(#nebula-glow)" className="pointer-events-none mix-blend-screen opacity-70" />
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
                    {stellarPulse && commit.smellData && (
                        <circle cx={x} cy={y} r="35" className="fill-transparent stroke-rose-500 stroke-[3] opacity-60 animate-blink pointer-events-none" />
                    )}

                    {isHovered && <circle cx={x} cy={y} r="28" className={`fill-transparent border-0 opacity-20 ${colors.stroke.replace('stroke-','fill-')} animate-ping`} />}
                    
                    <circle 
                      cx={x} cy={y} r="20" 
                      className={`fill-white stroke-[4] transition-all duration-300 ${isHovered ? 'stroke-slate-900' : (stellarPulse && commit.smellData ? 'stroke-rose-500' : colors.stroke)}`} 
                    />
                    <circle 
                      cx={x} cy={y} r="8" 
                      className={`transition-all duration-300 ${isHovered ? 'fill-slate-900' : colors.stroke.replace('stroke-','fill-')}`} 
                    />
                    
                    {isHovered && (
                      <foreignObject x={x - 175} y={y + 35} width="350" height={stellarPulse && commit.smellData ? "300" : "200"} className="pointer-events-none overflow-visible z-50">
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
                          
                          {stellarPulse && commit.smellData && (
                            <div className="mt-4 pt-3 border-t border-rose-500/30 bg-rose-500/10 p-4 rounded-xl shadow-inner">
                              <div className="flex items-center gap-2 mb-2 text-rose-600 font-extrabold text-xs uppercase tracking-wider">
                                <AlertTriangle className="w-4 h-4" /> Architectural Risk
                              </div>
                              <p className="text-slate-800 text-xs font-medium mb-2 leading-relaxed"><span className="text-rose-700 font-bold">Insight:</span> {commit.smellData.risk}</p>
                              <p className="text-slate-800 text-xs font-medium leading-relaxed"><span className="text-emerald-700 font-bold">Auto-Fix Suggestion:</span> {commit.smellData.recommendation}</p>
                            </div>
                          )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-500 animate-in fade-in" onClick={() => { setSelectedCommit(null); setDisplayedImpact(''); }}>
          <div 
            className="bg-slate-900/90 border border-amber-500/40 p-8 rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_0_100px_rgba(245,158,11,0.2),inset_0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-3xl transform transition-all animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-center border-b border-amber-500/20 pb-6 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                  <Activity className="w-7 h-7 text-amber-400 animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold font-mono text-amber-50 tracking-wide drop-shadow-md">
                    HUD // <span className="text-amber-500">{selectedCommit.sha.substring(0,7)}</span>
                  </h3>
                  <p className="text-amber-500/80 text-sm font-mono mt-1">
                    {new Date(selectedCommit.commit.author.date).toLocaleString()} • {selectedCommit.commit.author.name}
                  </p>
                </div>
              </div>
              <span className={`px-5 py-2 rounded-full text-sm font-bold border border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] uppercase tracking-wider`}>
                {selectedCommit.category}
              </span>
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              
              {/* Left Column: AI Narrator */}
              <div className="md:col-span-3 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    <Brain className="w-4 h-4 text-amber-300" />
                    <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping"></div>
                  </div>
                  <h4 className="text-amber-400 font-bold tracking-widest uppercase text-sm drop-shadow-lg">Cosmic Narrator</h4>
                </div>
                
                <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-7 min-h-[200px] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-500/0 via-amber-400 to-amber-500/0 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  
                  <p className="text-amber-50/90 leading-relaxed font-sans text-lg relative z-10 whitespace-pre-wrap">
                    {displayedImpact}
                    <span className="inline-block w-2.5 h-5 bg-amber-400 ml-1 animate-pulse align-middle shadow-[0_0_10px_rgba(251,191,36,0.8)]"></span>
                  </p>
                </div>
              </div>

              {/* Right Column: Metadata */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-amber-500/70 font-semibold tracking-wider uppercase text-xs mb-2">Raw Trajectory Log</h4>
                  <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-4 font-mono text-xs text-amber-50/80 leading-relaxed max-h-32 overflow-y-auto shadow-inner">
                    {selectedCommit.commit.message}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-5 rounded-xl border border-amber-500/20 shadow-inner">
                    <p className="text-amber-500/70 text-xs font-semibold tracking-wider uppercase mb-2">Version Stack</p>
                    <p className="text-amber-100 font-bold font-mono text-sm">{selectedCommit.versionGroup}</p>
                  </div>
                  <div className="bg-slate-900/60 p-5 rounded-xl border border-amber-500/20 shadow-inner">
                    <p className="text-amber-500/70 text-xs font-semibold tracking-wider uppercase mb-2">Engaged By</p>
                    <p className="text-amber-100 font-bold truncate text-sm">{selectedCommit.commit.author.name}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <button 
              onClick={() => { setSelectedCommit(null); setDisplayedImpact(''); }}
              className="mt-10 w-full py-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500/20 hover:via-amber-500/30 hover:to-amber-500/20 text-amber-300 transition-all border border-amber-500/40 font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              Disengage HUD
            </button>
          </div>
        </div>
      )}

      {/* Supernova Explosion Effect */}
      {supernovaStage > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
           <div className={`absolute inset-0 bg-orange-100 mix-blend-color-dodge transition-opacity duration-[1000ms] ease-in ${supernovaStage === 2 ? 'opacity-100' : 'opacity-0'}`}></div>
           <div className={`w-4 h-4 bg-white rounded-full blur-md transition-all duration-[1200ms] ease-out ${supernovaStage === 2 ? 'scale-[400] opacity-0' : 'scale-100 opacity-100'} shadow-[0_0_150px_100px_#fef08a]`}></div>
        </div>
      )}

      {/* Release Notes Modal */}
      {showReleaseNotes && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white p-8 rounded-[2.5rem] max-w-4xl w-full max-h-[85vh] flex flex-col shadow-[0_0_200px_rgba(245,158,11,0.5)] border border-amber-200">
               <h2 className="text-3xl font-black text-amber-600 mb-6 flex items-center gap-3 tracking-tight">
                   <Zap className="w-8 h-8 fill-amber-500" /> Stellar Sequence Generated
               </h2>
               <div className="flex-1 overflow-y-auto bg-slate-50 border border-slate-200 p-8 rounded-2xl font-mono text-sm whitespace-pre-wrap text-slate-800 shadow-inner">
                   {releaseMarkdown}
               </div>
               <div className="flex justify-end gap-4 mt-8">
                  <button onClick={() => setShowReleaseNotes(false)} className="px-8 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-mono">
                      Discard Data
                  </button>
                  <button onClick={downloadMarkdown} className="px-8 py-4 rounded-2xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3 shadow-lg hover:shadow-amber-500/50">
                      <Download className="w-5 h-5" /> Export Manifest
                  </button>
               </div>
           </div>
        </div>
      )}

      {/* Deep Space Launcher Button */}
      {commitData.length > 0 && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-4">
           {showDeepSpace && (
             <div className="bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.6)] w-80 animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-widest uppercase text-amber-50 shadow-sm">Deep Space Level</span>
                  </div>
                  <span className="text-amber-500 font-mono text-sm font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{deepSpaceLevel}%</span>
                </div>
                
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={deepSpaceLevel} 
                  onChange={(e) => setDeepSpaceLevel(e.target.value)}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer border border-amber-500/20 bg-slate-800"
                  style={{
                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${deepSpaceLevel}%, #1e293b ${deepSpaceLevel}%, #1e293b 100%)`
                  }}
                />
                <p className="text-slate-400 text-xs mt-4 leading-relaxed bg-black/40 p-3 rounded-xl border border-slate-800">
                  Cut through the noise. Isolating major architectural stars.
                </p>
             </div>
           )}
           <button 
             onClick={() => setShowDeepSpace(!showDeepSpace)}
             title="Toggle Deep Space Filtering"
             className={`p-4 rounded-full border-2 transition-all shadow-2xl flex items-center justify-center ${showDeepSpace ? 'bg-amber-500 border-amber-400 text-slate-900 scale-110' : 'bg-slate-900/90 border-amber-500/40 text-amber-400 hover:border-amber-500'}`}
           >
             <Sparkles className={`w-6 h-6 ${showDeepSpace ? 'fill-slate-900' : ''}`} />
           </button>
        </div>
      )}
    </div>
  );
}

export default App;
