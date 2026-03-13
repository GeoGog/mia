import { useState, useEffect } from "react";

const DEFAULT_HABITS = ["Hydration 💧", "Skincare ✨", "Movement 🌿", "Reading 📖", "Journaling 🌸", "Sleep 8h 🌙", "Meditation 🕊️"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getLast10Weeks() {
  return Array.from({ length: 10 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(); date.setDate(date.getDate() - (9 - w) * 7 - (6 - d));
      return date.toISOString().split("T")[0];
    })
  );
}

export default function Mia() {
  const [tab, setTab] = useState("today");
  const [logs, setLogs] = useState(() => { try { return JSON.parse(localStorage.getItem("mia_logs") || "{}"); } catch { return {}; } });
  const [habits, setHabits] = useState(() => { try { return JSON.parse(localStorage.getItem("mia_habits") || "null") || DEFAULT_HABITS; } catch { return DEFAULT_HABITS; } });
  const [newHabit, setNewHabit] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const last7 = getLast7Days();
  const weeks = getLast10Weeks();

  useEffect(() => { try { localStorage.setItem("mia_logs", JSON.stringify(logs)); } catch {} }, [logs]);
  useEffect(() => { try { localStorage.setItem("mia_habits", JSON.stringify(habits)); } catch {} }, [habits]);

  const toggle = (h, d) => setLogs(p => ({ ...p, [`${h}||${d}`]: !p[`${h}||${d}`] }));
  const done = (h, d) => !!logs[`${h}||${d}`];
  const streak = h => { let s = 0, d = new Date(); while (done(h, d.toISOString().split("T")[0])) { s++; d.setDate(d.getDate() - 1); } return s; };
  const weekPct = h => Math.round(last7.filter(d => done(h, d)).length / 7 * 100);
  const todayCount = habits.filter(h => done(h, today)).length;

  const COLORS = ["#f9b8ca","#f4a7b9","#e896a8","#e8a4c8","#c8a4c8","#b8c4e8","#a4c8b8","#f9c8a0","#e8b898"];

  return (
    <div style={{ minHeight: "100vh", background: "#fdf8fb", fontFamily: "'Georgia', serif", color: "#3d2535" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fdf8fb; }
        .mia-check { transition: all 0.2s; cursor: pointer; border: none; }
        .mia-check:hover { transform: scale(1.1); }
        .mia-row { transition: background 0.2s; border-radius: 14px; }
        .mia-row:hover { background: rgba(249,184,202,0.12) !important; }
        .tab { background: none; border: none; cursor: pointer; transition: all 0.25s; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #f4c0d0; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "36px 24px 90px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 3, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, fontStyle: "italic", color: "#3d2535", lineHeight: 1.2 }}>
                Hello, Mia ✦
              </h1>
            </div>
            {/* Ring */}
            <svg width="52" height="52" style={{ flexShrink: 0 }}>
              <circle cx="26" cy="26" r="20" fill="none" stroke="#fde8f0" strokeWidth="3"/>
              <circle cx="26" cy="26" r="20" fill="none" stroke="#f4a7b9" strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - todayCount / habits.length)}`}
                strokeLinecap="round" transform="rotate(-90 26 26)" style={{ transition: "stroke-dashoffset 0.6s" }}/>
              <text x="26" y="31" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fill="#e896a8" fontWeight="500">
                {Math.round(todayCount / habits.length * 100)}%
              </text>
            </svg>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #fde0ec", marginBottom: 26 }}>
          {["today", "history", "insights"].map(t => (
            <button key={t} className="tab" onClick={() => setTab(t)} style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
              color: tab === t ? "#d4607a" : "#c8a0b8", padding: "8px 0",
              borderBottom: tab === t ? "1.5px solid #f4a7b9" : "1.5px solid transparent",
              marginBottom: -1, fontWeight: tab === t ? 500 : 300
            }}>{t}</button>
          ))}
        </div>

        {/* TODAY */}
        {tab === "today" && (
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8", letterSpacing: 1.5, marginBottom: 14, textTransform: "uppercase" }}>
              {todayCount} of {habits.length} done today
            </p>
            {habits.map((h, i) => {
              const isDone = done(h, today);
              const s = streak(h);
              const c = COLORS[i % COLORS.length];
              return (
                <div key={h} className="mia-row" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 14px", marginBottom: 7,
                  background: isDone ? `
