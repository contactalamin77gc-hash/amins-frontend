"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Loading from "@/components/ui/loading";
import { Save, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { clearContentCache } from "@/lib/content";

interface ContentItem {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string;
  group: string;
}

const GROUPS = [
  { key: "hero", label: "Hero Section" },
  { key: "services", label: "Services" },
  { key: "testimonials", label: "Testimonials" },
  { key: "cta", label: "Call to Action" },
  { key: "about", label: "About Page" },
  { key: "contact", label: "Contact Info" },
  { key: "concern", label: "Our Concern" },
  { key: "footer", label: "Footer" },
];

export default function SettingsPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState("hero");
  const [saved, setSaved] = useState(false);

  // Parsed JSON states for visual editing
  const [services, setServices] = useState<any[]>([]);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [concerns, setConcerns] = useState<any[]>([]);

  useEffect(() => {
    api.get("/site-content/admin").then((res) => {
      setItems(res.data);
      // Parse JSON fields
      const svcItem = res.data.find((i: ContentItem) => i.key === "services");
      if (svcItem) try { setServices(JSON.parse(svcItem.value)); } catch { setServices([]); }
      const procItem = res.data.find((i: ContentItem) => i.key === "process_steps");
      if (procItem) try { setProcessSteps(JSON.parse(procItem.value)); } catch { setProcessSteps([]); }
      const testItem = res.data.find((i: ContentItem) => i.key === "testimonials");
      if (testItem) try { setTestimonials(JSON.parse(testItem.value)); } catch { setTestimonials([]); }
      setLoading(false);

      const concernItem = res.data.find((i: ContentItem) => i.key === "concerns");
      if (concernItem) try { setConcerns(JSON.parse(concernItem.value)); } catch { setConcerns([]); }
    });
  }, []);

  const getVal = (key: string) => items.find((i) => i.key === key)?.value || "";

  const updateItem = (key: string, value: string) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, value } : i)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sync JSON fields back to items before saving
      updateItem("services", JSON.stringify(services));
      updateItem("process_steps", JSON.stringify(processSteps));

      const allItems = items.map((i) => {
        if (i.key === "services") return { ...i, value: JSON.stringify(services) };
        if (i.key === "process_steps") return { ...i, value: JSON.stringify(processSteps) };
        if (i.key === "testimonials") return { ...i, value: JSON.stringify(testimonials) };
        if (i.key === "concerns") return { ...i, value: JSON.stringify(concerns) };
        return i;
      });

      const toSave = allItems.filter((i) => i.group === activeGroup).map((i) => ({
        key: i.key, value: i.value, type: i.type, label: i.label, group: i.group,
      }));
      await api.post("/site-content/bulk", toSave);
      clearContentCache();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (key: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateItem(key, res.data.url);
    } catch {
      alert("Failed to upload image");
    }
  };

  // ═══ SERVICE HELPERS ═══
  const addService = () => setServices([...services, { icon: "Package", title: "", desc: "" }]);
  const removeService = (i: number) => setServices(services.filter((_, idx) => idx !== i));
  const updateService = (i: number, field: string, value: string) => {
    const updated = [...services];
    updated[i] = { ...updated[i], [field]: value };
    setServices(updated);
  };

  // ═══ PROCESS STEP HELPERS ═══
  const addStep = () => setProcessSteps([...processSteps, { n: String(processSteps.length + 1), title: "", desc: "" }]);
  const removeStep = (i: number) => {
    const updated = processSteps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, n: String(idx + 1) }));
    setProcessSteps(updated);
  };
  const updateStep = (i: number, field: string, value: string) => {
    const updated = [...processSteps];
    updated[i] = { ...updated[i], [field]: value };
    setProcessSteps(updated);
  };

  if (loading) return <Loading />;

  const ICON_OPTIONS = ["Plane", "Ship", "Warehouse", "ClipboardList", "Package", "Truck", "Globe", "Shield", "Clock", "MapPin"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-[26px] font-display text-brand-ink">Site Content Manager</h1>
          <p className="text-[13px] text-gray-label">Edit public website content. Save and refresh the public site to see changes.</p>
        </div>
        <button className="btn-blue" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {GROUPS.map((g) => (
          <button key={g.key} onClick={() => setActiveGroup(g.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors cursor-pointer ${activeGroup === g.key ? "bg-brand border-brand text-white" : "bg-white border-gray-line text-gray-label hover:border-brand hover:text-brand"}`}>
            {g.label}
          </button>
        ))}
      </div>

      {/* ═══ HERO SECTION ═══ */}
      {activeGroup === "hero" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Hero Section</h2>

          <div>
            <label className="field-label">Background Image</label>
            <div className="flex gap-3 items-start">
              <input className="field-input flex-1" placeholder="Image URL" value={getVal("hero_image")} onChange={(e) => updateItem("hero_image", e.target.value)} />
              <label className="btn-blue cursor-pointer shrink-0">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload("hero_image", e.target.files[0]); }} />
                Upload
              </label>
            </div>
            {getVal("hero_image") && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-line relative group">
                <img src={getVal("hero_image")} alt="Hero preview" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => updateItem("hero_image", "")} className="bg-white text-danger px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Remove</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Kicker Text (small text above title)</label>
            <input className="field-input" value={getVal("hero_kicker")} onChange={(e) => updateItem("hero_kicker", e.target.value)} />
          </div>

          <div>
            <label className="field-label">Main Title</label>
            <textarea className="field-input min-h-[100px] text-lg font-bold" value={getVal("hero_title")} onChange={(e) => updateItem("hero_title", e.target.value)} />
            <p className="text-[11px] text-gray-label mt-1">Use line breaks to control where text wraps.</p>
          </div>

          <div>
            <label className="field-label">Subtitle / Description</label>
            <textarea className="field-input min-h-[80px]" value={getVal("hero_subtitle")} onChange={(e) => updateItem("hero_subtitle", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Button 1 Text</label>
              <input className="field-input" value={getVal("hero_btn1_text")} onChange={(e) => updateItem("hero_btn1_text", e.target.value)} />
            </div>
            <div>
              <label className="field-label">Button 2 Text</label>
              <input className="field-input" value={getVal("hero_btn2_text")} onChange={(e) => updateItem("hero_btn2_text", e.target.value)} />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <label className="field-label">Preview</label>
            <div className="rounded-xl overflow-hidden text-white p-8" style={{
              background: getVal("hero_image")
                ? `linear-gradient(rgba(0,86,247,0.85), rgba(0,56,168,0.9)), url(${getVal("hero_image")}) center/cover`
                : "linear-gradient(135deg, #0056F7, #0038A8)",
            }}>
              <div className="text-[10px] uppercase tracking-[.2em] opacity-80 mb-2">{getVal("hero_kicker")}</div>
              <div className="text-2xl font-bold uppercase leading-tight mb-3" style={{ whiteSpace: "pre-line" }}>{getVal("hero_title")}</div>
              <div className="text-sm opacity-90 mb-4 max-w-[40ch]">{getVal("hero_subtitle")}</div>
              <div className="flex gap-2">
                <span className="bg-white text-brand px-4 py-1.5 rounded-lg text-xs font-bold">{getVal("hero_btn1_text")}</span>
                <span className="border border-white/50 px-4 py-1.5 rounded-lg text-xs font-bold">{getVal("hero_btn2_text")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeGroup === "services" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Services Section</h2>

          <div>
            <label className="field-label">Section Title</label>
            <input className="field-input" value={getVal("services_title")} onChange={(e) => updateItem("services_title", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Section Subtitle</label>
            <textarea className="field-input min-h-[80px]" value={getVal("services_subtitle")} onChange={(e) => updateItem("services_subtitle", e.target.value)} />
          </div>

          <div>
            <label className="field-label">Background Image</label>
            <div className="flex gap-3 items-start">
              <input className="field-input flex-1" placeholder="Image URL" value={getVal("services_image")} onChange={(e) => updateItem("services_image", e.target.value)} />
              <label className="btn-blue cursor-pointer shrink-0">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload("services_image", e.target.files[0]); }} />
                Upload
              </label>
            </div>
            {getVal("services_image") && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-line relative group">
                <img src={getVal("services_image")} alt="Services bg" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => updateItem("services_image", "")} className="bg-white text-danger px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">Remove</button>
                </div>
              </div>
            )}
            <p className="text-[11px] text-gray-label mt-1">Recommended: 1920x600px. Cargo/shipping themed image works best.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="field-label mb-0">Service Cards (shown on the image)</label>
              <button onClick={addService} className="btn-ghost py-1.5 px-3 text-[12px]"><Plus size={14} /> Add Service</button>
            </div>

            <div className="space-y-3">
              {services.map((svc, i) => (
                <div key={i} className="border border-gray-line rounded-xl p-4 bg-brand-mist">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-brand-ink">Service {i + 1}</span>
                    <button onClick={() => removeService(i)} className="text-danger hover:text-danger/70 cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Icon</label>
                      <select className="field-input text-[13px]" value={svc.icon} onChange={(e) => updateService(i, "icon", e.target.value)}>
                        {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Title</label>
                      <input className="field-input text-[13px]" placeholder="e.g. Air Freight" value={svc.title} onChange={(e) => updateService(i, "title", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="field-label">Preview</label>
            <div className="rounded-xl overflow-hidden relative min-h-[200px]" style={{
              background: getVal("services_image")
                ? `url(${getVal("services_image")}) center/cover`
                : "#1a2332",
            }}>
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10 grid grid-cols-4 gap-0 min-h-[200px]">
                {services.map((svc, i) => (
                  <div key={i} className={`flex flex-col items-center justify-center p-4 text-white text-center ${i < services.length - 1 ? "border-r border-white/15" : ""}`}>
                    <div className="w-10 h-10 rounded-full border-2 border-white/40 grid place-items-center mb-3 text-sm font-bold">{svc.icon?.charAt(0)}</div>
                    <div className="text-xs font-bold">{svc.title || "Untitled"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PROCESS SECTION ═══ */}
      {activeGroup === "process" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Import Process Section</h2>

          <div>
            <label className="field-label">Section Title</label>
            <input className="field-input" value={getVal("process_title")} onChange={(e) => updateItem("process_title", e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="field-label mb-0">Process Steps</label>
              <button onClick={addStep} className="btn-ghost py-1.5 px-3 text-[12px]"><Plus size={14} /> Add Step</button>
            </div>

            <div className="space-y-3">
              {processSteps.map((step, i) => (
                <div key={i} className="border border-gray-line rounded-xl p-4 bg-brand-mist">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center font-bold text-sm">{step.n}</div>
                      <span className="text-sm font-semibold text-brand-ink">Step {step.n}</span>
                    </div>
                    <button onClick={() => removeStep(i)} className="text-danger hover:text-danger/70 cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Title</label>
                      <input className="field-input text-[13px]" placeholder="e.g. Place order" value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Description</label>
                      <input className="field-input text-[13px]" placeholder="Step description" value={step.desc} onChange={(e) => updateStep(i, "desc", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="field-label">Preview</label>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {processSteps.map((step, i) => (
                <div key={i} className="text-center shrink-0 w-32">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-brand text-white grid place-items-center font-bold text-sm">{step.n}</div>
                  <div className="text-xs font-bold text-brand-ink uppercase">{step.title || "Untitled"}</div>
                  <div className="text-[10px] text-gray-label mt-1">{step.desc || "No description"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ OUR CONCERN SECTION ═══ */}
      {activeGroup === "concern" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Our Concern</h2>

          <div>
            <label className="field-label">Section Title</label>
            <input className="field-input" value={getVal("concern_title")} onChange={(e) => updateItem("concern_title", e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="field-label mb-0">Concern Companies</label>
              <button
                onClick={() => setConcerns([...concerns, { name: "", description: "", logo: "", link: "" }])}
                className="btn-ghost py-1.5 px-3 text-[12px]"
              >
                <Plus size={14} /> Add Concern
              </button>
            </div>

            <div className="space-y-3">
              {concerns.map((c, i) => (
                <div key={i} className="border border-gray-line rounded-xl p-4 bg-brand-mist">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-brand-ink">Concern {i + 1}</span>
                    <button onClick={() => setConcerns(concerns.filter((_, idx) => idx !== i))} className="text-danger hover:text-danger/70 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Company Name *</label>
                      <input className="field-input text-[13px]" placeholder="e.g. Amin's Trading" value={c.name}
                        onChange={(e) => { const u = [...concerns]; u[i] = { ...u[i], name: e.target.value }; setConcerns(u); }} />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Website Link</label>
                      <input className="field-input text-[13px]" placeholder="https://example.com" value={c.link}
                        onChange={(e) => { const u = [...concerns]; u[i] = { ...u[i], link: e.target.value }; setConcerns(u); }} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-[11px] text-gray-label font-semibold mb-1 block">Description</label>
                    <textarea className="field-input text-[13px] min-h-[60px]" placeholder="What does this company do?" value={c.description}
                      onChange={(e) => { const u = [...concerns]; u[i] = { ...u[i], description: e.target.value }; setConcerns(u); }} />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-label font-semibold mb-1 block">Logo URL</label>
                    <div className="flex gap-2 items-start">
                      <input className="field-input text-[13px] flex-1" placeholder="Paste logo URL or upload" value={c.logo}
                        onChange={(e) => { const u = [...concerns]; u[i] = { ...u[i], logo: e.target.value }; setConcerns(u); }} />
                      <label className="btn-blue cursor-pointer shrink-0 py-1.5 px-3 text-[12px]">
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          if (!e.target.files?.[0]) return;
                          const formData = new FormData();
                          formData.append("file", e.target.files[0]);
                          try {
                            const res = await api.post("/upload/image", formData, { headers: { "Content-Type": "multipart/form-data" } });
                            const u = [...concerns]; u[i] = { ...u[i], logo: res.data.url }; setConcerns(u);
                          } catch { alert("Upload failed"); }
                        }} />
                        Upload
                      </label>
                    </div>
                    {c.logo && (
                      <div className="mt-2 w-20 h-20 rounded-lg border border-gray-line overflow-hidden bg-white p-2">
                        <img src={c.logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="field-label">Preview</label>
            <div className="bg-brand-ink rounded-xl p-6">
              <div className="text-center text-white font-bold text-lg mb-4">{getVal("concern_title") || "Our Concern"}</div>
              <div className="grid grid-cols-3 gap-4">
                {concerns.map((c, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-4 text-center">
                    {c.logo ? (
                      <img src={c.logo} alt={c.name} className="w-14 h-14 object-contain mx-auto mb-2 rounded-lg bg-white p-1" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-brand mx-auto mb-2 grid place-items-center text-white font-bold text-xl">
                        {c.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="text-white text-sm font-semibold">{c.name || "Company"}</div>
                    <div className="text-white/60 text-[11px] mt-1">{c.description || "Description"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CTA SECTION ═══ */}
      {activeGroup === "cta" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Call to Action Section</h2>
          <div>
            <label className="field-label">Title</label>
            <input className="field-input" value={getVal("cta_title")} onChange={(e) => updateItem("cta_title", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Subtitle</label>
            <textarea className="field-input min-h-[80px]" value={getVal("cta_subtitle")} onChange={(e) => updateItem("cta_subtitle", e.target.value)} />
          </div>
          {/* Preview */}
          <div>
            <label className="field-label">Preview</label>
            <div className="bg-brand-mist rounded-xl p-8 text-center">
              <div className="text-xl font-bold text-brand-ink mb-2">{getVal("cta_title")}</div>
              <div className="text-sm text-gray-label max-w-[40ch] mx-auto">{getVal("cta_subtitle")}</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ABOUT SECTION ═══ */}
      {activeGroup === "about" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">About Page</h2>
          <div>
            <label className="field-label">Page Title</label>
            <input className="field-input" value={getVal("about_title")} onChange={(e) => updateItem("about_title", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Content</label>
            <textarea className="field-input min-h-[150px]" value={getVal("about_content")} onChange={(e) => updateItem("about_content", e.target.value)} />
          </div>
        </div>
      )}

      {/* ═══ CONTACT SECTION ═══ */}
      {activeGroup === "contact" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Contact Information</h2>
          <div>
            <label className="field-label">Phone Number</label>
            <input className="field-input" value={getVal("contact_phone")} onChange={(e) => updateItem("contact_phone", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Email Address</label>
            <input className="field-input" value={getVal("contact_email")} onChange={(e) => updateItem("contact_email", e.target.value)} />
          </div>
          <div>
            <label className="field-label">Office Address</label>
            <input className="field-input" value={getVal("contact_address")} onChange={(e) => updateItem("contact_address", e.target.value)} />
          </div>
          {/* Preview */}
          <div>
            <label className="field-label">Preview</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-gray-line rounded-xl p-4 bg-white"><div className="text-sm font-bold text-brand-ink mb-1">Phone</div><div className="text-[12px] text-gray-label">{getVal("contact_phone")}</div></div>
              <div className="border border-gray-line rounded-xl p-4 bg-white"><div className="text-sm font-bold text-brand-ink mb-1">Email</div><div className="text-[12px] text-gray-label">{getVal("contact_email")}</div></div>
              <div className="border border-gray-line rounded-xl p-4 bg-white"><div className="text-sm font-bold text-brand-ink mb-1">Address</div><div className="text-[12px] text-gray-label">{getVal("contact_address")}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TESTIMONIALS SECTION ═══ */}
      {activeGroup === "testimonials" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Client Testimonials</h2>

          <div>
            <label className="field-label">Section Title</label>
            <input className="field-input" value={getVal("testimonials_title")} onChange={(e) => updateItem("testimonials_title", e.target.value)} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="field-label mb-0">Testimonials</label>
              <button
                onClick={() => setTestimonials([...testimonials, { name: "", company: "", text: "", rating: 5 }])}
                className="btn-ghost py-1.5 px-3 text-[12px]"
              >
                <Plus size={14} /> Add Testimonial
              </button>
            </div>

            <div className="space-y-3">
              {testimonials.map((t, i) => (
                <div key={i} className="border border-gray-line rounded-xl p-4 bg-brand-mist">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-brand-ink">Testimonial {i + 1}</span>
                    <button onClick={() => setTestimonials(testimonials.filter((_, idx) => idx !== i))} className="text-danger hover:text-danger/70 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Client Name *</label>
                      <input className="field-input text-[13px]" placeholder="e.g. Rahim Khan" value={t.name}
                        onChange={(e) => { const u = [...testimonials]; u[i] = { ...u[i], name: e.target.value }; setTestimonials(u); }} />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-label font-semibold mb-1 block">Company / Role</label>
                      <input className="field-input text-[13px]" placeholder="e.g. Rahim Traders" value={t.company}
                        onChange={(e) => { const u = [...testimonials]; u[i] = { ...u[i], company: e.target.value }; setTestimonials(u); }} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-[11px] text-gray-label font-semibold mb-1 block">Testimonial Text *</label>
                    <textarea className="field-input text-[13px] min-h-[80px]" placeholder="What did the client say about your service?" value={t.text}
                      onChange={(e) => { const u = [...testimonials]; u[i] = { ...u[i], text: e.target.value }; setTestimonials(u); }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[11px] text-gray-label font-semibold">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button"
                          onClick={() => { const u = [...testimonials]; u[i] = { ...u[i], rating: star }; setTestimonials(u); }}
                          className={`text-lg cursor-pointer ${star <= (t.rating || 5) ? "text-yellow-400" : "text-gray-300"}`}>
                          {"★"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="field-label">Preview</label>
            <div className="grid grid-cols-3 gap-3">
              {testimonials.map((t, i) => (
                <div key={i} className="border border-gray-line rounded-xl p-4 bg-white">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= (t.rating || 5) ? "text-yellow-400" : "text-gray-300"}`}>{"★"}</span>
                    ))}
                  </div>
                  <div className="text-[12px] text-gray-label italic mb-3 line-clamp-3">{`"${t.text || 'No text'}"`}</div>
                  <div className="text-sm font-semibold text-brand-ink">{t.name || "Name"}</div>
                  <div className="text-[11px] text-gray-label">{t.company || "Company"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ FOOTER SECTION ═══ */}
      {activeGroup === "footer" && (
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-display text-brand-ink">Footer</h2>
          <div>
            <label className="field-label">Footer Description</label>
            <textarea className="field-input min-h-[80px]" value={getVal("footer_description")} onChange={(e) => updateItem("footer_description", e.target.value)} />
          </div>
        </div>
      )}

      {/* ═══ STATS (hidden but kept for data) ═══ */}
      {activeGroup === "stats" && (
        <div className="card p-6">
          <h2 className="text-lg font-display text-brand-ink mb-4">Stats Section</h2>
          <p className="text-gray-label text-sm">Stats section has been removed from the public site. This data is kept for reference only.</p>
        </div>
      )}

    </div>
  );
}
