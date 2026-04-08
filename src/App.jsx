import { useState } from 'react';
import { Search, Map, Loader2 } from 'lucide-react';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [commitData, setCommitData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [hoveredCommit, setHoveredCommit] = useState(null);

  const fetchCommits = async () => {
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Validate the input: expecting owner/repo
      const parts = repoUrl.trim().split('/');
      if (parts.length !== 2) {
        throw new Error('Please enter a valid format: owner/repo (e.g. facebook/react)');
      }
      
      const [owner, repo] = parts;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=15`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found. Check the owner/repo spelling.');
        } else if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please try again later with authentication if required.');
        } else {
          throw new Error(`Failed to fetch commits: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setCommitData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchCommits();
    }
  };

  // The Landing Screen
  if (commitData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4">
        <div className="max-w-xl w-full p-8 rounded-3xl backdrop-blur-md border border-white/10 bg-white/5 shadow-2xl overflow-hidden relative">
          
          {/* Subtle glowing effects for deep space aesthetic */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            
            <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Map className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-300 tracking-tight mb-2 text-center">
              PROJECT NEBULA
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl text-center mb-10 font-light">
              Stellar Constellation Code Mapper
            </p>

            <div className="w-full relative flex items-center mb-6">
              <div className="absolute left-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="owner/repo, e.g., facebook/react" 
                className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-lg"
              />
            </div>

            {error && (
              <div className="w-full mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm font-medium">
                {error}
              </div>
            )}

            <button 
              onClick={fetchCommits}
              disabled={isLoading || !repoUrl.trim()}
              className="w-full relative group overflow-hidden rounded-xl py-4 flex items-center justify-center font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/50"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>Map Codebase</>
                )}
              </span>
            </button>

          </div>
        </div>
      </div>
    );
  }

  // Once commitData is loaded
  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 relative overflow-hidden">
      {/* Background stars / grid placeholder */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-300">
              Nebula Mapped: {repoUrl}
            </h2>
            <p className="text-slate-400 mt-2">Successfully retrieved {commitData.length} latest commits from the constellation.</p>
          </div>
          <button 
            onClick={() => setCommitData([])}
            className="px-6 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 transition-colors border border-indigo-500/30 font-medium"
          >
            Map New System
          </button>
        </div>
        
        <div className="w-full h-[600px] bg-slate-950/80 rounded-3xl border border-white/5 relative shadow-2xl mt-8">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none rounded-3xl"></div>
          <svg viewBox="0 0 1000 600" className="w-full h-full relative z-10 overflow-visible">
            {/* Draw Lines */}
            {commitData.map((commit, i) => {
              if (i === 0) return null;
              const prev = commitData[i - 1];
              const prevFractionX = (i - 1) / Math.max(1, commitData.length - 1);
              const prevX = 100 + prevFractionX * 800;
              const prevFractionY = (parseInt(prev.sha.substring(0, 5), 16) % 1000) / 1000;
              const prevY = 150 + prevFractionY * 300;

              const fractionX = i / Math.max(1, commitData.length - 1);
              const x = 100 + fractionX * 800;
              const fractionY = (parseInt(commit.sha.substring(0, 5), 16) % 1000) / 1000;
              const y = 150 + fractionY * 300;

              return (
                <line 
                  key={`line-${commit.sha}`}
                  x1={prevX} y1={prevY} 
                  x2={x} y2={y} 
                  stroke="#334155"
                  strokeWidth="2"
                />
              );
            })}

            {/* Draw Nodes */}
            {commitData.map((commit, i) => {
              const fractionX = i / Math.max(1, commitData.length - 1);
              const x = 100 + fractionX * 800;
              const fractionY = (parseInt(commit.sha.substring(0, 5), 16) % 1000) / 1000;
              const y = 150 + fractionY * 300;

              const isHovered = hoveredCommit === commit;
              
              return (
                <g 
                  key={`node-${commit.sha}`} 
                  className="cursor-pointer group" 
                  onClick={() => setSelectedCommit(commit)}
                  onMouseEnter={() => setHoveredCommit(commit)}
                  onMouseLeave={() => setHoveredCommit(null)}
                >
                  <circle 
                    cx={x} cy={y} r="18" 
                    className={`fill-[#0f172a] stroke-[3] transition-all duration-300 ${isHovered ? 'stroke-indigo-400' : 'stroke-slate-600'}`} 
                  />
                  <circle 
                    cx={x} cy={y} r="8" 
                    className={`transition-all duration-300 ${isHovered ? 'fill-white' : 'fill-slate-400'}`} 
                  />
                  
                  {isHovered && (
                    <foreignObject x={x - 150} y={y + 30} width="300" height="200" className="pointer-events-none overflow-visible z-50">
                      <div xmlns="http://www.w3.org/1999/xhtml" className="bg-[#0f172a]/95 border border-slate-700/80 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
                        <p className="text-white text-sm font-medium leading-relaxed overflow-hidden text-ellipsis line-clamp-3">
                          {commit.commit.message}
                        </p>
                        <div className="mt-2 text-xs text-slate-400 flex justify-between">
                          <span>{commit.commit.author.name}</span>
                          <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Commit Modal */}
      {selectedCommit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCommit(null)}>
          <div 
            className="bg-slate-900 border border-indigo-500/30 p-8 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold mb-4 text-indigo-300 border-b border-white/10 pb-4">
              Commit Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-1">Message</p>
                <p className="text-slate-200 whitespace-pre-wrap bg-black/30 p-4 rounded-xl font-mono text-sm">
                  {selectedCommit.commit.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-sm font-medium mb-1">Author</p>
                  <p className="text-slate-200">{selectedCommit.commit.author.name}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-sm font-medium mb-1">Date</p>
                  <p className="text-slate-200">{new Date(selectedCommit.commit.author.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-slate-400 text-sm font-medium mb-1">SHA hash</p>
                <p className="text-indigo-400 font-mono break-all">{selectedCommit.sha}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedCommit(null)}
              className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
