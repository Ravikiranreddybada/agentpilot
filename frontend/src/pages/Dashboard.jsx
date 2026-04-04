import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://agentpilot.onrender.com';

// ─── Task 1: Web Research Agent ──────────────────────────────────────────────
function WebResearchAgent() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const steps = ['🔍 Planning research strategy...', '📡 Querying knowledge sources...', '🧠 Synthesizing findings...'];

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true); setResult(''); setStepIdx(0);
    const iv = setInterval(() => setStepIdx(i => (i + 1) % steps.length), 900);
    try {
      const res = await fetch(`${API}/api/agent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('ap_token')}` },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: `You are a Web Research Agent. For any research query:
1. Break it into sub-questions
2. Synthesize a comprehensive answer with **bold** section headers
3. End with a Key Takeaways bullet list using - bullets
Be concise but thorough. Use emojis for section icons.`,
          messages: [{ role: 'user', content: `Research: ${query}` }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setResult('❌ Error: ' + (data.error || `Server error ${res.status}`));
      } else {
        setResult(data.content?.[0]?.text || 'No response.');
      }
    } catch (e) { setResult('❌ Error: ' + e.message); }
    clearInterval(iv); setLoading(false);
  };

  return (
    <AgentCard icon="🔍" title="Web Research Agent" desc="Autonomously researches any topic using chain-of-thought reasoning" color="#00d4ff" badge="Task 1">
      <div style={s.row}>
        <input style={s.inp} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()} placeholder="e.g. How do transformer models work? What is LangChain?" />
        <Btn onClick={run} disabled={loading} color="#00d4ff">{loading?'…':'Research →'}</Btn>
      </div>
      {loading && <Loader step={steps[stepIdx]} color="#00d4ff" />}
      {result && <Out text={result} color="#00d4ff" />}
    </AgentCard>
  );
}

