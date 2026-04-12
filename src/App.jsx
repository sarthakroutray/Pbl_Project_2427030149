import React, { useEffect, useState } from 'react'

const REPO_OWNER = 'sarthakroutray'
const REPO_NAME = 'IntelliMed-AI'
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`
const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
const GITHUB_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
}

const GITHUB_FALLBACK = {
  stars: 0,
  forks: 0,
  openIssues: 0,
  watchers: 0,
  defaultBranch: 'main',
  pushedAt: '2026-04-09T21:43:18Z',
  updatedAt: '2026-04-09T21:43:22Z',
  latestCommitSha: '3f560d9',
  latestCommitMessage: 'Feat: Update Readme and Documentation to Latest Version',
  latestCommitDate: '2026-04-09T21:43:11Z',
  contributors: 1,
  branches: 2,
  topContributor: 'sarthakroutray',
  topContributions: 21,
  languages: [
    { name: 'JavaScript', percentage: 63 },
    { name: 'Python', percentage: 29 },
    { name: 'CSS', percentage: 7 },
    { name: 'HTML', percentage: 0 },
    { name: 'Dockerfile', percentage: 0 }
  ]
}

const formatStopwatchTime = (milliseconds) => {
  const totalCentiseconds = Math.floor(milliseconds / 10)
  const minutes = String(Math.floor(totalCentiseconds / 6000)).padStart(2, '0')
  const seconds = String(Math.floor((totalCentiseconds % 6000) / 100)).padStart(2, '0')
  const centiseconds = String(totalCentiseconds % 100).padStart(2, '0')
  return `${minutes}:${seconds}.${centiseconds}`
}

const formatGithubDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A'
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).toUpperCase()
}

const getLanguageBreakdown = (languagesObject) => {
  if (!languagesObject || typeof languagesObject !== 'object') {
    return []
  }

  const entries = Object.entries(languagesObject)
  if (!entries.length) {
    return []
  }

  const totalBytes = entries.reduce((accumulator, [, bytes]) => accumulator + bytes, 0)

  return entries
    .sort(([, currentBytes], [, nextBytes]) => nextBytes - currentBytes)
    .slice(0, 5)
    .map(([name, bytes]) => ({
      name,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0
    }))
}

function App() {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [githubData, setGithubData] = useState({
    status: 'loading',
    ...GITHUB_FALLBACK
  })

  useEffect(() => {
    let isMounted = true

    const fetchGithubJson = async (endpoint) => {
      try {
        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers: GITHUB_HEADERS })
        if (!response.ok) {
          return { ok: false, data: null }
        }

        const data = await response.json()
        return { ok: true, data }
      } catch {
        return { ok: false, data: null }
      }
    }

    const loadGithubData = async () => {
      const repoResult = await fetchGithubJson('')

      const [languageResult, commitResult, contributorResult, branchResult] = await Promise.all([
        fetchGithubJson('/languages'),
        fetchGithubJson('/commits?per_page=1'),
        fetchGithubJson('/contributors?per_page=100'),
        fetchGithubJson('/branches?per_page=100')
      ])

      if (!isMounted) {
        return
      }

      if (!repoResult.ok) {
        setGithubData((previousValue) => ({
          ...previousValue,
          status: 'fallback',
          latestCommitMessage: `${previousValue.latestCommitMessage} (cached snapshot)`
        }))
        return
      }

      const repo = repoResult.data
      const commitList = Array.isArray(commitResult.data) ? commitResult.data : []
      const contributorList = Array.isArray(contributorResult.data) ? contributorResult.data : []
      const branchList = Array.isArray(branchResult.data) ? branchResult.data : []
      const latestCommit = commitList[0]
      const topContributor = contributorList[0]
      const liveLanguages = getLanguageBreakdown(languageResult.data)

      setGithubData((previousValue) => ({
        ...previousValue,
        status: 'ready',
        stars: repo.stargazers_count ?? previousValue.stars,
        forks: repo.forks_count ?? previousValue.forks,
        openIssues: repo.open_issues_count ?? previousValue.openIssues,
        watchers: repo.subscribers_count ?? repo.watchers_count ?? previousValue.watchers,
        defaultBranch: repo.default_branch ?? previousValue.defaultBranch,
        pushedAt: repo.pushed_at ?? previousValue.pushedAt,
        updatedAt: repo.updated_at ?? previousValue.updatedAt,
        latestCommitSha: latestCommit?.sha ? latestCommit.sha.slice(0, 7) : previousValue.latestCommitSha,
        latestCommitMessage: latestCommit?.commit?.message ?? previousValue.latestCommitMessage,
        latestCommitDate: latestCommit?.commit?.author?.date ?? previousValue.latestCommitDate,
        contributors: contributorList.length || previousValue.contributors,
        branches: branchList.length || previousValue.branches,
        topContributor: topContributor?.login ?? previousValue.topContributor,
        topContributions: topContributor?.contributions ?? previousValue.topContributions,
        languages: liveLanguages.length ? liveLanguages : previousValue.languages
      }))
    }

    loadGithubData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    // Speed up timer to 1.25x: increment by 12.5ms every 10ms (rounded to 13ms for integer math)
    const increment = 12.5
    const interval = 10
    const intervalId = setInterval(() => {
      setElapsedTime((previousTime) => previousTime + increment)
    }, interval)

    return () => clearInterval(intervalId)
  }, [isRunning])

  const githubMarqueeItems = [
    { icon: 'star', label: `${githubData.stars} Stars` },
    { icon: 'fork_right', label: `${githubData.forks} Forks` },
    { icon: 'group', label: `${githubData.contributors} Contributors` },
    { icon: 'alt_route', label: `${githubData.branches} Branches` },
    { icon: 'bug_report', label: `${githubData.openIssues} Open Issues` },
    { icon: 'schedule', label: `Last Push ${formatGithubDate(githubData.pushedAt)}` },
    { icon: 'code', label: githubData.latestCommitSha ? `Commit ${githubData.latestCommitSha}` : 'Commit N/A' }
  ]

  const latestCommitUrl = githubData.latestCommitSha
    ? `${REPO_URL}/commit/${githubData.latestCommitSha}`
    : REPO_URL

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b-4 border-[#283339] bg-background-light dark:bg-background-dark">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div className="flex items-center justify-between p-4 md:px-8 md:py-6 border-b-2 md:border-b-0 md:border-r-2 border-[#283339] bg-primary/10">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">
                INTELLIMED<span className="text-primary">-AI</span>
              </h1>
            </div>
            <button className="md:hidden p-2 border-2 border-[#283339] rounded text-primary hover:bg-primary hover:text-white transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          <div className="hidden md:flex flex-1 justify-end">
            <div className="flex">
              <a className="px-8 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#problem-gap">Problem & Gap</a>
              <a className="px-8 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#architecture">Architecture</a>
              <a className="px-8 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#capabilities">Capabilities</a>
              <a className="px-8 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#accuracy">Accuracy</a>
              <a className="px-8 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#stack">Stack</a>
              <a className="px-8 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#demo">Demo</a>
              <a className="px-8 py-6 text-sm font-bold uppercase tracking-widest border-l-2 border-[#283339] hover:bg-primary hover:text-white transition-all" href="#team">Team</a>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <header className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] border-b-4 border-[#283339]">
          <div className="lg:col-span-7 flex flex-col justify-center p-6 md:p-12 lg:p-20 border-b-4 lg:border-b-0 lg:border-r-4 border-[#283339] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="mb-6 flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-[#283339] text-white rounded uppercase tracking-widest">MUJ PBL 2026</span>
              <span className="px-3 py-1 text-xs font-bold border border-primary text-primary rounded uppercase tracking-widest">AI-Powered</span>
            </div>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter uppercase mb-8">
              IntelliMed<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-100">-AI</span>
            </h2>
            <p className="text-lg md:text-xl font-medium text-gray-400 max-w-2xl leading-relaxed border-l-4 border-primary pl-6 mb-12">
              IntelliMed-AI is a multi-modal healthcare intelligence platform for document parsing, X-ray analysis, and secure patient-doctor collaboration. This page now syncs live project health data directly from GitHub.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl">
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Latest Commit</div>
                <div className="text-sm text-white font-black">{githubData.latestCommitSha || 'N/A'}</div>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Contributors</div>
                <div className="text-sm text-white font-black">{githubData.contributors}</div>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Default Branch</div>
                <div className="text-sm text-white font-black uppercase">{githubData.defaultBranch}</div>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] px-3 py-3">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Repo Status</div>
                <div className="text-sm text-white font-black uppercase">
                  {githubData.status === 'ready' ? 'Live Sync' : githubData.status === 'loading' ? 'Syncing' : 'Cached Snapshot'}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="group relative px-8 py-4 bg-primary text-[#111618] text-lg font-bold uppercase tracking-wider overflow-hidden border-2 border-transparent hover:border-primary transition-all">
                <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                  View Github Repo
                  <span className="material-symbols-outlined">arrow_outward</span>
                </span>
              </a>
              <a href={latestCommitUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 border-2 border-[#283339] text-white text-lg font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-all">
                Latest Commit
              </a>
            </div>
          </div>
          <div className="lg:col-span-5 relative bg-[#1a2327] flex flex-col">
            <div className="h-1/2 w-full bg-cover bg-center border-b-4 border-[#283339]" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBjcZxplohYdkyb8EIZPL_gzRnNKziR9NE8RsxM8RVADNLfGUuqdhqbvdTcTiBCer-c-UR82tK1EmkLhLD3Qb2RkueeFyfN7xE5DsQ--dD6hMrear_MS-DPLaPod8oz3rtor8gVZLaBrLNQNMJzpNywgP4gN_HsBhd-MbAP3CthhpF6hYdwNvkClaB8uXauhUdTAlzNXyJNBwOsRKiuJN5VBBV1hrxatz4czfq7SiF0pFF_0wbroXadra6ZJxu6xNfTdv8Z5WXhJwU')"}}>
              <div className="w-full h-full bg-primary/20 backdrop-brightness-75 flex items-end p-6">
                <span className="bg-black/80 text-white px-2 py-1 text-xs font-mono">FIG 1.0: DIAGNOSTIC MATRIX</span>
              </div>
            </div>
            <div className="h-1/2 w-full bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBOQBc5H6Y7NJZof0sOB-aNJBIVk28ET8gVN8ASP7HmyaGA9_yfGUwr7qFYQeMrUT6__DfO-hvExtEUkv1uKpLK6PXiAiJS-PSr9dyIFUEH2_mqWzNSnIAqHrHWfhSUX0ph4b2En50aty32fJXkdQwHZpbBB6bzsoPki0-gxvkibIAlQuR3XYBdpvRzrOvAe5q10zRcJd-8EZr0ZcQLkMt1Pk5UxqbHKW6B0Q_nwBljH7OXV3IWpa0URh_QUR_XOSiYy1BrvHM0kQU')"}}>
              <div className="w-full h-full bg-[#111618]/60 flex items-end p-6">
                <span className="bg-black/80 text-white px-2 py-1 text-xs font-mono">FIG 1.1: IMAGE PROCESSING UNIT</span>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111618] border-4 border-primary p-6 shadow-[8px_8px_0px_0px_rgba(0,229,255,0.3)] max-w-xs w-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-xs font-mono uppercase">Avg Processing</span>
                <span className="material-symbols-outlined text-primary">timer</span>
              </div>
              <div className="text-5xl font-black text-white mb-1">3-4s</div>
              <div className="text-sm font-bold text-primary">Per Document</div>
              <div className="text-[11px] text-gray-400 mt-3 font-mono">LAST PUSH: {formatGithubDate(githubData.pushedAt)}</div>
            </div>
          </div>
        </header>

        {/* Marquee */}
        <div className="border-b-4 border-[#283339] bg-primary overflow-hidden py-3">
          <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
            {[...githubMarqueeItems, ...githubMarqueeItems].map((item, index) => (
              <span key={`${item.label}-${index}`} className="text-[#111618] font-black text-xl uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined">{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-2 border-r-4 border-[#283339] bg-[#161b1e] p-8 sticky top-[88px] h-[calc(100vh-88px)]">
            <div className="flex flex-col gap-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contents</span>
              <nav className="flex flex-col gap-4">
                <a className="text-sm font-bold text-white hover:text-primary flex items-center gap-2 group" href="#problem-gap">
                  <span className="w-1 h-1 bg-primary rounded-full group-hover:w-3 transition-all"></span> 01. Problem & Gap
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#architecture">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 02. Architecture
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#capabilities">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 03. Capabilities
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#accuracy">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 04. Accuracy
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#stack">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 05. Tech Stack
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#demo">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 06. Demo
                </a>
                <a className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-2 group" href="#team">
                  <span className="w-1 h-1 bg-gray-600 rounded-full group-hover:bg-primary group-hover:w-3 transition-all"></span> 07. Team
                </a>
              </nav>
            </div>
            <div className="mt-auto pt-8 border-t-2 border-[#283339]">
              <div className="text-xs text-gray-500 font-mono uppercase mb-1">LAST UPDATED</div>
              <div className="text-sm font-mono text-white">{formatGithubDate(githubData.pushedAt)}</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-3 mb-1">SYNC STATUS</div>
              <div className="text-xs font-mono text-primary uppercase">
                {githubData.status === 'ready' ? 'LIVE GITHUB DATA' : githubData.status === 'loading' ? 'SYNCING' : 'USING CACHED SNAPSHOT'}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-10">
            {/* Problem Statement & Research Gap Section */}
            <section className="border-b-4 border-[#283339] bg-[#161b1e] p-6 md:p-16" id="problem-gap">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 01</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Problem Statement<br />&amp; Research Gap</h3>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="border-4 border-[#283339] p-6 md:p-8 bg-[#111618]">
                  <h4 className="text-xl font-bold uppercase mb-6 border-b border-[#283339] pb-3 text-primary">Problem Statement</h4>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    The inefficiency and error-proneness of managing and analyzing fragmented, multi-format patient data, which delays diagnosis, increases medical errors, and heightens clinician workload.
                  </p>
                </div>
                <div className="border-4 border-[#283339] p-6 md:p-8 bg-[#111618]">
                  <h4 className="text-xl font-bold uppercase mb-6 border-b border-[#283339] pb-3 text-primary">Research Gap</h4>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Existing solutions often optimize only one modality at a time, but this platform context shows real care workflows need combined handling of prescriptions, diagnostic images, and secure sharing in a single path.
                  </p>
                  <ul className="space-y-3 text-sm text-gray-300 list-disc pl-5">
                    <li>Current reporting highlights model accuracy (93.8% X-ray, 93.2% medication extraction) but not end-to-end clinical impact such as reduction in diagnostic delays and documentation errors.</li>
                    <li>Multi-format ingestion (PDF, image, DICOM) is addressed technically, yet there is limited evidence on robust cross-modal correlation between extracted text entities and imaging findings for clinician decision support.</li>
                    <li>Security and role-based sharing are present, but research is still needed on interoperability with broader hospital ecosystems and longitudinal care records at scale.</li>
                    <li>Fast processing (3-4s) improves throughput, though a gap remains in explainability and uncertainty communication so clinicians can calibrate trust in AI-assisted outputs.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Architecture Section */}
            <section className="border-b-4 border-[#283339] bg-[#161b1e] p-6 md:p-16" id="architecture">
              <div className="flex flex-col gap-2 mb-16">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 02</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">System Architecture</h3>
                <p className="text-gray-400 max-w-2xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  A high-performance parallel processing pipeline coordinating secure uploads, analysis, and storage.
                </p>
              </div>
              <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 py-8">
                <div className="hidden md:block absolute top-[88px] left-0 w-full h-1 border-t-4 border-dashed border-[#283339] z-0"></div>
                <div className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-44 h-44 rounded-full border-4 border-[#283339] bg-[#111618] flex items-center justify-center mb-8 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20">
                    <div className="w-36 h-36 rounded-full bg-[#1a2327] flex items-center justify-center border-2 border-[#283339] group-hover:border-primary/30 transition-all">
                      <span className="material-symbols-outlined text-6xl text-gray-500 group-hover:text-primary transition-colors">cloud_upload</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-8 border-l-2 border-dashed border-[#283339] mb-2 md:hidden"></div>
                    <h4 className="text-xl font-black uppercase text-white mb-2 group-hover:text-primary transition-colors">User Upload</h4>
                    <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">Secure interface for encrypted document submission.</p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-44 h-44 rounded-full border-4 border-[#283339] bg-[#111618] flex items-center justify-center mb-8 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20">
                    <div className="w-36 h-36 rounded-full bg-[#1a2327] flex items-center justify-center border-2 border-[#283339] group-hover:border-primary/30 transition-all">
                      <span className="material-symbols-outlined text-6xl text-gray-500 group-hover:text-primary transition-colors">hub</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-8 border-l-2 border-dashed border-[#283339] mb-2 md:hidden"></div>
                    <h4 className="text-xl font-black uppercase text-white mb-2 group-hover:text-primary transition-colors">API Coordination</h4>
                    <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">FastAPI Gateway handling parallel request orchestration.</p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-44 h-44 rounded-full border-4 border-[#283339] bg-[#111618] flex items-center justify-center mb-8 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20">
                    <div className="w-36 h-36 rounded-full bg-[#1a2327] flex items-center justify-center border-2 border-[#283339] group-hover:border-primary/30 transition-all">
                      <span className="material-symbols-outlined text-6xl text-gray-500 group-hover:text-primary transition-colors">smart_toy</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-8 border-l-2 border-dashed border-[#283339] mb-2 md:hidden"></div>
                    <h4 className="text-xl font-black uppercase text-white mb-2 group-hover:text-primary transition-colors">AI Analysis</h4>
                    <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">Parallel OCR, Computer Vision, and NLP processing services.</p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-44 h-44 rounded-full border-4 border-[#283339] bg-[#111618] flex items-center justify-center mb-8 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20">
                    <div className="w-36 h-36 rounded-full bg-[#1a2327] flex items-center justify-center border-2 border-[#283339] group-hover:border-primary/30 transition-all">
                      <span className="material-symbols-outlined text-6xl text-gray-500 group-hover:text-primary transition-colors">dns</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-1 h-8 border-l-2 border-dashed border-[#283339] mb-2 md:hidden"></div>
                    <h4 className="text-xl font-black uppercase text-white mb-2 group-hover:text-primary transition-colors">Data Storage</h4>
                    <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">Structured PostgreSQL database and secure file storage.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Capabilities Section */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="capabilities">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 03</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">AI Capabilities</h3>
                <p className="text-gray-400 max-w-2xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  Multi-modal document analysis integrating OCR, medical NLP, and deep learning for comprehensive healthcare document processing with 150+ medication database and ResNet50-powered X-ray classification.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group border-2 border-[#283339] bg-[#1a2327] hover:border-primary transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-9xl">description</span>
                  </div>
                  <div className="p-8 flex flex-col h-full relative z-10">
                    <span className="text-6xl font-black text-[#283339] group-hover:text-primary transition-colors mb-4">01</span>
                    <h4 className="text-xl font-bold uppercase mb-2">OCR &amp; NLP<br />Extraction</h4>
                    <p className="text-sm text-gray-400 mb-6 flex-grow">EasyOCR + Tesseract pipeline with 8-step preprocessing. Extracts medications, dosages, frequencies from prescriptions. SpaCy NER for 150+ medical entities with 93.2% accuracy.</p>
                    <div className="w-full h-1 bg-[#283339] group-hover:bg-primary transition-colors"></div>
                  </div>
                </div>
                <div className="group border-2 border-[#283339] bg-[#1a2327] hover:border-primary transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-9xl">radiology</span>
                  </div>
                  <div className="p-8 flex flex-col h-full relative z-10">
                    <span className="text-6xl font-black text-[#283339] group-hover:text-primary transition-colors mb-4">02</span>
                    <h4 className="text-xl font-bold uppercase mb-2">X-Ray<br />Analysis</h4>
                    <p className="text-sm text-gray-400 mb-6 flex-grow">Fine-tuned ResNet50 (50-layer CNN) for pneumonia detection: Normal, Bacterial, Viral. 93.8% accuracy with 94.3% sensitivity. 0.8s inference time with confidence scoring.</p>
                    <div className="w-full h-1 bg-[#283339] group-hover:bg-primary transition-colors"></div>
                  </div>
                </div>
                <div className="group border-2 border-[#283339] bg-[#1a2327] hover:border-primary transition-colors duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-9xl">admin_panel_settings</span>
                  </div>
                  <div className="p-8 flex flex-col h-full relative z-10">
                    <span className="text-6xl font-black text-[#283339] group-hover:text-primary transition-colors mb-4">03</span>
                    <h4 className="text-xl font-bold uppercase mb-2">Secure<br />Linking</h4>
                    <p className="text-sm text-gray-400 mb-6 flex-grow">JWT authentication with bcrypt hashing. Patient-controlled document sharing via unique access codes. Role-based access (Patient/Doctor/Admin) with audit trails and verification workflow.</p>
                    <div className="w-full h-1 bg-[#283339] group-hover:bg-primary transition-colors"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Accuracy Section */}
            <section className="border-b-4 border-[#283339] bg-[#161b1e] p-6 md:p-16" id="accuracy">
              <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
                <div>
                  <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 04</span>
                  <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Diagnostic<br />Accuracy</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary"></div>
                    <span className="text-xs font-bold uppercase text-gray-300">AI-Assisted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#283339]"></div>
                    <span className="text-xs font-bold uppercase text-gray-500">Manual Review</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="border-4 border-[#283339] p-6 md:p-8 bg-[#111618] flex flex-col">
                  <h4 className="text-xl font-bold uppercase mb-8 border-b border-[#283339] pb-4 flex justify-between items-center">
                    Processing Speed <span className="text-xs bg-[#283339] px-2 py-1 rounded">SEC / PATIENT</span>
                  </h4>
                  <div className="flex-grow flex flex-col justify-end gap-6 h-64">
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                        <span>X-Ray Classification</span>
                        <span className="text-white">0.8s vs 180s</span>
                      </div>
                      <div className="h-10 w-full bg-[#283339] relative flex items-center">
                        <div className="h-full bg-primary absolute top-0 left-0" style={{width: '4%'}}>
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-black font-bold text-xs">AI</span>
                        </div>
                      </div>
                      <div className="h-4 w-full bg-[#1a2327] mt-1 relative">
                        <div className="h-full bg-[#3b4c54] absolute top-0 left-0" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                        <span>OCR + Entity Extraction</span>
                        <span className="text-white">3.5s vs 300s</span>
                      </div>
                      <div className="h-10 w-full bg-[#283339] relative flex items-center">
                        <div className="h-full bg-primary absolute top-0 left-0" style={{width: '6%'}}>
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-black font-bold text-xs">AI</span>
                        </div>
                      </div>
                      <div className="h-4 w-full bg-[#1a2327] mt-1 relative">
                        <div className="h-full bg-[#3b4c54] absolute top-0 left-0" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-4 border-[#283339] p-6 md:p-8 bg-[#111618] flex flex-col">
                  <h4 className="text-xl font-bold uppercase mb-8 border-b border-[#283339] pb-4 flex justify-between items-center">
                    Accuracy Rate <span className="text-xs bg-[#283339] px-2 py-1 rounded">% CORRECT</span>
                  </h4>
                  <div className="flex justify-around items-end h-64 w-full px-4 gap-4">
                    <div className="w-1/3 h-full flex flex-col justify-end group">
                      <span className="text-center font-bold text-2xl mb-2 text-gray-500 group-hover:text-white transition-colors">82%</span>
                      <div className="w-full bg-[#283339] h-[82%] relative overflow-hidden group-hover:bg-[#3b4c54] transition-colors border-t-2 border-x-2 border-[#3b4c54]">
                        <div className="text-center pt-2 text-xs font-mono text-gray-400">Manual</div>
                      </div>
                      <span className="text-center text-xs font-bold uppercase mt-3 text-gray-500">Human Review</span>
                    </div>
                    <div className="w-1/3 h-full flex flex-col justify-end group">
                      <span className="text-center font-bold text-2xl mb-2 text-primary">93.8%</span>
                      <div className="w-full bg-primary h-[93%] relative overflow-hidden border-t-2 border-x-2 border-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                        <div className="text-center pt-2 text-xs font-mono text-[#111618] font-bold">ResNet50</div>
                      </div>
                      <span className="text-center text-xs font-bold uppercase mt-3 text-white">AI-Powered</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tech Stack Section */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="stack">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 05</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">The Stack</h3>
                <p className="text-gray-400 max-w-3xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  Live language distribution from the IntelliMed repository. Top contributor: {githubData.topContributor || 'N/A'} ({githubData.topContributions} commits).
                </p>
              </div>
              <div className="border-2 border-[#283339] bg-[#111618] p-6 mb-10">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">GitHub Language Breakdown</div>
                <div className="flex flex-wrap gap-3">
                  {githubData.languages.length > 0 ? (
                    githubData.languages.map((language) => (
                      <div key={language.name} className="border border-[#283339] bg-[#161b1e] px-3 py-2">
                        <div className="text-sm font-black text-white uppercase">{language.name}</div>
                        <div className="text-xs font-mono text-primary">{language.percentage}% of repo</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400">Language snapshot unavailable.</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">bolt</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">FastAPI</span>
                  <span className="text-xs text-gray-500 mt-1">Backend</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">psychology</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">PyTorch</span>
                  <span className="text-xs text-gray-500 mt-1">ML Framework</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">code</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">React</span>
                  <span className="text-xs text-gray-500 mt-1">Frontend</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">database</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Prisma</span>
                  <span className="text-xs text-gray-500 mt-1">ORM</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">storage</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Postgres</span>
                  <span className="text-xs text-gray-500 mt-1">Database</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">image</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">OpenCV</span>
                  <span className="text-xs text-gray-500 mt-1">Vision</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">text_fields</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">SpaCy</span>
                  <span className="text-xs text-gray-500 mt-1">NLP</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">article</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">EasyOCR</span>
                  <span className="text-xs text-gray-500 mt-1">OCR Engine</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">hub</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Vite</span>
                  <span className="text-xs text-gray-500 mt-1">Bundler</span>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-8 flex flex-col items-center justify-center hover:bg-[#1a2327] hover:border-primary transition-all group">
                  <span className="material-symbols-outlined text-4xl text-gray-500 mb-2 group-hover:text-primary">security</span>
                  <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">JWT</span>
                  <span className="text-xs text-gray-500 mt-1">Auth</span>
                </div>
              </div>
            </section>

            {/* Demo Screenshots Section */}
            <section className="border-b-4 border-[#283339] bg-background-light dark:bg-background-dark p-6 md:p-16" id="demo">
              <div className="flex flex-col gap-2 mb-12">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 06</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Project Demo</h3>
                <p className="text-gray-400 max-w-2xl text-lg mt-4 border-l-2 border-[#283339] pl-4">
                  Real-world screenshots showcasing the IntelliMed-AI platform in action from patient dashboards to AI-powered medical analysis results.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Screenshot 1 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Patient_Dashboard.png"
                      alt="Patient Dashboard Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">Patient Dashboard</h4>
                    <p className="text-sm text-gray-400">Document upload interface with drag-and-drop functionality, real-time AI processing status, and comprehensive medical history view.</p>
                  </div>
                </div>

                {/* Screenshot 2 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Xray.png"
                      alt="X-Ray Classification Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">X-Ray Classification</h4>
                    <p className="text-sm text-gray-400">ResNet50-powered pneumonia detection with confidence scores, classification results (Normal/Bacterial/Viral), and detailed analysis visualization.</p>
                  </div>
                </div>

                {/* Screenshot 3 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Prescription Parsing.png"
                      alt="Prescription Parsing Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">Prescription Parsing</h4>
                    <p className="text-sm text-gray-400">EasyOCR and Tesseract text extraction with medical NER, structured medication data with dosages, frequencies, and durations displayed.</p>
                  </div>
                </div>

                {/* Screenshot 4 */}
                <div className="group border-4 border-[#283339] bg-[#1a2327] hover:border-primary transition-all duration-300">
                  <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                    <img
                      src="./Doctor Dashboard.png"
                      alt="Doctor Verification Screenshot"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="p-6 border-t-4 border-[#283339]">
                    <h4 className="text-xl font-bold uppercase text-white mb-2">Doctor Verification</h4>
                    <p className="text-sm text-gray-400">Doctor dashboard showing patient documents, AI analysis results verification interface, clinical notes addition, and digital signature capability.</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 text-center">
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-transparent border-2 border-primary text-primary text-lg font-bold uppercase tracking-wider hover:bg-primary hover:text-[#111618] transition-all">
                  View Full Documentation
                </a>
              </div>
            </section>

            {/* Team Section */}
            <section className="p-6 md:p-16 bg-[#161b1e]" id="team">
              <div className="flex flex-col gap-2 mb-12 text-center md:text-left">
                <span className="text-primary font-mono text-sm tracking-widest uppercase">// Section 07</span>
                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Project Team</h3>
                <p className="text-gray-400 text-lg mt-2">Department of Computer Science & Engineering</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-[#111618] border-2 border-[#283339] p-4 flex flex-col items-center text-center group hover:border-primary transition-all hover:-translate-y-1">
                  <div className="w-24 h-24 mb-4 border-2 border-[#283339] bg-gradient-to-br from-primary/20 to-cyan-900/20 rounded flex items-center justify-center">
                    <span className="text-4xl font-black text-primary">SR</span>
                  </div>
                  <h5 className="text-lg font-black uppercase text-white mb-1">Sarthak Routray</h5>
                  <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2">2427030149</span>
                  <span className="text-xs text-gray-400 mb-4">Team Member</span>
                  <div className="flex gap-2 mt-auto">
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">mail</span>
                    </a>
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">link</span>
                    </a>
                  </div>
                </div>
                <div className="bg-[#111618] border-2 border-[#283339] p-4 flex flex-col items-center text-center group hover:border-primary transition-all hover:-translate-y-1">
                  <div className="w-24 h-24 mb-4 border-2 border-[#283339] bg-gradient-to-br from-cyan-900/40 to-primary/10 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-primary">school</span>
                  </div>
                  <h5 className="text-lg font-black uppercase text-white mb-1">Ms. Soni Gupta</h5>
                  <span className="text-xs font-mono text-primary uppercase tracking-wider mb-2">Project Guide</span>
                  <span className="text-xs text-gray-400 mb-4">CSE Department</span>
                  <div className="flex gap-2 mt-auto">
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">mail</span>
                    </a>
                    <a className="w-8 h-8 flex items-center justify-center border border-[#283339] hover:bg-white hover:text-black transition-colors" href="#">
                      <span className="material-symbols-outlined text-sm">link</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t-4 border-[#283339] bg-[#0b0f11] p-8 md:p-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                  <h2 className="text-3xl font-black uppercase text-white mb-4">IntelliMed<br />-AI</h2>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Department of Computer Science & Engineering<br />
                    Manipal University Jaipur<br />
                    PBL Project 2026
                  </p>
                  <div className="flex gap-4">
                    <a className="text-gray-400 hover:text-primary font-bold uppercase text-sm" href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a className="text-gray-400 hover:text-primary font-bold uppercase text-sm" href="#demo">Demo</a>
                    <a className="text-gray-400 hover:text-primary font-bold uppercase text-sm" href="#team">Contact</a>
                  </div>
                </div>
                <div className="w-full md:max-w-md border-2 border-[#283339] bg-[#111618] p-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Latest GitHub Commit</div>
                  <div className="text-sm text-white font-semibold mb-2">{githubData.latestCommitMessage}</div>
                  <div className="text-xs text-gray-400 font-mono">SHA: {githubData.latestCommitSha || 'N/A'} | DATE: {formatGithubDate(githubData.latestCommitDate)}</div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
      <div className="fixed bottom-6 right-6 z-50 w-[240px] h-[160px] border-4 border-[#283339] bg-[#111618] shadow-[8px_8px_0px_0px_rgba(0,229,255,0.2)]">
        <div className="flex items-center justify-between border-b-2 border-[#283339] px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Stopwatch</span>
          <span className="material-symbols-outlined text-primary text-base">timer</span>
        </div>
        <div className="px-3 py-4">
          <div className="text-3xl font-black text-white text-center mb-3 font-mono">{formatStopwatchTime(elapsedTime)}</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((currentValue) => !currentValue)}
              className="border-2 border-primary bg-primary text-[#111618] text-xs font-bold uppercase py-2 hover:bg-transparent hover:text-primary transition-colors"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRunning(false)
                setElapsedTime(0)
              }}
              className="border-2 border-[#283339] text-gray-300 text-xs font-bold uppercase py-2 hover:border-primary hover:text-primary transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
