import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Camera,
  ArrowRight,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Navigation,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Quick Reporting",
    desc: "Citizens can upload a photo, write a short description, and select their area in Gwalior.",
  },
  {
    icon: MapPin,
    title: "Live Issue Map",
    desc: "Reports appear visually on a city map so problem areas become easy to identify.",
  },
  {
    icon: BarChart3,
    title: "Smarter Priorities",
    desc: "Issues can be sorted by severity, location, and frequency to help faster action.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-green-500 rounded-xl flex items-center justify-center shadow-md">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-xl">
              Civic<span className="text-blue-600">Lens</span>{" "}
              <span className="text-green-600">AI</span>
            </span>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:scale-105 transition-all shadow-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Background blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30 animate-pulse" />

        <div className="relative max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-full shadow-sm text-blue-700 font-medium text-sm mb-6">
              <Sparkles size={16} />
              Built for smarter civic reporting
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
              Report issues.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Improve your city.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              CivicLens AI helps citizens report local problems like potholes,
              garbage, water leakage, and broken streetlights through a simple
              map-based platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 hover:scale-105 transition-all shadow-lg"
              >
                Report an Issue <ArrowRight size={20} />
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 rounded-full bg-white text-gray-700 font-bold border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:scale-105 transition-all shadow-sm"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative">
            <div className="relative bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-5 hover:scale-[1.02] transition-transform duration-500">
              <div className="h-72 rounded-[1.5rem] bg-gradient-to-br from-blue-100 to-green-100 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_1px_1px,#2563eb_1px,transparent_0)] [background-size:24px_24px]" />

                <div className="absolute top-8 left-8 bg-white rounded-2xl shadow-lg p-4 w-52">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      🚧
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Road Damage
                      </p>
                      <p className="text-xs text-gray-400">Lashkar</p>
                    </div>
                  </div>
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-semibold">
                    High Priority
                  </span>
                </div>

                <div className="absolute bottom-8 right-8 bg-white rounded-2xl shadow-lg p-4 w-52">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      🗺️
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Live Map
                      </p>
                      <p className="text-xs text-gray-400">Gwalior reports</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <Navigation size={34} className="text-white" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden md:block">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-green-600" />
                <span className="font-bold text-gray-800 text-sm">
                  Verified city reports
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-bold mb-2">HOW IT WORKS</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              From complaint to city insight
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              CivicLens AI converts scattered public complaints into structured,
              visible, and useful civic data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {features.map(({ icon: Icon, title, desc }, index) => (
              <div
                key={title}
                className="group bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Icon size={26} className="text-blue-600" />
                </div>
                <p className="text-sm font-bold text-green-600 mb-2">
                  Step {index + 1}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-green-600 font-bold mb-2">REAL WORLD IMPACT</p>
            <h2 className="text-4xl font-black text-gray-900 mb-6">
              Why CivicLens AI matters
            </h2>

            <div className="space-y-5">
              {[
                "Citizens get a simple way to raise local problems.",
                "Repeated complaints become visible as location-based patterns.",
                "Authorities can identify neglected areas faster.",
                "The map creates transparency and accountability.",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle className="text-green-600 shrink-0 mt-1" />
                  <p className="text-gray-600 font-medium">{item}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-8 px-8 py-4 rounded-full bg-green-600 text-white font-bold flex items-center gap-2 hover:bg-green-700 hover:scale-105 transition-all shadow-lg"
            >
              Try Dashboard <ArrowRight size={20} />
            </button>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100">
            <div className="rounded-3xl bg-gray-50 p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Sample Report</h3>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                  High
                </span>
              </div>

              <div className="h-40 rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-6xl mb-5">
                🕳️
              </div>

              <p className="text-gray-600 mb-4">
                “Large pothole near school road causing traffic risk.”
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                  Lashkar
                </span>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                  Map Visible
                </span>
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                  Priority Issue
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-4xl font-black mb-4">
            Ready to report your first issue?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Help make civic problems visible, trackable, and easier to act on.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-9 py-4 rounded-full bg-white text-blue-600 font-bold hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2"
          >
            Open Dashboard <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3 text-gray-500 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            CivicLens AI © {new Date().getFullYear()}
          </div>
          <p>Built for civic awareness and smarter cities.</p>
        </div>
      </footer>
    </div>
  );
}