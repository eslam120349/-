import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";

// ─── Theme (matches ParentHome exactly) ──────────────────────────────────────
// BG dark    : #0f1c2e  (navy)
// BG crimson : #8b1a2e
// BG light   : #f5f4f2
// Accent     : #8b1a2e
// Gold       : #c9a84c
// Text dark  : #1a1a1a
// Border     : #e8e4de

// ─── Types ────────────────────────────────────────────────────────────────────

type ChildTeacher = { name: string; subject: string; image: string };
type ChildSchedule = { day: string; subject: string; teacher: string; time: string; duration: string; status: string };
type ChildRecent = { subject: string; teacher: string; date: string; attended: boolean; note?: string };
type ChildItem = {
  id: number;
  name: string;
  age: number;
  grade: string;
  avatar: string;
  color: string;
  attendance: number;
  sessions: number;
  upcoming: number;
  teachers: ChildTeacher[];
  schedule: ChildSchedule[];
  recentSessions: ChildRecent[];
};

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// ─── Skeleton (dynamic dark/light aware) ─────────────────────────────────────

function SkeletonBlock({ className = "", isDark }: { className?: string; isDark: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        borderRadius: "2px",
      }}
    >
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent)"
            : "linear-gradient(90deg, transparent, rgba(139,26,46,0.1), transparent)",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </div>
  );
}

function StatsSkeletons({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-0"
      style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-8 space-y-3 text-center"
          style={{
            borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
          }}
        >
          <SkeletonBlock className="w-16 h-8 mx-auto" isDark={isDark} />
          <SkeletonBlock className="w-24 h-3 mx-auto" isDark={isDark} />
        </div>
      ))}
    </div>
  );
}

function ChildrenSkeletons({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="p-6 space-y-4"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
            borderTop: "3px solid #8b1a2e",
            borderRadius: "2px",
          }}
        >
          <div className="flex items-start gap-4">
            <SkeletonBlock className="w-16 h-16 rounded-full flex-shrink-0" isDark={isDark} />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="w-32 h-4" isDark={isDark} />
              <SkeletonBlock className="w-24 h-3" isDark={isDark} />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <SkeletonBlock key={j} className="h-10" isDark={isDark} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SectionLabel (same as ParentHome) ───────────────────────────────────────

function SectionLabel({ text, onDark = false }: { text: string; onDark?: boolean }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
      style={{ color: onDark ? "rgba(255,255,255,0.55)" : "#c9a84c", fontFamily: "sans-serif" }}
    >
      {text}
    </p>
  );
}

// ─── AvatarOrInitial ──────────────────────────────────────────────────────────

function AvatarOrInitial({ src, name, className = "", style }: { src: string; name: string; className?: string; style?: any }) {
  return src ? (
    <img src={src} alt={name} className={className} style={style} />
  ) : (
    <div
      className={`${className} flex items-center justify-center font-bold text-white`}
      style={{ background: "linear-gradient(135deg, #8b1a2e, #1c0c14)", ...style }}
    >
      {name?.charAt(0)?.toUpperCase() || "؟"}
    </div>
  );
}

// ─── Add Child Modal (dynamic) ────────────────────────────────────────────────

