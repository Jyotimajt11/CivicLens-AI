// Landing Page — clean, white, India-friendly design
import { useNavigate } from "react-router-dom";
import { MapPin, Brain, BarChart3, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: MapPin,    color: "bg-blue-100 text-blue-600",  title: "Live Map",        desc: "All reports plotted on an interactive map with real-time updates." },
  { icon: Brain,     color: "bg-purple-100 text-purple-600", title: "AI Analysis",  desc: "Gemini AI classifies every issue and assigns a severity level instantly." },
  { icon: BarChart3, color: "bg-green-100 text-green-600",  title: "City Insights", desc: "Authorities get dashboards with heatmaps, trends and priority lists." },
];

const benefits = [
  "Report any civic issue in under 30 seconds",
  "AI classifies severity automatically",
  "Authorities see prioritized issues first",
  "Real-time map updates for all citizens",
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              CivicLens <span className="text-blue-600">AI</span>
            </span>
          </div>
          <button
            id="btn-nav-login"
            onClick={() => navigate("/dashboard")}
            className="btn-primary py-2 px-5 text-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-blue-50 to-white">
        {/* pill */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6 animate-fade-up">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          AI-Powered Civic Reporting
        </span>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight animate-fade-up delay-100">
          Civic<span className="text-blue-600">Lens</span> AI
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-500 font-light mb-3 animate-fade-up delay-200">
          Report. Analyze. Improve your city.
        </p>
        <p className="text-gray-400 max-w-md mx-auto mb-10 animate-fade-up delay-300">
          Snap a photo of any civic problem — potholes, garbage, water leaks — and our AI does the rest.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-up delay-400">
          <button
            id="btn-hero-get-started"
            onClick={() => navigate("/dashboard")}
            className="btn-primary text-base px-8 py-3.5"
          >
            Get Started <ArrowRight size={18} />
          </button>
          <button
            id="btn-hero-learn"
            onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
            className="btn-secondary text-base px-8 py-3.5"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-blue-600 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10K+", label: "Issues Reported" },
            { value: "95%",  label: "AI Accuracy" },
            { value: "3×",   label: "Faster Resolution" },
            { value: "50+",  label: "Cities" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold mb-1">{value}</div>
              <div className="text-blue-200 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need</h2>
            <p className="text-gray-500 max-w-md mx-auto">From reporting to resolution — CivicLens AI powers every step.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow duration-200 group">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why CivicLens AI?</h2>
            <ul className="space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">{b}</span>
                </li>
              ))}
            </ul>
            <button
              id="btn-benefits-cta"
              onClick={() => navigate("/dashboard")}
              className="btn-primary mt-8"
            >
              Start Reporting Free <ArrowRight size={18} />
            </button>
          </div>

          {/* Visual mockup */}
          <div className="card p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">New Report</div>
                <div className="text-gray-400 text-xs">Just now</div>
              </div>
              <span className="ml-auto badge-high">High</span>
            </div>
            <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl flex items-center justify-center mb-4 border border-gray-100">
              <span className="text-4xl">🕳️</span>
            </div>
            <p className="text-gray-600 text-sm">"Large pothole on MG Road near the school gate causing accidents."</p>
            <div className="flex gap-2 mt-3">
              <span className="badge-cat">🕳️ Pothole</span>
              <span className="badge-high">High Severity</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <MapPin size={12} className="text-white" />
            </div>
            CivicLens AI © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
