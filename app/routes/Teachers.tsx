import { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useDarkMode } from "../hooks/useDarkMode";

// ─── Theme ────────────────────────────────────────────────────────────────────
// Navy      : #0f1c2e
// Crimson   : #8b1a2e
// Gold      : #c9a84c
// Light bg  : #f5f4f2
// Border    : rgba(255,255,255,0.08)

// ─── Data ─────────────────────────────────────────────────────────────────────

const subjects = [
  { name: "الكل",        icon: "✨", ar: "الكل" },
  { name: "Mathematics", icon: "📐", ar: "رياضيات" },
  { name: "Physics",     icon: "⚛️", ar: "فيزياء" },
  { name: "Chemistry",   icon: "🧪", ar: "كيمياء" },
  { name: "Biology",     icon: "🧬", ar: "أحياء" },
  { name: "English",     icon: "📖", ar: "إنجليزي" },
  { name: "Arabic",      icon: "✍️", ar: "عربي" },
];

type Teacher = {
  id: number;
  name: string;
  nameAr: string;
  subject: string;
  subjectAr: string;
  rating: number;
  students: number;
  sessions: number;
  experience: string;
  price: number;
  bio: string;
  tags: string[];
  available: boolean;
  image: string;
  levels: string[];
  schedule: string[];
  color: string;
};

type Child = {
  id: number;
  name: string;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ className = "", isDark }: { className?: string; isDark: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
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

function TeacherCardSkeleton({ isDark }: { isDark: boolean }) {
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
      <div className="flex flex-col items-center gap-3">
        <SkeletonBlock className="w-20 h-20 rounded-full" isDark={isDark} />
        <SkeletonBlock className="w-32 h-4" isDark={isDark} />
        <SkeletonBlock className="w-20 h-5" isDark={isDark} />
      </div>
      <SkeletonBlock className="w-24 h-3 mx-auto" isDark={isDark} />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <SkeletonBlock key={i} className="h-10" isDark={isDark} />
        ))}
      </div>
      <SkeletonBlock className="w-full h-9" isDark={isDark} />
    </div>
  );
}

function GridSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <TeacherCardSkeleton key={i} isDark={isDark} />
      ))}
    </div>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ rating, isDark }: { rating: number; isDark: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className="w-3.5 h-3.5"
          style={{
            color: s <= Math.floor(rating) ? "#c9a84c" : isDark ? "rgba(255,255,255,0.15)" : "#d4cfc8",
          }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
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

// ─── Teacher Detail Modal ─────────────────────────────────────────────────────

function TeacherModal({
  teacher,
  onClose,
  isDark,
}: {
  teacher: Teacher;
  onClose: () => void;
  isDark: boolean;
}) {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [booked, setBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setChildrenLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("children")
        .select("id, name")
        .eq("parent_id", user.id);
      if (!error && data) {
        setChildren(data);
        if (data.length === 1) setSelectedChild(data[0].id);
      }
      setChildrenLoading(false);
    };
    load();
  }, []);

  const handleBook = async () => {
    if (!supabase || !selectedChild) return;
    setBookingLoading(true);
    setBookingError(null);
    const { error } = await supabase
      .from("enrollments")
      .insert({ child_id: selectedChild, teacher_id: teacher.id });
    if (error) {
      if (error.code === "23505") setBooked(true);
      else setBookingError("حدث خطأ أثناء الحجز، حاول مرة أخرى");
    } else {
      setBooked(true);
    }
    setBookingLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg shadow-2xl overflow-hidden"
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
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.2)" }}
          >
            ✕
          </button>

          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={teacher.image}
                alt={teacher.nameAr}
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: "3px solid rgba(255,255,255,0.3)" }}
              />
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full"
                style={{ background: teacher.available ? "#4ade80" : "#4b5563", border: "2px solid #8b1a2e" }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                {teacher.nameAr}
              </h2>
              <span
                className="inline-block text-xs font-medium px-3 py-0.5 mt-1"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "2px", fontFamily: "sans-serif" }}
              >
                {teacher.subjectAr}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={teacher.rating} isDark={true} />
                <span className="text-xs font-semibold" style={{ color: "#c9a84c" }}>
                  {teacher.rating}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
                  ({teacher.sessions} حصة)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { v: teacher.students, l: "طالب" },
              { v: teacher.sessions, l: "حصة" },
              { v: teacher.experience, l: "خبرة" },
              { v: `${teacher.price} ج`, l: "/ ساعة" },
            ].map((s, i) => (
              <div
                key={i}
                className="p-3 text-center"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                  borderRadius: "2px",
                }}
              >
                <div className="text-base font-extrabold" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
                  {s.v}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#555", fontFamily: "sans-serif" }}
            dir="rtl"
          >
            {teacher.bio}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {teacher.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`,
                  color: isDark ? "rgba(255,255,255,0.45)" : "#666",
                  borderRadius: "2px",
                  fontFamily: "sans-serif",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Schedule */}
          <div className="mb-4">
            <SectionLabel text="أيام الإتاحة" isDark={isDark} />
            <div className="flex flex-wrap gap-2">
              {teacher.schedule.map((day) => (
                <span
                  key={day}
                  className="text-xs font-medium px-3 py-1"
                  style={{
                    background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)",
                    border: `1px solid ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`,
                    color: isDark ? "#f0b8be" : "#8b1a2e",
                    borderRadius: "2px",
                    fontFamily: "sans-serif",
                  }}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div className="mb-6">
            <SectionLabel text="المراحل الدراسية" isDark={isDark} />
            <div className="flex flex-wrap gap-2">
              {teacher.levels.map((lvl) => (
                <span
                  key={lvl}
                  className="text-xs px-3 py-1"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                    color: isDark ? "rgba(255,255,255,0.55)" : "#666",
                    borderRadius: "2px",
                    fontFamily: "sans-serif",
                  }}
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          {/* Booking */}
          {teacher.available ? (
            <div className="space-y-3">
              {childrenLoading ? (
                <div
                  className="w-full px-4 py-3 text-sm text-center animate-pulse"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                    borderRadius: "2px",
                    color: isDark ? "rgba(255,255,255,0.35)" : "#888",
                    fontFamily: "sans-serif",
                  }}
                >
                  جار تحميل أسماء الأطفال...
                </div>
              ) : children.length === 0 ? (
                <div
                  className="w-full px-4 py-3 text-sm text-center"
                  style={{
                    background: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    borderRadius: "2px",
                    color: "#c9a84c",
                    fontFamily: "sans-serif",
                  }}
                >
                  ⚠️ لا يوجد أطفال مسجلين في حسابك
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>
                    اختر الطفل اللي هتحجزله
                  </p>
                  <select
                    value={selectedChild ?? ""}
                    onChange={(e) => setSelectedChild(Number(e.target.value))}
                    disabled={booked}
                    className="w-full px-4 py-3 text-sm focus:outline-none transition-colors disabled:opacity-50"
                    style={{
                      background: isDark ? "#0f1c2e" : "#ffffff",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`,
                      borderRadius: "2px",
                      color: isDark ? "#fff" : "#1a1a1a",
                    }}
                  >
                    {children.length > 1 && (
                      <option value="" disabled style={{ background: isDark ? "#0f1c2e" : "#ffffff" }}>
                        — اختر اسم الطفل —
                      </option>
                    )}
                    {children.map((child) => (
                      <option key={child.id} value={child.id} style={{ background: isDark ? "#0f1c2e" : "#ffffff" }}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {bookingError && (
                <p
                  className="text-xs text-center py-2"
                  style={{
                    background: "rgba(139,26,46,0.15)",
                    border: "1px solid rgba(139,26,46,0.3)",
                    borderRadius: "2px",
                    color: "#f0b8be",
                    fontFamily: "sans-serif",
                  }}
                >
                  ⚠️ {bookingError}
                </p>
              )}

              <button
                onClick={handleBook}
                disabled={booked || bookingLoading || !selectedChild || children.length === 0}
                className="w-full py-3.5 font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
              >
                {bookingLoading ? "⏳ جار الحجز..." : booked ? "✅ تم إرسال طلب الحجز!" : "احجز حصة تجريبية مجانية 🚀"}
              </button>
            </div>
          ) : (
            <div
              className="w-full py-3.5 text-center text-sm"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "#f5f4f2",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                borderRadius: "2px",
                color: isDark ? "rgba(255,255,255,0.3)" : "#aaa",
                fontFamily: "sans-serif",
              }}
            >
              المدرس غير متاح حالياً — يمكنك إضافته للمفضلة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────

function TeacherCard({
  teacher,
  onSelect,
  isDark,
}: {
  teacher: Teacher;
  onSelect: () => void;
  isDark: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className="group p-5 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
        borderTop: "3px solid #8b1a2e",
        borderRadius: "2px",
        boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Available badge */}
      <div className="flex justify-end mb-2">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5"
          style={{
            background: teacher.available ? "rgba(74,222,128,0.1)" : isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
            color: teacher.available ? "#4ade80" : isDark ? "rgba(255,255,255,0.3)" : "#aaa",
            borderRadius: "2px",
            fontFamily: "sans-serif",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: teacher.available ? "#4ade80" : isDark ? "rgba(255,255,255,0.2)" : "#ccc",
              animation: teacher.available ? "pulse 2s infinite" : "none",
            }}
          />
          {teacher.available ? "متاح" : "مشغول"}
        </span>
      </div>

      {/* Avatar */}
      <div className="relative w-fit mx-auto mb-4">
        <img
          src={teacher.image}
          alt={teacher.nameAr}
          className="w-20 h-20 rounded-full object-cover transition-all duration-300 group-hover:scale-105"
          style={{ border: "2px solid #8b1a2e" }}
        />
      </div>

      {/* Name + subject */}
      <h3 className="text-base font-bold mb-0.5" style={{ color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}>
        {teacher.nameAr}
      </h3>
      <p className="text-sm mb-3 font-medium" style={{ color: "#8b1a2e", fontFamily: "sans-serif" }}>
        {teacher.subjectAr}
      </p>

      {/* Stars */}
      <div className="flex items-center justify-center gap-1.5 mb-4">
        <StarRating rating={teacher.rating} isDark={isDark} />
        <span className="text-xs font-bold" style={{ color: "#c9a84c" }}>
          {teacher.rating}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { v: teacher.students, l: "طالب" },
          { v: teacher.sessions, l: "حصة" },
          { v: teacher.experience, l: "خبرة" },
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
            <div className="text-sm font-extrabold" style={{ color: "#c9a84c" }}>
              {s.v}
            </div>
            <div className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#888", fontFamily: "sans-serif" }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Price */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#888", fontFamily: "sans-serif" }}>
          سعر الحصة
        </span>
        <span className="text-sm font-bold" style={{ color: "#c9a84c" }}>
          {teacher.price} ج / ساعة
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4 justify-center">
        {teacher.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5"
            style={{
              background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
              color: isDark ? "rgba(255,255,255,0.35)" : "#888",
              borderRadius: "2px",
              fontFamily: "sans-serif",
            }}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button
        className="w-full py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
        style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
      >
        عرض الملف الكامل
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeachersPage() {
  const { isDark } = useDarkMode();
  const [activeSubject, setActiveSubject] = useState("الكل");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price_asc" | "price_desc" | "students">("rating");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!supabase) {
        setErrorMsg("Supabase غير مهيّأ");
        setLoading(false);
        return;
      }
      const { data: rows, error } = await supabase
        .from("teachers")
        .select("id,name,name_ar,subject,subject_ar,rating,students,sessions,experience,price,bio,tags,available,image,levels,schedule,color");
      if (!mounted) return;
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
      const mapped: Teacher[] = (rows ?? []).map((r: any) => ({
        id: r.id,
        name: r.name,
        nameAr: r.name_ar ?? r.name,
        subject: r.subject,
        subjectAr: r.subject_ar ?? r.subject,
        rating: Number(r.rating ?? 0),
        students: Number(r.students ?? 0),
        sessions: Number(r.sessions ?? 0),
        experience: r.experience ?? "",
        price: Number(r.price ?? 0),
        bio: r.bio ?? "",
        tags: Array.isArray(r.tags) ? r.tags : [],
        available: !!r.available,
        image: r.image ?? "",
        levels: Array.isArray(r.levels) ? r.levels : [],
        schedule: Array.isArray(r.schedule) ? r.schedule : [],
        color: r.color ?? "crimson",
      }));
      setTeachers(mapped);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...teachers];
    if (activeSubject !== "الكل") list = list.filter((t) => t.subjectAr === activeSubject);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.nameAr.includes(search) ||
          t.name.toLowerCase().includes(q) ||
          t.subjectAr.includes(search) ||
          t.tags.some((tag) => tag.includes(search))
      );
    }
    if (onlyAvailable) list = list.filter((t) => t.available);
    switch (sortBy) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "students":
        list.sort((a, b) => b.students - a.students);
        break;
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
    }
    return list;
  }, [teachers, activeSubject, search, sortBy, onlyAvailable]);

  const statsAvailable = teachers.filter((t) => t.available).length;
  const statsAvgRating = teachers.length
    ? Math.round((teachers.reduce((a, b) => a + b.rating, 0) / teachers.length) * 10) / 10
    : 0;
  const statsStudents = teachers.reduce((a, b) => a + b.students, 0);
  const hasFilters = search || onlyAvailable || activeSubject !== "الكل";

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
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
              right: "25%",
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
              bottom: "25%",
              left: "25%",
              width: 400,
              height: 250,
              background: isDark ? "rgba(201,168,76,0.06)" : "rgba(201,168,76,0.03)",
              filter: "blur(120px)",
              borderRadius: "50%",
            }}
          />
        </div>

        {selectedTeacher && (
          <TeacherModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} isDark={isDark} />
        )}

        {/* ═══════ HERO HEADER ═══════ */}
        <div style={{ borderBottom: "4px solid #8b1a2e" }}>
          <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-sm mb-4"
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
                  {loading ? "جار تحميل المدرسين..." : `${teachers.length} مدرس متاح على المنصة`}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                  اختار{" "}
                  <span style={{ color: "#c9a84c" }}>مدرسك</span>
                  {" "}المثالي
                </h1>
                <p className="text-base mt-2" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>
                  ابحث، قارن، واحجز حصة تجريبية مجانية
                </p>
              </div>

              {/* Summary stats */}
              <div className="flex gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
                {loading ? (
                  [0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="px-6 py-4 space-y-2 text-center"
                      style={{ borderRight: i < 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none" }}
                    >
                      <SkeletonBlock className="w-12 h-6 mx-auto" isDark={isDark} />
                      <SkeletonBlock className="w-20 h-3 mx-auto" isDark={isDark} />
                    </div>
                  ))
                ) : (
                  [
                    { v: statsAvailable, l: "متاح الآن" },
                    { v: `${statsAvgRating}★`, l: "متوسط التقييم" },
                    { v: `${statsStudents}+`, l: "طالب مسجل" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="px-6 py-4 text-center"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
                        borderRight: i < 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
                      }}
                    >
                      <div className="text-xl font-extrabold mb-0.5" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
                        {s.v}
                      </div>
                      <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
                        {s.l}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* ═══════ SEARCH + FILTERS ═══════ */}
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}>
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم المدرس أو المادة أو الكلمات الدلالية..."
                className="w-full pr-12 pl-4 py-3.5 text-sm focus:outline-none transition-colors"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`,
                  borderRadius: "2px",
                  fontFamily: "sans-serif",
                  color: isDark ? "#fff" : "#1a1a1a",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8b1a2e")}
                onBlur={(e) => (e.target.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#aaa" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Subject pills + controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex flex-wrap gap-2 flex-1">
                {subjects.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => setActiveSubject(sub.ar)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      borderRadius: "2px",
                      fontFamily: "sans-serif",
                      border: activeSubject === sub.ar ? "1px solid #8b1a2e" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`,
                      background: activeSubject === sub.ar ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
                      color: activeSubject === sub.ar ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#555",
                    }}
                  >
                    <span>{sub.icon}</span>
                    {sub.ar}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setOnlyAvailable(!onlyAvailable)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-all duration-200"
                  style={{
                    borderRadius: "2px",
                    fontFamily: "sans-serif",
                    border: onlyAvailable ? "1px solid rgba(74,222,128,0.4)" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`,
                    background: onlyAvailable
                      ? "rgba(74,222,128,0.1)"
                      : isDark
                      ? "rgba(255,255,255,0.04)"
                      : "#ffffff",
                    color: onlyAvailable ? "#4ade80" : isDark ? "rgba(255,255,255,0.45)" : "#555",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: onlyAvailable ? "#4ade80" : isDark ? "rgba(255,255,255,0.2)" : "#ccc" }}
                  />
                  متاح فقط
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3.5 py-2 text-xs focus:outline-none transition-colors"
                  style={{
                    background: isDark ? "#0f1c2e" : "#ffffff",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`,
                    borderRadius: "2px",
                    color: isDark ? "rgba(255,255,255,0.6)" : "#555",
                    fontFamily: "sans-serif",
                  }}
                >
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="students">الأكثر طلاباً</option>
                  <option value="price_asc">السعر: الأقل أولاً</option>
                  <option value="price_desc">السعر: الأعلى أولاً</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
                {errorMsg ? (
                  "تعذّر تحميل المدرّسين"
                ) : (
                  <>
                    عرض <span style={{ color: isDark ? "#fff" : "#1a1a1a", fontWeight: 600 }}>{filtered.length}</span> مدرس
                    {activeSubject !== "الكل" && <span style={{ color: "#8b1a2e" }}> في {activeSubject}</span>}
                  </>
                )}
              </p>
              {hasFilters && (
                <button
                  onClick={() => {
                    setSearch("");
                    setOnlyAvailable(false);
                    setActiveSubject("الكل");
                  }}
                  className="text-xs transition-colors hover:opacity-80 underline underline-offset-2"
                  style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#aaa", fontFamily: "sans-serif" }}
                >
                  إزالة الفلاتر
                </button>
              )}
            </div>
          )}

          {/* ═══════ GRID ═══════ */}
          {loading ? (
            <GridSkeleton isDark={isDark} />
          ) : errorMsg ? (
            <div
              className="text-center py-24"
              style={{ border: `1px dashed ${isDark ? "rgba(139,26,46,0.3)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px" }}
            >
              <div className="text-5xl mb-4">⚠️</div>
              <p className="mb-2" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
                خطأ أثناء تحميل المدرّسين
              </p>
              <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#aaa", fontFamily: "sans-serif" }}>
                {errorMsg}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-24"
              style={{ border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px" }}
            >
              <div className="text-5xl mb-4">🔍</div>
              <p className="mb-2" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>
                لا يوجد مدرسين بهذه المواصفات
              </p>
              <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#aaa", fontFamily: "sans-serif" }}>
                جرب تغيير الفلاتر أو كلمة البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} onSelect={() => setSelectedTeacher(teacher)} isDark={isDark} />
              ))}
            </div>
          )}

          {/* ═══════ CTA BOTTOM — crimson section ═══════ */}
          <div className="relative text-center px-8 py-14 overflow-hidden" style={{ background: "#8b1a2e", borderRadius: "2px" }}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 70%)" }}
            />
            <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "sans-serif" }}>
              محتاج مساعدة؟
            </p>
            <h2 className="text-2xl font-extrabold text-white mb-3">مش لاقي المدرس المناسب؟</h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", direction: "rtl" }}>
              فريقنا هيساعدك تلاقي أنسب مدرس لطفلك بناءً على مستواه واحتياجاته
            </p>
            <button
              className="px-8 py-3 font-semibold text-sm text-white transition-all duration-200 hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "2px", fontFamily: "sans-serif" }}
            >
              تواصل معنا 💬
            </button>
          </div>
        </div>
      </div>
    </>
  );
}