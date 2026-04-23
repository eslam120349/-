import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";
import {
  FaChild, FaTimes, FaChartLine, FaBook, FaCalendarAlt, FaStar,
  FaChalkboardTeacher, FaClipboardList, FaArrowLeft, FaUserPlus,
  FaUsers, FaPlus, FaExclamationTriangle, FaCheck, FaGraduationCap
} from "react-icons/fa";

// ─── Theme ────────────────────────────────────────────────────────────────────
// Navy    : #0f1c2e
// Crimson : #8b1a2e
// Gold    : #c9a84c
// Border  : rgba(255,255,255,0.08)

type TeacherBrief = { name: string; subject: string; image: string; rating: number };
type GradeEntry = { subject: string; grade: number; max: number; date: string };
type Child = {
  id: number;
  name: string;
  age: number;
  grade: string;
  avatar: string;
  color: string;
  attendance: number;
  sessions: number;
  upcoming: number;
  gpa: number;
  teachers: TeacherBrief[];
  recentGrades: GradeEntry[];
};

const GRADES = [
  "الصف الرابع الابتدائي",
  "الصف الخامس الابتدائي",
  "الصف السادس الابتدائي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي",
];
const COLORS = ["crimson"];

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

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
      style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#666", fontFamily: "sans-serif" }}
    >
      {text}
    </p>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ChildSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="p-6 space-y-4"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
        borderTop: "3px solid #8b1a2e",
        borderRadius: "2px",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full animate-pulse" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 animate-pulse" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", width: "60%", borderRadius: "2px" }} />
          <div className="h-3 animate-pulse" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", width: "40%", borderRadius: "2px" }} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-10 animate-pulse" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: "2px" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddChildModal({
  onClose,
  onAdd,
  isDark,
}: {
  onClose: () => void;
  onAdd: (c: Child) => void;
  isDark: boolean;
}) {
  const [form, setForm] = useState<{ name: string; age: string; grade: string }>({ name: "", age: "", grade: "" });
  const [error, setError] = useState("");

  const submit = () => {
    if (!form.name.trim()) return setError("اكتب اسم الطالب");
    if (!form.grade) return setError("اختار الصف الدراسي");
    setError("");
    onAdd({
      id: Date.now(),
      name: form.name.trim(),
      age: parseInt(form.age) || 14,
      grade: form.grade,
      avatar: "",
      color: "crimson",
      attendance: 0,
      sessions: 0,
      upcoming: 0,
      gpa: 0,
      teachers: [],
      recentGrades: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div
        className="relative w-full max-w-md shadow-2xl overflow-hidden"
        style={{
          background: isDark ? "#0f1c2e" : "#ffffff",
          borderTop: "4px solid #8b1a2e",
          border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "#e8e4de"}`,
          borderRadius: "2px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crimson header */}
        <div className="px-8 pt-8 pb-6" style={{ background: "#8b1a2e" }}>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.2)" }}
          >
            <FaTimes />
          </button>
          <div className="text-3xl mb-2">
            <FaChild />
          </div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            إضافة ابن جديد
          </h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif" }}>
            أدخل بيانات ابنك لمتابعة حصصه وأدائه
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-4">
          {error && (
            <p
              className="text-xs py-2 px-3 text-center"
              style={{
                background: "rgba(139,26,46,0.15)",
                border: "1px solid rgba(139,26,46,0.3)",
                borderRadius: "2px",
                color: "#f0b8be",
                fontFamily: "sans-serif",
              }}
            >
              <FaExclamationTriangle className="inline-block ml-1" /> {error}
            </p>
          )}

          {[
            { label: "اسم الطالب", key: "name", type: "text", placeholder: "مثال: أحمد محمد" },
            { label: "السن", key: "age", type: "number", placeholder: "مثال: 15" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#666", fontFamily: "sans-serif" }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
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
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#666", fontFamily: "sans-serif" }}>
              الصف الدراسي
            </label>
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
              {GRADES.map((g) => (
                <option key={g} value={g} style={{ background: isDark ? "#0f1c2e" : "#ffffff" }}>
                  {g}
                </option>
              ))}
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
              onClick={submit}
              className="flex-1 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
            >
              إضافة <FaCheck className="inline-block mr-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Child Detail Panel ───────────────────────────────────────────────────────

function ChildPanel({
  child,
  onClose,
  onDelete,
  isDark,
}: {
  child: Child;
  onClose: () => void;
  onDelete: (id: number) => void;
  isDark: boolean;
}) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md h-full overflow-y-auto shadow-2xl"
        style={{ background: isDark ? "#0f1c2e" : "#ffffff", borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Crimson top bar */}
        <div style={{ height: 4, background: "#8b1a2e" }} />

        {/* Crimson header */}
        <div className="px-6 pt-6 pb-5" style={{ background: "#8b1a2e" }}>
          <div className="flex items-start justify-between mb-4">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded transition-colors"
              style={{ background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.7)" }}
            >
              <FaTimes />
            </button>
            <button
              onClick={() => onDelete(child.id)}
              className="text-xs px-3 py-1.5 transition-colors hover:opacity-80"
              style={{ background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.6)", borderRadius: "2px", fontFamily: "sans-serif" }}
            >
              حذف
            </button>
          </div>
          <div className="flex items-center gap-4">
            <AvatarOrInitial
              src={child.avatar}
              name={child.name}
              className="w-16 h-16 object-cover text-xl"
              style={{ borderRadius: "2px", border: "3px solid rgba(255,255,255,0.3)" }}
            />
            <div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                {child.name}
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>
                {child.grade}
              </p>
              <span
                className="text-xs px-2.5 py-0.5 mt-1 inline-block"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "2px", fontFamily: "sans-serif" }}
              >
                {child.age} سنة
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0" style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
          {[
            ["overview", "نظرة عامة"],
            ["teachers", "المدرسين"],
            ["grades", "الدرجات"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex-1 py-3 text-xs font-medium transition-all duration-200"
              style={{
                fontFamily: "sans-serif",
                background: tab === id ? "#8b1a2e" : "transparent",
                color: tab === id ? "#fff" : isDark ? "rgba(255,255,255,0.4)" : "#888",
                borderRight: id !== "grades" ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Overview */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: "نسبة الحضور", v: `${child.attendance}%`, icon: FaChartLine },
                  { l: "حصص منعقدة", v: child.sessions, icon: FaBook },
                  { l: "حصص قادمة", v: child.upcoming, icon: FaCalendarAlt },
                  { l: "متوسط الدرجات", v: child.gpa ? `${child.gpa}%` : "—", icon: FaStar },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      className="p-4"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.03)" : "#f5f4f2",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                        borderRadius: "2px",
                      }}
                    >
                      <div className="text-xl mb-1"><Icon /></div>
                      <div className="text-xl font-extrabold" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
                        {s.v}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>
                        {s.l}
                      </div>
                    </div>
                  );
                })}
              </div>

              {child.attendance > 0 && (
                <div
                  className="p-4"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "#f5f4f2",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                    borderRadius: "2px",
                  }}
                >
                  <div className="flex justify-between text-xs mb-2">
                    <span style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#666", fontFamily: "sans-serif" }}>نسبة الحضور</span>
                    <span className="font-bold" style={{ color: "#c9a84c" }}>
                      {child.attendance}%
                    </span>
                  </div>
                  <div className="w-full h-2" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e8e4de", borderRadius: "2px" }}>
                    <div className="h-2 transition-all duration-700" style={{ width: `${child.attendance}%`, background: "#8b1a2e", borderRadius: "2px" }} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Teachers */}
          {tab === "teachers" && (
            <div className="space-y-3">
              {child.teachers.length === 0 ? (
                <div className="text-center py-12" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#aaa" }}>
                  <div className="text-3xl mb-2"><FaChalkboardTeacher /></div>
                  <p className="text-sm" style={{ fontFamily: "sans-serif" }}>
                    لا يوجد مدرسين مسجلين
                  </p>
                </div>
              ) : (
                child.teachers.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                      borderRadius: "2px",
                    }}
                  >
                    <AvatarOrInitial
                      src={t.image}
                      name={t.name}
                      className="w-11 h-11 object-cover text-base"
                      style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}>
                        {t.name}
                      </p>
                      <p className="text-xs" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>
                        {t.subject}
                      </p>
                    </div>
                    <div className="text-xs font-bold" style={{ color: "#c9a84c" }}>
                      <FaStar className="inline-block ml-1" /> {t.rating}
                    </div>
                  </div>
                ))
              )}
              <button
                className="w-full py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
              >
                <FaUserPlus className="inline-block ml-1" /> إضافة مدرس
              </button>
            </div>
          )}

          {/* Grades */}
          {tab === "grades" && (
            <div className="space-y-3">
              {child.recentGrades.length === 0 ? (
                <div className="text-center py-12" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#aaa" }}>
                  <div className="text-3xl mb-2"><FaClipboardList /></div>
                  <p className="text-sm" style={{ fontFamily: "sans-serif" }}>
                    لا يوجد درجات مسجلة
                  </p>
                </div>
              ) : (
                child.recentGrades.map((g, i) => (
                  <div
                    key={i}
                    className="p-4"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                      borderRadius: "2px",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                        {g.subject}
                      </span>
                      <span className="text-sm font-bold" style={{ color: "#c9a84c" }}>
                        {g.grade}/{g.max}
                      </span>
                    </div>
                    <div className="w-full h-1.5" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#e8e4de", borderRadius: "2px" }}>
                      <div
                        className="h-1.5 transition-all duration-700"
                        style={{ width: `${(g.grade / g.max) * 100}%`, background: "#8b1a2e", borderRadius: "2px" }}
                      />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#aaa", fontFamily: "sans-serif" }}>
                      {g.date}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChildrenPage() {
  const { isDark } = useDarkMode();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Child | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("children")
        .select("id,name,grade,avatar,color,created_at")
        .order("created_at", { ascending: false });
      if (error || !data || !mounted) {
        setLoading(false);
        return;
      }
      setChildren(
        data.map((r: any) => ({
          id: r.id,
          name: r.name,
          age: 14,
          grade: r.grade ?? "",
          avatar: r.avatar ?? "",
          color: "crimson",
          attendance: 0,
          sessions: 0,
          upcoming: 0,
          gpa: 0,
          teachers: [],
          recentGrades: [],
        }))
      );
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const addChild = async (c: Child) => {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;
    const { data } = await supabase
      .from("children")
      .insert({
        parent_id: auth.user.id,
        name: c.name,
        grade: c.grade,
        avatar: c.avatar,
        color: c.color,
      })
      .select("id")
      .single();
    setChildren((prev) => [{ ...c, id: data?.id ?? Date.now() }, ...prev]);
  };

  const deleteChild = async (id: number) => {
    setChildren((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
    if (supabase) await supabase.from("children").delete().eq("id", id);
  };

  const totalSessions = children.reduce((a, c) => a + c.sessions, 0);
  const avgAttendance = children.length
    ? Math.round(children.reduce((a, c) => a + c.attendance, 0) / children.length)
    : 0;
  const totalUpcoming = children.reduce((a, c) => a + c.upcoming, 0);

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
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "33%",
            width: 400,
            height: 250,
            background: isDark ? "rgba(139,26,46,0.12)" : "rgba(139,26,46,0.04)",
            filter: "blur(100px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: "20%",
            width: 300,
            height: 200,
            background: isDark ? "rgba(201,168,76,0.05)" : "rgba(201,168,76,0.03)",
            filter: "blur(100px)",
            borderRadius: "50%",
          }}
        />
      </div>

      {showAdd && <AddChildModal onClose={() => setShowAdd(false)} onAdd={addChild} isDark={isDark} />}
      {selected && <ChildPanel child={selected} onClose={() => setSelected(null)} onDelete={deleteChild} isDark={isDark} />}

      {/* ═══════ HEADER ═══════ */}
      <div style={{ borderBottom: "4px solid #8b1a2e" }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm mb-3"
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
              {children.length} {children.length === 1 ? "ابن مسجل" : "أبناء مسجلين"}
            </div>
            <h1 className="text-3xl font-extrabold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
              أبناؤي
            </h1>
            <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>
              إدارة ومتابعة أبناؤك
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
          >
            <FaUserPlus /> إضافة ابن جديد
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* ═══════ SUMMARY STATS ═══════ */}
        {!loading && children.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
            {[
              { l: "عدد الأبناء", v: children.length, icon: FaUsers },
              { l: "إجمالي الحصص", v: totalSessions, icon: FaBook },
              { l: "متوسط الحضور", v: `${avgAttendance}%`, icon: FaChartLine },
              { l: "حصص قادمة", v: totalUpcoming, icon: FaCalendarAlt },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="py-8 px-4 text-center"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
                    borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
                  }}
                >
                  <div className="text-2xl mb-1"><Icon /></div>
                  <div className="text-3xl font-extrabold mb-0.5" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
                    {s.v}
                  </div>
                  <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
                    {s.l}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════ CHILDREN GRID ═══════ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <ChildSkeleton key={i} isDark={isDark} />
            ))}
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-24" style={{ border: `1px dashed ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px" }}>
            <div className="text-6xl mb-4"><FaUsers /></div>
            <h3 className="text-xl font-bold mb-2" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
              لا يوجد أبناء مسجلين
            </h3>
            <p className="text-sm mb-6" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
              أضف ابنك الأول وابدأ تتابع تقدمه
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
            >
              <FaUserPlus className="inline-block ml-1" /> أضف ابنك الأول
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {children.map((child) => (
              <div
                key={child.id}
                onClick={() => setSelected(child)}
                className="group p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                  borderTop: "3px solid #8b1a2e",
                  borderRadius: "2px",
                  boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div className="mb-4 transition-all duration-500" style={{ height: 2, width: "3rem", background: "#8b1a2e", borderRadius: "2px" }} />

                <div className="flex items-center gap-4 mb-4">
                  <AvatarOrInitial
                    src={child.avatar}
                    name={child.name}
                    className="w-16 h-16 flex-shrink-0 object-cover text-xl transition-transform duration-300 group-hover:scale-105"
                    style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                      {child.name}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>
                      {child.grade}
                    </p>
                    <span
                      className="text-xs px-2.5 py-0.5 mt-1 inline-block"
                      style={{ background: "rgba(139,26,46,0.2)", color: "#f0b8be", borderRadius: "2px", fontFamily: "sans-serif" }}
                    >
                      <FaChild className="inline-block ml-1" /> {child.age} سنة
                    </span>
                  </div>
                  <span className="text-sm transition-colors" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#ccc" }}>
                    <FaArrowLeft />
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
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
                      <p className="text-sm font-extrabold" style={{ color: "#c9a84c" }}>
                        {s.v}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#888", fontFamily: "sans-serif" }}>
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>

                {child.teachers.length > 0 && (
                  <div className="flex items-center gap-2 pt-4" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}` }}>
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
                    <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#888", fontFamily: "sans-serif" }}>
                      {child.teachers.length} مدرس
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Add card */}
            <button
              onClick={() => setShowAdd(true)}
              className="flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:opacity-80 min-h-[200px]"
              style={{ border: `2px dashed ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px", background: "transparent" }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center text-2xl"
                style={{ background: isDark ? "rgba(139,26,46,0.1)" : "rgba(139,26,46,0.05)", border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px", color: "#8b1a2e" }}
              >
                <FaPlus />
              </div>
              <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>
                إضافة ابن جديد
              </p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}