import { useState, useEffect, useRef } from "react";

// ─── Config ────────────────────────────────────────────────────────────────
const BLOCK_NAME = "37–42 Castelnau Gardens, SW13 8DU";
const FLATS = ["Flat 38", "Flat 39", "Flat 40", "Flat 41", "Flat 42"];

const DIRECTORS = [
  { id: 1, name: "Dominic O'Regan",  email: "dominic@castelnau.rtm",  flat: "Flat 38" },
  { id: 2, name: "Simona Rauta",     email: "simona@castelnau.rtm",   flat: "Flat 39" },
  { id: 3, name: "Liwei Xu",         email: "liwei@castelnau.rtm",    flat: "Flat 41" },
  { id: 4, name: "Lala Guliyeva",    email: "lala@castelnau.rtm",     flat: "Flat 42" },
];

const MOCK_ISSUES = [];
const MOCK_FINANCES = [];
const MOCK_DOCS = [
  { id: 1, name: "Buildings Insurance 2026.pdf",  type: "insurance", date: "2026-01-01", size: "2.4 MB", folder: "Insurance" },
  { id: 2, name: "Lease – Flat 38.pdf",           type: "lease",     date: "2024-06-01", size: "1.1 MB", folder: "Leases"    },
  { id: 3, name: "Lease – Flat 39.pdf",           type: "lease",     date: "2024-06-01", size: "1.0 MB", folder: "Leases"    },
  { id: 4, name: "AGM Minutes April 2026.docx",   type: "minutes",   date: "2026-04-15", size: "340 KB", folder: "Minutes"   },
];
const MOCK_TASKS = [
  { id: 1, title: "Renew buildings insurance",          assignee: "Dominic O'Regan", due: "2026-06-30", done: false, priority: "high"   },
  { id: 2, title: "Get 3 quotes for roof inspection",   assignee: "Simona Rauta",    due: "2026-06-15", done: false, priority: "medium" },
  { id: 3, title: "File AGM minutes to Companies House",assignee: "Liwei Xu",        due: "2026-06-20", done: false, priority: "medium" },
  { id: 4, title: "Set up Xero bank feed",              assignee: "Lala Guliyeva",   due: "2026-07-01", done: false, priority: "high"   },
];

// ─── Theme ─────────────────────────────────────────────────────────────────
const T = {
  bg:        "#eeeeee",
  card:      "#464655",
  accent:    "#35a7ff",
  textPri:   "#ffffff",
  textSec:   "#f2af29",
  border:    "#55556a",
  inputBg:   "#373744",
  headerBg:  "#3a3a48",
  danger:    "#ef4444",
  warn:      "#f59e0b",
  success:   "#22c55e",
};

const statusColor = { open: T.danger, "in-progress": T.warn, resolved: T.success };
const statusLabel = { open: "Open", "in-progress": "In Progress", resolved: "Resolved" };
const priorityColor = { high: T.danger, medium: T.warn, low: T.success };

const callClaude = async (messages, systemPrompt) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
};

