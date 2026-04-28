// Dashboard Page — light theme, split layout
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, MapPin, Send, Loader2, X,
  CheckCircle2, AlertTriangle, LayoutDashboard,
  Map as MapIcon, Home, TrendingUp,
} from "lucide-react";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

// Firebase imports
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

/* ── helpers ── */
function SeverityBadge({ severity }) {
  const map = { high: "badge-high", medium: "badge-medium", low: "badge-low" };
  const labels = { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" };
  return <span className={map[severity] || "badge-medium"}>{labels[severity] || "🟡 Medium"}</span>;
}

function CategoryBadge({ category }) {
  const icons = {
    pothole: "🕳️", garbage: "🗑️", water_leak: "💧",
    broken_streetlight: "💡", graffiti: "🎨", flooding: "🌊",
    road_damage: "🚧", illegal_dumping: "♻️", sewage: "🚽", other: "📌",
  };
  const label = category
    ? category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Other";
  return (
    <span className="badge-cat">{icons[category] || "📌"} {label}</span>
  );
}

function getCoordsForArea(areaName) {
  const map = {
    "City Centre": { lat: 26.2183, lng: 78.1828 },
    "Lashkar": { lat: 26.2038, lng: 78.1560 },
    "Morar": { lat: 26.2280, lng: 78.2230 },
    "Thatipur": { lat: 26.2200, lng: 78.2000 },
    "Gola Ka Mandir": { lat: 26.2450, lng: 78.1900 },
    "Maharajpura": { lat: 26.2650, lng: 78.2050 },
  };
  const jitter = () => (Math.random() - 0.5) * 0.02;
  return map[areaName] || { lat: 26.2183 + jitter(), lng: 78.1828 + jitter() };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [issues, setIssues] = useState([]);

  // Load reports from Firestore on mount
  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedIssues = snapshot.docs.map(doc => {
          const data = doc.data();
          const coords = getCoordsForArea(data.area);
          return {
            id: doc.id,
            ...data,
            lat: data.lat || coords.lat,
            lng: data.lng || coords.lng,
            time: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleString() : "Just now"
          };
        });
        setIssues(fetchedIssues);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    }
    fetchReports();
  }, []);

  const counts = {
    total: issues.length,
    high: issues.filter(i => i.severity === "high").length,
    medium: issues.filter(i => i.severity === "medium").length,
    low: issues.filter(i => i.severity === "low").length,
  };

  /* image */
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setFormError("Please upload a valid image."); return; }
    if (file.size > 10 * 1024 * 1024) { setFormError("Image must be under 10 MB."); return; }
    setFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* submit */
  async function handleSubmit(e) {
  e.preventDefault();
  setFormError("");

  if (!description.trim()) {
    setFormError("Description is required.");
    return;
  }

  const finalArea = area === "Others" ? customArea.trim() : area;

  setSubmitting(true);

  let imageUrl = "";

  try {
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "civiclens_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dvjq6b247/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log("Cloudinary response:", data);
      if (!data.secure_url) {
        throw new Error("Image upload failed");
      }

  const coords = getCoordsForArea(finalArea);
     if (imageFile) {
  // upload
  imageUrl = data.secure_url;
}

// ALWAYS save
await addDoc(collection(db, "reports"), {
  description: description.trim(),
  area: finalArea,
  severity: "medium",
  imageUrl: imageUrl,
  lat: coords.lat,
  lng: coords.lng,
  createdAt: serverTimestamp(),
});


}

    console.log({
      description: description.trim(),
      area: finalArea,
      imageUrl,
      createdAt: new Date(),
    });

    setIssues((prev) => [
      {
        id: Date.now().toString(),
        description: description.trim(),
        category: "other",
        severity: "medium",
        time: "Just now",
        imagePreview: imageUrl,
        area: finalArea,
      },
      ...prev,
    ]);

    setSubmitted(true);
    setDescription("");
    setArea("");
    setCustomArea("");
    removeImage();
  } catch (error) {
    console.error(error);
    setFormError("Upload failed. Try again.");
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
            id="nav-logo"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <MapPin size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              CivicLens <span className="text-blue-600">AI</span>
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: "nav-dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
              { id: "nav-heatmap", icon: MapIcon, label: "Heatmap", active: false },
              { id: "nav-analytics", icon: TrendingUp, label: "Analytics", active: false },
            ].map(({ id, icon: Icon, label, active }) => (
              <button
                key={id}
                id={id}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} id="nav-home" className="btn-ghost text-sm">
              <Home size={15} /> Home
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
          </div>
        </div>
      </header>

      {/* ── Stat bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6 text-sm overflow-x-auto">
          {[
            { label: "Total", value: counts.total, color: "text-gray-900" },
            { label: "High", value: counts.high, color: "text-red-600" },
            { label: "Medium", value: counts.medium, color: "text-amber-600" },
            { label: "Low", value: counts.low, color: "text-green-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-1.5 shrink-0">
              <span className={`font-bold text-xl ${color}`}>{value}</span>
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">

        {/* ════ LEFT: Form ════ */}
        <aside className="flex flex-col gap-5">

          {/* Form card */}
          <div className="card p-6 animate-fade-up">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send size={14} className="text-blue-600" />
              </div>
              Report an Issue
            </h2>

            {/* Success */}
            {submitted && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm mb-4 animate-fade-in">
                <CheckCircle2 size={16} /> Submitted! AI classification coming in Step 2.
              </div>
            )}

            {/* Error */}
            {formError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                <AlertTriangle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Image upload */}
              <div>
                <label className="label">Photo of Issue</label>
                {imagePreview ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      id="btn-remove-image"
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 hover:text-red-600 rounded-full flex items-center justify-center shadow transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                      {imageFile?.name}
                    </div>
                  </div>
                ) : (
                  <label
                    id="upload-zone"
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center gap-2 w-full h-36
                               border-2 border-dashed border-gray-200 hover:border-blue-400
                               rounded-xl cursor-pointer bg-gray-50 hover:bg-blue-50
                               transition-all duration-200 group"
                  >
                    <Upload size={22} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm text-gray-400 group-hover:text-blue-600">Click to upload photo</span>
                    <span className="text-xs text-gray-300">JPG, PNG, WEBP — max 10 MB</span>
                  </label>
                )}
                <input id="image-upload" ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="label">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Describe the issue — what it is, where exactly, any hazards…"
                  className="input resize-none"
                />
                <div className="text-right text-xs text-gray-300 mt-1">{description.length}/500</div>
              </div>

              {/* Location */}
              <div>
                <label className="label">Location (Area in Gwalior)</label>
                <div className="flex flex-col gap-2">
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="input py-2.5"
                  >
                    <option value="">Select Area</option>
                    <option value="City Centre">City Centre</option>
                    <option value="Lashkar">Lashkar</option>
                    <option value="Morar">Morar</option>
                    <option value="Thatipur">Thatipur</option>
                    <option value="Gola Ka Mandir">Gola Ka Mandir</option>
                    <option value="Maharajpura">Maharajpura</option>
                    <option value="Others">Others</option>
                  </select>

                  {area === "Others" && (
                    <input
                      type="text"
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      placeholder="Enter Area (if not listed)"
                      className="input py-2.5"
                    />
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                id="btn-submit-report"
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting
                  ? <><Loader2 size={17} className="animate-spin" /> Submitting…</>
                  : <><Send size={17} /> Submit Report</>}
              </button>
            </form>
          </div>

          {/* Recent reports */}
          <div className="card p-5 animate-fade-up delay-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Recent Reports</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {issues.map((issue) => (
                <div key={issue.id} id={`issue-${issue.id}`} className="card-hover p-3 cursor-pointer">
                  {(issue.imagePreview || issue.imageUrl) && (
                    <img src={issue.imagePreview || issue.imageUrl} alt="issue" className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    <CategoryBadge category={issue.category} />
                    <SeverityBadge severity={issue.severity} />
                  </div>
                  <p className="text-gray-600 text-xs line-clamp-2">{issue.description}</p>
                  <p className="text-gray-300 text-xs mt-1">{issue.time}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ════ RIGHT: Map ════ */}
        <main className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapIcon size={18} className="text-blue-600" /> Live Issue Map
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {[
                { color: "bg-red-500", label: "High" },
                { color: "bg-amber-400", label: "Medium" },
                { color: "bg-green-500", label: "Low" },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Map */}
          <div
            id="map-container"
            className="flex-1 min-h-[520px] card overflow-hidden animate-fade-up delay-200 relative"
          >
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                defaultCenter={{ lat: 26.2183, lng: 78.1828 }}
                defaultZoom={12}
                mapId="DEMO_MAP_ID"
                disableDefaultUI={true}
              >
                {issues
                  .filter(issue => typeof issue.lat === "number" && typeof issue.lng === "number")
                 .map((issue) => (
                  <AdvancedMarker
                    key={issue.id}
                    position={{ lat: issue.lat, lng: issue.lng }}
                    title={issue.description}
                  >
                    <Pin
                      background={issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#fbbf24' : '#22c55e'}
                      borderColor={issue.severity === 'high' ? '#b91c1c' : issue.severity === 'medium' ? '#b45309' : '#15803d'}
                      glyphColor={"#fff"}
                    />
                  </AdvancedMarker>
                ))}
              </GoogleMap>
            </APIProvider>

            {/* Count chips */}
            <div className="absolute bottom-4 left-4 flex gap-2 pointer-events-none">
              {[
                { count: counts.high, cls: "bg-red-50 text-red-600 ring-red-200", label: "High" },
                { count: counts.medium, cls: "bg-amber-50 text-amber-600 ring-amber-200", label: "Med" },
                { count: counts.low, cls: "bg-green-50 text-green-600 ring-green-200", label: "Low" },
              ].map(({ count, cls, label }) => (
                <div key={label} className={`px-3 py-1.5 rounded-lg ring-1 text-xs font-semibold ${cls} bg-white/90 backdrop-blur`}>
                  {count} {label}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
