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
                  background: isDone ? `${c}1a` : "white",
                  border: isDone ? `1px solid ${c}55` : "1px solid #fce8f0"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button className="mia-check" onClick={() => toggle(h, today)} style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: isDone ? c : "white",
                      border: `1.5px solid ${isDone ? c : "#f4c0d0"}`,
                      color: "white", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>{isDone ? "✓" : ""}</button>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: "#3d2535" }}>{h}</p>
                      {s > 1 && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8", marginTop: 1 }}>🔥 {s} day streak</p>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    {last7.map((d, di) => (
                      <div key={di} style={{ width: 5, height: 5, borderRadius: "50%", background: done(h, d) ? c : "#fce8f0" }}/>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add */}
            <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center" }}>
              <input value={newHabit} onChange={e => setNewHabit(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newHabit.trim()) { setHabits(p => [...p, newHabit.trim()]); setNewHabit(""); }}}
                placeholder="Add a new habit..."
                style={{ flex: 1, background: "white", border: "1px solid #fce8f0", borderRadius: 30, padding: "10px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#3d2535" }}/>
              <button onClick={() => { if (newHabit.trim()) { setHabits(p => [...p, newHabit.trim()]); setNewHabit(""); }}}
                style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #f9b8ca, #e896a8)", border: "none", color: "white", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8", letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase" }}>10-week pattern</p>
            {habits.map((h, i) => {
              const c = COLORS[i % COLORS.length];
              return (
                <div key={h} style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#5a3040" }}>{h}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8" }}>{weekPct(h)}% this week</p>
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {weeks.map((week, wi) => (
                      <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {week.map((day, di) => (
                          <div key={di} onClick={() => toggle(h, day)} style={{
                            width: 9, height: 9, borderRadius: 2, cursor: "pointer",
                            background: done(h, day) ? c : "#fce8f0",
                            transition: "all 0.15s"
                          }}/>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#d4a0b8" }}>less</p>
              {["#fce8f0","#f9c8d8","#f4a7b9","#e896a8","#d4607a"].map((c, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: c }}/>
              ))}
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#d4a0b8" }}>more</p>
            </div>
          </div>
        )}

        {/* INSIGHTS */}
        {tab === "insights" && (
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8", letterSpacing: 1.5, marginBottom: 20, textTransform: "uppercase" }}>your patterns</p>

            {(() => {
              const best = habits.reduce((a, b) => weekPct(a) >= weekPct(b) ? a : b);
              const needs = habits.reduce((a, b) => weekPct(a) <= weekPct(b) ? a : b);
              return (
                <>
                  <div style={{ background: "linear-gradient(135deg, #fde8f0, #fdf0f8)", border: "1px solid #f9c8d8", borderRadius: 18, padding: "18px 20px", marginBottom: 12 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 2.5, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>✦ Your best habit</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", color: "#3d2535" }}>{best}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#b8809a", marginTop: 4 }}>{weekPct(best)}% this week · {streak(best)} day streak</p>
                  </div>
                  <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 18, padding: "18px 20px", marginBottom: 24 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: 2.5, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>✦ Needs more love</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", color: "#3d2535" }}>{needs}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#b8809a", marginTop: 4 }}>Only {weekPct(needs)}% this week</p>
                  </div>
                </>
              );
            })()}

            {/* Bar chart */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8", letterSpacing: 1.5, marginBottom: 14, textTransform: "uppercase" }}>daily completion</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 72, marginBottom: 28 }}>
              {last7.map((d, i) => {
                const count = habits.filter(h => done(h, d)).length;
                const h = habits.length > 0 ? (count / habits.length) * 64 : 0;
                const isT = d === today;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: Math.max(h, 3), borderRadius: 6, background: isT ? "linear-gradient(180deg,#f9b8ca,#e896a8)" : "#fce8f0", transition: "height 0.5s" }}/>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: isT ? "#e896a8" : "#c8a0b8" }}>
                      {["M","T","W","T","F","S","S"][new Date(d).getDay() === 0 ? 6 : new Date(d).getDay() - 1]}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Progress bars */}
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8", letterSpacing: 1.5, marginBottom: 14, textTransform: "uppercase" }}>all habits this week</p>
            {habits.map((h, i) => (
              <div key={h} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#5a3040" }}>{h}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#e8a0b8" }}>{weekPct(h)}%</p>
                </div>
                <div style={{ height: 4, background: "#fce8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${weekPct(h)}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, #f4a7b9)`, borderRadius: 10, transition: "width 0.6s" }}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
