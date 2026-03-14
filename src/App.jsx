import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";

// ─── QUOTES ───────────────────────────────────────────────────────────────────
const QUOTES = [
  { t: "Be here. Right now. This moment is the only one that exists.", a: "MIA ✦" },
  { t: "You don't need more time. You need more presence.", a: "MIA ✦" },
  { t: "The morning belongs to you before it belongs to anyone else.", a: "MIA ✦" },
  { t: "Small rituals, practised daily, become the architecture of a beautiful life.", a: "MIA ✦" },
  { t: "Your last 15 minutes tonight shape your first 15 minutes tomorrow.", a: "MIA ✦" },
  { t: "Breathe. You are already exactly where you need to be.", a: "MIA ✦" },
  { t: "Consistency is not a talent. It is a decision.", a: "MIA ✦" },
  { t: "What you do in your quiet moments defines everything else.", a: "MIA ✦" },
  { t: "The most powerful thing you can do is show up for yourself.", a: "MIA ✦" },
  { t: "You are not behind. You are exactly on time.", a: "MIA ✦" },
  { t: "One mindful minute is worth more than one distracted hour.", a: "MIA ✦" },
  { t: "Your body is listening to every thought you think.", a: "MIA ✦" },
  { t: "Peace is not found. It is practised.", a: "MIA ✦" },
  { t: "Do it gently. Do it consistently. Watch yourself transform.", a: "MIA ✦" },
  { t: "Your morning is a gift you give yourself before the world wakes up.", a: "MIA ✦" },
];

// ─── MORNING ROUTINE ──────────────────────────────────────────────────────────
const MORNING_TASKS = [
  { id: "m1",  icon: "😊", name: "Smile",              desc: "Before getting out of bed, smile for 10 seconds. Trigger joy before the day begins." },
  { id: "m2",  icon: "🤲", name: "Scalp Massage",      desc: "30-second scalp massage to wake up the nervous system and stimulate circulation." },
  { id: "m3",  icon: "🪥", name: "Brush Teeth",        desc: "Brush with intention. No phone. Just presence." },
  { id: "m4",  icon: "✨", name: "Skincare",           desc: "A simple, consistent skincare routine — cleanse, moisturise, SPF." },
  { id: "m5",  icon: "🪞", name: "Mirror Affirmations",desc: "Look into the mirror and say self-loving affirmations out loud. At least 3." },
  { id: "m6",  icon: "💧", name: "Warm Water",         desc: "Drink 2 glasses of warm water sitting in Malasana to hydrate and activate digestion." },
  { id: "m7",  icon: "🌬️", name: "Pranayama",          desc: "3 minutes of conscious breathwork — alternate nostril, box breathing, or deep belly breath." },
  { id: "m8",  icon: "🧘", name: "Meditation",         desc: "5 minutes of silent, guided, or mantra-based meditation." },
  { id: "m9",  icon: "📖", name: "Read 1 Page",        desc: "Read one page of any book of your choice. Build the reading habit gently." },
  { id: "m10", icon: "🎯", name: "Set Intention",      desc: "Write or say one intention for the day." },
  { id: "m11", icon: "🙏", name: "Gratitude",          desc: "Name 3 things you are grateful for." },
  { id: "m12", icon: "🌿", name: "Movement",           desc: "30 seconds of any movement — stretch, shake, dance, jump." },
  { id: "m13", icon: "☀️", name: "Sunlight",           desc: "Step outside or near a window. Get natural light on your face for 30 seconds." },
  { id: "m14", icon: "🥗", name: "Nourish Preview",    desc: "Mentally review what you will eat today. Set yourself up to nourish well." },
  { id: "m15", icon: "💬", name: "Declare Your Day",   desc: "Say out loud: 'Today I choose to show up for myself.'" },
];