function AddChildModal({
  onClose,
  onAdd,
  isDark,
}: {
  onClose: () => void;
  onAdd: (c: ChildItem) => void;
  isDark: boolean;
}) {
  const [form, setForm] = useState<{ name: string; age: string; grade: string }>({ name: "", age: "", grade: "" });
  const grades = ["الصف الرابع الابتدائي","الصف الخامس الابتدائي","الصف السادس الابتدائي","الصف الأول الإعدادي","الصف الثاني الإعدادي","الصف الثالث الإعدادي","الصف الأول الثانوي","الصف الثاني الثانوي","الصف الثالث الثانوي"];

  const handleAdd = () => {
    if (!form.name || !form.grade) return;
    const newChild: ChildItem = {
      id: Date.now(), name: form.name, age: parseInt(form.age) || 14,
      grade: form.grade, avatar: "", color: "#8b1a2e",
      attendance: 0, sessions: 0, upcoming: 0,
      teachers: [], schedule: [], recentSessions: [],
    };
    onAdd(newChild);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md shadow-2xl overflow-hidden"
        style={{
          background: isDark ? "#0f1c2e" : "#ffffff",
          borderTop: "4px solid #8b1a2e",
          borderRadius: "2px",
          border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "#e8e4de"}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crimson header (fixed) */}
        <div className="px-8 pt-8 pb-6" style={{ background: "#8b1a2e" }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.2)" }}
          >
            ✕
          </button>
          <div className="text-3xl mb-2">👦</div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>إضافة ابن جديد</h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif" }}>أدخل بيانات ابنك لمتابعة حصصه</p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-4">
          {[
            { label: "اسم الطالب", key: "name", type: "text", placeholder: "مثال: أحمد محمد" },
            { label: "السن", key: "age", type: "number", placeholder: "مثال: 15" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#666", fontFamily: "sans-serif" }}>{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                dir="rtl"
                className="w-full px-4 py-2.5 text-sm focus:outline-none transition-colors"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`,
                  borderRadius: "2px",
                  color: isDark ? "#fff" : "#1a1a1a",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8b1a2e")}
                onBlur={(e) => (e.target.style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4")}
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#666", fontFamily: "sans-serif" }}>الصف الدراسي</label>
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              dir="rtl"
              className="w-full px-4 py-2.5 text-sm focus:outline-none transition-colors"
              style={{
                background: isDark ? "#0f1c2e" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`,
                borderRadius: "2px",
                color: isDark ? "#fff" : "#1a1a1a",
              }}
            >
              <option value="">اختار الصف</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium transition-all duration-200 hover:opacity-80"
              style={{
                background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`,
                color: isDark ? "rgba(255,255,255,0.6)" : "#666",
                borderRadius: "2px",
                fontFamily: "sans-serif",
              }}
            >
              إلغاء
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
            >
              إضافة ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Child Detail View (dynamic) ──────────────────────────────────────────────

function ChildDetail({ child, onBack, isDark }: { child: ChildItem; onBack: () => void; isDark: boolean }) {
  const [tab, setTab] = useState("schedule");

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{
            background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`,
            color: isDark ? "rgba(255,255,255,0.7)" : "#666",
            borderRadius: "2px",
          }}
        >
          ←
        </button>
        <div className="flex items-center gap-4">
          <AvatarOrInitial
            src={child.avatar}
            name={child.name}
            className="w-12 h-12 object-cover text-lg"
            style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }}
          />
          <div>
            <h2 className="text-xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}>{child.name}</h2>
            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>{child.grade}</p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
        {[
          { label: "نسبة الحضور", value: `${child.attendance}%`, icon: "📊" },
          { label: "حصص منعقدة", value: child.sessions, icon: "📚" },
          { label: "حصص قادمة", value: child.upcoming, icon: "📅" },
        ].map((s, i) => (
          <div
            key={i}
            className="py-6 px-4 text-center"
            style={{
              borderRight: i < 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
              background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
            }}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold mb-0.5" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px" }}>
        {[["schedule","الجدول الأسبوعي","📅"],["sessions","سجل الحصص","📋"],["teachers","المدرسين","👨‍🏫"]].map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200"
            style={{
              fontFamily: "sans-serif",
              background: tab === id ? "#8b1a2e" : "transparent",
              color: tab === id ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#666",
              borderRight: id !== "teachers" ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
            }}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Tab: schedule */}
      {tab === "schedule" && (
        <div className="space-y-3">
          <SectionLabel text="الجدول الأسبوعي" onDark={isDark} />
          {child.schedule.length === 0 ? (
            <div className="text-center py-16" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#aaa" }}>
              <div className="text-4xl mb-3">📅</div>
              <p style={{ fontFamily: "sans-serif" }}>لا يوجد حصص مجدولة حتى الآن</p>
            </div>
          ) : child.schedule.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                borderRight: "3px solid #8b1a2e",
                borderRadius: "2px",
              }}
            >
              <div
                className="w-12 h-12 flex flex-col items-center justify-center text-center flex-shrink-0"
                style={{
                  background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)",
                  border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "rgba(139,26,46,0.2)"}`,
                  borderRadius: "2px",
                }}
              >
                <span className="text-xs font-bold" style={{ color: "#c9a84c" }}>{s.day.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{s.subject}</div>
                <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888", fontFamily: "sans-serif" }}>{s.teacher}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-medium" style={{ color: "#c9a84c" }}>{s.time}</div>
                <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#aaa", fontFamily: "sans-serif" }}>{s.duration}</div>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#c9a84c" }} />
            </div>
          ))}
        </div>
      )}

      {/* Tab: sessions */}
      {tab === "sessions" && (
        <div className="space-y-3">
          <SectionLabel text="سجل الحصص الأخيرة" onDark={isDark} />
          {child.recentSessions.length === 0 ? (
            <div className="text-center py-16" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#aaa" }}>
              <div className="text-4xl mb-3">📋</div>
              <p style={{ fontFamily: "sans-serif" }}>لا يوجد سجل حصص بعد</p>
            </div>
          ) : child.recentSessions.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 transition-all duration-200"
              style={{
                background: s.attended
                  ? isDark ? "rgba(255,255,255,0.03)" : "#ffffff"
                  : isDark ? "rgba(139,26,46,0.08)" : "#fff9f9",
                border: `1px solid ${s.attended ? (isDark ? "rgba(255,255,255,0.08)" : "#e8e4de") : (isDark ? "rgba(139,26,46,0.25)" : "#f0c0c0")}`,
                borderRadius: "2px",
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: s.attended ? (isDark ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.1)") : (isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.1)"),
                  borderRadius: "2px",
                }}
              >
                {s.attended ? "✅" : "❌"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{s.subject}</div>
                <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>{s.teacher} · {s.date}</div>
                {s.note && <div className="text-xs mt-0.5" style={{ color: "#c9a84c", fontFamily: "sans-serif" }}>💬 {s.note}</div>}
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 flex-shrink-0"
                style={{
                  background: s.attended ? "rgba(201,168,76,0.15)" : (isDark ? "rgba(139,26,46,0.25)" : "rgba(139,26,46,0.1)"),
                  color: s.attended ? "#c9a84c" : (isDark ? "#f0b8be" : "#8b1a2e"),
                  borderRadius: "2px",
                  fontFamily: "sans-serif",
                }}
              >
                {s.attended ? "حضر" : "غياب"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: teachers */}
      {tab === "teachers" && (
        <div className="space-y-3">
          <SectionLabel text="المدرسين المسجلين" onDark={isDark} />
          {child.teachers.length === 0 ? (
            <div className="text-center py-16" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#aaa" }}>
              <div className="text-4xl mb-3">👨‍🏫</div>
              <p style={{ fontFamily: "sans-serif" }}>لا يوجد مدرسين مسجلين</p>
            </div>
          ) : child.teachers.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                borderRadius: "2px",
              }}
            >
              <AvatarOrInitial
                src={t.image}
                name={t.name}
                className="w-12 h-12 object-cover text-base"
                style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }}
              />
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}>{t.name}</div>
                <div className="text-xs" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>{t.subject}</div>
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: "#c9a84c" }} />
            </div>
          ))}
          <button
            className="w-full py-3 font-semibold text-sm text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
          >
            + إضافة مدرس جديد
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { isDark } = useDarkMode();
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState<string>("");
  const [parentImage, setParentImage] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!supabase) return;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", auth.user.id)
        .single();

      if (profile && mounted) {
        setParentName(profile.full_name ?? "");
        setParentImage("");
      }

      const { data: kids } = await supabase
        .from("children")
        .select("id,name,grade,avatar,color")
        .order("created_at", { ascending: false });

      if (kids && mounted) {
        const mapped: ChildItem[] = kids.map((r: any) => ({
          id: r.id, name: r.name, age: 14,
          grade: r.grade ?? "", avatar: r.avatar ?? "",
          color: "#8b1a2e",
          attendance: 0, sessions: 0, upcoming: 0,
          teachers: [], schedule: [], recentSessions: [],
        }));
        setChildren(mapped);
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const totalSessions = children.reduce((a, c) => a + c.sessions, 0);
  const avgAttendance = children.length
    ? Math.round(children.reduce((a, c) => a + c.attendance, 0) / children.length)
    : 0;
  const totalUpcoming = children.reduce((a, c) => a + c.upcoming, 0);

  // ── Child detail view ──
  if (selectedChild) {
    return (
      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          background: isDark
            ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)"
            : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)",
          color: isDark ? "#fff" : "#1a1a1a",
          fontFamily: "Georgia, serif",
        }}
        dir="rtl"
      >
        <div className="max-w-3xl mx-auto px-6 py-10">
          <ChildDetail child={selectedChild} onBack={() => setSelectedChild(null)} isDark={isDark} />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div
        className="min-h-screen transition-colors duration-300"
        style={{
          background: isDark
            ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)"
            : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)",
          color: isDark ? "#fff" : "#1a1a1a",
          fontFamily: "Georgia, serif",
        }}
        dir="rtl"
      >
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "25%",
              width: 500,
              height: 300,
              background: isDark ? "rgba(139,26,46,0.12)" : "rgba(139,26,46,0.04)",
              filter: "blur(120px)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: "25%",
              width: 400,
              height: 250,
              background: isDark ? "rgba(201,168,76,0.06)" : "rgba(201,168,76,0.03)",
              filter: "blur(120px)",
              borderRadius: "50%",
            }}
          />
        </div>

        {showAddModal && (
          <AddChildModal
            onClose={() => setShowAddModal(false)}
            onAdd={(c) => setChildren([...children, c])}
            isDark={isDark}
          />
        )}

        {/* ═══════ TOP BAR ═══════ */}
        <div style={{ borderBottom: "4px solid #8b1a2e" }}>
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs mb-3"
                style={{
                  background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)",
                  border: `1px solid ${isDark ? "rgba(139,26,46,0.5)" : "rgba(139,26,46,0.3)"}`,
                  color: isDark ? "#f0b8be" : "#8b1a2e",
                  letterSpacing: ".05em",
                  borderRadius: "2px",
                  fontFamily: "sans-serif",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
                لوحة تحكم ولي الأمر
              </div>
              {parentName ? (
                <h1 className="text-3xl font-extrabold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                  أهلاً، {parentName} 👋
                </h1>
              ) : (
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="w-44 h-8" isDark={isDark} />
                  <span className="text-3xl">👋</span>
                </div>
              )}
              <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>
                تابع أبناءك وجداولهم من مكان واحد
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="relative w-10 h-10 flex items-center justify-center transition-all duration-200 hover:opacity-80"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`,
                  borderRadius: "2px",
                  color: isDark ? "rgba(255,255,255,0.6)" : "#666",
                }}
              >
                🔔
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#8b1a2e" }} />
              </button>
              <AvatarOrInitial
                src={parentImage}
                name={parentName}
                className="w-10 h-10 object-cover text-sm"
                style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          {/* ═══════ STATS ═══════ */}
          {loading ? (
            <StatsSkeletons isDark={isDark} />
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-4"
              style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}
            >
              {[
                { label: "عدد الأبناء", value: children.length, icon: "👨‍👧‍👦" },
                { label: "إجمالي الحصص", value: totalSessions, icon: "📚" },
                { label: "متوسط الحضور", value: `${avgAttendance}%`, icon: "📊" },
                { label: "حصص قادمة", value: totalUpcoming, icon: "📅" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="py-10 px-4 text-center"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
                    borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
                  }}
                >
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-4xl font-extrabold mb-1" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
                    {s.value}
                  </div>
                  <div className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888", fontFamily: "sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════ CHILDREN ═══════ */}
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <SectionLabel text="الأبناء المسجلين" onDark={isDark} />
                <h2 className="text-2xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>أبناؤك</h2>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
              >
                + إضافة ابن
              </button>
            </div>

            {loading ? (
              <ChildrenSkeletons isDark={isDark} />
            ) : children.length === 0 ? (
              <div
                className="text-center py-16"
                style={{ border: `1px dashed ${isDark ? "rgba(139,26,46,0.4)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px" }}
              >
                <div className="text-5xl mb-4">👨‍👧‍👦</div>
                <p className="mb-4" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>لم تسجل أي أبناء بعد</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
                >
                  أضف ابنك الأول
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                      borderTop: "3px solid #8b1a2e",
                      borderRadius: "2px",
                      boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                    onClick={() => setSelectedChild(child)}
                  >
                    <div className="flex items-start gap-4">
                      <AvatarOrInitial
                        src={child.avatar}
                        name={child.name}
                        className="w-16 h-16 flex-shrink-0 object-cover text-xl"
                        style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="text-base font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{child.name}</h3>
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5"
                            style={{ background: "rgba(139,26,46,0.3)", color: "#f0b8be", borderRadius: "2px", fontFamily: "sans-serif" }}
                          >
                            {child.age} سنة
                          </span>
                        </div>
                        <p className="text-xs mb-3" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>{child.grade}</p>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { v: `${child.attendance}%`, l: "حضور" },
                            { v: child.sessions, l: "حصة" },
                            { v: child.upcoming, l: "قادمة" },
                          ].map((s, i) => (
                            <div
                              key={i}
                              className="p-2 text-center"
                              style={{
                                background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
                                borderRadius: "2px",
                              }}
                            >
                              <div className="text-sm font-bold" style={{ color: "#c9a84c" }}>{s.v}</div>
                              <div className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>{s.l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {child.teachers.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}` }}>
                        <div className="flex">
                          {child.teachers.slice(0, 3).map((t, i) => (
                            <AvatarOrInitial
                              key={i}
                              src={t.image}
                              name={t.name}
                              className="w-7 h-7 object-cover text-[10px]"
                              style={{ borderRadius: "50%", border: `2px solid ${isDark ? "#0f1c2e" : "#ffffff"}`, marginLeft: i > 0 ? "-6px" : 0 }}
                            />
                          ))}
                        </div>
                        <span className="text-xs mr-1" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>{child.teachers.length} مدرس</span>
                        <span className="mr-auto text-xs" style={{ color: "#8b1a2e", fontFamily: "sans-serif" }}>عرض التفاصيل ←</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══════ WEEKLY OVERVIEW ═══════ */}
          <div
            style={{
              background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
              borderRadius: "2px",
            }}
          >
            {/* Crimson header strip */}
            <div className="px-6 py-5" style={{ background: "#8b1a2e", borderBottom: "none" }}>
              <SectionLabel text="الأسبوع الحالي" onDark />
              <h2 className="text-xl font-bold text-white">نظرة عامة على الجدول</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-24" isDark={isDark} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day, di) => {
                    const allSessions = children.flatMap((c) =>
                      c.schedule.filter((s) => s.day === day).map((s) => ({ ...s, childName: c.name }))
                    );
                    const isToday = di === 0;
                    return (
                      <div
                        key={day}
                        className="p-3 min-h-[90px] transition-all duration-200"
                        style={{
                          background: isToday
                            ? (isDark ? "rgba(139,26,46,0.15)" : "rgba(139,26,46,0.05)")
                            : (isDark ? "rgba(255,255,255,0.02)" : "#faf9f7"),
                          border: `1px solid ${isToday ? (isDark ? "rgba(139,26,46,0.4)" : "rgba(139,26,46,0.3)") : (isDark ? "rgba(255,255,255,0.06)" : "#e8e4de")}`,
                          borderRadius: "2px",
                        }}
                      >
                        <div
                          className="text-[10px] font-bold mb-2 text-center"
                          style={{ color: isToday ? "#c9a84c" : (isDark ? "rgba(255,255,255,0.3)" : "#aaa"), fontFamily: "sans-serif" }}
                        >
                          {day.slice(0, 2)}
                        </div>
                        {allSessions.length === 0 ? (
                          <div className="text-center text-xs mt-2" style={{ color: isDark ? "rgba(255,255,255,0.15)" : "#ddd" }}>—</div>
                        ) : (
                          allSessions.map((s, i) => (
                            <div
                              key={i}
                              className="p-1.5 mb-1"
                              style={{
                                background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.05)",
                                border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "rgba(139,26,46,0.2)"}`,
                                borderRadius: "2px",
                              }}
                            >
                              <div className="text-[9px] font-bold leading-tight truncate" style={{ color: isDark ? "#f0b8be" : "#8b1a2e" }}>{s.subject}</div>
                              <div className="text-[8px] leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>{s.time}</div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ═══════ RECENT ACTIVITY ═══════ */}
          <div>
            <div className="mb-6">
              <SectionLabel text="آخر الأنشطة" onDark={isDark} />
              <h2 className="text-2xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>آخر الحصص</h2>
            </div>
            <div className="space-y-3">
              {children.flatMap((c) =>
                c.recentSessions.slice(0, 2).map((s) => ({ ...s, childName: c.name, childAvatar: c.avatar }))
              ).slice(0, 5).map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 transition-all duration-200"
                  style={{
                    background: s.attended
                      ? (isDark ? "rgba(255,255,255,0.03)" : "#ffffff")
                      : (isDark ? "rgba(139,26,46,0.08)" : "#fff9f9"),
                    border: `1px solid ${s.attended ? (isDark ? "rgba(255,255,255,0.08)" : "#e8e4de") : (isDark ? "rgba(139,26,46,0.2)" : "#f0c0c0")}`,
                    borderRight: `3px solid ${s.attended ? "#c9a84c" : "#8b1a2e"}`,
                    borderRadius: "2px",
                  }}
                >
                  <AvatarOrInitial
                    src={s.childAvatar}
                    name={s.childName}
                    className="w-10 h-10 object-cover text-sm flex-shrink-0"
                    style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{s.childName}</span>
                      <span style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#ccc" }}>·</span>
                      <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888", fontFamily: "sans-serif" }}>{s.subject}</span>
                    </div>
                    <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa", fontFamily: "sans-serif" }}>{s.teacher} · {s.date}</div>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 flex-shrink-0"
                    style={{
                      background: s.attended ? "rgba(201,168,76,0.15)" : (isDark ? "rgba(139,26,46,0.25)" : "rgba(139,26,46,0.1)"),
                      color: s.attended ? "#c9a84c" : (isDark ? "#f0b8be" : "#8b1a2e"),
                      borderRadius: "2px",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {s.attended ? "✓ حضر" : "✗ غياب"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}