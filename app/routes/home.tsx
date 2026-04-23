import { useState } from "react";
import { useNavigate } from "react-router";
import { useDarkMode } from "../hooks/useDarkMode";

// ─── Theme ────────────────────────────────────────────────────────────────────
// Hero    : dark navy  #0f1c2e (داكن) / أبيض (فاتح)
// White sections : #ffffff  text #1a1a1a
// Crimson sections : #8b1a2e  text #ffffff
// Light gray sections : #f5f4f2
// Accent  : #8b1a2e
// Gold    : #c9a84c

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: "1,200+", label: "طالب نشط" },
  { value: "80+", label: "مدرس محترف" },
  { value: "95%", label: "نسبة الرضا" },
  { value: "15+", label: "مادة دراسية" },
];

const subjects = [
  { name: "All", icon: "✨" },
  { name: "Mathematics", icon: "📐" },
  { name: "Physics", icon: "⚛️" },
  { name: "Chemistry", icon: "🧪" },
  { name: "Biology", icon: "🧬" },
  { name: "English", icon: "📖" },
];

const teachers = [
  { id: 1, name: "Mr. Ahmed", subject: "Mathematics", rating: 4.9, students: 120, bio: "10+ years teaching advanced mathematics. Specializes in exam preparation.", image: "https://i.pravatar.cc/150?img=31" },
  { id: 2, name: "Ms. Sara", subject: "Physics", rating: 4.8, students: 98, bio: "PhD in Physics. Makes complex concepts simple and fun for all levels.", image: "https://i.pravatar.cc/150?img=32" },
  { id: 3, name: "Mr. Ali", subject: "Chemistry", rating: 4.7, students: 85, bio: "Passionate about chemistry with a hands-on teaching approach.", image: "https://i.pravatar.cc/150?img=33" },
  { id: 4, name: "Ms. Mona", subject: "Biology", rating: 4.9, students: 110, bio: "Expert in Biology and Life Sciences. Known for clear explanations.", image: "https://i.pravatar.cc/150?img=34" },
  { id: 5, name: "Ms. Nour", subject: "English", rating: 4.6, students: 74, bio: "Native-level English speaker. Focuses on conversation and writing skills.", image: "https://i.pravatar.cc/150?img=44" },
  { id: 6, name: "Mr. Karim", subject: "Mathematics", rating: 4.8, students: 95, bio: "Algebra and calculus specialist. Helped 500+ students pass their exams.", image: "https://i.pravatar.cc/150?img=53" },
];