// ─── Task 2: SQL Query Generator ─────────────────────────────────────────────
function SQLAgent() {
  const [schema, setSchema] = useState('users(id, name, email, created_at), orders(id, user_id, product, amount, status, created_at)');
  const [nlq, setNlq] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const steps = ['📊 Analyzing schema...', '🧩 Identifying tables & joins...', '✍️ Generating optimized SQL...'];

  const run = async () => {
    if (!nlq.trim()) return;
    setLoading(true); setResult(''); setStepIdx(0);
    const iv = setInterval(() => setStepIdx(i => (i+1) % steps.length), 900);
    try {
      const res = await fetch(`${API}/api/agent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('ap_token')}` },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: `You are a SQL Query Generation Agent. Given a schema and natural language request:
**🧠 Reasoning:** brief approach explanation
**📝 SQL Query:**
\`\`\`sql
(query here)
\`\`\`
**📌 Explanation:** what it does
**⚡ Performance Note:** tips`,
          messages: [{ role: 'user', content: `Schema: ${schema}\nRequest: ${nlq}` }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setResult('❌ Error: ' + (data.error || `Server error ${res.status}`));
      } else {
        setResult(data.content?.[0]?.text || 'No response.');
      }
    } catch (e) { setResult('❌ Error: ' + e.message); }
    clearInterval(iv); setLoading(false);
  };

  return (
    <AgentCard icon="🗄️" title="SQL Query Generator" desc="Converts natural language into optimized SQL using reasoning over your schema" color="#a78bfa" badge="Task 2">
      <Lbl>Database Schema</Lbl>
      <textarea style={{...s.inp, height:60, resize:'vertical', fontFamily:'monospace', fontSize:12, marginBottom:10, display:'block', width:'100%'}} value={schema} onChange={e=>setSchema(e.target.value)} />
      <Lbl>Natural Language Request</Lbl>
      <div style={s.row}>
        <input style={s.inp} value={nlq} onChange={e=>setNlq(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()} placeholder="e.g. Show top 5 users by total order amount this month" />
        <Btn onClick={run} disabled={loading} color="#a78bfa">{loading?'…':'Generate →'}</Btn>
      </div>
      {loading && <Loader step={steps[stepIdx]} color="#a78bfa" />}
      {result && <Out text={result} color="#a78bfa" />}
    </AgentCard>
  );
}

// ─── Task 3: Code Review Agent ───────────────────────────────────────────────
function CodeReviewAgent() {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('JavaScript');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const steps = ['🔬 Parsing code structure...', '🐛 Scanning for bugs & issues...', '✨ Generating improvement plan...'];

  const run = async () => {
    if (!code.trim()) return;
    setLoading(true); setResult(''); setStepIdx(0);
    const iv = setInterval(() => setStepIdx(i => (i+1) % steps.length), 900);
    try {
      const res = await fetch(`${API}/api/agent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('ap_token')}` },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: `You are a Code Review Agent for ${lang}. Analyze and provide:
**🐛 Bugs & Issues:** list bugs/errors
**⚡ Performance:** bottlenecks
**🔒 Security:** vulnerabilities
**📐 Code Quality:** readability/structure
**✅ Refactored Version:** improved snippet
**📊 Score:** X/10 with verdict`,
          messages: [{ role: 'user', content: `Review this ${lang}:\n\`\`\`${lang.toLowerCase()}\n${code}\n\`\`\`` }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setResult('❌ Error: ' + (data.error || `Server error ${res.status}`));
      } else {
        setResult(data.content?.[0]?.text || 'No response.');
      }
    } catch (e) { setResult('❌ Error: ' + e.message); }
    clearInterval(iv); setLoading(false);
  };

  return (
    <AgentCard icon="🔬" title="Code Review Agent" desc="Reviews code for bugs, security vulnerabilities, performance issues, and suggests refactors" color="#34d399" badge="Task 3">
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        {['JavaScript','Python','Java','TypeScript','SQL','Go'].map(l => (
          <button key={l} onClick={()=>setLang(l)} style={{padding:'4px 14px',borderRadius:20,border:`1.5px solid ${lang===l?'#34d399':'#222'}`,background:lang===l?'#34d39918':'transparent',color:lang===l?'#34d399':'#555',fontSize:12,cursor:'pointer',fontWeight:lang===l?700:400,fontFamily:'Syne,sans-serif'}}>
            {l}
          </button>
        ))}
      </div>
      <textarea style={{...s.inp,height:120,resize:'vertical',fontFamily:'monospace',fontSize:12,marginBottom:10,display:'block',width:'100%'}} value={code} onChange={e=>setCode(e.target.value)} placeholder={`Paste your ${lang} code here...`} />
      <Btn onClick={run} disabled={loading} color="#34d399" block>🔬 {loading?'Reviewing...':'Review Code →'}</Btn>
      {loading && <Loader step={steps[stepIdx]} color="#34d399" />}
      {result && <Out text={result} color="#34d399" />}
    </AgentCard>
  );
}

// ─── Task 4: Workflow Automation Planner ──────────────────────────────────────
function WorkflowPlannerAgent() {
  const [goal, setGoal] = useState('');
  const [tools, setTools] = useState('Gmail, Google Sheets, Slack, REST API, MongoDB');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const steps = ['🎯 Analyzing workflow goal...','🔧 Selecting optimal tools...','📋 Building execution plan...','⚙️ Generating automation code...'];

  const run = async () => {
    if (!goal.trim()) return;
    setLoading(true); setResult(''); setStepIdx(0);
    const iv = setInterval(() => setStepIdx(i => (i+1) % steps.length), 900);
    try {
      const res = await fetch(`${API}/api/agent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('ap_token')}` },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: `You are a Workflow Automation Planner Agent. Given a goal and tools:
**🎯 Goal Analysis:** break down what needs to happen
**🔧 Tool Selection:** which tools and why
**📋 Step-by-Step Plan:** numbered execution steps
**💻 LangChain / Python Skeleton:** show code outline
**⏱️ Time Saved:** manual vs automated estimate
**⚠️ Edge Cases:** potential issues and mitigations
Be practical and specific.`,
          messages: [{ role: 'user', content: `Goal: ${goal}\nAvailable Tools: ${tools}` }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setResult('❌ Error: ' + (data.error || `Server error ${res.status}`));
      } else {
        setResult(data.content?.[0]?.text || 'No response.');
      }
    } catch (e) { setResult('❌ Error: ' + e.message); }
    clearInterval(iv); setLoading(false);
  };

  return (
    <AgentCard icon="⚙️" title="Workflow Automation Planner" desc="Plans and generates multi-tool automation pipelines for any enterprise workflow goal" color="#fb923c" badge="Task 4">
      <Lbl>Available Tools / APIs</Lbl>
      <input style={{...s.inp, marginBottom:10, display:'block', width:'100%'}} value={tools} onChange={e=>setTools(e.target.value)} placeholder="Gmail, Slack, Database, REST API..." />
      <Lbl>Automation Goal</Lbl>
      <div style={s.row}>
        <input style={s.inp} value={goal} onChange={e=>setGoal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&run()} placeholder="e.g. Auto-send weekly sales report from DB to Slack every Monday" />
        <Btn onClick={run} disabled={loading} color="#fb923c">{loading?'…':'Plan →'}</Btn>
      </div>
      {loading && <Loader step={steps[stepIdx]} color="#fb923c" />}
      {result && <Out text={result} color="#fb923c" />}
    </AgentCard>
  );
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
const Lbl = ({children}) => <div style={{color:'#444',fontSize:11,fontWeight:700,letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>{children}</div>;

const Btn = ({children, onClick, disabled, color, block}) => (
  <button onClick={onClick} disabled={disabled} style={{background:`linear-gradient(135deg, ${color}, ${color}aa)`,color:'#fff',border:'none',padding:'10px 18px',borderRadius:8,fontSize:13,fontWeight:700,cursor:disabled?'not-allowed':'pointer',fontFamily:'Syne,sans-serif',opacity:disabled?0.6:1,flexShrink:0,width:block?'100%':'auto'}}>
    {children}
  </button>
);

function AgentCard({ icon, title, desc, color, badge, children }) {
  return (
    <div style={{background:'#0d0d1a',border:`1px solid ${color}22`,borderRadius:16,overflow:'hidden'}}>
      <div style={{padding:'18px 24px',borderBottom:'1px solid #111',display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:44,height:44,borderRadius:10,background:`${color}18`,border:`1px solid ${color}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{icon}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h3 style={{fontSize:16,fontWeight:800,color,fontFamily:'Syne,sans-serif',margin:0}}>{title}</h3>
            <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,border:`1px solid ${color}44`,color,letterSpacing:0.5}}>{badge}</span>
          </div>
          <p style={{color:'#444',fontSize:12,margin:'2px 0 0'}}>{desc}</p>
        </div>
      </div>
      <div style={{padding:'20px 24px'}}>{children}</div>
    </div>
  );
}

function Loader({step, color}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:8,border:`1px solid ${color}33`,background:`${color}08`,marginTop:12}}>
      <style>{`@keyframes bnc{0%,80%,100%{transform:scale(0.5);opacity:0.5}40%{transform:scale(1);opacity:1}}`}</style>
      {[0,1,2].map(i => <span key={i} style={{width:6,height:6,borderRadius:'50%',background:color,display:'inline-block',animation:`bnc 1.2s ease-in-out ${i*0.2}s infinite`}} />)}
      <span style={{color,fontSize:13}}>{step}</span>
    </div>
  );
}

function Out({text, color}) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const lines = text.split('\n');
  return (
    <div style={{border:`1px solid ${color}33`,background:`${color}06`,borderRadius:10,padding:16,marginTop:14,maxHeight:380,overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <span style={{color,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>✅ Agent Output</span>
        <button onClick={copy} style={{background:'transparent',border:`1px solid ${color}44`,borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:600,cursor:'pointer',color,fontFamily:'Syne,sans-serif'}}>{copied?'✓ Copied':'📋 Copy'}</button>
      </div>
      <div style={{fontFamily:'JetBrains Mono, monospace'}}>
        {lines.map((line,i) => {
          const isBold = line.startsWith('**') && line.includes('**');
          if (isBold) return <div key={i} style={{fontWeight:700,color:'#ddd',marginTop:12,fontSize:13}}>{line.replace(/\*\*/g,'')}</div>;
          if (line.trim()==='') return <div key={i} style={{height:8}} />;
          return <div key={i} style={{color:'#999',fontSize:12,lineHeight:1.7}}>{line}</div>;
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('agents');

  const handleLogout = async () => { await logout(); window.location.href = '/login'; };

  return (
    <div style={{minHeight:'100vh',background:'#080810',color:'#fff',fontFamily:'Syne,sans-serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;700;800;900&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0d0d1a}::-webkit-scrollbar-thumb{background:#222;border-radius:3px}
        @keyframes gflow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes sup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 48px',borderBottom:'1px solid #111',background:'#08081088',backdropFilter:'blur(10px)',position:'sticky',top:0,zIndex:100}}>
        <Link to="/" style={{display:'flex',alignItems:'center',gap:10,fontSize:18,fontWeight:800,color:'#fff',textDecoration:'none',fontFamily:'Syne,sans-serif'}}>
          <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#00d4ff,#7b2ff7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800}}>AP</div>
          Agent Pilot
        </Link>
        <div style={{display:'flex',gap:2}}>
          {['agents','profile','team'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:'transparent',border:'none',borderBottom:`2px solid ${tab===t?'#00d4ff':'transparent'}`,padding:'8px 18px',fontSize:13,fontWeight:600,cursor:'pointer',color:tab===t?'#fff':'#444',fontFamily:'Syne,sans-serif',transition:'all 0.2s'}}>
              {t==='agents'?'🤖 AI Agents':t==='profile'?'👤 Profile':'👥 Team'}
            </button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{color:'#333',fontSize:12,fontFamily:'JetBrains Mono,monospace'}}>@{user?.username}</span>
          <button onClick={handleLogout} style={{background:'transparent',color:'#ff6b6b',border:'1px solid #ff6b6b33',padding:'7px 16px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'Syne,sans-serif'}}>Sign Out</button>
        </div>
      </nav>

      <div style={{maxWidth:1080,margin:'0 auto',padding:'48px 32px'}}>

        {/* AGENTS TAB */}
        {tab==='agents' && (
          <div style={{animation:'sup 0.4s ease'}}>
            <div style={{textAlign:'center',marginBottom:48}}>
              <div style={{display:'inline-block',background:'#00d4ff0d',border:'1px solid #00d4ff22',color:'#00d4ff',fontSize:11,fontWeight:700,padding:'4px 14px',borderRadius:20,marginBottom:16,letterSpacing:1,textTransform:'uppercase'}}>🚀 LLM-Powered Agents</div>
              <h1 style={{fontSize:42,fontWeight:900,lineHeight:1.2,marginBottom:12}}>
                Agentic AI <span style={{background:'linear-gradient(135deg,#00d4ff,#a78bfa,#fb923c)',backgroundSize:'200% 200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'gflow 4s ease infinite'}}>Workflow Tasks</span>
              </h1>
              <p style={{color:'#444',fontSize:15,maxWidth:520,margin:'0 auto 20px',lineHeight:1.7}}>Four intelligent agents that plan, reason, and execute tasks autonomously using large language models</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,flexWrap:'wrap'}}>
                {[['4','#00d4ff','Active Agents'],['LLM','#a78bfa','Powered'],['Live','#34d399','Execution'],['Claude','#fb923c','Backend']].map(([v,c,l])=>(
                  <span key={l} style={{color:'#333',fontSize:13}}><span style={{color:c,fontWeight:700}}>{v}</span> {l}</span>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:24}}>
              <WebResearchAgent />
              <SQLAgent />
              <CodeReviewAgent />
              <WorkflowPlannerAgent />
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab==='profile' && (
          <div style={{animation:'sup 0.4s ease',maxWidth:580,margin:'0 auto'}}>
            <h1 style={{fontSize:38,fontWeight:900,textAlign:'center',marginBottom:32}}>Your <span style={{color:'#00d4ff'}}>Profile</span></h1>
            <div style={{background:'#0d0d1a',border:'1px solid #1a1a2e',borderRadius:16,padding:40,textAlign:'center'}}>
              <div style={{width:88,height:88,borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff,#7b2ff7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,fontWeight:800,margin:'0 auto 16px',overflow:'hidden'}}>
                {user?.avatar?<img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 style={{fontSize:24,fontWeight:800,marginBottom:4}}>{user?.name}</h2>
              <p style={{color:'#444',marginBottom:28,fontSize:13}}>Agent Pilot Member</p>
              {[['Full Name',user?.name,'#ccc'],['Username','@'+user?.username,'#00d4ff'],['Email',user?.email,'#ccc'],['Auth Method',user?.googleId?'Google OAuth 2.0':'Username & Password','#ccc']].map(([l,v,c])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',borderBottom:'1px solid #111',textAlign:'left'}}>
                  <span style={{color:'#444',fontSize:13}}>{l}</span>
                  <span style={{color:c,fontWeight:700,fontSize:13,fontFamily:'JetBrains Mono,monospace'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {tab==='team' && (
          <div style={{animation:'sup 0.4s ease'}}>
            <div style={{textAlign:'center',marginBottom:40}}>
              <h1 style={{fontSize:38,fontWeight:900,marginBottom:8}}>Our <span style={{color:'#00d4ff'}}>Team</span></h1>
              <p style={{color:'#444',fontSize:15}}>The engineers who built Agent Pilot</p>
            </div>
            <div style={{display:'flex',justifyContent:'center'}}>
              {[
                {i:'R',n:'Bada Ravi Kiran Reddy',r:'Full Stack Developer',c:'#34d399',d:'Designed and implemented the end-to-end Agent Pilot platform, including the AI reasoning engine, frontend UI, and backend architecture.'},
              ].map(m=>(
                <div key={m.n} style={{background:'#0d0d1a',border:`1px solid ${m.c}22`,borderRadius:16,padding:'32px 28px',textAlign:'center',maxWidth:400}}>
                  <div style={{width:72,height:72,borderRadius:'50%',background:`${m.c}18`,border:`2px solid ${m.c}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:800,color:m.c,margin:'0 auto 16px'}}>{m.i}</div>
                  <h3 style={{fontSize:17,fontWeight:800,marginBottom:8}}>{m.n}</h3>
                  <span style={{display:'inline-block',border:`1px solid ${m.c}44`,color:m.c,fontSize:11,fontWeight:700,padding:'3px 12px',borderRadius:20,marginBottom:14}}>{m.r}</span>
                  <p style={{color:'#555',fontSize:13,lineHeight:1.7}}>{m.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer style={{borderTop:'1px solid #111',padding:20,textAlign:'center',color:'#222',fontSize:12,fontFamily:'JetBrains Mono,monospace'}}>
        © 2025 Agent Pilot — LLM-Based Agentic AI for Tool-Using Reasoning Workflows
      </footer>
    </div>
  );
}

const s = {
  row: {display:'flex',gap:8},
  inp: {flex:1,background:'#111',border:'1px solid #1e1e35',borderRadius:8,padding:'10px 14px',color:'#fff',fontSize:13,fontFamily:'JetBrains Mono,monospace',outline:'none',width:'100%'},
};