// ─── NIGHT ROUTINE ─────────────────────────────────────────────────────────────
const NIGHT_TASKS = [
  { id: "n1",  icon: "🍽️", name: "Menu Planning",      desc: "Write out tomorrow's meals or food intentions." },
  { id: "n2",  icon: "📝", name: "To-Do List",         desc: "Write 3–5 priorities for tomorrow. Clear the mental clutter." },
  { id: "n3",  icon: "🌰", name: "Soak the Nuts",      desc: "Soak almonds, walnuts, or seeds overnight for tomorrow morning." },
  { id: "n4",  icon: "🌙", name: "Night Skincare",     desc: "Evening cleanse, serum, night cream. A ritual of self-care." },
  { id: "n5",  icon: "📓", name: "Gratitude Journal",  desc: "Write 3 things that went well today." },
  { id: "n6",  icon: "🌟", name: "Reflect",            desc: "One sentence: what did I do today that I am proud of?" },
  { id: "n7",  icon: "📵", name: "Digital Sunset",     desc: "Put the phone away. No screens for the final 10 minutes." },
  { id: "n8",  icon: "🍵", name: "Herbal Tea",         desc: "Sip something warm and calming." },
  { id: "n9",  icon: "📖", name: "Read 1 Page",        desc: "Continue your book. End the day with imagination, not a screen." },
  { id: "n10", icon: "🌬️", name: "Breathing",          desc: "3 minutes of slow, deep breathing to calm the nervous system." },
  { id: "n11", icon: "🧘", name: "Body Scan",          desc: "1-minute mental scan from head to toe. Notice and release tension." },
  { id: "n12", icon: "💗", name: "Affirmations",       desc: "3 loving affirmations before sleep." },
  { id: "n13", icon: "🕊️", name: "Forgiveness",        desc: "Release anything from the day. Let it go." },
  { id: "n14", icon: "🌛", name: "Sleep Intention",    desc: "Choose how you want to wake up feeling tomorrow." },
  { id: "n15", icon: "😊", name: "Smile",              desc: "End the day the same way it began. Smile." },
];

const ALL_TASKS = [...MORNING_TASKS, ...NIGHT_TASKS];
const COLORS = ["#f9b8ca","#f4a7b9","#e896a8","#e8a4c8","#c8a4c8","#b8c4e8","#a4c8b8","#f9c8a0","#e8b898"];
const DAYS_SHORT = ["M","T","W","T","F","S","S"];
const LEVEL_THRESHOLD_DAYS = 90;
const LEVEL_THRESHOLD_PCT = 0.7;
const LEVEL_REQUIRED_DAYS = 80;

function toDay(d) { return d.toISOString().split("T")[0]; }
function todayStr() { return toDay(new Date()); }
function getLast7() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return toDay(d);
  });
}
function getLast10Weeks() {
  return Array.from({ length: 10 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const dt = new Date(); dt.setDate(dt.getDate() - (9 - w) * 7 - (6 - d)); return toDay(dt);
    })
  );
}
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

const f = { fontFamily: "'DM Sans', sans-serif" };
const serif = { fontFamily: "'Cormorant Garamond', serif" };

