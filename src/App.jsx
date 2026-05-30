import { useState, useEffect, useRef } from "react";

const FLATS = ["Flat 1", "Flat 2", "Flat 3", "Flat 4", "Flat 5", "Flat 6"];

const DIRECTORS = [
  { id: 1, name: "Director 1", email: "director1@rtm.com", flat: "Flat 1" },
  { id: 2, name: "Director 2", email: "director2@rtm.com", flat: "Flat 2" },
  { id: 3, name: "Director 3", email: "director3@rtm.com", flat: "Flat 3" },
  { id: 4, name: "Director 4", email: "director4@rtm.com", flat: "Flat 4" },
];

const MOCK_ISSUES = [
  { id: 1, flat: "Flat 3", description: "Leak under kitchen sink", status: "open", date: "2026-05-28", urgent: true, aiSummary: null, reportedBy: "Director 3" },
  { id: 2, flat: "Flat 1", description: "Front door lock stiff", status: "in-progress", date: "2026-05-20", urgent: false, aiSummary: null, reportedBy: "Director 1" },
  { id: 3, flat: "Flat 5", description: "Communal light bulb out – 2nd floor", status: "resolved", date: "2026-05-10", urgent: false, aiSummary: null, reportedBy: "Resident" },
];

const MOCK_FINANCES = [
  { id: 1, type: "income", desc: "Service charge – Flat 1", amount: 600, date: "2026-04-01", flat: "Flat 1" },
  { id: 2, type: "income", desc: "Service charge – Flat 2", amount: 600, date: "2026-04-01", flat: "Flat 2" },
  { id: 3, type: "income", desc: "Service charge – Flat 4", amount: 600, date: "2026-04-01", flat: "Flat 4" },
  { id: 4, type: "expense", desc: "Buildings insurance renewal", amount: 1200, date: "2026-04-15", flat: "All" },
  { id: 5, type: "expense", desc: "Gutter cleaning", amount: 180, date: "2026-05-02", flat: "All" },
];

const MOCK_DOCS = [
  { id: 1, name: "Buildings Insurance 2026.pdf", type: "insurance", date: "2026-01-01", size: "2.4 MB", folder: "Insurance" },
  { id: 2, name: "Lease – Flat 1.pdf", type: "lease", date: "2024-06-01", size: "1.1 MB", folder: "Leases" },
  { id: 3, name: "Lease – Flat 2.pdf", type: "lease", date: "2024-06-01", size: "1.0 MB", folder: "Leases" },
  { id: 4, name: "AGM Minutes April 2026.docx", type: "minutes", date: "2026-04-15", size: "340 KB", folder: "Minutes" },
  { id: 5, name: "Gutter Invoice May 2026.pdf", type: "invoice", date: "2026-05-02", size: "210 KB", folder: "Invoices" },
];

const MOCK_TASKS = [
  { id: 1, title: "Renew buildings insurance", assignee: "Director 1", due: "2026-06-30", done: false, priority: "high" },
  { id: 2, title: "Chase Flat 3 service charge", assignee: "Director 2", due: "2026-06-07", done: false, priority: "high" },
  { id: 3, title: "Get 3 quotes for roof inspection", assignee: "Director 3", due: "2026-06-15", done: false, priority: "medium" },
  { id: 4, title: "File AGM minutes to Companies House", assignee: "Director 4", due: "2026-06-20", done: true, priority: "medium" },
];

