import { useState, useEffect } from "react";

// ====== App ======
function App() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [group, setGroup] = useState("7A");
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  const storageKey = `attendance-${date}-${group}`;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    setStudents(saved || []);
  }, [date, group]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(students));
  }, [students, storageKey]);

  const addStudent = () => {
    if (!name.trim()) return;
    setStudents([...students, { id: Date.now(), name, status: "Present" }]);
    setName("");
  };

  const updateStatus = (id, status) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const deleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const clearAll = () => {
    if (window.confirm("Бүх ирцийг устгах уу?")) setStudents([]);
  };

  const handleLogin = () => {
    if (password === "teacher123") {
      setLoggedIn(true);
      setPassword("");
    } else {
      alert("Нууц үг буруу!");
    }
  };

  const exportCSV = () => {
    if (!students.length) return;
    const headers = ["Name", "Status"];
    const csvContent = [
      headers.join(","),
      ...students.map(s => `${s.name},${s.status}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendance-${date}-${group}.csv`);
    link.click();
  };

  const stats = {
    present: students.filter(s => s.status === "Present").length,
    absent: students.filter(s => s.status === "Absent").length,
    late: students.filter(s => s.status === "Late").length
  };

  if (!loggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🔐 Teacher Login</h2>
          <input
            type="password"
            placeholder="Нууц үг"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
          />
          <button style={styles.addBtn} onClick={handleLogin}>Нэвтрэх</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📚 Ирцийн систем</h2>

        <Controls date={date} setDate={setDate} group={group} setGroup={setGroup} />

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Сурагчийн нэр"
          />
          <button style={styles.addBtn} onClick={addStudent}>Нэмэх</button>
        </div>

        <StudentList students={students} updateStatus={updateStatus} deleteStudent={deleteStudent} />

        <Stats stats={stats} />

        <div style={{ marginTop: 20 }}>
          <h3>Бар Chart</h3>
          <BarChart stats={stats} />

          <h3 style={{ marginTop: 20 }}>Pie Chart</h3>
          <PieChart stats={stats} />
        </div>

        <button style={styles.clearBtn} onClick={exportCSV}>📤 CSV Export</button>
        {students.length > 0 && <button style={styles.clearBtn} onClick={clearAll}>🗑 Бүх ирцийг устгах</button>}
      </div>
    </div>
  );
}

// ====== Controls ======
function Controls({ date, setDate, group, setGroup }) {
  return (
    <div style={styles.controls}>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <select value={group} onChange={e => setGroup(e.target.value)}>
        <option>6A</option>
        <option>6Б</option>
        <option>7A</option>
        <option>7Б</option>
        <option>8A</option>
        <option>8Б</option>
      </select>
    </div>
  );
}

// ====== StudentList ======
function StudentList({ students, updateStatus, deleteStudent }) {
  if (students.length === 0) return <p style={styles.empty}>Бүртгэл алга</p>;

  return (
    <ul style={styles.list}>
      {students.map(s => (
        <li key={s.id} style={styles.listItem}>
          <span>{s.name}</span>
          <select value={s.status} onChange={e => updateStatus(s.id, e.target.value)}>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>
          <button style={styles.deleteBtn} onClick={() => deleteStudent(s.id)}>✖</button>
        </li>
      ))}
    </ul>
  );
}

// ====== Stats ======
function Stats({ stats }) {
  return (
    <div style={styles.stats}>
      <span>✅ Present: {stats.present}</span>
      <span>❌ Absent: {stats.absent}</span>
      <span>⏰ Late: {stats.late}</span>
    </div>
  );
}

// ====== Bar Chart ======
function BarChart({ stats }) {
  const total = stats.present + stats.absent + stats.late || 1;
  const barHeight = 100;
  return (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: barHeight }}>
      {["present", "absent", "late"].map(key => (
        <div key={key} style={{ textAlign: "center", flex: 1 }}>
          <div
            style={{
              backgroundColor: key === "present" ? "#4caf50" : key === "absent" ? "#f44336" : "#ff9800",
              width: "60%",
              height: (stats[key] / total) * barHeight,
              margin: "0 auto",
              transition: "height 0.3s"
            }}
          />
          <div>{stats[key]}</div>
        </div>
      ))}
    </div>
  );
}

// ====== Pie Chart ======
function PieChart({ stats }) {
  const total = stats.present + stats.absent + stats.late || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const slices = [
    { value: stats.present, color: "#4caf50", label: "Present" },
    { value: stats.absent, color: "#f44336", label: "Absent" },
    { value: stats.late, color: "#ff9800", label: "Late" }
  ];

  let offset = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="100%" height="150" viewBox="0 0 150 150">
        <g transform="translate(75,75) rotate(-90)">
          {slices.map((slice, index) => {
            const stroke = (slice.value / total) * circumference;
            const circle = (
              <circle
                key={index}
                r={radius}
                cx={0}
                cy={0}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={40}
                strokeDasharray={`${stroke} ${circumference - stroke}`}
                strokeDashoffset={-offset}
                style={{ transition: "stroke-dasharray 0.3s, stroke-dashoffset 0.3s" }}
              />
            );
            offset += stroke;
            return circle;
          })}
        </g>
      </svg>
      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 12, backgroundColor: slice.color }} />
            <span>{slice.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ====== Styles ======
const styles = {
  container: {
    minHeight: "100%",
    padding: 20,
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily: "Arial",
    boxSizing: "border-box"
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 14,
    width: "100%",
    maxWidth: 500,
    boxShadow: "0 12px 30px rgba(0,0,0,.25)"
  },
  title: { textAlign: "center", marginBottom: 16 },
  controls: { display: "flex", justifyContent: "space-between", marginBottom: 12 },
  inputRow: { display: "flex", gap: 8, marginBottom: 12 },
  input: { flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" },
  addBtn: { background: "#667eea", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px" },
  list: { listStyle: "none", padding: 0, maxHeight: 200, overflowY: "auto" },
  listItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee" },
  deleteBtn: { background: "#e53e3e", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px" },
  clearBtn: { marginTop: 12, width: "100%", padding: 10, background: "#444", color: "#fff", border: "none", borderRadius: 8 },
  stats: { display: "flex", justifyContent: "space-around", marginTop: 12, fontWeight: "bold" },
  empty: { textAlign: "center", color: "#777" }
};

export default App;