// ─── Shared Styles ─────────────────────────────────────────────────────────
const card = {
  background: T.card, border: `1px solid ${T.border}`,
  borderRadius: "12px", padding: "14px",
};
const inp = {
  width: "100%", background: T.inputBg, border: `1px solid ${T.border}`,
  borderRadius: "8px", color: T.textPri, padding: "9px 12px",
  fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const lbl = { display: "block", fontSize: "11px", color: T.textSec, marginBottom: "4px", letterSpacing: "0.5px" };
const btn = (bg, col = T.textPri) => ({
  background: bg, color: col, border: "none", borderRadius: "8px",
  padding: "8px 14px", cursor: "pointer", fontSize: "13px",
  fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap",
});

// ─── Login Screen ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏢</div>
        <div style={{ fontFamily: "'Google Sans Flex','Montserrat',sans-serif", fontSize: "26px", color: T.card, fontWeight: 700 }}>RTM Director Portal</div>
        <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>{BLOCK_NAME}</div>
      </div>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>Select Your Profile</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {DIRECTORS.map(d => (
            <div key={d.id} onClick={() => setSelected(d)}
              style={{ background: T.card, borderRadius: "12px", cursor: "pointer", border: selected?.id === d.id ? `2px solid ${T.accent}` : `2px solid transparent`, display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", transition: "all 0.15s" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${T.accent},#1a6fbf)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0, color: "#fff" }}>
                {d.name.split(" ").map(w => w[0]).join("").slice(0,2)}
              </div>
              <div>
                <div style={{ fontSize: "14px", color: T.textPri, fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: "11px", color: T.textSec }}>{d.flat}</div>
              </div>
              {selected?.id === d.id && <div style={{ marginLeft: "auto", color: T.accent, fontSize: "18px" }}>✓</div>}
            </div>
          ))}
        </div>
        <button onClick={() => selected && onLogin(selected)} disabled={!selected}
          style={{ ...btn(selected ? T.accent : "#ccc", "#fff"), width: "100%", padding: "13px", fontSize: "15px", opacity: selected ? 1 : 0.5, borderRadius: "12px" }}>
          Enter Portal →
        </button>
        <div style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "14px" }}>
          Connect Google Workspace SSO when ready
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ issues, finances, tasks, director }) {
  const openIssues = issues.filter(i => i.status === "open").length;
  const urgentIssues = issues.filter(i => i.urgent && i.status !== "resolved").length;
  const income = finances.filter(f => f.type === "income").reduce((a, b) => a + b.amount, 0);
  const expenses = finances.filter(f => f.type === "expense").reduce((a, b) => a + b.amount, 0);
  const myTasks = tasks.filter(t => t.assignee === director.name && !t.done);
  const flatsPaid = [...new Set(finances.filter(f => f.type === "income" && f.desc.includes("Service charge")).map(f => f.flat))];
  const unpaidFlats = FLATS.filter(f => !flatsPaid.includes(f));

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", color: T.textSec, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Welcome back</div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: T.card }}>{director.name}</div>
        <div style={{ fontSize: "12px", color: "#888" }}>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Open Issues",  val: openIssues,  color: openIssues > 0 ? T.danger : T.success, icon: "🔧" },
          { label: "Urgent",       val: urgentIssues,color: urgentIssues > 0 ? T.danger : T.success,icon: "⚠️" },
          { label: "Balance",      val: `£${(income-expenses).toLocaleString()}`, color: T.success, icon: "£" },
          { label: "Unpaid S/C",   val: unpaidFlats.length, color: unpaidFlats.length > 0 ? T.warn : T.success, icon: "📋" },
        ].map(k => (
          <div key={k.label} style={{ ...card }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{k.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: "11px", color: T.textSec, marginTop: "2px" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: T.textSec, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>Your Tasks</div>
        {myTasks.length === 0
          ? <div style={{ ...card, color: T.textSec, fontSize: "13px" }}>✓ No pending tasks</div>
          : myTasks.map(t => (
            <div key={t.id} style={{ ...card, marginBottom: "8px", borderLeft: `3px solid ${priorityColor[t.priority]}` }}>
              <div style={{ fontSize: "13px", color: T.textPri }}>{t.title}</div>
              <div style={{ fontSize: "11px", color: T.textSec, marginTop: "3px" }}>Due {t.due}</div>
            </div>
          ))
        }
      </div>

      {unpaidFlats.length > 0 && (
        <div style={{ background: "#3d2000", border: `1px solid ${T.warn}55`, borderRadius: "10px", padding: "12px", fontSize: "13px", color: T.warn }}>
          ⚠ Outstanding service charges: <strong>{unpaidFlats.join(", ")}</strong>
        </div>
      )}
    </div>
  );
}

// ─── AI Assistant ──────────────────────────────────────────────────────────
function AIAssistant({ issues, finances, tasks, docs, director }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${director.name}! I'm your RTM assistant for ${BLOCK_NAME}. I have full context on the block — issues, finances, and tasks. What do you need?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const quickPrompts = ["Summarise open issues", "Who hasn't paid service charge?", "Draft arrears reminder", "What to budget next year?"];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    const userMsg = { role: "user", content: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const ctx = `You are an expert RTM property management AI for ${BLOCK_NAME} (6 flats: Flats 38-42).
Speaking with: ${director.name}.
Issues: ${JSON.stringify(issues)}
Finances: ${JSON.stringify(finances)}
Tasks: ${JSON.stringify(tasks)}
Documents: ${JSON.stringify(docs.map(d=>d.name))}
Connected: Google Drive, Gmail, Xero, Google Calendar. Be concise, practical, UK English.`;
      const reply = await callClaude(newMsgs.map(m => ({ role: m.role, content: m.content })), ctx);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error — please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${T.border}`, background: T.headerBg }}>
        <div style={{ fontSize: "11px", color: T.textSec, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>Quick Actions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {quickPrompts.map(p => (
            <button key={p} onClick={() => send(p)} style={{ ...btn(T.inputBg), fontSize: "11px", padding: "5px 10px", border: `1px solid ${T.border}` }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: T.bg }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
            background: m.role === "user" ? T.accent : T.card,
            borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            padding: "10px 14px", fontSize: "13px", lineHeight: "1.6",
            color: T.textPri, whiteSpace: "pre-wrap",
          }}>{m.content}</div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", color: T.textSec, fontSize: "13px", padding: "8px 14px" }}>Thinking…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, background: T.headerBg, display: "flex", gap: "8px" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything about the block…" style={{ ...inp, flex: 1 }} />
        <button onClick={() => send()} disabled={loading} style={btn(loading ? T.border : T.accent, "#fff")}>Send</button>
      </div>
    </div>
  );
}

// ─── Maintenance ───────────────────────────────────────────────────────────
function Maintenance({ issues, setIssues, director }) {
  const [showForm, setShowForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ flat: "Flat 38", description: "", urgent: false });
  const [loadingId, setLoadingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const addIssue = () => {
    if (!newIssue.description.trim()) return;
    setIssues(prev => [...prev, { id: Date.now(), ...newIssue, status: "open", date: new Date().toISOString().split("T")[0], aiSummary: null, reportedBy: director.name }]);
    setNewIssue({ flat: "Flat 38", description: "", urgent: false });
    setShowForm(false);
  };

  const analyse = async (issue) => {
    setLoadingId(issue.id);
    try {
      const reply = await callClaude([{ role: "user", content: `${issue.flat} at ${BLOCK_NAME}: "${issue.description}". ${issue.urgent?"URGENT.":""} Give: 1) Diagnosis, 2) Recommended action, 3) UK cost estimate, 4) Contractor needed? Max 4 lines.` }],
        "You are a UK residential block maintenance expert. Concise and practical.");
      setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, aiSummary: reply } : i));
    } catch {}
    setLoadingId(null);
  };

  const filtered = filter === "all" ? issues : issues.filter(i => i.status === filter);

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%", background: T.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: T.textSec, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Maintenance</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: T.card }}>Issue Tracker</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btn(T.accent, "#fff")}>+ Report</button>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["all","open","in-progress","resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...btn(filter===f ? T.accent : T.card, filter===f?"#fff":T.textPri), fontSize: "11px", padding: "5px 10px", textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: "16px" }}>
          <select value={newIssue.flat} onChange={e => setNewIssue(p=>({...p,flat:e.target.value}))} style={inp}>
            {FLATS.map(f=><option key={f}>{f}</option>)}
          </select>
          <textarea value={newIssue.description} onChange={e => setNewIssue(p=>({...p,description:e.target.value}))}
            placeholder="Describe the issue…" rows={3} style={{ ...inp, resize:"vertical", marginTop:"8px" }} />
          <label style={{ display:"flex", alignItems:"center", gap:"8px", color: T.danger, fontSize:"13px", marginTop:"8px", cursor:"pointer" }}>
            <input type="checkbox" checked={newIssue.urgent} onChange={e=>setNewIssue(p=>({...p,urgent:e.target.checked}))} /> Mark urgent
          </label>
          <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
            <button onClick={addIssue} style={btn(T.accent,"#fff")}>Submit</button>
            <button onClick={()=>setShowForm(false)} style={btn(T.inputBg)}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ ...card, color: T.textSec, fontSize: "13px", textAlign: "center", padding: "30px" }}>
          No issues logged yet
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        {filtered.map(issue => (
          <div key={issue.id} style={{ ...card, borderLeft:`3px solid ${statusColor[issue.status]}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"8px" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:"6px", alignItems:"center", marginBottom:"4px" }}>
                  <span style={{ fontSize:"12px", color:T.textSec, fontWeight:600 }}>{issue.flat}</span>
                  {issue.urgent && <span style={{ fontSize:"10px", background:"#3d0f0f", color:T.danger, padding:"2px 7px", borderRadius:"20px" }}>URGENT</span>}
                </div>
                <div style={{ fontSize:"14px", color:T.textPri }}>{issue.description}</div>
                <div style={{ fontSize:"11px", color:T.textSec, marginTop:"3px" }}>{issue.date} · {issue.reportedBy}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                <select value={issue.status} onChange={e=>setIssues(prev=>prev.map(i=>i.id===issue.id?{...i,status:e.target.value}:i))}
                  style={{ ...inp, fontSize:"12px", padding:"5px 8px", color:statusColor[issue.status] }}>
                  {Object.entries(statusLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
                <button onClick={()=>analyse(issue)} disabled={loadingId===issue.id}
                  style={{ ...btn(T.inputBg, T.textSec), fontSize:"11px", padding:"5px 10px" }}>
                  {loadingId===issue.id?"Analysing…":"✦ AI Analyse"}
                </button>
              </div>
            </div>
            {issue.aiSummary && (
              <div style={{ marginTop:"12px", padding:"10px 12px", background: T.inputBg, border:`1px solid ${T.accent}44`, borderRadius:"8px", fontSize:"12px", color:T.textSec, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                <span style={{ fontSize:"10px", color:T.accent, letterSpacing:"1.5px", display:"block", marginBottom:"4px" }}>AI ASSESSMENT</span>
                {issue.aiSummary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Finance ───────────────────────────────────────────────────────────────
function Finance({ finances, setFinances }) {
  const [showForm, setShowForm] = useState(false);
  const [newTx, setNewTx] = useState({ type:"income", desc:"", amount:"", flat:"Flat 38", date:new Date().toISOString().split("T")[0] });
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const income = finances.filter(f=>f.type==="income").reduce((a,b)=>a+b.amount,0);
  const expenses = finances.filter(f=>f.type==="expense").reduce((a,b)=>a+b.amount,0);
  const flatsPaid = [...new Set(finances.filter(f=>f.type==="income"&&f.desc.includes("Service charge")).map(f=>f.flat))];
  const unpaidFlats = FLATS.filter(f=>!flatsPaid.includes(f));

  const addTx = () => {
    if (!newTx.desc.trim()||!newTx.amount) return;
    setFinances(prev=>[...prev,{id:Date.now(),...newTx,amount:parseFloat(newTx.amount)}]);
    setNewTx({type:"income",desc:"",amount:"",flat:"Flat 38",date:new Date().toISOString().split("T")[0]});
    setShowForm(false);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const reply = await callClaude([{role:"user",content:`RTM block ${BLOCK_NAME} (6 flats). Income: £${income}, Expenses: £${expenses}, Balance: £${income-expenses}. Transactions: ${JSON.stringify(finances)}. Unpaid: ${unpaidFlats.join(", ")||"None"}. Give: 1) Financial health, 2) Concerns, 3) Recommendation. Max 5 lines. UK English.`}],
        "UK property finance advisor. Concise.");
      setAiReport(reply);
    } catch { setAiReport("Could not generate report."); }
    setLoading(false);
  };

  return (
    <div style={{ padding:"20px", overflowY:"auto", height:"100%", background:T.bg }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div>
          <div style={{ fontSize:"11px", color:T.textSec, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Finance</div>
          <div style={{ fontSize:"20px", fontWeight:700, color:T.card }}>Accounts</div>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={generateReport} disabled={loading} style={{ ...btn(T.card, T.textSec), fontSize:"12px" }}>{loading?"Generating…":"✦ AI Report"}</button>
          <button onClick={()=>setShowForm(!showForm)} style={btn(T.accent,"#fff")}>+ Add</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"16px" }}>
        {[{l:"Income",v:income,c:T.success},{l:"Expenses",v:expenses,c:T.danger},{l:"Balance",v:income-expenses,c:(income-expenses)>=0?T.success:T.danger}].map(s=>(
          <div key={s.l} style={{ ...card }}>
            <div style={{ fontSize:"10px", color:T.textSec, letterSpacing:"1.5px", textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:"20px", fontWeight:700, color:s.c, marginTop:"4px" }}>£{s.v.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {unpaidFlats.length > 0 && (
        <div style={{ background:"#3d2000", border:`1px solid ${T.warn}55`, borderRadius:"10px", padding:"12px", marginBottom:"14px", fontSize:"13px", color:T.warn }}>
          ⚠ Outstanding: <strong>{unpaidFlats.join(", ")}</strong>
        </div>
      )}

      {aiReport && (
        <div style={{ background:T.card, border:`1px solid ${T.accent}44`, borderRadius:"10px", padding:"14px", marginBottom:"14px", fontSize:"13px", color:T.textSec, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
          <div style={{ fontSize:"10px", color:T.accent, letterSpacing:"1.5px", marginBottom:"6px" }}>AI FINANCIAL REPORT</div>
          {aiReport}
        </div>
      )}

      <div style={{ ...card, marginBottom:"14px", fontSize:"12px", color:T.textSec }}>
        Xero sync: <span style={{ color:T.warn }}>● Connect Xero to enable live bank balance</span>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom:"14px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            <select value={newTx.type} onChange={e=>setNewTx(p=>({...p,type:e.target.value}))} style={inp}>
              <option value="income">Income</option><option value="expense">Expense</option>
            </select>
            <input type="date" value={newTx.date} onChange={e=>setNewTx(p=>({...p,date:e.target.value}))} style={inp}/>
          </div>
          <input value={newTx.desc} onChange={e=>setNewTx(p=>({...p,desc:e.target.value}))} placeholder="Description" style={{...inp,marginTop:"8px"}}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"8px" }}>
            <input type="number" value={newTx.amount} onChange={e=>setNewTx(p=>({...p,amount:e.target.value}))} placeholder="Amount £" style={inp}/>
            <select value={newTx.flat} onChange={e=>setNewTx(p=>({...p,flat:e.target.value}))} style={inp}>
              <option value="All">All flats</option>{FLATS.map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
            <button onClick={addTx} style={btn(T.accent,"#fff")}>Add</button>
            <button onClick={()=>setShowForm(false)} style={btn(T.inputBg)}>Cancel</button>
          </div>
        </div>
      )}

      {finances.length === 0 && (
        <div style={{ ...card, color:T.textSec, fontSize:"13px", textAlign:"center", padding:"30px" }}>No transactions yet — add one or connect Xero</div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {[...finances].reverse().map(tx=>(
          <div key={tx.id} style={{ ...card, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"13px", color:T.textPri }}>{tx.desc}</div>
              <div style={{ fontSize:"11px", color:T.textSec, marginTop:"2px" }}>{tx.date} · {tx.flat}</div>
            </div>
            <div style={{ fontSize:"15px", fontWeight:700, color:tx.type==="income"?T.success:T.danger }}>
              {tx.type==="income"?"+":"-"}£{tx.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Documents ─────────────────────────────────────────────────────────────
function Documents({ docs }) {
  const [filter, setFilter] = useState("all");
  const folders = ["all", ...new Set(docs.map(d=>d.folder))];
  const filtered = filter==="all"?docs:docs.filter(d=>d.folder===filter);
  const iconMap = { insurance:"🛡️", lease:"📄", minutes:"📝", invoice:"🧾" };

  return (
    <div style={{ padding:"20px", overflowY:"auto", height:"100%", background:T.bg }}>
      <div style={{ marginBottom:"16px" }}>
        <div style={{ fontSize:"11px", color:T.textSec, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Documents</div>
        <div style={{ fontSize:"20px", fontWeight:700, color:T.card }}>Drive Files</div>
      </div>

      <div style={{ background:T.card, border:`1px dashed ${T.border}`, borderRadius:"10px", padding:"14px", marginBottom:"16px", fontSize:"13px", color:T.textSec, textAlign:"center" }}>
        <div style={{ fontSize:"20px", marginBottom:"6px" }}>☁️</div>
        Google Drive not connected yet — <span style={{ color:T.accent }}>connect to sync documents</span>
      </div>

      <div style={{ display:"flex", gap:"6px", marginBottom:"14px", flexWrap:"wrap" }}>
        {folders.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ ...btn(filter===f?T.accent:T.card, filter===f?"#fff":T.textPri), fontSize:"11px", padding:"5px 10px" }}>{f}</button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {filtered.map(doc=>(
          <div key={doc.id} style={{ ...card, display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ fontSize:"22px" }}>{iconMap[doc.type]||"📁"}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"13px", color:T.textPri }}>{doc.name}</div>
              <div style={{ fontSize:"11px", color:T.textSec, marginTop:"2px" }}>{doc.folder} · {doc.size} · {doc.date}</div>
            </div>
            <button style={{ ...btn(T.inputBg), fontSize:"11px", padding:"5px 10px" }}>View</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tasks ─────────────────────────────────────────────────────────────────
function Tasks({ tasks, setTasks, director }) {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title:"", assignee:director.name, due:"", priority:"medium" });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(prev=>[...prev,{id:Date.now(),...newTask,done:false}]);
    setNewTask({title:"",assignee:director.name,due:"",priority:"medium"});
    setShowForm(false);
  };

  return (
    <div style={{ padding:"20px", overflowY:"auto", height:"100%", background:T.bg }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <div>
          <div style={{ fontSize:"11px", color:T.textSec, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Board</div>
          <div style={{ fontSize:"20px", fontWeight:700, color:T.card }}>Director Tasks</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={btn(T.accent,"#fff")}>+ Task</button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom:"16px" }}>
          <input value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))} placeholder="Task title…" style={inp}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"8px" }}>
            <select value={newTask.assignee} onChange={e=>setNewTask(p=>({...p,assignee:e.target.value}))} style={inp}>
              {DIRECTORS.map(d=><option key={d.id}>{d.name}</option>)}
            </select>
            <input type="date" value={newTask.due} onChange={e=>setNewTask(p=>({...p,due:e.target.value}))} style={inp}/>
            <select value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} style={inp}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
            <button onClick={addTask} style={btn(T.accent,"#fff")}>Add</button>
            <button onClick={()=>setShowForm(false)} style={btn(T.inputBg)}>Cancel</button>
          </div>
        </div>
      )}

      {["Pending","Done"].map(group=>{
        const groupTasks = tasks.filter(t=>group==="Done"?t.done:!t.done);
        return (
          <div key={group} style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"11px", color:T.textSec, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"8px" }}>{group} ({groupTasks.length})</div>
            {groupTasks.map(t=>(
              <div key={t.id} style={{ ...card, marginBottom:"8px", borderLeft:`3px solid ${priorityColor[t.priority]}`, display:"flex", alignItems:"center", gap:"12px", opacity:t.done?0.5:1 }}>
                <input type="checkbox" checked={t.done} onChange={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,done:!x.done}:x))}
                  style={{ width:16,height:16,cursor:"pointer",flexShrink:0,accentColor:T.accent }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", color:T.textPri, textDecoration:t.done?"line-through":"none" }}>{t.title}</div>
                  <div style={{ fontSize:"11px", color:T.textSec, marginTop:"2px" }}>{t.assignee}{t.due?` · Due ${t.due}`:""}</div>
                </div>
                <span style={{ fontSize:"10px", color:priorityColor[t.priority], background:T.inputBg, padding:"2px 8px", borderRadius:"20px" }}>{t.priority}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Letters ───────────────────────────────────────────────────────────────
function Letters({ finances, director }) {
  const [letterType, setLetterType] = useState("service-charge");
  const [flat, setFlat] = useState("Flat 38");
  const [customNote, setCustomNote] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [gmailStatus, setGmailStatus] = useState(null);

  const letterTypes = [
    { value:"service-charge", label:"Service Charge Demand" },
    { value:"arrears",        label:"Arrears Reminder"      },
    { value:"maintenance",    label:"Maintenance Notice"    },
    { value:"agm",            label:"AGM Notice"            },
    { value:"custom",         label:"Custom Letter"         },
  ];

  const generate = async () => {
    setLoading(true); setLetter(""); setGmailStatus(null);
    const prompts = {
      "service-charge": `Draft formal UK service charge demand for ${flat} at ${BLOCK_NAME}, April–September 2026, £600. RTM company. Payment due 21 days. Bank details placeholder. Signed ${director.name}.`,
      "arrears":        `Polite but firm arrears reminder for ${flat} at ${BLOCK_NAME}. Outstanding service charge £600, 30 days overdue. Legal action if unpaid in 14 days. Signed ${director.name}.`,
      "maintenance":    `Maintenance notice to all residents of ${BLOCK_NAME}: ${customNote||"scheduled communal area works"}. Contractors need access. Brief, clear. Signed ${director.name}.`,
      "agm":            `Formal AGM notice for all leaseholders at ${BLOCK_NAME}. Date: [DATE], [TIME], [VENUE]. Agenda: accounts, director election, budget, AOB. Signed ${director.name}.`,
      "custom":         `Professional RTM letter to ${flat} at ${BLOCK_NAME}: ${customNote||"general communication"}. Signed ${director.name}.`,
    };
    try {
      const reply = await callClaude([{role:"user",content:prompts[letterType]}],
        "UK property solicitor drafting RTM letters. Professional, ready-to-send, UK English, [PLACEHOLDERS] where needed.");
      setLetter(reply);
    } catch { setLetter("Could not generate — try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding:"20px", overflowY:"auto", height:"100%", background:T.bg }}>
      <div style={{ marginBottom:"16px" }}>
        <div style={{ fontSize:"11px", color:T.textSec, letterSpacing:"2px", textTransform:"uppercase", marginBottom:"4px" }}>Communications</div>
        <div style={{ fontSize:"20px", fontWeight:700, color:T.card }}>AI Letter Writer</div>
      </div>

      <div style={{ ...card, marginBottom:"14px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"12px" }}>
          <div>
            <label style={lbl}>Letter Type</label>
            <select value={letterType} onChange={e=>setLetterType(e.target.value)} style={inp}>
              {letterTypes.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Recipient</label>
            <select value={flat} onChange={e=>setFlat(e.target.value)} style={inp}>
              <option value="All Residents">All Residents</option>
              {FLATS.map(f=><option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
        {(letterType==="maintenance"||letterType==="custom") && (
          <textarea value={customNote} onChange={e=>setCustomNote(e.target.value)} placeholder="Details…" rows={2}
            style={{...inp,resize:"vertical",marginBottom:"12px"}}/>
        )}
        <button onClick={generate} disabled={loading} style={{...btn(loading?T.border:T.accent,"#fff"),width:"100%",padding:"12px"}}>
          {loading?"Drafting…":"✦ Generate with AI"}
        </button>
      </div>

      {letter && (
        <div>
          <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
            <button onClick={()=>navigator.clipboard.writeText(letter)} style={{...btn(T.card),fontSize:"12px"}}>Copy</button>
            <button onClick={()=>setGmailStatus("Gmail not connected yet — connect Gmail to send directly.")} style={{...btn(T.card,T.textSec),fontSize:"12px"}}>✉ Send via Gmail</button>
          </div>
          {gmailStatus && <div style={{ background:"#3d2000", border:`1px solid ${T.warn}55`, borderRadius:"8px", padding:"10px 12px", fontSize:"12px", color:T.warn, marginBottom:"10px" }}>{gmailStatus}</div>}
          <div style={{ background:"#f8f6f0", borderRadius:"10px", padding:"20px", fontSize:"13px", color:"#1a1a1a", lineHeight:1.8, whiteSpace:"pre-wrap", fontFamily:"'Georgia',serif" }}>
            {letter}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────
export default function App() {
  const [director, setDirector] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [finances, setFinances] = useState(MOCK_FINANCES);
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [docs] = useState(MOCK_DOCS);

  if (!director) return <LoginScreen onLogin={setDirector}/>;

  const tabs = [
    { id:"dashboard", label:"Home",      icon:"⌂" },
    { id:"ai",        label:"AI",        icon:"✦" },
    { id:"maintenance",label:"Issues",   icon:"🔧" },
    { id:"finance",   label:"Finance",   icon:"£" },
    { id:"docs",      label:"Docs",      icon:"📁" },
    { id:"tasks",     label:"Tasks",     icon:"✓" },
    { id:"letters",   label:"Letters",   icon:"✉" },
  ];

  const openCount = issues.filter(i=>i.status==="open").length;

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.textPri, fontFamily:"'Montserrat','Google Sans Flex',sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Google+Sans+Flex&display=swap');
        * { box-sizing:border-box; margin:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${T.bg}; }
        ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:4px; }
        select option { background:${T.card}; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>

      {/* Header */}
      <div style={{ padding:"12px 16px 0", background:T.headerBg, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
          <div style={{ width:32, height:32, background:`linear-gradient(135deg,${T.accent},#1a6fbf)`, borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>🏢</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"13px", fontWeight:700, color:T.textPri }}>RTM Director Portal</div>
            <div style={{ fontSize:"10px", color:T.textSec }}>{BLOCK_NAME} · {director.name}</div>
          </div>
          {openCount > 0 && <div style={{ background:"#3d0f0f", color:T.danger, fontSize:"10px", fontWeight:700, padding:"3px 8px", borderRadius:"20px" }}>{openCount} open</div>}
          <button onClick={()=>setDirector(null)} style={{...btn(T.inputBg),fontSize:"11px",padding:"5px 10px",border:`1px solid ${T.border}`}}>↩ Switch</button>
        </div>
        <div style={{ display:"flex", overflowX:"auto" }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"none", border:"none",
              borderBottom: tab===t.id ? `2px solid ${T.accent}` : "2px solid transparent",
              color: tab===t.id ? T.accent : T.textSec,
              padding:"6px 12px", fontSize:"12px", fontWeight:600, cursor:"pointer",
              fontFamily:"inherit", whiteSpace:"nowrap", transition:"all 0.15s",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {tab==="dashboard"   && <div style={{flex:1,overflow:"auto"}}><Dashboard issues={issues} finances={finances} tasks={tasks} director={director}/></div>}
        {tab==="ai"          && <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}><AIAssistant issues={issues} finances={finances} tasks={tasks} docs={docs} director={director}/></div>}
        {tab==="maintenance" && <div style={{flex:1,overflow:"auto"}}><Maintenance issues={issues} setIssues={setIssues} director={director}/></div>}
        {tab==="finance"     && <div style={{flex:1,overflow:"auto"}}><Finance finances={finances} setFinances={setFinances}/></div>}
        {tab==="docs"        && <div style={{flex:1,overflow:"auto"}}><Documents docs={docs}/></div>}
        {tab==="tasks"       && <div style={{flex:1,overflow:"auto"}}><Tasks tasks={tasks} setTasks={setTasks} director={director}/></div>}
        {tab==="letters"     && <div style={{flex:1,overflow:"auto"}}><Letters finances={finances} director={director}/></div>}
      </div>
    </div>
  );
}
