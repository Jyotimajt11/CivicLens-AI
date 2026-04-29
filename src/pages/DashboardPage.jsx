// Dashboard Page — light theme, split layout
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload, MapPin, Send, Loader2, X,
  CheckCircle2, AlertTriangle, LayoutDashboard,
  Map as MapIcon, Home, TrendingUp,
} from "lucide-react";
import { APIProvider, Map as GoogleMap, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";

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

function formatLabel(value) {
  return value
    ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Other";
}

function getMarkerIcon(severity) {
  if (severity === "high") return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  if (severity === "low") return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
}

function getMostFrequent(items, key) {
  const counts = items.reduce((acc, item) => {
    const value = item[key];
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return topEntry ? topEntry[0] : "";
}

function classifyIssueByKeywords(description) {
  const text = description.toLowerCase();
  const hasAny = (terms) => terms.some((term) => text.includes(term));

  if (hasAny(["dangerous", "accident", "blocked road", "sewage overflow", "fire", "major", "urgent", "broken electric wire"])) {
    return { category: "other", severity: "high" };
  }

  if (hasAny(["minor", "small", "cleaning", "request", "suggestion"])) {
    return { category: "other", severity: "low" };
  }

  if (hasAny(["garbage pile", "garbage", "trash", "waste"])) {
    return { category: "garbage", severity: "medium" };
  }

  if (hasAny(["pothole", "hole"])) {
    return { category: "pothole", severity: "medium" };
  }

  if (hasAny(["water leakage", "water leak", "water", "leak"])) {
    return { category: "water_leak", severity: "medium" };
  }

  if (hasAny(["streetlight issue", "streetlight", "light"])) {
    return { category: "broken_streetlight", severity: "medium" };
  }

  if (hasAny(["sewage", "drain"])) {
    return { category: "sewage", severity: "high" };
  }

  return { category: "other", severity: "medium" };
}

async function classifyIssueWithAI(description) {
  try {
    const prompt = `
Classify this civic complaint.

Complaint: "${description}"

Return ONLY JSON:
{"category":"pothole","severity":"high"}

Allowed categories: pothole, garbage, water_leak, broken_streetlight, flooding, sewage, road_damage, illegal_dumping, graffiti, other
Allowed severity: low, medium, high

Severity rules:
- high: dangerous, accident, blocked road, sewage overflow, fire, major, urgent, broken electric wire
- medium: garbage pile, pothole, water leakage, streetlight issue
- low: minor, small, cleaning, request, suggestion
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini API failed: ${res.status}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text.trim()) {
      throw new Error("Gemini returned empty response");
    }

    const cleanText = text.replace(/```json|```/g, "").trim();
    const jsonText = cleanText.match(/\{[\s\S]*\}/)?.[0] || cleanText;
    const parsed = JSON.parse(jsonText);
    const fallback = classifyIssueByKeywords(description);
    const severity = String(parsed.severity || "").toLowerCase();

    return {
      category: parsed.category || fallback.category,
      severity: ["high", "medium", "low"].includes(severity) ? severity : fallback.severity,
    };
  } catch (error) {
    console.error("AI classification failed:", error);
    return classifyIssueByKeywords(description);
  }
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

async function getCoordsForLocation(exactLocation, areaName) {
  if (!exactLocation.trim()) {
    return getCoordsForArea(areaName);
  }

  try {
    const searchString = `${exactLocation.trim()}, ${areaName}, Gwalior, Madhya Pradesh, India`;
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchString)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    const location = data?.results?.[0]?.geometry?.location;

    if (typeof location?.lat === "number" && typeof location?.lng === "number") {
      return { lat: location.lat, lng: location.lng };
    }
  } catch (error) {
    console.warn("Location geocoding failed, using area coordinates:", error);
  }

  return getCoordsForArea(areaName);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [customArea, setCustomArea] = useState("");
  const [exactLocation, setExactLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);

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

  const filteredIssues = filter === "all"
    ? issues
    : issues.filter((issue) => issue.severity === filter);

  const analytics = {
    totalReports: issues.length,
    highPriorityCount: issues.filter((issue) => issue.severity === "high").length,
    mostCommonCategory: getMostFrequent(issues, "category"),
    mostAffectedArea: getMostFrequent(issues, "area"),
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
  const aiResult = await classifyIssueWithAI(description);
  
  if (!finalArea) {
    setFormError("Please select or enter an area.");
    return;
  }

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

      if (!data.secure_url) {
        throw new Error("Image upload failed");
      }

      imageUrl = data.secure_url;
    }

    const finalLocation = exactLocation.trim();
    const coords = await getCoordsForLocation(finalLocation, finalArea);
    

    await addDoc(collection(db, "reports"), {
      description: description.trim(),
      area: finalArea,
      location: finalLocation,
      severity: aiResult.severity,
      category: aiResult.category,
      imageUrl,
      lat: coords.lat,
      lng: coords.lng,
      createdAt: serverTimestamp(),
    });

    setIssues((prev) => [
      {
        id: Date.now().toString(),
        description: description.trim(),
        category: aiResult.category,
        severity: aiResult.severity,
        time: "Just now",
        imageUrl,
        area: finalArea,
        location: finalLocation,
        lat: coords.lat,
        lng: coords.lng,
      },
      ...prev,
    ]);

    setSubmitted(true);
    setDescription("");
    setArea("");
    setCustomArea("");
    setExactLocation("");
    removeImage();
  } catch (error) {
    console.error("Submit failed:", error);
    setFormError("Submit failed. Check console for details.");
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

                  <input
                    type="text"
                    value={exactLocation}
                    onChange={(e) => setExactLocation(e.target.value)}
                    placeholder="Exact location, landmark, road, ward..."
                    className="input py-2.5"
                  />
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

          {/* Analytics */}
          <div className="card p-5 animate-fade-up delay-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Analytics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Reports", value: analytics.totalReports },
                { label: "High Priority Reports", value: analytics.highPriorityCount },
                { label: "Most Common Issue Category", value: analytics.mostCommonCategory ? formatLabel(analytics.mostCommonCategory) : "No data yet" },
                { label: "Most Affected Area", value: analytics.mostAffectedArea || "No data yet" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent reports */}
          <div className="card p-5 animate-fade-up delay-100">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Reports</h3>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg p-1">
                {["all", "high", "medium", "low"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors capitalize
                      ${filter === value ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {filteredIssues.map((issue) => (
                <div key={issue.id} id={`issue-${issue.id}`} className="card-hover p-3 cursor-pointer">
                  {(issue.imagePreview || issue.imageUrl) && (
                    <img src={issue.imagePreview || issue.imageUrl} alt="issue" className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  <CategoryBadge category={issue.category} />
                  <SeverityBadge severity={issue.severity} />
               </div>

               <p className="text-xs text-blue-600 font-semibold mb-1">
                 📍 Area: {issue.area || "Location not provided"}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Exact Location: {issue.location || "No exact location added"}
              </p>
              {typeof issue.lat === "number" && typeof issue.lng === "number" && (
                <p className="text-xs text-gray-400 mb-1">
                  Lat: {issue.lat.toFixed(4)}, Lng: {issue.lng.toFixed(4)}
                </p>
              )}

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
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <img
                      src={getMarkerIcon(issue.severity)}
                      alt={`${issue.severity || "medium"} severity marker`}
                      className="w-8 h-8"
                    />
                  </AdvancedMarker>
                ))}

                {selectedIssue && (
                  <InfoWindow
                    position={{ lat: selectedIssue.lat, lng: selectedIssue.lng }}
                    onCloseClick={() => setSelectedIssue(null)}
                  >
                    <div className="min-w-48 max-w-64 text-sm text-gray-700">
                      <p className="font-bold text-gray-900 mb-2">{formatLabel(selectedIssue.category)}</p>
                      <p className="mb-2">{selectedIssue.description}</p>
                      <div className="space-y-1 text-xs">
                        <p><span className="font-semibold text-gray-500">Severity:</span> {formatLabel(selectedIssue.severity)}</p>
                        <p><span className="font-semibold text-gray-500">Area:</span> {selectedIssue.area || "Location not provided"}</p>
                        <p><span className="font-semibold text-gray-500">Location:</span> {selectedIssue.location || "No exact location added"}</p>
                      </div>
                    </div>
                  </InfoWindow>
                )}
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
