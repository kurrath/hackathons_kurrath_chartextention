import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDownToLine, ArrowRight, Bell, CheckCircle2, ChevronRight, CircleHelp, Clock3, FileText, Fingerprint, Github, LockKeyhole, MessageSquareText, RotateCcw, Search, ShieldCheck, Sparkles, Target, Upload, Zap } from 'lucide-react';
import './style.css';

const SAMPLE = `Aisha: The client meeting has been moved to tomorrow at 10 AM. Please update your calendar.\nRahul: We decided to use Option B for the final dashboard.\nTeam Lead: @Kurrath, can you upload the dataset by Friday?\nMeera: URGENT — the demo link is broken. Can someone check it ASAP?\nAisha: Please send the final slides before the meeting.\nRahul: Thanks everyone, design is approved.`;
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [conversation, setConversation] = useState('');
  const [name, setName] = useState('Kurrath');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [copied, setCopied] = useState(false);
  const counts = useMemo(() => ({ total: result?.message_count || 0, urgent: result?.insights?.filter(x => x.priority === 'High').length || 0, actions: result?.action_items?.length || 0 }), [result]);

  async function analyze() {
    if (conversation.trim().length < 10) { setError('Paste a few chat messages first, or load the demo conversation.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch(`${API}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation, user_name: name || 'me' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not analyze conversation. Is the backend running?');
      setResult(data);
    } catch (e) { setError(`${e.message}. Start the FastAPI backend, then try again.`); }
    finally { setLoading(false); }
  }
  function loadSample() { setConversation(SAMPLE); setResult(null); setError(''); }
  function reset() { setConversation(''); setResult(null); setError(''); setFilter('All'); }
  function exportReport() {
    if (!result) return;
    const report = ['MISSEDLY AI — MISSED INTELLIGENCE REPORT', '', 'SUMMARY', ...result.summary.map(x => `• ${x}`), '', 'PRIORITY INSIGHTS', ...result.insights.map(x => `[${x.priority}] ${x.category} — ${x.message} (line ${x.source_line})`), '', 'ACTION ITEMS', ...result.action_items.map(x => `☐ ${x.message}`), '', `Privacy: ${result.privacy}`].join('\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'missedly-report.txt'; a.click(); URL.revokeObjectURL(url);
  }
  const visible = result?.insights?.filter(x => filter === 'All' || x.category === filter) || [];

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top"><span className="brand-mark"><Sparkles size={19}/></span><span>MISSEDLY<span className="brand-ai"> AI</span><small>CONVERSATION INTELLIGENCE</small></span></a>
      <div className="side-label">WORKSPACE</div>
      <button className="nav-item active"><MessageSquareText size={17}/> Catch me up <span className="nav-dot"/></button>
      <button className="nav-item" onClick={() => document.getElementById('results')?.scrollIntoView({behavior:'smooth'})}><Target size={17}/> Priority insights</button>
      <button className="nav-item" onClick={() => document.getElementById('actions')?.scrollIntoView({behavior:'smooth'})}><CheckCircle2 size={17}/> Action items</button>
      <div className="side-bottom"><div className="privacy-card"><div className="privacy-icon"><ShieldCheck size={18}/></div><strong>Your chats stay yours.</strong><p>This demo uses rule-based analysis. Your pasted text isn't stored in a database or sent to an AI provider.</p><span><span className="green-dot"/> LOCAL-FIRST DEMO</span></div><div className="profile"><div className="avatar">K</div><div><strong>Your workspace</strong><small>Personal account</small></div><ChevronRight size={15}/></div></div>
    </aside>

    <main id="top" className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={13}/> <span>Catch me up</span></div><div className="top-actions"><span className="status"><span className="green-dot"/> System ready</span><button className="icon-btn" title="Privacy details" onClick={() => alert('This starter makes no third-party AI calls. Text is sent only to the FastAPI backend you run.') }><LockKeyhole size={17}/></button><div className="avatar small">K</div></div></header>
      <section className="hero"><div className="eyebrow"><span className="eyebrow-icon"><Zap size={13}/></span> YOUR PERSONAL CONVERSATION RADAR</div><h1>Catch up on what<br/><span>actually matters.</span></h1><p className="hero-copy">Turn noisy group chats into a clear plan. Find the decisions, deadlines, and action items you can't afford to miss.</p><div className="hero-pills"><span><Clock3 size={14}/> 30-second catch-up</span><span><Fingerprint size={14}/> Privacy-first</span><span><Activity size={14}/> Priority-aware</span></div></section>

      <section className="workspace-grid">
        <div className="panel input-panel"><div className="panel-heading"><div className="heading-icon"><MessageSquareText size={17}/></div><div><h2>Conversation inbox</h2><p>Paste your unread messages below</p></div><span className="step">STEP 01</span></div>
          <div className="field-row"><label htmlFor="username">YOUR NAME / MENTION</label><input id="username" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kurrath" maxLength={80}/></div>
          <div className="textarea-wrap"><textarea value={conversation} onChange={e => setConversation(e.target.value)} placeholder={'Paste chat messages here…\n\nOne message per line works best. You can include names, dates, and timestamps.'} maxLength={100000}/><div className="textarea-footer"><span><FileText size={13}/> {conversation.trim() ? conversation.trim().split(/\s+/).length : 0} words</span><button onClick={loadSample} className="text-btn"><Sparkles size={13}/> Try sample data</button></div></div>
          {error && <div className="error-msg">{error}</div>}
          <button className="primary-btn" onClick={analyze} disabled={loading}>{loading ? <><span className="spinner"/> Scanning conversation…</> : <><Sparkles size={16}/> Find what I missed <ArrowRight size={16}/></>}</button><p className="input-note"><LockKeyhole size={12}/> Demo uses transparent rules, not a generative AI model.</p>
        </div>
        <div className="right-column"><div className="panel how-panel"><div className="panel-heading"><div className="heading-icon purple"><Activity size={17}/></div><div><h2>Intelligence engine</h2><p>How your catch-up is built</p></div></div><div className="engine-step"><span className="engine-num">01</span><div><strong>Scan the conversation</strong><small>Identify signals and key phrases</small></div><CheckCircle2 size={16} className="check"/></div><div className="engine-step"><span className="engine-num">02</span><div><strong>Rank by importance</strong><small>Urgency, deadlines, decisions</small></div><CheckCircle2 size={16} className="check"/></div><div className="engine-step"><span className="engine-num">03</span><div><strong>Build your action plan</strong><small>Original messages stay traceable</small></div><CheckCircle2 size={16} className="check"/></div></div>
          <div className="insight-promo"><div className="promo-glow"/><div className="promo-top"><span className="promo-tag"><Sparkles size={12}/> SIGNATURE FEATURE</span><span className="promo-symbol"><Target size={19}/></span></div><h3>Missed Impact<br/>Graph</h3><p>Don't just see what was said. Understand what could happen if you miss it.</p><div className="promo-line"><span/> <span/> <span/> <span/> <span/></div><small>CONTEXT → IMPACT → NEXT STEP</small></div></div>
      </section>

      <section className="metrics" aria-label="Analysis metrics"><div className="metric-card"><span className="metric-label">MESSAGES SCANNED</span><div className="metric-bottom"><strong>{counts.total.toString().padStart(2,'0')}</strong><span className="metric-icon"><MessageSquareText size={17}/></span></div><small>Non-empty message lines</small></div><div className="metric-card"><span className="metric-label">HIGH PRIORITY</span><div className="metric-bottom"><strong>{counts.urgent.toString().padStart(2,'0')}</strong><span className="metric-icon red"><Bell size={17}/></span></div><small>Urgent, deadline, or mention signals</small></div><div className="metric-card"><span className="metric-label">ACTION ITEMS</span><div className="metric-bottom"><strong>{counts.actions.toString().padStart(2,'0')}</strong><span className="metric-icon violet"><CheckCircle2 size={17}/></span></div><small>Tasks to review</small></div></section>

      {result ? <div className="results-area" id="results"><section className="panel summary-panel"><div className="panel-heading"><div className="heading-icon"><Sparkles size={17}/></div><div><h2>Your missed intelligence report</h2><p>Generated from {result.message_count} message lines</p></div><button className="outline-btn export-btn" onClick={exportReport}><ArrowDownToLine size={14}/> Export</button></div><div className="summary-list">{result.summary.map((item,i)=><div className="summary-item" key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{item}</p></div>)}</div><div className="privacy-note"><ShieldCheck size={15}/><span>{result.privacy}</span></div></section>
        <section className="panel insights-panel"><div className="panel-heading"><div className="heading-icon orange"><Target size={17}/></div><div><h2>Priority insights</h2><p>Every insight points back to a source line</p></div><span className="count-badge">{result.insights.length} FOUND</span></div><div className="filters">{['All','Urgent','Deadline','Mention','Decision','Action item'].map(f=><button key={f} className={filter===f?'filter active-filter':'filter'} onClick={()=>setFilter(f)}>{f}</button>)}</div>{visible.length ? <div className="insight-list">{visible.map((item,i)=><article className="insight-row" key={`${item.source_line}-${i}`}><span className={`priority-dot ${item.priority.toLowerCase()}`}/><div className="insight-body"><div className="insight-meta"><span className={`category ${item.category.toLowerCase().replace(' ','-')}`}>{item.category}</span><span>LINE {item.source_line}</span></div><p>{item.message}</p><small>{item.reason}</small></div><span className={`priority-label ${item.priority.toLowerCase()}`}>{item.priority}</span></article>)}</div>:<div className="empty-state"><Search size={21}/><strong>No items in this filter</strong><p>Try another category or paste more messages.</p></div>}</section>
        <section className="panel actions-panel" id="actions"><div className="panel-heading"><div className="heading-icon purple"><CheckCircle2 size={17}/></div><div><h2>Your next steps</h2><p>Check off items as you review them</p></div></div>{result.action_items.length ? <div className="todo-list">{result.action_items.map((item,i)=><label className="todo-item" key={`${item.source_line}-${i}`}><input type="checkbox"/><span className="custom-check"><CheckCircle2 size={16}/></span><span className="todo-text">{item.message}<small>Source line {item.source_line} · {item.category}</small></span><ChevronRight size={15}/></label>)}</div>:<div className="empty-state"><CheckCircle2 size={21}/><strong>No clear action items detected</strong><p>Always review the original chat to confirm.</p></div>}</section>
      </div> : <section className="empty-report"><div className="empty-graphic"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="empty-core"><Sparkles size={25}/></div><span className="float-icon float-one"><Bell size={15}/></span><span className="float-icon float-two"><CheckCircle2 size={15}/></span><span className="float-icon float-three"><Target size={15}/></span></div><h2>Your clarity report is waiting.</h2><p>Drop in a conversation and we'll surface the details worth your attention.</p><button className="text-btn" onClick={loadSample}>Explore with sample data <ArrowRight size={14}/></button></section>}
      <footer><span>© 2026 MISSEDLY AI</span><span><span className="green-dot"/> BUILT FOR HUMAN ATTENTION</span><button onClick={reset}><RotateCcw size={12}/> Reset workspace</button></footer>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