const testimonials = [
  { name: "Layla Hassan", role: "Parent", text: "My daughter's grades improved drastically. The teachers here are incredibly dedicated.", avatar: "https://i.pravatar.cc/150?img=47" },
  { name: "Omar Khaled", role: "Parent", text: "Finding the right tutor was so easy. The platform is intuitive and well-organized.", avatar: "https://i.pravatar.cc/150?img=52" },
  { name: "Dina Youssef", role: "Student", text: "I finally understand Chemistry! Mr. Ali explains everything so clearly.", avatar: "https://i.pravatar.cc/150?img=45" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Teacher = (typeof teachers)[0];

// ─── StarRating ───────────────────────────────────────────────────────────────

function StarRating({ rating, onLight = true }: { rating: number; onLight?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className="w-3.5 h-3.5"
          style={{ color: s <= Math.floor(rating) ? "#c9a84c" : onLight ? "#d4cfc8" : "rgba(255,255,255,0.25)" }}
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

function SectionLabel({ text, onDark = false }: { text: string; onDark?: boolean }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
      style={{ color: onDark ? "rgba(255,255,255,0.55)" : "#8b1a2e", fontFamily: "sans-serif" }}
    >
      {text}
    </p>
  );
}

// ─── Teacher Modal ────────────────────────────────────────────────────────────

function TeacherModal({ teacher, onClose, isDark }: { teacher: Teacher; onClose: () => void; isDark: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden"
        style={{ borderTop: "4px solid #8b1a2e", borderRadius: "2px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded transition-colors"
          style={{ color: "rgba(255,255,255,0.8)", fontFamily: "sans-serif", background: "rgba(0,0,0,0.2)" }}
        >
          ✕
        </button>

        {/* Crimson header */}
        <div className="flex flex-col items-center text-center px-8 pt-10 pb-6" style={{ background: "#8b1a2e" }}>
          <div className="relative mb-3">
            <img
              src={teacher.image}
              alt={teacher.name}
              className="w-24 h-24 rounded-full object-cover"
              style={{ border: "3px solid rgba(255,255,255,0.35)" }}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400" style={{ border: "2px solid #8b1a2e" }} />
          </div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            {teacher.name}
          </h2>
          <span
            className="mt-1 text-xs px-3 py-1 font-medium"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "2px", fontFamily: "sans-serif" }}
          >
            {teacher.subject}
          </span>
        </div>

        {/* White body */}
        <div className="px-8 py-6" style={{ background: isDark ? "#1a2a40" : "#ffffff" }}>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { value: teacher.rating, label: "Rating" },
              { value: teacher.students, label: "Students" },
              { value: "5★", label: "Reviews" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 text-center"
                style={{
                  background: isDark ? "#0f1c2e" : "#f5f4f2",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e4de",
                  borderRadius: "2px",
                }}
              >
                <div className="text-lg font-bold" style={{ color: "#8b1a2e", fontFamily: "Georgia, serif" }}>
                  {item.value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: isDark ? "#cccccc" : "#888888", fontFamily: "sans-serif" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mb-4">
            <StarRating rating={teacher.rating} onLight={!isDark} />
          </div>

          <p className="text-sm text-center leading-relaxed mb-6" style={{ color: isDark ? "#dddddd" : "#555555", fontFamily: "sans-serif" }}>
            {teacher.bio}
          </p>

          <button
            className="w-full py-3 font-semibold text-sm text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
          >
            احجز حصة تجريبية مجانية
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParentHome() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [activeSubject, setActiveSubject] = useState("All");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const filteredTeachers =
    activeSubject === "All"
      ? teachers
      : teachers.filter((t) => t.subject === activeSubject);

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: isDark ? "#0f1c2e" : "#ffffff", fontFamily: "Georgia, serif", color: isDark ? "#ffffff" : "#1a1a1a" }}
    >
      {selectedTeacher && (
        <TeacherModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} isDark={isDark} />
      )}

      {/* ═══════════════════════════════════════
          HERO — dynamic dark/light
      ═══════════════════════════════════════ */}
      <section
        className="relative text-center px-6 pt-20 pb-24 overflow-hidden transition-all duration-300"
        style={{
          background: isDark
            ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)"
            : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)",
          borderBottom: "4px solid #8b1a2e",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,26,46,0.2) 0%, transparent 70%)"
              : "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,26,46,0.05) 0%, transparent 70%)",
          }}
        />

        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 text-sm mb-6"
          style={{
            background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)",
            border: isDark ? "1px solid rgba(139,26,46,0.5)" : "1px solid rgba(139,26,46,0.3)",
            color: isDark ? "#f0b8be" : "#8b1a2e",
            letterSpacing: ".05em",
            borderRadius: "2px",
            fontFamily: "sans-serif",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
          المنصة الأولى للتعليم الخصوصي في مصر
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
          Find the Best{" "}
          <span style={{ color: "#c9a84c" }}>Teacher</span>
          <br />
          <span style={{ color: isDark ? "#f0e8d0" : "#8b1a2e" }}>for Your Child</span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#666666", fontFamily: "sans-serif" }}
        >
          اختار المدرس المثالي لطفلك من بين أفضل المدرسين المتخصصين —
          بسهولة، بسرعة، وبثقة.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3.5 font-semibold text-base text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
          >
            ابدأ دلوقتي — مجاناً
          </button>
          <button
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-3.5 font-semibold text-base transition-all duration-200"
            style={{
              background: "transparent",
              border: isDark ? "1px solid rgba(255,255,255,0.3)" : "1px solid #8b1a2e",
              color: isDark ? "#fff" : "#8b1a2e",
              borderRadius: "2px",
              fontFamily: "sans-serif",
            }}
          >
            شوف كيف بتشتغل ▶
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS — dynamic background
      ═══════════════════════════════════════ */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 transition-colors"
        style={{
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`,
          background: isDark ? "#0f1c2e" : "#ffffff",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="text-center py-10 px-4 transition-colors"
            style={{
              borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}` : "none",
            }}
          >
            <div className="text-4xl font-extrabold mb-1" style={{ color: "#8b1a2e", fontFamily: "Georgia, serif" }}>
              {s.value}
            </div>
            <div className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#888888", fontFamily: "sans-serif", direction: "rtl" }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════
          SUBJECTS — light gray / dark surface
      ═══════════════════════════════════════ */}
      <section
        id="subjects"
        className="px-6 py-16 transition-colors"
        style={{ background: isDark ? "#1a2a40" : "#f5f4f2" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <SectionLabel text="المواد الدراسية" />
            <h2 className="text-3xl font-bold" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>Browse by Subject</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {subjects.map((sub) => (
              <button
                key={sub.name}
                onClick={() => setActiveSubject(sub.name)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  borderRadius: "2px",
                  fontFamily: "sans-serif",
                  border: activeSubject === sub.name ? "1px solid #8b1a2e" : isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #d0ccc4",
                  background: activeSubject === sub.name ? "#8b1a2e" : isDark ? "#0f1c2e" : "#ffffff",
                  color: activeSubject === sub.name ? "#fff" : isDark ? "#dddddd" : "#555555",
                }}
              >
                <span>{sub.icon}</span>
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TEACHERS — dynamic background
      ═══════════════════════════════════════ */}
      <section
        id="teachers"
        className="px-6 py-16 transition-colors"
        style={{ background: isDark ? "#0f1c2e" : "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <SectionLabel text="أفضل المدرسين" />
              <h2 className="text-3xl font-bold" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
                {activeSubject === "All" ? "Top-Rated Teachers" : `${activeSubject} Teachers`}
                <span className="ml-3 text-lg font-normal" style={{ color: isDark ? "#aaaaaa" : "#aaaaaa" }}>
                  ({filteredTeachers.length})
                </span>
              </h2>
            </div>
            <button
              onClick={() => navigate("/teachers")}
              className="text-sm font-medium hover:underline"
              style={{ color: "#8b1a2e", fontFamily: "sans-serif" }}
            >
              See All →
            </button>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="text-center py-20" style={{ color: isDark ? "#aaaaaa" : "#aaaaaa" }}>
              <div className="text-5xl mb-4">🔍</div>
              <p style={{ fontFamily: "sans-serif" }}>No teachers found for this subject yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="p-5 text-center transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: isDark ? "#1a2a40" : "#ffffff",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e4de",
                    borderTop: "3px solid #8b1a2e",
                    borderRadius: "2px",
                    boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="relative w-fit mx-auto mb-4">
                    <img
                      src={teacher.image}
                      alt={teacher.name}
                      className="w-24 h-24 rounded-full object-cover"
                      style={{ border: "2px solid #8b1a2e" }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500" style={{ border: "2px solid #fff" }} />
                  </div>

                  <h3 className="text-base font-bold mb-0.5" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
                    {teacher.name}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>
                    {teacher.subject}
                  </p>

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <StarRating rating={teacher.rating} onLight={!isDark} />
                    <span className="text-xs font-semibold" style={{ color: "#c9a84c" }}>
                      {teacher.rating}
                    </span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: isDark ? "#aaaaaa" : "#aaaaaa", fontFamily: "sans-serif" }}>
                    {teacher.students} students
                  </p>

                  <button
                    onClick={() => setSelectedTeacher(teacher)}
                    className="w-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
                    style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — crimson bg (fixed)
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="px-6 py-16" style={{ background: "#8b1a2e" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel text="الطريقة" onDark />
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <p className="mt-2" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", direction: "rtl" }}>
              3 خطوات بسيطة وطفلك هيلاقي مدرسه المثالي
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "اختار المادة", desc: "اختار المادة اللي محتاجها وحدد مستوى طفلك.", icon: "🎯" },
              { step: "02", title: "قارن المدرسين", desc: "اطلع على ملفات المدرسين ومراجعات الأولياء الآخرين.", icon: "👀" },
              { step: "03", title: "احجز حصة", desc: "احجز أول حصة تجريبية مجانية بضغطة واحدة.", icon: "✅" },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center text-center p-8 transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "2px",
                }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center text-3xl mb-4"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px" }}
                >
                  {item.icon}
                </div>
                <div className="text-xs font-mono tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif", direction: "rtl" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS — dynamic background
      ═══════════════════════════════════════ */}
      <section
        id="testimonials"
        className="px-6 py-16 transition-colors"
        style={{ background: isDark ? "#1a2a40" : "#f5f4f2" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel text="آراء الأهالي" />
            <h2 className="text-3xl font-bold" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>What Parents Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: isDark ? "#0f1c2e" : "#ffffff",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e4de",
                  borderLeft: "3px solid #8b1a2e",
                  borderRadius: "2px",
                  boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ border: "2px solid #8b1a2e" }}
                  />
                  <div>
                    <div className="text-sm font-bold" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#8b1a2e", fontFamily: "sans-serif" }}>{t.role}</div>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={5} onLight={!isDark} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: isDark ? "#dddddd" : "#555555", fontFamily: "sans-serif" }}>
                  "{t.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA — dark navy (fixed dark)
      ═══════════════════════════════════════ */}
      <section
        className="relative text-center px-8 py-20 overflow-hidden"
        style={{ background: "#0f1c2e" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#8b1a2e" }} />

        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "#c9a84c", fontFamily: "sans-serif" }}>
          انضم إلينا
        </p>
        <h2 className="text-4xl font-extrabold mb-4 text-white">ابدأ رحلة التعلم دلوقتي</h2>
        <p className="mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "sans-serif", direction: "rtl" }}>
          انضم لأكثر من 1,200 طالب بيتعلموا مع أفضل المدرسين على المنصة.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="px-10 py-4 font-semibold text-base transition-all duration-200 hover:opacity-90"
          style={{ background: "#8b1a2e", color: "#fff", borderRadius: "2px", fontFamily: "sans-serif", fontWeight: 600 }}
        >
          سجل مجاناً الآن
        </button>
      </section>
    </div>
  );
}