const statusColor = { open: "#ef4444", "in-progress": "#f59e0b", resolved: "#22c55e" };
const statusLabel = { open: "Open", "in-progress": "In Progress", resolved: "Resolved" };
const priorityColor = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

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
  background: "#0d1f33", border: "1px solid #1e3050",
  borderRadius: "12px", padding: "14px",
};
const inp = {
  width: "100%", background: "#070f1a", border: "1px solid #1e3050",
  borderRadius: "8px", color: "#d4e6f8", padding: "9px 12px",
  fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const lbl = { display: "block", fontSize: "11px", color: "#3a6a8a", marginBottom: "4px", letterSpacing: "0.5px" };
const btn = (bg, col = "#d4e6f8") => ({
  background: bg, color: col, border: "none", borderRadius: "8px",
  padding: "8px 14px", cursor: "pointer", fontSize: "13px",
  fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap",
});

// ─── Login Screen ─────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: "#060e18", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏢</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#d4e6f8", fontWeight: 700 }}>RTM Director Portal</div>
        <div style={{ fontSize: "13px", color: "#3a6a8a", marginTop: "6px" }}>6 Flats · Powered by AI</div>
      </div>
      <div style={{ width: "100%", maxWidth: "360px" }}>
        <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px", textAlign: "center" }}>Select Your Director Profile</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          {DIRECTORS.map(d => (
            <div key={d.id} onClick={() => setSelected(d)}
              style={{ ...card, cursor: "pointer", border: selected?.id === d.id ? "1px solid #1a6fbf" : "1px solid #1e3050", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1a6fbf,#0d3a7a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, flexShrink: 0 }}>
                {d.name.split(" ").map(w => w[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: "14px", color: "#d4e6f8", fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: "11px", color: "#3a6a8a" }}>{d.flat} · {d.email}</div>
              </div>
              {selected?.id === d.id && <div style={{ marginLeft: "auto", color: "#1a6fbf", fontSize: "18px" }}>✓</div>}
            </div>
          ))}
        </div>
        <button onClick={() => selected && onLogin(selected)} disabled={!selected}
          style={{ ...btn(selected ? "#1a6fbf" : "#0d1f33"), width: "100%", padding: "13px", fontSize: "15px", opacity: selected ? 1 : 0.5 }}>
          Enter Portal →
        </button>
        <div style={{ textAlign: "center", fontSize: "11px", color: "#1e3050", marginTop: "16px" }}>
          In production: connect Google Workspace SSO
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Panel ──────────────────────────────────────────────────────
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
        <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Welcome back</div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#d4e6f8", fontFamily: "'Playfair Display', serif" }}>{director.name}</div>
        <div style={{ fontSize: "12px", color: "#3a6a8a" }}>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Open Issues", val: openIssues, color: openIssues > 0 ? "#ef4444" : "#22c55e", icon: "🔧" },
          { label: "Urgent", val: urgentIssues, color: urgentIssues > 0 ? "#ef4444" : "#22c55e", icon: "⚠️" },
          { label: "Bank Balance", val: `£${(income - expenses).toLocaleString()}`, color: "#22c55e", icon: "£" },
          { label: "Unpaid S/C", val: unpaidFlats.length, color: unpaidFlats.length > 0 ? "#f59e0b" : "#22c55e", icon: "📋" },
        ].map(k => (
          <div key={k.label} style={{ ...card }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{k.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: k.color }}>{k.val}</div>
            <div style={{ fontSize: "11px", color: "#3a6a8a", marginTop: "2px" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* My Tasks */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", color: "#5a9fd4", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>Your Tasks</div>
        {myTasks.length === 0
          ? <div style={{ ...card, color: "#3a6a8a", fontSize: "13px" }}>✓ No pending tasks</div>
          : myTasks.map(t => (
            <div key={t.id} style={{ ...card, marginBottom: "8px", borderLeft: `3px solid ${priorityColor[t.priority]}` }}>
              <div style={{ fontSize: "13px", color: "#d4e6f8" }}>{t.title}</div>
              <div style={{ fontSize: "11px", color: "#3a6a8a", marginTop: "3px" }}>Due {t.due}</div>
            </div>
          ))
        }
      </div>

      {/* Unpaid alert */}
      {unpaidFlats.length > 0 && (
        <div style={{ background: "#2d1a00", border: "1px solid #7c3a00", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#fb923c" }}>
          ⚠ Outstanding service charges: <strong>{unpaidFlats.join(", ")}</strong>
        </div>
      )}
    </div>
  );
}

// ─── AI Assistant ──────────────────────────────────────────────────────────
function AIAssistant({ issues, finances, tasks, docs, director }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${director.name}! I have full context on your block — ${issues.filter(i=>i.status==="open").length} open maintenance issues, current finances, and your task list. What do you need help with today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const quickPrompts = [
    "Summarise this week's issues",
    "Who hasn't paid their service charge?",
    "Draft an arrears reminder email",
    "What should we budget for next year?",
  ];

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
      const context = `You are an expert RTM (Right to Manage) property management AI assistant for a block of 6 flats in the UK.
You are speaking with ${director.name}.
Maintenance issues: ${JSON.stringify(issues)}
Finances: ${JSON.stringify(finances)}
Tasks: ${JSON.stringify(tasks)}
Documents on file: ${JSON.stringify(docs.map(d => d.name))}
Connected systems: Google Drive (documents), Gmail (communications), Xero (accounting), Google Calendar (meetings).
Be concise, practical and use UK English. When drafting letters/emails, make them ready to send.`;
      const reply = await callClaude(newMsgs.map(m => ({ role: m.role, content: m.content })), context);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error — please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "16px 16px 8px", borderBottom: "1px solid #0d1f33" }}>
        <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>Quick Actions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {quickPrompts.map(p => (
            <button key={p} onClick={() => send(p)} style={{ ...btn("#0d1f33"), fontSize: "11px", padding: "5px 10px", border: "1px solid #1e3050" }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%",
            background: m.role === "user" ? "#1a3a5c" : "#0d1f33",
            border: m.role === "assistant" ? "1px solid #1e3050" : "none",
            borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            padding: "10px 14px", fontSize: "13px", lineHeight: "1.6",
            color: "#d4e6f8", whiteSpace: "pre-wrap",
          }}>{m.content}</div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", color: "#5a9fd4", fontSize: "13px", padding: "8px 14px" }}>AI thinking…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1e3050", display: "flex", gap: "8px" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything about your block…"
          style={{ ...inp, flex: 1 }} />
        <button onClick={() => send()} disabled={loading} style={btn(loading ? "#1e3050" : "#1a6fbf")}>Send</button>
      </div>
    </div>
  );
}

// ─── Maintenance ───────────────────────────────────────────────────────────
function Maintenance({ issues, setIssues, director }) {
  const [showForm, setShowForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ flat: "Flat 1", description: "", urgent: false });
  const [loadingId, setLoadingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const addIssue = () => {
    if (!newIssue.description.trim()) return;
    setIssues(prev => [...prev, { id: Date.now(), ...newIssue, status: "open", date: new Date().toISOString().split("T")[0], aiSummary: null, reportedBy: director.name }]);
    setNewIssue({ flat: "Flat 1", description: "", urgent: false });
    setShowForm(false);
  };

  const analyse = async (issue) => {
    setLoadingId(issue.id);
    try {
      const reply = await callClaude([{ role: "user", content: `${issue.flat} reports: "${issue.description}". ${issue.urgent ? "URGENT." : ""} Provide: 1) Diagnosis, 2) Action needed, 3) UK cost estimate, 4) Contractor needed? Max 4 lines.` }],
        "You are a UK residential property maintenance expert. Be concise and practical.");
      setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, aiSummary: reply } : i));
    } catch {}
    setLoadingId(null);
  };

  const filtered = filter === "all" ? issues : issues.filter(i => i.status === filter);

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Maintenance</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#d4e6f8", fontFamily: "'Playfair Display', serif" }}>Issue Tracker</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btn("#1a6fbf")}>+ Report</button>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {["all", "open", "in-progress", "resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...btn(filter === f ? "#1a6fbf" : "#0d1f33"), fontSize: "11px", padding: "5px 10px", border: "1px solid #1e3050", textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: "16px" }}>
          <select value={newIssue.flat} onChange={e => setNewIssue(p => ({ ...p, flat: e.target.value }))} style={inp}>
            {FLATS.map(f => <option key={f}>{f}</option>)}
          </select>
          <textarea value={newIssue.description} onChange={e => setNewIssue(p => ({ ...p, description: e.target.value }))}
            placeholder="Describe the issue…" rows={3} style={{ ...inp, resize: "vertical", marginTop: "8px" }} />
          <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ef4444", fontSize: "13px", marginTop: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={newIssue.urgent} onChange={e => setNewIssue(p => ({ ...p, urgent: e.target.checked }))} /> Mark urgent
          </label>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={addIssue} style={btn("#1a6fbf")}>Submit</button>
            <button onClick={() => setShowForm(false)} style={btn("#1e3050")}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map(issue => (
          <div key={issue.id} style={{ ...card, borderLeft: `3px solid ${statusColor[issue.status]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5a9fd4", fontWeight: 600 }}>{issue.flat}</span>
                  {issue.urgent && <span style={{ fontSize: "10px", background: "#3d0f0f", color: "#ef4444", padding: "2px 7px", borderRadius: "20px" }}>URGENT</span>}
                </div>
                <div style={{ fontSize: "14px", color: "#d4e6f8" }}>{issue.description}</div>
                <div style={{ fontSize: "11px", color: "#3a6a8a", marginTop: "3px" }}>{issue.date} · Reported by {issue.reportedBy}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <select value={issue.status} onChange={e => setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, status: e.target.value } : i))}
                  style={{ ...inp, fontSize: "12px", padding: "5px 8px", color: statusColor[issue.status] }}>
                  {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button onClick={() => analyse(issue)} disabled={loadingId === issue.id}
                  style={{ ...btn("#0d3a2a", "#4ade80"), fontSize: "11px", padding: "5px 10px" }}>
                  {loadingId === issue.id ? "Analysing…" : "✦ AI Analyse"}
                </button>
              </div>
            </div>
            {issue.aiSummary && (
              <div style={{ marginTop: "12px", padding: "10px 12px", background: "#0a1e10", border: "1px solid #1a4a28", borderRadius: "8px", fontSize: "12px", color: "#86efac", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                <span style={{ fontSize: "10px", color: "#4ade80", letterSpacing: "1.5px", display: "block", marginBottom: "4px" }}>AI ASSESSMENT</span>
                {issue.aiSummary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────────────────────────
function Finance({ finances, setFinances }) {
  const [showForm, setShowForm] = useState(false);
  const [newTx, setNewTx] = useState({ type: "income", desc: "", amount: "", flat: "Flat 1", date: new Date().toISOString().split("T")[0] });
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const income = finances.filter(f => f.type === "income").reduce((a, b) => a + b.amount, 0);
  const expenses = finances.filter(f => f.type === "expense").reduce((a, b) => a + b.amount, 0);
  const flatsPaid = [...new Set(finances.filter(f => f.type === "income" && f.desc.includes("Service charge")).map(f => f.flat))];
  const unpaidFlats = FLATS.filter(f => !flatsPaid.includes(f));

  const addTx = () => {
    if (!newTx.desc.trim() || !newTx.amount) return;
    setFinances(prev => [...prev, { id: Date.now(), ...newTx, amount: parseFloat(newTx.amount) }]);
    setNewTx({ type: "income", desc: "", amount: "", flat: "Flat 1", date: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const reply = await callClaude([{ role: "user", content: `RTM block of 6 flats. Income: £${income}, Expenses: £${expenses}, Balance: £${income - expenses}. Transactions: ${JSON.stringify(finances)}. Unpaid service charges: ${unpaidFlats.join(", ") || "None"}. Give: 1) Financial health, 2) Key concerns, 3) Recommendation. Max 5 lines. UK English.` }],
        "You are a UK property finance advisor. Be concise.");
      setAiReport(reply);
    } catch { setAiReport("Could not generate report."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Finance</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#d4e6f8", fontFamily: "'Playfair Display', serif" }}>Accounts</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={generateReport} disabled={loading} style={{ ...btn("#0d3a2a", "#4ade80"), fontSize: "12px" }}>{loading ? "Generating…" : "✦ AI Report"}</button>
          <button onClick={() => setShowForm(!showForm)} style={btn("#1a6fbf")}>+ Add</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "16px" }}>
        {[{ l: "Income", v: income, c: "#22c55e" }, { l: "Expenses", v: expenses, c: "#ef4444" }, { l: "Balance", v: income - expenses, c: (income - expenses) >= 0 ? "#22c55e" : "#ef4444" }].map(s => (
          <div key={s.l} style={{ ...card }}>
            <div style={{ fontSize: "10px", color: "#3a6a8a", letterSpacing: "1.5px", textTransform: "uppercase" }}>{s.l}</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: s.c, marginTop: "4px" }}>£{s.v.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {unpaidFlats.length > 0 && (
        <div style={{ background: "#2d1a00", border: "1px solid #7c3a00", borderRadius: "10px", padding: "12px", marginBottom: "14px", fontSize: "13px", color: "#fb923c" }}>
          ⚠ Outstanding: <strong>{unpaidFlats.join(", ")}</strong>
        </div>
      )}

      {aiReport && (
        <div style={{ background: "#0a1e10", border: "1px solid #1a4a28", borderRadius: "10px", padding: "14px", marginBottom: "14px", fontSize: "13px", color: "#86efac", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          <div style={{ fontSize: "10px", color: "#4ade80", letterSpacing: "1.5px", marginBottom: "6px" }}>AI FINANCIAL REPORT</div>
          {aiReport}
        </div>
      )}

      <div style={{ fontSize: "11px", color: "#3a6a8a", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" }}>Xero sync: <span style={{ color: "#f59e0b" }}>● Connect to enable</span></div>

      {showForm && (
        <div style={{ ...card, marginBottom: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <select value={newTx.type} onChange={e => setNewTx(p => ({ ...p, type: e.target.value }))} style={inp}>
              <option value="income">Income</option><option value="expense">Expense</option>
            </select>
            <input type="date" value={newTx.date} onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))} style={inp} />
          </div>
          <input value={newTx.desc} onChange={e => setNewTx(p => ({ ...p, desc: e.target.value }))} placeholder="Description" style={{ ...inp, marginTop: "8px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
            <input type="number" value={newTx.amount} onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))} placeholder="Amount £" style={inp} />
            <select value={newTx.flat} onChange={e => setNewTx(p => ({ ...p, flat: e.target.value }))} style={inp}>
              <option value="All">All flats</option>{FLATS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={addTx} style={btn("#1a6fbf")}>Add</button>
            <button onClick={() => setShowForm(false)} style={btn("#1e3050")}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[...finances].reverse().map(tx => (
          <div key={tx.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", color: "#d4e6f8" }}>{tx.desc}</div>
              <div style={{ fontSize: "11px", color: "#3a6a8a", marginTop: "2px" }}>{tx.date} · {tx.flat}</div>
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: tx.type === "income" ? "#22c55e" : "#ef4444" }}>
              {tx.type === "income" ? "+" : "-"}£{tx.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Documents ────────────────────────────────────────────────────────────
function Documents({ docs }) {
  const [filter, setFilter] = useState("all");
  const folders = ["all", ...new Set(docs.map(d => d.folder))];
  const filtered = filter === "all" ? docs : docs.filter(d => d.folder === filter);
  const iconMap = { insurance: "🛡️", lease: "📄", minutes: "📝", invoice: "🧾" };

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Documents</div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#d4e6f8", fontFamily: "'Playfair Display', serif" }}>Drive Files</div>
      </div>

      <div style={{ background: "#0a1a2a", border: "1px dashed #1e3050", borderRadius: "10px", padding: "14px", marginBottom: "16px", fontSize: "13px", color: "#3a6a8a", textAlign: "center" }}>
        <div style={{ fontSize: "20px", marginBottom: "6px" }}>☁️</div>
        Google Drive not connected yet — <span style={{ color: "#5a9fd4" }}>connect to sync documents</span>
      </div>

      <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
        {folders.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ ...btn(filter === f ? "#1a6fbf" : "#0d1f33"), fontSize: "11px", padding: "5px 10px", border: "1px solid #1e3050" }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.map(doc => (
          <div key={doc.id} style={{ ...card, display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "22px" }}>{iconMap[doc.type] || "📁"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", color: "#d4e6f8" }}>{doc.name}</div>
              <div style={{ fontSize: "11px", color: "#3a6a8a", marginTop: "2px" }}>{doc.folder} · {doc.size} · {doc.date}</div>
            </div>
            <button style={{ ...btn("#0d1f33"), fontSize: "11px", padding: "5px 10px", border: "1px solid #1e3050" }}>View</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────
function Tasks({ tasks, setTasks, director }) {
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", assignee: director.name, due: "", priority: "medium" });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), ...newTask, done: false }]);
    setNewTask({ title: "", assignee: director.name, due: "", priority: "medium" });
    setShowForm(false);
  };

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Board</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#d4e6f8", fontFamily: "'Playfair Display', serif" }}>Director Tasks</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btn("#1a6fbf")}>+ Task</button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: "16px" }}>
          <input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title…" style={inp} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px" }}>
            <select value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} style={inp}>
              {DIRECTORS.map(d => <option key={d.id}>{d.name}</option>)}
            </select>
            <input type="date" value={newTask.due} onChange={e => setNewTask(p => ({ ...p, due: e.target.value }))} style={inp} />
            <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={inp}>
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={addTask} style={btn("#1a6fbf")}>Add</button>
            <button onClick={() => setShowForm(false)} style={btn("#1e3050")}>Cancel</button>
          </div>
        </div>
      )}

      <div>
        {["Pending", "Done"].map(group => {
          const groupTasks = tasks.filter(t => group === "Done" ? t.done : !t.done);
          return (
            <div key={group} style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "#3a6a8a", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>{group} ({groupTasks.length})</div>
              {groupTasks.map(t => (
                <div key={t.id} style={{ ...card, marginBottom: "8px", borderLeft: `3px solid ${priorityColor[t.priority]}`, display: "flex", alignItems: "center", gap: "12px", opacity: t.done ? 0.5 : 1 }}>
                  <input type="checkbox" checked={t.done} onChange={() => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
                    style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "#d4e6f8", textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                    <div style={{ fontSize: "11px", color: "#3a6a8a", marginTop: "2px" }}>{t.assignee}{t.due ? ` · Due ${t.due}` : ""}</div>
                  </div>
                  <span style={{ fontSize: "10px", color: priorityColor[t.priority], background: "#0d1f33", padding: "2px 8px", borderRadius: "20px", border: `1px solid ${priorityColor[t.priority]}33` }}>{t.priority}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Letters ──────────────────────────────────────────────────────────────
function Letters({ finances, director }) {
  const [letterType, setLetterType] = useState("service-charge");
  const [flat, setFlat] = useState("Flat 1");
  const [customNote, setCustomNote] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [gmailStatus, setGmailStatus] = useState(null);

  const letterTypes = [
    { value: "service-charge", label: "Service Charge Demand" },
    { value: "arrears", label: "Arrears Reminder" },
    { value: "maintenance", label: "Maintenance Notice" },
    { value: "agm", label: "AGM Notice" },
    { value: "custom", label: "Custom Letter" },
  ];

  const generate = async () => {
    setLoading(true); setLetter(""); setGmailStatus(null);
    const prompts = {
      "service-charge": `Draft a formal UK service charge demand letter for ${flat} for April–September 2026. Amount: £600. RTM company. Payment due 21 days. Include bank details placeholder. Director signature: ${director.name}.`,
      "arrears": `Draft polite but firm arrears reminder for ${flat}, outstanding service charge £600, 30 days overdue. Mention legal action if unpaid in 14 days. Signed by ${director.name}.`,
      "maintenance": `Notice to all residents: upcoming maintenance — ${customNote || "communal area works"}. Contractors need access. Brief, clear, professional.`,
      "agm": `Formal AGM notice for all 6 leaseholders. Date: [DATE], [TIME], [VENUE]. Agenda: accounts review, director election, budget approval, AOB. Signed by ${director.name}.`,
      "custom": `Professional RTM letter to ${flat}: ${customNote || "general communication"}. Signed by ${director.name}.`,
    };
    try {
      const reply = await callClaude([{ role: "user", content: prompts[letterType] }],
        "You are a UK property solicitor drafting RTM letters. Professional, ready-to-send, UK English, use [PLACEHOLDERS] where needed.");
      setLetter(reply);
    } catch { setLetter("Could not generate — try again."); }
    setLoading(false);
  };

  const sendViaGmail = () => {
    setGmailStatus("Gmail not connected yet — connect Gmail to send directly from here.");
  };

  return (
    <div style={{ padding: "20px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: "#5a9fd4", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Communications</div>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#d4e6f8", fontFamily: "'Playfair Display', serif" }}>AI Letter Writer</div>
      </div>

      <div style={{ ...card, marginBottom: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
          <div>
            <label style={lbl}>Letter Type</label>
            <select value={letterType} onChange={e => setLetterType(e.target.value)} style={inp}>
              {letterTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Recipient</label>
            <select value={flat} onChange={e => setFlat(e.target.value)} style={inp}>
              <option value="All Residents">All Residents</option>
              {FLATS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
        {(letterType === "maintenance" || letterType === "custom") && (
          <textarea value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="Details…" rows={2}
            style={{ ...inp, resize: "vertical", marginBottom: "12px" }} />
        )}
        <button onClick={generate} disabled={loading} style={{ ...btn(loading ? "#1e3050" : "#1a6fbf"), width: "100%", padding: "12px" }}>
          {loading ? "Drafting…" : "✦ Generate with AI"}
        </button>
      </div>

      {letter && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <button onClick={() => navigator.clipboard.writeText(letter)} style={{ ...btn("#1e3050"), fontSize: "12px" }}>Copy</button>
            <button onClick={sendViaGmail} style={{ ...btn("#0d3a2a", "#4ade80"), fontSize: "12px" }}>✉ Send via Gmail</button>
          </div>
          {gmailStatus && <div style={{ background: "#2d1a00", border: "1px solid #7c3a00", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#fb923c", marginBottom: "10px" }}>{gmailStatus}</div>}
          <div style={{ background: "#f8f6f0", borderRadius: "10px", padding: "20px", fontSize: "13px", color: "#1a1a1a", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "'Georgia', serif" }}>
            {letter}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────
export default function App() {
  const [director, setDirector] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [finances, setFinances] = useState(MOCK_FINANCES);
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [docs] = useState(MOCK_DOCS);

  if (!director) return <LoginScreen onLogin={setDirector} />;

  const tabs = [
    { id: "dashboard", label: "Home", icon: "⌂" },
    { id: "ai", label: "AI", icon: "✦" },
    { id: "maintenance", label: "Issues", icon: "🔧" },
    { id: "finance", label: "Finance", icon: "£" },
    { id: "docs", label: "Docs", icon: "📁" },
    { id: "tasks", label: "Tasks", icon: "✓" },
    { id: "letters", label: "Letters", icon: "✉" },
  ];

  const openCount = issues.filter(i => i.status === "open").length;

  return (
    <div style={{ minHeight: "100vh", background: "#060e18", color: "#d4e6f8", fontFamily: "'DM Sans','Segoe UI',sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #060e18; }
        ::-webkit-scrollbar-thumb { background: #1e3050; border-radius: 4px; }
        select option { background: #0d1f33; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "12px 16px 0", background: "#08131f", borderBottom: "1px solid #0d1f33" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#1a6fbf,#0d3a7a)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>🏢</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'Playfair Display',serif", color: "#d4e6f8" }}>RTM Portal</div>
            <div style={{ fontSize: "10px", color: "#3a6a8a" }}>6 Flats · {director.name}</div>
          </div>
          {openCount > 0 && <div style={{ background: "#3d0f0f", color: "#ef4444", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px" }}>{openCount} open</div>}
          <button onClick={() => setDirector(null)} style={{ ...btn("#0d1f33"), fontSize: "11px", padding: "5px 10px", border: "1px solid #1e3050" }}>↩ Switch</button>
        </div>
        <div style={{ display: "flex", overflowX: "auto", gap: "0" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none",
              borderBottom: tab === t.id ? "2px solid #1a6fbf" : "2px solid transparent",
              color: tab === t.id ? "#5a9fd4" : "#3a6a8a",
              padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {tab === "dashboard" && <div style={{ flex: 1, overflow: "auto" }}><Dashboard issues={issues} finances={finances} tasks={tasks} director={director} /></div>}
        {tab === "ai" && <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}><AIAssistant issues={issues} finances={finances} tasks={tasks} docs={docs} director={director} /></div>}
        {tab === "maintenance" && <div style={{ flex: 1, overflow: "auto" }}><Maintenance issues={issues} setIssues={setIssues} director={director} /></div>}
        {tab === "finance" && <div style={{ flex: 1, overflow: "auto" }}><Finance finances={finances} setFinances={setFinances} /></div>}
        {tab === "docs" && <div style={{ flex: 1, overflow: "auto" }}><Documents docs={docs} /></div>}
        {tab === "tasks" && <div style={{ flex: 1, overflow: "auto" }}><Tasks tasks={tasks} setTasks={setTasks} director={director} /></div>}
        {tab === "letters" && <div style={{ flex: 1, overflow: "auto" }}><Letters finances={finances} director={director} /></div>}
      </div>
    </div>
  );
}
