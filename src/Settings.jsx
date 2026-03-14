import { useState, useRef } from "react";
import { supabase } from "./supabase";

const f = { fontFamily: "'DM Sans', sans-serif" };
const serif = { fontFamily: "'Cormorant Garamond', serif" };

function SettingRow({ icon, label, children, border = true }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0",
      borderBottom: border ? "1px solid #fce8f0" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
        <p style={{ ...f, fontSize: 13, color: "#3d2535" }}>{label}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: "pointer",
      background: value ? "linear-gradient(135deg,#f9b8ca,#e896a8)" : "#e8d8e0",
      position: "relative", transition: "background 0.3s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: value ? 22 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "white",
        transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

export default function Settings({ session, onClose, darkMode, setDarkMode, stats }) {
  const [name, setName] = useState(session?.user?.user_metadata?.full_name || "");
  const [editingName, setEditingName] = useState(false);
  const [morningTime, setMorningTime] = useState("07:00");
  const [nightTime, setNightTime] = useState("21:00");
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef();

  const initials = name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "ME";

  const saveName = async () => {
    setSavingName(true);
    await supabase.auth.updateUser({ data: { full_name: name } });
    setSavingName(false);
    setEditingName(false);
    setNameSuccess(true);
    setTimeout(() => setNameSuccess(false), 2000);
  };

  const savePassword = async () => {
    if (newPwd.length < 6) { setPwdMsg("At least 6 characters"); return; }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) setPwdMsg(error.message);
    else { setPwdMsg("Password updated! ✓"); setNewPwd(""); setTimeout(() => { setPwdMsg(""); setShowPwdForm(false); }, 2000); }
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: darkMode ? "#1a0f14" : "linear-gradient(160deg,#fff8fb,#fdf0f7,#f8f0fd)",
      zIndex: 200, overflowY: "auto", maxWidth: 430, margin: "0 auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        input:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{
        background: darkMode ? "rgba(40,10,24,0.95)" : "linear-gradient(160deg,#fde8f0,#f8e8fd)",
        padding: "52px 24px 28px", position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, left: 20,
          background: "rgba(255,255,255,0.6)", border: "1px solid rgba(249,184,202,0.4)",
          borderRadius: 20, padding: "6px 14px", ...f, fontSize: 11,
          color: "#b8809a", cursor: "pointer",
        }}>← Back</button>

        <div style={{ textAlign: "center" }}>
          {/* Avatar */}
          <div onClick={() => fileRef.current.click()} style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 12px",
            background: avatar ? "transparent" : "linear-gradient(135deg,#f9b8ca,#c8a4c8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative", overflow: "hidden",
            border: "3px solid rgba(255,255,255,0.8)",
          }}>
            {avatar
              ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
              : <span style={{ ...f, fontSize: 28, fontWeight: 500, color: "white" }}>{initials}</span>
            }
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.2s",
            }} className="avatar-overlay">
              <span style={{ fontSize: 20 }}>📷</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: "none" }} />
          <p style={{ ...f, fontSize: 9, color: "#e8a0b8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Tap photo to change</p>

          {/* Name */}
          {editingName ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 8 }}>
              <input value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveName()}
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #f4a7b9", borderRadius: 14, padding: "8px 14px", ...f, fontSize: 16, color: "#3d2535", textAlign: "center", width: 160 }} />
              <button onClick={saveName} style={{ background: "linear-gradient(135deg,#f9b8ca,#e896a8)", border: "none", borderRadius: 20, padding: "8px 14px", ...f, fontSize: 12, color: "white", cursor: "pointer" }}>
                {savingName ? "..." : "Save"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
              <p style={{ ...serif, fontSize: 24, fontStyle: "italic", color: darkMode ? "#fde8f0" : "#3d2535" }}>{name || "Your Name"}</p>
              <button onClick={() => setEditingName(true)} style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(249,184,202,0.4)", borderRadius: 12, padding: "4px 10px", ...f, fontSize: 10, color: "#b8809a", cursor: "pointer" }}>Edit</button>
            </div>
          )}
          {nameSuccess && <p style={{ ...f, fontSize: 11, color: "#48a070", marginTop: 4 }}>Name updated ✓</p>}
          <p style={{ ...f, fontSize: 11, color: "#b8809a", marginTop: 4 }}>{session?.user?.email}</p>
        </div>
      </div>

      <div style={{ padding: "0 22px" }}>

        {/* My Stats */}
        <p style={{ ...f, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#e8a0b8", margin: "22px 0 12px" }}>My Stats</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            ["🌸", "Level", stats.level],
            ["🔥", "Best Streak", stats.bestStreak + "d"],
            ["✦", "Total Days", stats.totalDays],
          ].map(([icon, label, val]) => (
            <div key={label} style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 16, padding: "14px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 18, marginBottom: 4 }}>{icon}</p>
              <p style={{ ...f, fontSize: 16, fontWeight: 500, color: "#d4607a", marginBottom: 3 }}>{val}</p>
              <p style={{ ...f, fontSize: 9, color: "#c8a0b8", letterSpacing: 1, textTransform: "uppercase" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Appearance */}
        <p style={{ ...f, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#e8a0b8", margin: "22px 0 4px" }}>Appearance</p>
        <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "0 16px" }}>
          <SettingRow icon="🌙" label="Dark Mode" border={false}>
            <Toggle value={darkMode} onChange={setDarkMode} />
          </SettingRow>
        </div>

        {/* Notifications */}
        <p style={{ ...f, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#e8a0b8", margin: "22px 0 4px" }}>Reminders</p>
        <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "0 16px" }}>
          <SettingRow icon="🔔" label="Daily Reminders">
            <Toggle value={notificationsOn} onChange={setNotificationsOn} />
          </SettingRow>
          {notificationsOn && (
            <>
              <SettingRow icon="☀️" label="Morning reminder">
                <input type="time" value={morningTime} onChange={e => setMorningTime(e.target.value)}
                  style={{ border: "1px solid #fce8f0", borderRadius: 10, padding: "6px 10px", ...f, fontSize: 13, color: "#d4607a", background: "#fdf8fb" }} />
              </SettingRow>
              <SettingRow icon="🌙" label="Night reminder" border={false}>
                <input type="time" value={nightTime} onChange={e => setNightTime(e.target.value)}
                  style={{ border: "1px solid #fce8f0", borderRadius: 10, padding: "6px 10px", ...f, fontSize: 13, color: "#c8a4c8", background: "#fdf8fb" }} />
              </SettingRow>
            </>
          )}
          {!notificationsOn && (
            <div style={{ paddingBottom: 4 }}>
              <p style={{ ...f, fontSize: 11, color: "#c8a0b8", paddingLeft: 36, paddingBottom: 12 }}>Turn on to set morning & night reminders</p>
            </div>
          )}
        </div>

        {/* Account */}
        <p style={{ ...f, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#e8a0b8", margin: "22px 0 4px" }}>Account</p>
        <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "0 16px" }}>
          <SettingRow icon="🔑" label="Change Password">
            <button onClick={() => setShowPwdForm(!showPwdForm)} style={{
              background: "none", border: "1px solid #fce8f0", borderRadius: 14,
              padding: "6px 14px", ...f, fontSize: 11, color: "#b8809a", cursor: "pointer",
            }}>{showPwdForm ? "Cancel" : "Change"}</button>
          </SettingRow>
          {showPwdForm && (
            <div style={{ paddingBottom: 14, paddingLeft: 36 }}>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                placeholder="New password (6+ chars)"
                onKeyDown={e => e.key === "Enter" && savePassword()}
                style={{ width: "100%", background: "#fdf8fb", border: "1px solid #fce8f0", borderRadius: 12, padding: "10px 14px", ...f, fontSize: 13, color: "#3d2535", marginBottom: 8 }} />
              <button onClick={savePassword} style={{
                width: "100%", padding: "10px", background: "linear-gradient(135deg,#f9b8ca,#e896a8)",
                border: "none", borderRadius: 12, ...f, fontSize: 13, color: "white", cursor: "pointer",
              }}>{savingPwd ? "Saving..." : "Update Password"}</button>
              {pwdMsg && <p style={{ ...f, fontSize: 11, color: pwdMsg.includes("✓") ? "#48a070" : "#d4607a", marginTop: 6 }}>{pwdMsg}</p>}
            </div>
          )}
          <SettingRow icon="📧" label="Email" border={false}>
            <p style={{ ...f, fontSize: 11, color: "#c8a0b8" }}>{session?.user?.email}</p>
          </SettingRow>
        </div>

        {/* About */}
        <p style={{ ...f, fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#e8a0b8", margin: "22px 0 4px" }}>About</p>
        <div style={{ background: "white", border: "1px solid #fce8f0", borderRadius: 20, padding: "0 16px" }}>
          <SettingRow icon="🌸" label="MIA — Me In Action">
            <p style={{ ...f, fontSize: 11, color: "#c8a0b8" }}>v1.0</p>
          </SettingRow>
          <SettingRow icon="✦" label="Your data is private" border={false}>
            <p style={{ ...f, fontSize: 11, color: "#c8a0b8" }}>Secured ✓</p>
          </SettingRow>
        </div>

        {/* Sign out */}
        <button onClick={signOut} style={{
          width: "100%", marginTop: 24, marginBottom: 40,
          padding: "14px", background: "white",
          border: "1px solid #fce8f0", borderRadius: 16,
          ...f, fontSize: 14, color: "#d4607a", cursor: "pointer",
        }}>Sign Out</button>
      </div>
    </div>
  );
}