function SectionTitle({ children, style = {} }) {
  return <p style={{ ...f, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#e8a0b8", margin: "22px 0 12px", ...style }}>{children}</p>;
}

// ─── TASK ROW ─────────────────────────────────────────────────────────────────
function TaskRow({ task, i, date, logs, onToggle, showDesc = false }) {
  const [expanded, setExpanded] = useState(false);
  const done = !!logs[task.id + "||" + date];
  const c = COLORS[i % COLORS.length];
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{
        display: "flex", alignItems: "center",
        padding: "12px 14px", borderRadius: 16,
        background: done ? c + "18" : "white",
        border: `1px solid ${done ? c + "66" : "#fce8f0"}`,
        transition: "all 0.2s", WebkitTapHighlightColor: "transparent",
      }}>
        <div onClick={() => onToggle(task.id, date)} style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: done ? c : "transparent",
          border: `1.5px solid ${done ? c : "#f4c0d0"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: 14, cursor: "pointer", transition: "all 0.2s",
        }}>{done ? "✓" : ""}</div>
        <span style={{ fontSize: 18, margin: "0 10px", flexShrink: 0 }}>{task.icon}</span>
        <div style={{ flex: 1 }} onClick={() => setExpanded(!expanded)}>
          <p style={{ ...f, fontSize: 13, color: "#3d2535", margin: 0, cursor: "pointer" }}>{task.name}</p>
          {expanded && <p style={{ ...f, fontSize: 11, color: "#9a7080", marginTop: 4, lineHeight: 1.6 }}>{task.desc}</p>}
        </div>
        <span onClick={() => setExpanded(!expanded)} style={{ fontSize: 10, color: "#e8a0b8", cursor: "pointer", padding: "0 4px" }}>{expanded ? "▲" : "▼"}</span>
      </div>
    </div>
  );
}

// ─── PROGRESS RING ────────────────────────────────────────────────────────────
function Ring({ pct, size = 64, stroke = 4, color = "#f4a7b9", label }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 0.6s" }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize={size < 50 ? 9 : 13} fill="#d4607a" fontWeight="500">{label || pct + "%"}</text>
    </svg>
  );
}

// ─── LEVEL BADGE ──────────────────────────────────────────────────────────────
function LevelBadge({ level }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "linear-gradient(135deg,#f9b8ca,#c8a4c8)", borderRadius: 20, padding: "4px 12px" }}>
      <span style={{ fontSize: 12 }}>✦</span>
      <span style={{ ...f, fontSize: 10, color: "white", letterSpacing: 1.5, fontWeight: 500 }}>LEVEL {level}</span>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [routineTab, setRoutineTab] = useState("morning"); // morning | night
  const [logs, setLogs] = useState({});
  const [water, setWaterRaw] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dataId, setDataId] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [expandedTask, setExpandedTask] = useState(null);

  const today = todayStr();
  const last7 = getLast7();
  const weeks = getLast10Weeks();
  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadUserData(); }, [session]);

  const loadUserData = async () => {
    const { data } = await supabase.from("habits").select("*").eq("user_id", session.user.id).single();
    if (data) {
      setDataId(data.id);
      setLogs(data.logs || {});
      setWaterRaw(data.water?.[today] || 0);
      setUserLevel(data.level || 1);
    } else {
      const { data: nd } = await supabase.from("habits").insert({
        user_id: session.user.id,
        name: JSON.stringify([]),
        logs: {}, water: {}, level: 1,
      }).select().single();
      if (nd) setDataId(nd.id);
    }
  };

  const saveData = async (newLogs, newWater, newLevel) => {
    if (!session || !dataId) return;
    setSaving(true);
    await supabase.from("habits").update({
      logs: newLogs,
      water: { [today]: newWater },
      level: newLevel,
    }).eq("id", dataId);
    setSaving(false);
  };

  const toggle = (taskId, date) => {
    const newLogs = { ...logs, [taskId + "||" + date]: !logs[taskId + "||" + date] };
    setLogs(newLogs);
    saveData(newLogs, water, userLevel);
  };

  const setWater = (n) => {
    const nw = water === n ? n - 1 : n;
    setWaterRaw(nw);
    saveData(logs, nw, userLevel);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setLogs({}); setWaterRaw(0); setDataId(null);
  };

  // ── Computed ──
  const isDone = (taskId, date) => !!logs[taskId + "||" + date];
  const morningDoneToday = MORNING_TASKS.filter(t => isDone(t.id, today)).length;
  const nightDoneToday = NIGHT_TASKS.filter(t => isDone(t.id, today)).length;
  const totalDoneToday = morningDoneToday + nightDoneToday;
  const totalTasks = ALL_TASKS.length;
  const overallPct = Math.round(totalDoneToday / totalTasks * 100);
  const morningPct = Math.round(morningDoneToday / MORNING_TASKS.length * 100);
  const nightPct = Math.round(nightDoneToday / NIGHT_TASKS.length * 100);

  const taskStreak = (taskId) => {
    let s = 0, d = new Date();
    while (isDone(taskId, toDay(d))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  };

  const dayScore = (date) => {
    const done = ALL_TASKS.filter(t => isDone(t.id, date)).length;
    return done / totalTasks;
  };

  // Level progress: count qualifying days in last 90
  const qualifyingDays = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    return dayScore(toDay(d)) >= LEVEL_THRESHOLD_PCT;
  }).filter(Boolean).length;
  const levelProgress = Math.min(Math.round(qualifyingDays / LEVEL_REQUIRED_DAYS * 100), 100);
  const daysToNextLevel = Math.max(LEVEL_REQUIRED_DAYS - qualifyingDays, 0);

  const userName = session?.user?.user_metadata?.full_name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "lovely";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fff8fb,#fdf0f7,#f8f0fd)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🌸</div>
      <p style={{ ...serif, fontSize: 24, fontStyle: "italic", color: "#d4607a" }}>Loading MIA...</p>
    </div>
  );

  if (!session) return <Auth />;

  // ── TAB BAR ──
  const TabBar = () => (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "rgba(255,248,251,0.97)", backdropFilter: "blur(16px)",
      borderTop: "1px solid #fce8f0",
      display: "flex", justifyContent: "space-around",
      padding: "8px 0 calc(8px + env(safe-area-inset-bottom))", zIndex: 100,
    }}>
      {[
        { id: "home",     icon: "🌸", label: "Home" },
        { id: "routines", icon: "✦",  label: "Routines" },
        { id: "progress", icon: "📊", label: "Progress" },
        { id: "journey",  icon: "💗", label: "Journey" },
      ].map(({ id, icon, label }) => (
        <button key={id} onClick={() => setTab(id)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          padding: "2px 12px", WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontSize: tab === id ? 20 : 17, transition: "all 0.2s" }}>{icon}</span>
          <span style={{ ...f, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: tab === id ? "#d4607a" : "#c8a0b8", fontWeight: tab === id ? 500 : 300 }}>{label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fff8fb 0%,#fdf0f7 50%,#f8f0fd 100%)", maxWidth: 430, margin: "0 auto", paddingBottom: 90 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdf8fb; -webkit-font-smoothing: antialiased; }
        input:focus { outline: none; }
        button { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #f4c0d0; border-radius: 3px; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════ HOME */}
      {tab === "home" && (
        <div>
          {/* Hero */}
          <div style={{ background: "linear-gradient(160deg,#fde8f0 0%,#f8e8fd 100%)", padding: "48px 24px 28px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "rgba(249,184,202,0.2)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 140, height: 140, background: "rgba(200,164,200,0.15)", borderRadius: "50%" }} />
            <button onClick={signOut} style={{ position: "absolute", top: 16, right: 20, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(249,184,202,0.4)", borderRadius: 20, padding: "5px 12px", ...f, fontSize: 10, color: "#b8809a", cursor: "pointer" }}>Sign out</button>
            {saving && <p style={{ position: "absolute", top: 18, left: 20, ...f, fontSize: 9, color: "#e8a0b8" }}>saving...</p>}
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <p style={{ ...f, fontSize: 10, letterSpacing: 3, color: "#e8a0b8", textTransform: "uppercase" }}>{greeting}</p>
                <LevelBadge level={userLevel} />
              </div>
              <h1 style={{ ...serif, fontSize: 34, fontStyle: "italic", fontWeight: 300, color: "#3d2535", lineHeight: 1.1, marginBottom: 4 }}>Hello, {userName} ✦</h1>
              <p style={{ ...f, fontSize: 11, color: "#b8809a", marginBottom: 22 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              {/* Rings row */}
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <Ring pct={overallPct} size={64} />
                  <p style={{ ...f, fontSize: 9, color: "#c8a0b8", marginTop: 4 }}>Today</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Ring pct={morningPct} size={48} color="#f9b8ca" />
                  <p style={{ ...f, fontSize: 9, color: "#c8a0b8", marginTop: 4 }}>Morning</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Ring pct={nightPct} size={48} color="#c8a4c8" />
                  <p style={{ ...f, fontSize: 9, color: "#c8a0b8", marginTop: 4 }}>Night</p>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                  <div style={{ background: "rgba(255,255,255,0.65)", borderRadius: 14, padding: "6px 12px", border: "1px solid rgba(249,184,202,0.3)" }}>
                    <span style={{ ...f, fontSize: 10, color: "#b8809a" }}>Tasks done </span>
                    <span style={{ ...f, fontSize: 12, fontWeight: 500, color: "#d4607a" }}>{totalDoneToday}/{totalTasks}</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.65)", borderRadius: 14, padding: "6px 12px", border: "1px solid rgba(249,184,202,0.3)" }}>
                    <span style={{ ...f, fontSize: 10, color: "#b8809a" }}>Water </span>
                    <span style={{ ...f, fontSize: 12, fontWeight: 500, color: "#d4607a" }}>{water}/8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "0 22px" }}>
            {/* Daily quote */}
            <div style={{ background: "linear-gradient(135deg,#fde8f0,#f0e8fd)", borderRadius: 20, padding: "18px 20px", marginTop: 20, border: "1px solid rgba(249,184,202,0.3)" }}>
              <p style={{ ...f, fontSize: 9, letterSpacing: 2, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 8 }}>Daily Mindfulness</p>
              <p style={{ ...serif, fontSize: 17, fontStyle: "italic", color: "#5a3040", lineHeight: 1.65, marginBottom: 8 }}>"{quote.t}"</p>
              <p style={{ ...f, fontSize: 10, color: "#c8a0b8", letterSpacing: 1 }}>— {quote.a}</p>
            </div>

            {/* Morning preview */}
            <SectionTitle>☀️ Morning Routine</SectionTitle>
            <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ ...f, fontSize: 12, color: "#5a3040" }}>{morningDoneToday} of 15 complete</p>
                <Ring pct={morningPct} size={36} stroke={3} color="#f9b8ca" />
              </div>
              <div style={{ height: 5, background: "#fce8f0", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${morningPct}%`, background: "linear-gradient(90deg,#f9b8ca,#e896a8)", borderRadius: 10, transition: "width 0.5s" }} />
              </div>
              <p onClick={() => { setTab("routines"); setRoutineTab("morning"); }} style={{ ...f, fontSize: 11, color: "#e8a0b8", marginTop: 10, cursor: "pointer", textAlign: "center" }}>Start morning routine →</p>
            </div>

            {/* Night preview */}
            <SectionTitle>🌙 Night Routine</SectionTitle>
            <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ ...f, fontSize: 12, color: "#5a3040" }}>{nightDoneToday} of 15 complete</p>
                <Ring pct={nightPct} size={36} stroke={3} color="#c8a4c8" />
              </div>
              <div style={{ height: 5, background: "#f0e8f8", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${nightPct}%`, background: "linear-gradient(90deg,#c8a4c8,#a880a8)", borderRadius: 10, transition: "width 0.5s" }} />
              </div>
              <p onClick={() => { setTab("routines"); setRoutineTab("night"); }} style={{ ...f, fontSize: 11, color: "#c8a4c8", marginTop: 10, cursor: "pointer", textAlign: "center" }}>Start night routine →</p>
            </div>

            {/* Water */}
            <SectionTitle>💧 Water Today</SectionTitle>
            <div style={{ background: "white", border: "1px solid #e8f4fd", borderRadius: 20, padding: "16px 16px 14px" }}>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} onClick={() => setWater(i + 1)} style={{
                    width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                    background: i < water ? "linear-gradient(160deg,#b8d4e8,#88b8d8)" : "white",
                    border: `1.5px solid ${i < water ? "#88b8d8" : "#c8dce8"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.2s",
                  }}>💧</div>
                ))}
              </div>
              <div style={{ height: 5, background: "#f0ecf8", borderRadius: 10, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${water / 8 * 100}%`, background: "linear-gradient(90deg,#b8d4e8,#88b8d8)", borderRadius: 10, transition: "width 0.4s" }} />
              </div>
              <p style={{ ...f, fontSize: 11, color: "#88b8d8" }}>{water} of 8 glasses · {water * 250}ml</p>
            </div>

            {/* Level progress */}
            <SectionTitle>✦ Level Progress</SectionTitle>
            <div style={{ background: "linear-gradient(135deg,#fde8f0,#fdf0f8)", border: "1px solid #f9c8d8", borderRadius: 20, padding: "18px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <p style={{ ...serif, fontSize: 18, fontStyle: "italic", color: "#3d2535" }}>Level {userLevel} — Foundation</p>
                  <p style={{ ...f, fontSize: 11, color: "#b8809a", marginTop: 3 }}>
                    {daysToNextLevel > 0 ? `${daysToNextLevel} more qualifying days to Level ${userLevel + 1}` : "Ready to advance! ✦"}
                  </p>
                </div>
                <Ring pct={levelProgress} size={52} stroke={4} color="#e896a8" />
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.6)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${levelProgress}%`, background: "linear-gradient(90deg,#f9b8ca,#c8a4c8)", borderRadius: 10, transition: "width 0.6s" }} />
              </div>
              <p style={{ ...f, fontSize: 10, color: "#c8a0b8", marginTop: 6 }}>{qualifyingDays} of {LEVEL_REQUIRED_DAYS} qualifying days · complete 70%+ of all tasks to qualify</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ ROUTINES */}
      {tab === "routines" && (
        <div style={{ padding: "44px 22px 0" }}>
          {/* Toggle */}
          <div style={{ display: "flex", background: "#fdf0f4", borderRadius: 20, padding: 4, marginBottom: 24 }}>
            {[["morning", "☀️ Morning"], ["night", "🌙 Night"]].map(([id, label]) => (
              <button key={id} onClick={() => setRoutineTab(id)} style={{
                flex: 1, padding: "11px", border: "none", borderRadius: 16, cursor: "pointer",
                background: routineTab === id ? "white" : "transparent",
                boxShadow: routineTab === id ? "0 2px 10px rgba(244,167,185,0.2)" : "none",
                ...f, fontSize: 13, color: routineTab === id ? "#d4607a" : "#b8809a",
                fontWeight: routineTab === id ? 500 : 300, transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          {routineTab === "morning" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h2 style={{ ...serif, fontSize: 26, fontStyle: "italic", fontWeight: 300, color: "#3d2535" }}>Morning Routine</h2>
                <Ring pct={morningPct} size={44} stroke={3} color="#f9b8ca" />
              </div>
              <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginBottom: 18 }}>Your first 15 minutes · {morningDoneToday} of 15 done</p>
              {MORNING_TASKS.map((task, i) => (
                <TaskRow key={task.id} task={task} i={i} date={today} logs={logs} onToggle={toggle} />
              ))}
            </div>
          )}

          {routineTab === "night" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h2 style={{ ...serif, fontSize: 26, fontStyle: "italic", fontWeight: 300, color: "#3d2535" }}>Night Routine</h2>
                <Ring pct={nightPct} size={44} stroke={3} color="#c8a4c8" />
              </div>
              <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginBottom: 18 }}>Your last 15 minutes · {nightDoneToday} of 15 done</p>
              {NIGHT_TASKS.map((task, i) => (
                <TaskRow key={task.id} task={task} i={i + 15} date={today} logs={logs} onToggle={toggle} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ PROGRESS */}
      {tab === "progress" && (
        <div style={{ padding: "44px 22px 0" }}>
          <h2 style={{ ...serif, fontSize: 28, fontStyle: "italic", fontWeight: 300, color: "#3d2535", marginBottom: 4 }}>Progress</h2>
          <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginBottom: 20 }}>Your 10-week pattern</p>

          {/* Routine toggle */}
          <div style={{ display: "flex", background: "#fdf0f4", borderRadius: 16, padding: 3, marginBottom: 20 }}>
            {[["morning", "☀️ Morning"], ["night", "🌙 Night"]].map(([id, label]) => (
              <button key={id} onClick={() => setRoutineTab(id)} style={{
                flex: 1, padding: "8px", border: "none", borderRadius: 13, cursor: "pointer",
                background: routineTab === id ? "white" : "transparent",
                ...f, fontSize: 12, color: routineTab === id ? "#d4607a" : "#b8809a",
                fontWeight: routineTab === id ? 500 : 300, transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          {(routineTab === "morning" ? MORNING_TASKS : NIGHT_TASKS).map((task, i) => {
            const c = COLORS[(routineTab === "morning" ? i : i + 15) % COLORS.length];
            const wPct = Math.round(last7.filter(d => isDone(task.id, d)).length / 7 * 100);
            const s = taskStreak(task.id);
            return (
              <div key={task.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <p style={{ ...f, fontSize: 12, color: "#5a3040" }}>{task.icon} {task.name}</p>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ ...f, fontSize: 10, color: "#e8a0b8" }}>{wPct}%</span>
                    {s > 0 && <span style={{ ...f, fontSize: 10, background: c + "22", color: c, padding: "2px 8px", borderRadius: 10 }}>🔥 {s}d</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {weeks.map((week, wi) => (
                    <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {week.map((day, di) => (
                        <div key={di} onClick={() => toggle(task.id, day)} style={{
                          width: 10, height: 10, borderRadius: 3, cursor: "pointer",
                          background: isDone(task.id, day) ? c : "#fce8f0", transition: "all 0.15s",
                        }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, paddingBottom: 8 }}>
            <p style={{ ...f, fontSize: 10, color: "#d4a0b8" }}>less</p>
            {["#fce8f0","#f9c8d8","#f4a7b9","#e896a8","#d4607a"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            ))}
            <p style={{ ...f, fontSize: 10, color: "#d4a0b8" }}>more</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ JOURNEY */}
      {tab === "journey" && (
        <div style={{ padding: "44px 22px 0" }}>
          <h2 style={{ ...serif, fontSize: 28, fontStyle: "italic", fontWeight: 300, color: "#3d2535", marginBottom: 4 }}>Your Journey</h2>
          <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginBottom: 20 }}>Insights, patterns & level progress</p>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              ["Today", `${totalDoneToday}/${totalTasks}`],
              ["Morning", `${morningPct}%`],
              ["Night", `${nightPct}%`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 16, padding: "14px 10px", textAlign: "center" }}>
                <p style={{ ...f, fontSize: 18, fontWeight: 500, color: "#d4607a", marginBottom: 4 }}>{v}</p>
                <p style={{ ...f, fontSize: 9, letterSpacing: 1.5, color: "#c8a0b8", textTransform: "uppercase" }}>{l}</p>
              </div>
            ))}
          </div>

          {/* Champion & needs love */}
          {(() => {
            const scores = ALL_TASKS.map(t => ({ task: t, pct: Math.round(last7.filter(d => isDone(t.id, d)).length / 7 * 100) }));
            const best = scores.reduce((a, b) => a.pct >= b.pct ? a : b);
            const needs = scores.reduce((a, b) => a.pct <= b.pct ? a : b);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div style={{ background: "linear-gradient(135deg,#fde8f0,#fdf0f8)", border: "1px solid #f9c8d8", borderRadius: 18, padding: "16px" }}>
                  <p style={{ ...f, fontSize: 8, letterSpacing: 2, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>✦ Champion</p>
                  <p style={{ fontSize: 20, marginBottom: 4 }}>{best.task.icon}</p>
                  <p style={{ ...serif, fontSize: 14, fontStyle: "italic", color: "#3d2535", marginBottom: 4 }}>{best.task.name}</p>
                  <p style={{ ...f, fontSize: 10, color: "#b8809a" }}>{best.pct}% this week</p>
                </div>
                <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 18, padding: "16px" }}>
                  <p style={{ ...f, fontSize: 8, letterSpacing: 2, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>✦ Needs love</p>
                  <p style={{ fontSize: 20, marginBottom: 4 }}>{needs.task.icon}</p>
                  <p style={{ ...serif, fontSize: 14, fontStyle: "italic", color: "#3d2535", marginBottom: 4 }}>{needs.task.name}</p>
                  <p style={{ ...f, fontSize: 10, color: "#b8809a" }}>{needs.pct}% this week</p>
                </div>
              </div>
            );
          })()}

          {/* 7-day bar chart */}
          <SectionTitle>Daily completion — last 7 days</SectionTitle>
          <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "18px 16px 14px", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {last7.map((d, i) => {
                const score = dayScore(d);
                const barH = Math.max(Math.round(score * 72), 3);
                const isT = d === today;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: barH, borderRadius: 6, background: isT ? "linear-gradient(180deg,#f9b8ca,#e896a8)" : "#fce8f0", transition: "height 0.5s" }} />
                    <p style={{ ...f, fontSize: 9, color: isT ? "#e896a8" : "#c8a0b8" }}>
                      {DAYS_SHORT[new Date(d).getDay() === 0 ? 6 : new Date(d).getDay() - 1]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Level card */}
          <SectionTitle>Level journey</SectionTitle>
          <div style={{ background: "linear-gradient(135deg,#fde8f0,#f0e8fd)", border: "1px solid #f9c8d8", borderRadius: 20, padding: "20px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <LevelBadge level={userLevel} />
                <p style={{ ...serif, fontSize: 20, fontStyle: "italic", color: "#3d2535", marginTop: 10, marginBottom: 4 }}>Foundation</p>
                <p style={{ ...f, fontSize: 11, color: "#b8809a" }}>Master all 30 daily tasks for 90 days</p>
              </div>
              <Ring pct={levelProgress} size={56} stroke={4} color="#e896a8" />
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.6)", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${levelProgress}%`, background: "linear-gradient(90deg,#f9b8ca,#c8a4c8)", borderRadius: 10, transition: "width 0.6s" }} />
            </div>
            <p style={{ ...f, fontSize: 11, color: "#c8a0b8" }}>
              {qualifyingDays}/{LEVEL_REQUIRED_DAYS} qualifying days · {daysToNextLevel > 0 ? `${daysToNextLevel} more to go` : "Level 2 unlocking soon! ✦"}
            </p>
          </div>

          {/* Locked level preview */}
          <div style={{ background: "rgba(255,255,255,0.5)", border: "1px solid #fce8f0", borderRadius: 20, padding: "20px", textAlign: "center", opacity: 0.7 }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🔒</p>
            <p style={{ ...serif, fontSize: 20, fontStyle: "italic", color: "#b8809a", marginBottom: 6 }}>Level 2 — Deepening</p>
            <p style={{ ...f, fontSize: 11, color: "#c8a0b8", lineHeight: 1.6 }}>Complete Level 1 for 90 days to unlock deeper practices, new routines, and advanced tools.</p>
          </div>

          {/* All tasks progress */}
          <SectionTitle style={{ marginTop: 28 }}>All tasks this week</SectionTitle>
          <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "18px" }}>
            {ALL_TASKS.map((task, i) => {
              const pct = Math.round(last7.filter(d => isDone(task.id, d)).length / 7 * 100);
              return (
                <div key={task.id} style={{ marginBottom: i < ALL_TASKS.length - 1 ? 12 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <p style={{ ...f, fontSize: 11, color: "#5a3040" }}>{task.icon} {task.name}</p>
                    <p style={{ ...f, fontSize: 10, color: "#e8a0b8" }}>{pct}%</p>
                  </div>
                  <div style={{ height: 4, background: "#fce8f0", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${COLORS[i % COLORS.length]},#f4a7b9)`, borderRadius: 10, transition: "width 0.6s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
