import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";

const QUOTES = [
  { t: "Small steps every day lead to big changes.", a: "daily reminder ✦" },
  { t: "You are doing better than you think.", a: "for you ✦" },
  { t: "Take care of your body. It's the only place you live.", a: "Jim Rohn" },
  { t: "Progress, not perfection.", a: "daily reminder ✦" },
  { t: "She believed she could, so she did.", a: "r.s. grey" },
  { t: "Your habits shape your identity.", a: "James Clear" },
  { t: "Consistency is the secret ingredient.", a: "daily reminder ✦" },
  { t: "Every day is a fresh start.", a: "daily reminder ✦" },
  { t: "You deserve the effort you give others.", a: "for you ✦" },
];

const DEFAULT_HABITS = [
  "Hydration 💧", "Skincare ✨", "Movement 🌿",
  "Reading 📖", "Journaling 🌸", "Sleep 8h 🌙", "Meditation 🕊️",
];

const COLORS = [
  "#f9b8ca","#f4a7b9","#e896a8","#e8a4c8",
  "#c8a4c8","#b8c4e8","#a4c8b8","#f9c8a0","#e8b898",
];

const DAYS_SHORT = ["M","T","W","T","F","S","S"];

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

const f = { fontFamily: "'DM Sans', sans-serif" };
const serif = { fontFamily: "'Cormorant Garamond', serif" };

