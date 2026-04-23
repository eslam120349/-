import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";

// ─── Theme ────────────────────────────────────────────────────────────────────
// Navy    : #0f1c2e
// Crimson : #8b1a2e
// Gold    : #c9a84c

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

type ChildRow = { id: number; name: string; avatar: string };
type SessionRow = {
  id: number;
  childId: number;
  childName: string;
  day: string;
  subject: string;
  teacher: string;
  time: string;
  duration: number;
  teacherImg: string;
};

// ─── Session Modal ────────────────────────────────────────────────────────────

function SessionModal({
  session,
  onClose,
  isDark,
}: {
  session: SessionRow;
  onClose: () => void;
  isDark: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm shadow-2xl overflow-hidden"
        style={{
          background: isDark ? "#0f1c2e" : "#ffffff",
          borderTop: "4px solid #8b1a2e",
          border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "#e8e4de"}`,
          borderRadius: "2px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Crimson header */}
        <div className="px-7 pt-7 pb-5" style={{ background: "#8b1a2e" }}>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.2)" }}
          >
            ✕
          </button>

          <div className="flex items-center gap-4">
            <img
              src={session.teacherImg}
              alt=""
              className="w-14 h-14 rounded-full object-cover"
              style={{ border: "3px solid rgba(255,255,255,0.3)" }}
            />
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif" }}>
                {session.subject}
              </p>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                {session.teacher}
              </h3>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "sans-serif" }}>
                مدرس {session.subject}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-5">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { l: "اليوم", v: session.day },
              { l: "الوقت", v: session.time },
              { l: "المدة", v: `${session.duration} دقيقة` },
              { l: "الطالب", v: session.childName },
            ].map((s, i) => (
              <div
                key={i}
                className="p-3"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                  borderRadius: "2px",
                }}
              >
                <p className="text-[10px] mb-0.5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>
                  {s.l}
                </p>
                <p className="text-sm font-semibold" style={{ color: isDark ? "#fff" : "#1a1a1a", fontFamily: "sans-serif" }}>
                  {s.v}
                </p>
              </div>
            ))}
          </div>

          <button
            className="w-full py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
          >
            إلغاء / إعادة جدولة
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const { isDark } = useDarkMode();
  const [activeChild, setActiveChild] = useState(0);
  const [selectedSession, setSelectedSession] = useState<SessionRow | null>(null);
  const [view, setView] = useState<"week" | "list">("week");
  const [childrenRows, setChildrenRows] = useState<ChildRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoading(false);
        return;
      }

      const { data: kids } = await supabase.from("children").select("id,name,avatar,color");
      if (kids && mounted) {
        setChildrenRows(
          kids.map((c: any) => ({
            id: c.id,
            name: c.name,
            avatar: c.avatar ?? "https://i.pravatar.cc/150?img=12",
          }))
        );
      }

      const { data: sched } = await supabase
        .from("schedules")
        .select("id,child_id,day,time,duration,subject,color,teacher_img,teacher:teachers(name)")
        .order("day");

      if (sched && mounted) {
        const mapChildName = (id: number) => (kids ?? []).find((k: any) => k.id === id)?.name ?? "";
        setSessions(
          sched.map((s: any) => ({
            id: s.id,
            childId: s.child_id,
            childName: mapChildName(s.child_id),
            day: s.day,
            subject: s.subject ?? "",
            teacher: s.teacher?.name ?? "",
            time: s.time,
            duration: s.duration,
            teacherImg: s.teacher_img ?? "https://i.pravatar.cc/150?img=31",
          }))
        );
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = activeChild === 0 ? sessions : sessions.filter((s) => s.childId === activeChild);
  const todayAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"][new Date().getDay()];

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
            right: "33%",
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
            left: "20%",
            width: 300,
            height: 200,
            background: isDark ? "rgba(201,168,76,0.05)" : "rgba(201,168,76,0.03)",
            filter: "blur(100px)",
            borderRadius: "50%",
          }}
        />
      </div>

      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} isDark={isDark} />
      )}

      {/* ═══════ HEADER ═══════ */}
      <div style={{ borderBottom: "4px solid #8b1a2e" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
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
              الأسبوع الحالي
            </div>
            <h1 className="text-3xl font-extrabold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
              الجدول الأسبوعي
            </h1>
            <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>
              كل حصص أبناؤك في مكان واحد
            </p>
          </div>

          {/* View toggle */}
          <div className="flex gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px" }}>
            {[
              ["week", "📅 أسبوعي"],
              ["list", "📋 قائمة"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setView(v as any)}
                className="px-5 py-2.5 text-xs font-medium transition-all duration-200"
                style={{
                  fontFamily: "sans-serif",
                  background: view === v ? "#8b1a2e" : "transparent",
                  color: view === v ? "#fff" : isDark ? "rgba(255,255,255,0.4)" : "#888",
                  borderRight: v === "week" ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ═══════ CHILD FILTER ═══════ */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveChild(0)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-200"
            style={{
              borderRadius: "2px",
              fontFamily: "sans-serif",
              border: activeChild === 0 ? "1px solid #8b1a2e" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`,
              background: activeChild === 0 ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
              color: activeChild === 0 ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#555",
            }}
          >
            ✨ الكل
            <span
              className="px-1.5 py-0.5 text-[10px]"
              style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}
            >
              {sessions.length}
            </span>
          </button>

          {childrenRows.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChild(c.id)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-200"
              style={{
                borderRadius: "2px",
                fontFamily: "sans-serif",
                border: activeChild === c.id ? "1px solid #8b1a2e" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`,
                background: activeChild === c.id ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                color: activeChild === c.id ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#555",
              }}
            >
              {c.avatar ? (
                <img
                  src={c.avatar}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                />
              ) : (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "rgba(139,26,46,0.4)" }}
                >
                  {c.name.charAt(0)}
                </span>
              )}
              {c.name}
              <span
                className="px-1.5 py-0.5 text-[10px]"
                style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}
              >
                {sessions.filter((s) => s.childId === c.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* ═══════ WEEK VIEW ═══════ */}
        {view === "week" && (
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const daySessions = filtered.filter((s) => s.day === day);
              const isToday = day === todayAr;
              return (
                <div
                  key={day}
                  className="p-2 min-h-[160px] flex flex-col transition-all duration-200"
                  style={{
                    background: isToday
                      ? isDark
                        ? "rgba(139,26,46,0.12)"
                        : "rgba(139,26,46,0.05)"
                      : isDark
                      ? "rgba(255,255,255,0.02)"
                      : "#faf9f7",
                    border: `1px solid ${
                      isToday
                        ? isDark
                          ? "rgba(139,26,46,0.4)"
                          : "rgba(139,26,46,0.3)"
                        : isDark
                        ? "rgba(255,255,255,0.06)"
                        : "#e8e4de"
                    }`,
                    borderRadius: "2px",
                  }}
                >
                  {/* Day header */}
                  <div
                    className="text-center mb-2 pb-2"
                    style={{
                      borderBottom: `1px solid ${
                        isToday
                          ? isDark
                            ? "rgba(139,26,46,0.25)"
                            : "rgba(139,26,46,0.2)"
                          : isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#e8e4de"
                      }`,
                    }}
                  >
                    <p
                      className="text-[10px] font-bold"
                      style={{
                        color: isToday ? "#c9a84c" : isDark ? "rgba(255,255,255,0.3)" : "#aaa",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {day.slice(0, 2)}
                    </p>
                    {isToday && (
                      <span className="text-[8px] font-medium" style={{ color: "#c9a84c", fontFamily: "sans-serif" }}>
                        اليوم
                      </span>
                    )}
                  </div>

                  {/* Sessions */}
                  <div className="flex flex-col gap-1.5 flex-1">
                    {daySessions.length === 0 ? (
                      <p className="text-center text-[10px] mt-3" style={{ color: isDark ? "rgba(255,255,255,0.12)" : "#ddd" }}>
                        —
                      </p>
                    ) : (
                      daySessions.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSession(s)}
                          className="w-full text-right p-1.5 transition-all duration-200 hover:scale-[1.03]"
                          style={{
                            background: isDark ? "rgba(139,26,46,0.15)" : "rgba(139,26,46,0.08)",
                            border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "rgba(139,26,46,0.2)"}`,
                            borderRadius: "2px",
                          }}
                        >
                          <p className="text-[9px] font-bold leading-tight truncate" style={{ color: isDark ? "#f0b8be" : "#8b1a2e" }}>
                            {s.subject}
                          </p>
                          <p className="text-[8px] leading-tight" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>
                            {s.time}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <img src={s.teacherImg} alt="" className="w-3 h-3 rounded-full object-cover opacity-60" />
                            <p className="text-[7px] truncate" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#aaa", fontFamily: "sans-serif" }}>
                              {s.childName}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════ LIST VIEW ═══════ */}
        {view === "list" && (
          <div className="space-y-6">
            {DAYS.map((day) => {
              const daySessions = filtered.filter((s) => s.day === day);
              if (daySessions.length === 0) return null;
              const isToday = day === todayAr;
              return (
                <div key={day}>
                  {/* Day label */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-xs font-semibold px-3 py-1"
                      style={{
                        borderRadius: "2px",
                        fontFamily: "sans-serif",
                        background: isToday ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
                        border: `1px solid ${isToday ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                        color: isToday ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#666",
                      }}
                    >
                      {day} {isToday && "← اليوم"}
                    </span>
                    <div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#e8e4de" }} />
                  </div>

                  <div className="space-y-2">
                    {daySessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSession(s)}
                        className="w-full flex items-center gap-4 p-4 text-right transition-all duration-200 hover:-translate-y-0.5"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                          borderRight: "3px solid #8b1a2e",
                          borderRadius: "2px",
                        }}
                      >
                        <img
                          src={s.teacherImg}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                          style={{ border: "2px solid #8b1a2e" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}>
                            {s.subject}
                          </p>
                          <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
                            {s.teacher}
                          </p>
                        </div>
                        <div className="text-left flex-shrink-0">
                          <p className="text-sm font-semibold" style={{ color: "#c9a84c" }}>
                            {s.time}
                          </p>
                          <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa", fontFamily: "sans-serif" }}>
                            {s.duration} د · {s.childName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && !loading && (
          <div
            className="text-center py-20"
            style={{ border: `1px dashed ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px" }}
          >
            <div className="text-5xl mb-3">📅</div>
            <p style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
              لا يوجد حصص مجدولة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}