
import { useState } from "react";
import { supabase } from "./supabase";

const f = { fontFamily: "'DM Sans', sans-serif" };
const serif = { fontFamily: "'Cormorant Garamond', serif" };

export default function Auth() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        setSuccess("Check your email to confirm your account! ✦");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#fff8fb 0%,#fdf0f7 50%,#f8f0fd 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", maxWidth: 430, margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: #f4a7b9 !important; }
        .auth-input { transition: border-color 0.2s; }
        .auth-btn:active { transform: scale(0.98); }
      `}</style>

      {/* Decorative circles */}
      <div style={{ position: "fixed", top: -80, right: -80, width: 240, height: 240, background: "rgba(249,184,202,0.15)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -60, left: -60, width: 180, height: 180, background: "rgba(200,164,200,0.12)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
        <h1 style={{ ...serif, fontSize: 40, fontStyle: "italic", fontWeight: 300, color: "#3d2535", marginBottom: 6 }}>Mia</h1>
        <p style={{ ...f, fontSize: 11, letterSpacing: 3, color: "#e8a0b8", textTransform: "uppercase" }}>your habit companion</p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", background: "white", borderRadius: 24, padding: "28px 24px", border: "1px solid #fce8f0", boxShadow: "0 4px 40px rgba(244,167,185,0.1)" }}>

        {/* Toggle */}
        <div style={{ display: "flex", background: "#fdf0f4", borderRadius: 16, padding: 4, marginBottom: 24 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
              flex: 1, padding: "10px", border: "none", borderRadius: 13, cursor: "pointer",
              background: mode === m ? "white" : "transparent",
              boxShadow: mode === m ? "0 2px 8px rgba(244,167,185,0.2)" : "none",
              ...f, fontSize: 13, color: mode === m ? "#d4607a" : "#b8809a",
              fontWeight: mode === m ? 500 : 300, transition: "all 0.2s",
            }}>{m === "login" ? "Sign In" : "Create Account"}</button>
          ))}
        </div>

        {/* Fields */}
        {mode === "signup" && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ ...f, fontSize: 10, letterSpacing: 1.5, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>Your name</p>
            <input className="auth-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Sofia"
              style={{ width: "100%", background: "#fdf8fb", border: "1px solid #fce8f0", borderRadius: 14, padding: "13px 16px", ...f, fontSize: 14, color: "#3d2535" }} />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <p style={{ ...f, fontSize: 10, letterSpacing: 1.5, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>Email</p>
          <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: "100%", background: "#fdf8fb", border: "1px solid #fce8f0", borderRadius: 14, padding: "13px 16px", ...f, fontSize: 14, color: "#3d2535" }} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <p style={{ ...f, fontSize: 10, letterSpacing: 1.5, color: "#e8a0b8", textTransform: "uppercase", marginBottom: 6 }}>Password</p>
          <input className="auth-input" type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", background: "#fdf8fb", border: "1px solid #fce8f0", borderRadius: 14, padding: "13px 16px", ...f, fontSize: 14, color: "#3d2535" }} />
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: "#fff0f3", border: "1px solid #ffc8d4", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ ...f, fontSize: 12, color: "#d4607a" }}>⚠ {error}</p>
          </div>
        )}
        {success && (
          <div style={{ background: "#f0fdf4", border: "1px solid #c8f0d8", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ ...f, fontSize: 12, color: "#48a070" }}>✓ {success}</p>
          </div>
        )}

        {/* Submit */}
        <button className="auth-btn" onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "15px", border: "none", borderRadius: 16, cursor: loading ? "not-allowed" : "pointer",
          background: loading ? "#f4c0d0" : "linear-gradient(135deg,#f9b8ca,#e896a8)",
          ...f, fontSize: 15, fontWeight: 500, color: "white", transition: "all 0.2s",
        }}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In ✦" : "Create Account ✦"}
        </button>
      </div>

      <p style={{ ...f, fontSize: 11, color: "#c8a0b8", marginTop: 24, textAlign: "center", lineHeight: 1.6 }}>
        Your habits are private and personal ✦<br />
        <span style={{ fontSize: 10 }}>Secured by Supabase</span>
      </p>
    </div>
  );
}