function SectionTitle({ children }) {
  return <p style={{ ...f, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#e8a0b8", margin: "22px 0 12px" }}>{children}</p>;
}

function HabitRow({ h, i, date, logs, onToggle, last7 }) {
  const done = !!logs[h + "||" + date];
  const c = COLORS[i % COLORS.length];
  const s = (() => { let s = 0, d = new Date(); while (!!logs[h + "||" + toDay(d)]) { s++; d.setDate(d.getDate() - 1); } return s; })();
  return (
    <div onClick={() => onToggle(h, date)} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 14px", marginBottom: 7, borderRadius: 16, cursor: "pointer",
      background: done ? c + "18" : "white",
      border: `1px solid ${done ? c + "66" : "#fce8f0"}`,
      transition: "all 0.2s", WebkitTapHighlightColor: "transparent",
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: done ? c : "transparent",
        border: `1.5px solid ${done ? c : "#f4c0d0"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: 13, transition: "all 0.2s",
      }}>{done ? "✓" : ""}</div>
      <div style={{ flex: 1, marginLeft: 10 }}>
        <p style={{ ...f, fontSize: 13, color: "#3d2535", margin: 0 }}>{h}</p>
        {s > 1 && <p style={{ ...f, fontSize: 9, color: "#e8a0b8", marginTop: 2 }}>🔥 {s} day streak</p>}
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {last7.map((d, di) => (
          <div key={di} style={{ width: 5, height: 5, borderRadius: "50%", background: !!logs[h + "||" + d] ? c : "#fce8f0" }} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [logs, setLogs] = useState({});
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [water, setWaterRaw] = useState(0);
  const [newHabit, setNewHabit] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataId, setDataId] = useState(null);

  const today = todayStr();
  const last7 = getLast7();
  const weeks = getLast10Weeks();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadUserData(); }, [session]);

  const loadUserData = async () => {
    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    if (data) {
      setDataId(data.id);
      setHabits(data.name ? JSON.parse(data.name) : DEFAULT_HABITS);
      setLogs(data.logs || {});
      setWaterRaw(data.water?.[today] || 0);
    } else {
      const { data: newData } = await supabase.from("habits").insert({
        user_id: session.user.id,
        name: JSON.stringify(DEFAULT_HABITS),
        logs: {}, water: {},
      }).select().single();
      if (newData) setDataId(newData.id);
    }
  };

  const saveData = async (newHabits, newLogs, newWater) => {
    if (!session || !dataId) return;
    setSaving(true);
    await supabase.from("habits").update({
      name: JSON.stringify(newHabits),
      logs: newLogs,
      water: { [today]: newWater },
    }).eq("id", dataId);
    setSaving(false);
  };

  const toggle = (h, d) => {
    const newLogs = { ...logs, [h + "||" + d]: !logs[h + "||" + d] };
    setLogs(newLogs); saveData(habits, newLogs, water);
  };

  const setWater = (n) => {
    const nw = water === n ? n - 1 : n;
    setWaterRaw(nw); saveData(habits, logs, nw);
  };

  const addHabit = () => {
    const v = newHabit.trim();
    if (v && !habits.includes(v)) {
      const nh = [...habits, v];
      setHabits(nh); setNewHabit(""); setShowAddModal(false);
      saveData(nh, logs, water);
    }
  };

  const removeHabit = (h) => {
    const nh = habits.filter(x => x !== h);
    setHabits(nh); saveData(nh, logs, water);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setLogs({}); setHabits(DEFAULT_HABITS); setWaterRaw(0); setDataId(null);
  };

  const isDone = (h, d) => !!logs[h + "||" + d];
  const streak = (h) => { let s = 0, d = new Date(); while (isDone(h, toDay(d))) { s++; d.setDate(d.getDate() - 1); } return s; };
  const weekPct = (h) => Math.round(last7.filter(d => isDone(h, d)).length / 7 * 100);
  const todayCount = habits.filter(h => isDone(h, today)).length;
  const bestStreak = Math.max(...habits.map(h => streak(h)), 0);
  const overallPct = habits.length ? Math.round(todayCount / habits.length * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const userName = session?.user?.user_metadata?.full_name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "lovely";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fff8fb,#fdf0f7,#f8f0fd)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 40 }}>🌸</div>
      <p style={{ ...serif, fontSize: 22, fontStyle: "italic", color: "#d4607a" }}>Loading Mia...</p>
    </div>
  );

  if (!session) return <Auth />;

  const TabBar = () => (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "rgba(255,248,251,0.96)", backdropFilter: "blur(16px)",
      borderTop: "1px solid #fce8f0",
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 calc(10px + env(safe-area-inset-bottom))",
      zIndex: 100,
    }}>
      {[
        { id: "home", icon: "🌸", label: "Home" },
        { id: "habits", icon: "✦", label: "Habits" },
        { id: "history", icon: "🗓", label: "History" },
        { id: "insights", icon: "💗", label: "Insights" },
      ].map(({ id, icon, label }) => (
        <button key={id} onClick={() => setTab(id)} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          padding: "2px 16px", WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontSize: tab === id ? 20 : 18, transition: "font-size 0.2s" }}>{icon}</span>
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
        input:focus { outline: none; border-color: #f4a7b9 !important; }
        button { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #f4c0d0; border-radius: 3px; }
      `}</style>

      {/* HOME */}
      {tab === "home" && (
        <div>
          <div style={{ background: "linear-gradient(160deg,#fde8f0 0%,#f8e8fd 100%)", padding: "52px 24px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "rgba(249,184,202,0.22)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 120, height: 120, background: "rgba(200,164,200,0.18)", borderRadius: "50%" }} />
            <button onClick={signOut} style={{ position: "absolute", top: 16, right: 20, background: "rgba(255,255,255,0.6)", border: "1px solid rgba(249,184,202,0.4)", borderRadius: 20, padding: "5px 12px", ...f, fontSize: 10, color: "#b8809a", cursor: "pointer" }}>Sign out</button>
            {saving && <div style={{ position: "absolute", top: 18, left: 20, ...f, fontSize: 9, color: "#e8a0b8", letterSpacing: 1 }}>saving...</div>}
            <div style={{ position: "relative" }}>
              <p style={{ ...f, fontSize: 10, letterSpacing: 3, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>{greeting}</p>
              <h1 style={{ ...serif, fontSize: 36, fontStyle: "italic", fontWeight: 300, color: "#3d2535", lineHeight: 1.1, marginBottom: 6 }}>Hello, {userName} ✦</h1>
              <p style={{ ...f, fontSize: 12, color: "#b8809a", marginBottom: 24 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <svg width="64" height="64" style={{ flexShrink: 0 }}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#f4a7b9" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - overallPct / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 32 32)" style={{ transition: "stroke-dashoffset 0.6s" }} />
                  <text x="32" y="37" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fill="#d4607a" fontWeight="500">{overallPct}%</text>
                </svg>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[["Best streak", bestStreak + " days"], ["Water today", water + " / 8"]].map(([l, v]) => (
                    <div key={l} style={{ background: "rgba(255,255,255,0.65)", borderRadius: 20, padding: "6px 14px", backdropFilter: "blur(8px)", border: "1px solid rgba(249,184,202,0.35)" }}>
                      <span style={{ ...f, fontSize: 10, color: "#b8809a" }}>{l} </span>
                      <span style={{ ...f, fontSize: 11, fontWeight: 500, color: "#d4607a" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: "0 22px" }}>
            <div style={{ background: "linear-gradient(135deg,#fde8f0,#f0e8fd)", borderRadius: 20, padding: "18px 20px", marginTop: 22, border: "1px solid rgba(249,184,202,0.3)" }}>
              <p style={{ ...serif, fontSize: 17, fontStyle: "italic", color: "#5a3040", lineHeight: 1.65, marginBottom: 8 }}>"{quote.t}"</p>
              <p style={{ ...f, fontSize: 10, color: "#c8a0b8", letterSpacing: 1 }}>— {quote.a}</p>
            </div>
            <SectionTitle>Today's habits</SectionTitle>
            {habits.slice(0, 5).map((h, i) => <HabitRow key={h} h={h} i={i} date={today} logs={logs} onToggle={toggle} last7={last7} />)}
            {habits.length > 5 && (
              <p onClick={() => setTab("habits")} style={{ ...f, fontSize: 11, color: "#e8a0b8", textAlign: "center", marginTop: 6, cursor: "pointer", letterSpacing: 1, padding: "8px 0" }}>
                +{habits.length - 5} more habits →
              </p>
            )}
            <SectionTitle>Water today 💧</SectionTitle>
            <div style={{ background: "white", border: "1px solid #e8f4fd", borderRadius: 20, padding: "18px 18px 16px" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} onClick={() => setWater(i + 1)} style={{
                    width: 38, height: 38, borderRadius: 12, cursor: "pointer",
                    background: i < water ? "linear-gradient(160deg,#b8d4e8,#88b8d8)" : "white",
                    border: `1.5px solid ${i < water ? "#88b8d8" : "#c8dce8"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all 0.2s",
                  }}>💧</div>
                ))}
              </div>
              <div style={{ height: 6, background: "#f0ecf8", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${water / 8 * 100}%`, background: "linear-gradient(90deg,#b8d4e8,#88b8d8)", borderRadius: 10, transition: "width 0.4s" }} />
              </div>
              <p style={{ ...f, fontSize: 11, color: "#88b8d8" }}>{water} of 8 glasses · {water * 250}ml</p>
            </div>
          </div>
        </div>
      )}

      {/* HABITS */}
      {tab === "habits" && (
        <div style={{ padding: "44px 22px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h2 style={{ ...serif, fontSize: 28, fontStyle: "italic", fontWeight: 300, color: "#3d2535" }}>My Habits</h2>
            <button onClick={() => setShowAddModal(true)} style={{ background: "linear-gradient(135deg,#f9b8ca,#e896a8)", border: "none", borderRadius: 20, padding: "8px 16px", color: "white", fontSize: 12, cursor: "pointer", ...f }}>+ Add</button>
          </div>
          <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginBottom: 20 }}>{todayCount} of {habits.length} complete today</p>
          {habits.map((h, i) => (
            <div key={h} style={{ position: "relative" }}>
              <HabitRow h={h} i={i} date={today} logs={logs} onToggle={toggle} last7={last7} />
              <button onClick={() => removeHabit(h)} style={{ position: "absolute", right: -2, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#f4c0d0", padding: "0 6px" }}>×</button>
            </div>
          ))}
          {showAddModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(61,37,53,0.3)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <div style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", width: "100%", maxWidth: 430 }}>
                <p style={{ ...serif, fontSize: 22, fontStyle: "italic", color: "#3d2535", marginBottom: 16 }}>New habit ✦</p>
                <input autoFocus value={newHabit} onChange={e => setNewHabit(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addHabit()}
                  placeholder="e.g. Morning walk 🌤️"
                  style={{ width: "100%", background: "#fdf8fb", border: "1px solid #fce8f0", borderRadius: 14, padding: "14px 18px", ...f, fontSize: 15, color: "#3d2535", marginBottom: 14 }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "13px", background: "#fdf0f4", border: "1px solid #fce8f0", borderRadius: 14, ...f, fontSize: 14, color: "#b8809a", cursor: "pointer" }}>Cancel</button>
                  <button onClick={addHabit} style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg,#f9b8ca,#e896a8)", border: "none", borderRadius: 14, ...f, fontSize: 14, color: "white", cursor: "pointer", fontWeight: 500 }}>Add Habit</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <div style={{ padding: "44px 22px 0" }}>
          <h2 style={{ ...serif, fontSize: 28, fontStyle: "italic", fontWeight: 300, color: "#3d2535", marginBottom: 4 }}>History</h2>
          <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginBottom: 20 }}>10-week pattern — tap any cell to edit</p>
          {habits.map((h, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <div key={h} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <p style={{ ...f, fontSize: 13, color: "#5a3040" }}>{h}</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ ...f, fontSize: 10, color: "#e8a0b8" }}>{weekPct(h)}% this week</span>
                    {streak(h) > 0 && <span style={{ ...f, fontSize: 10, background: c + "22", color: c, padding: "2px 8px", borderRadius: 10 }}>🔥 {streak(h)}d</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {weeks.map((week, wi) => (
                    <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {week.map((day, di) => (
                        <div key={di} onClick={() => toggle(h, day)} style={{ width: 10, height: 10, borderRadius: 3, cursor: "pointer", background: isDone(h, day) ? c : "#fce8f0", transition: "all 0.15s" }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <p style={{ ...f, fontSize: 10, color: "#d4a0b8" }}>less</p>
            {["#fce8f0","#f9c8d8","#f4a7b9","#e896a8","#d4607a"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            ))}
            <p style={{ ...f, fontSize: 10, color: "#d4a0b8" }}>more</p>
          </div>
        </div>
      )}

      {/* INSIGHTS */}
      {tab === "insights" && (
        <div style={{ padding: "44px 22px 0" }}>
          <h2 style={{ ...serif, fontSize: 28, fontStyle: "italic", fontWeight: 300, color: "#3d2535", marginBottom: 4 }}>Insights</h2>
          <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginBottom: 20 }}>Your patterns this week</p>
          {habits.length > 0 && (() => {
            const best = habits.reduce((a, b) => weekPct(a) >= weekPct(b) ? a : b, habits[0]);
            const needs = habits.reduce((a, b) => weekPct(a) <= weekPct(b) ? a : b, habits[0]);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                <div style={{ background: "linear-gradient(135deg,#fde8f0,#fdf0f8)", border: "1px solid #f9c8d8", borderRadius: 18, padding: "16px" }}>
                  <p style={{ ...f, fontSize: 8, letterSpacing: 2, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>✦ Champion</p>
                  <p style={{ ...serif, fontSize: 15, fontStyle: "italic", color: "#3d2535", marginBottom: 4 }}>{best}</p>
                  <p style={{ ...f, fontSize: 10, color: "#b8809a" }}>{weekPct(best)}% · {streak(best)}d streak</p>
                </div>
                <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 18, padding: "16px" }}>
                  <p style={{ ...f, fontSize: 8, letterSpacing: 2, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>✦ Needs love</p>
                  <p style={{ ...serif, fontSize: 15, fontStyle: "italic", color: "#3d2535", marginBottom: 4 }}>{needs}</p>
                  <p style={{ ...f, fontSize: 10, color: "#b8809a" }}>{weekPct(needs)}% this week</p>
                </div>
              </div>
            );
          })()}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 22 }}>
            {[["Today", todayCount + "/" + habits.length], ["Streak", bestStreak + "d"], ["Water", water + "/8"]].map(([l, v]) => (
              <div key={l} style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 16, padding: "14px 12px", textAlign: "center" }}>
                <p style={{ ...f, fontSize: 18, fontWeight: 500, color: "#d4607a", marginBottom: 4 }}>{v}</p>
                <p style={{ ...f, fontSize: 9, letterSpacing: 1.5, color: "#c8a0b8", textTransform: "uppercase" }}>{l}</p>
              </div>
            ))}
          </div>
          <SectionTitle>Daily completion — last 7 days</SectionTitle>
          <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "18px 16px 14px", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {last7.map((d, i) => {
                const cnt = habits.filter(h => isDone(h, d)).length;
                const barH = habits.length > 0 ? Math.max(Math.round(cnt / habits.length * 72), 3) : 3;
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
          <SectionTitle>All habits this week</SectionTitle>
          <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "18px" }}>
            {habits.map((h, i) => (
              <div key={h} style={{ marginBottom: i < habits.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <p style={{ ...f, fontSize: 12, color: "#5a3040" }}>{h}</p>
                  <p style={{ ...f, fontSize: 10, color: "#e8a0b8" }}>{weekPct(h)}%</p>
                </div>
                <div style={{ height: 5, background: "#fce8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${weekPct(h)}%`, background: `linear-gradient(90deg,${COLORS[i % COLORS.length]},#f4a7b9)`, borderRadius: 10, transition: "width 0.6s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
