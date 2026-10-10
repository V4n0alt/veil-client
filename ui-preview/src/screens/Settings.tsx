import { useState } from "react";
import {
  Settings2,
  Monitor,
  Zap,
  PanelBottom,
  Accessibility,
  Keyboard,
  ShieldCheck,
  Info,
  RotateCcw,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";
import { useVeil } from "../state";
import {
  SearchInput,
  SettingRow,
  Toggle,
  Slider,
  Badge,
  Button,
  EmptyState,
} from "../components/ui";
const sections = [
  ["General", Settings2],
  ["Graphics", Monitor],
  ["Performance", Zap],
  ["HUD", PanelBottom],
  ["Accessibility", Accessibility],
  ["Controls", Keyboard],
  ["Privacy", ShieldCheck],
  ["About", Info],
] as const;
type Entry = {
  key: string;
  title: string;
  description: string;
  section: string;
  type: "toggle" | "slider" | "select";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};
const entries: Entry[] = [
  {
    key: "language",
    title: "Language",
    description: "A familiar voice for your interface.",
    section: "General",
    type: "select",
    options: ["English", "Dansk", "Deutsch"],
  },
  {
    key: "uiScale",
    title: "Interface scale",
    description: "Adjust the preview’s text and controls.",
    section: "General",
    type: "slider",
    min: 85,
    max: 115,
    step: 5,
    unit: "%",
  },
  {
    key: "showTooltips",
    title: "Helpful tooltips",
    description: "Show labels on compact interface controls.",
    section: "General",
    type: "toggle",
  },
  {
    key: "graphics",
    title: "Visual preset",
    description: "A starting point for graphics preferences.",
    section: "Graphics",
    type: "select",
    options: ["Low", "Medium", "High", "Ultra"],
  },
  {
    key: "renderDistance",
    title: "Render distance",
    description: "How far your next horizon reaches. Preview only.",
    section: "Graphics",
    type: "slider",
    min: 2,
    max: 32,
    unit: " chunks",
  },
  {
    key: "particles",
    title: "Particle density",
    description: "Keep the atmosphere. Choose the detail.",
    section: "Graphics",
    type: "slider",
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
  },
  {
    key: "reducedBlur",
    title: "Reduced blur",
    description: "Use more opaque surfaces with less backdrop blur.",
    section: "Graphics",
    type: "toggle",
  },
  {
    key: "fpsLimit",
    title: "Frame limit",
    description: "Requested setting, not a measured frame rate.",
    section: "Performance",
    type: "slider",
    min: 30,
    max: 240,
    step: 6,
    unit: " FPS",
  },
  {
    key: "smartAnimation",
    title: "Smart animation",
    description: "Preview preference for pausing background motion.",
    section: "Performance",
    type: "toggle",
  },
  {
    key: "coordinates",
    title: "Coordinates",
    description: "Your place in the world, at a glance.",
    section: "HUD",
    type: "toggle",
  },
  {
    key: "keybinds",
    title: "Keybinds widget",
    description: "Keep frequently used controls close.",
    section: "HUD",
    type: "toggle",
  },
  {
    key: "armor",
    title: "Armor durability",
    description: "Know when your gear needs a little care.",
    section: "HUD",
    type: "toggle",
  },
  {
    key: "effects",
    title: "Potion effects",
    description: "A compact list of active effect samples.",
    section: "HUD",
    type: "toggle",
  },
  {
    key: "crosshair",
    title: "Crosshair style",
    description: "A precise center point for your view.",
    section: "HUD",
    type: "select",
    options: ["Cross", "Dot", "Circle"],
  },
  {
    key: "reducedMotion",
    title: "Reduced motion",
    description: "Turn off transitions and entrance animations.",
    section: "Accessibility",
    type: "toggle",
  },
  {
    key: "highContrast",
    title: "Higher contrast",
    description: "Strengthen surfaces and secondary text.",
    section: "Accessibility",
    type: "toggle",
  },
  {
    key: "subtitles",
    title: "Sound captions",
    description: "Preview a preference for visual sound cues.",
    section: "Accessibility",
    type: "toggle",
  },
  {
    key: "masterVolume",
    title: "Master volume",
    description: "Sample volume control; this preview plays no audio.",
    section: "Controls",
    type: "slider",
    min: 0,
    max: 100,
    unit: "%",
  },
  {
    key: "telemetry",
    title: "Telemetry",
    description: "Off by default. No collection is implemented.",
    section: "Privacy",
    type: "toggle",
  },
  {
    key: "analytics",
    title: "Analytics",
    description: "Off by default. This preview has no analytics service.",
    section: "Privacy",
    type: "toggle",
  },
  {
    key: "crashUploads",
    title: "Crash uploads",
    description: "No logs or crash reports leave this preview.",
    section: "Privacy",
    type: "toggle",
  },
  {
    key: "presence",
    title: "Activity presence",
    description: "Your activity is private by default.",
    section: "Privacy",
    type: "toggle",
  },
];
export function Settings() {
  const { settings, setSetting, resetSettings, navigate, notify } = useVeil();
  const [section, setSection] = useState("Graphics");
  const [search, setSearch] = useState("");
  const visible = entries.filter(
    (e) =>
      (search || e.section === section) &&
      `${e.title} ${e.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section className="window-shell settings-window enter">
      <aside className="sidebar">
        <p className="eyebrow">YOUR CLIENT, YOUR WAY</p>
        <h2>
          Settings<span>.</span>
        </h2>
        <nav aria-label="Settings sections">
          {sections.map(([name, Icon]) => (
            <button
              key={name}
              className={section === name && !search ? "active" : ""}
              onClick={() => {
                setSection(name);
                setSearch("");
              }}
            >
              <Icon size={18} />
              <span>{name}</span>
            </button>
          ))}
        </nav>
        <button className="back-link" onClick={() => navigate("Main menu")}>
          <ArrowLeft size={16} /> Back to menu
        </button>
      </aside>
      <div className="window-content">
        <header className="window-toolbar">
          <span className="breadcrumb">
            Settings <span>/</span> {search ? "Search" : section}
          </span>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search settings…"
            label="Search settings"
          />
        </header>
        <div className="content-scroll settings-content">
          <div className="section-heading">
            <div>
              <h1>
                {search
                  ? "Find your balance."
                  : section === "Graphics"
                    ? "Every detail, considered."
                    : section === "Privacy"
                      ? "Your world stays yours."
                      : section === "About"
                        ? "Beautiful Performance."
                        : `${section}, thoughtfully done.`}
              </h1>
              <p>
                {section === "Graphics"
                  ? "Set the scene for the way you want to play."
                  : "Make the interface feel like home."}
              </p>
            </div>
            {section !== "About" && (
              <Button
                variant="ghost"
                icon={RotateCcw}
                onClick={() => {
                  resetSettings(visible.map((e) => e.key));
                  notify("This section’s preview settings were reset.");
                }}
              >
                Reset section
              </Button>
            )}
          </div>
          {section === "Graphics" && !search && (
            <div className="settings-banner">
              <div>
                <Badge>VISUAL PREFERENCES</Badge>
                <h3>Find your kind of beautiful.</h3>
                <p>From a lighter touch to every little detail.</p>
              </div>
              <div className="segmented presets">
                {["Low", "Medium", "High", "Ultra"].map((p) => (
                  <button
                    className={settings.graphics === p ? "active" : ""}
                    aria-pressed={settings.graphics === p}
                    key={p}
                    onClick={() => {
                      setSetting("graphics", p);
                      setSetting(
                        "renderDistance",
                        { Low: 6, Medium: 10, High: 16, Ultra: 24 }[p]!,
                      );
                      setSetting(
                        "particles",
                        { Low: 25, Medium: 50, High: 75, Ultra: 100 }[p]!,
                      );
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
          {section === "Privacy" && !search && (
            <div className="notice">
              <ShieldCheck size={22} />
              <div>
                <strong>Private from the very beginning.</strong>
                <p>
                  All four privacy options default off. These controls only
                  demonstrate UI states and never send data.
                </p>
              </div>
            </div>
          )}
          <div className="settings-group">
            {visible.map((e) => (
              <SettingRow
                key={e.key}
                title={e.title}
                description={e.description}
              >
                {e.type === "toggle" ? (
                  <Toggle
                    label={e.title}
                    checked={!!settings[e.key]}
                    onChange={() => setSetting(e.key, !settings[e.key])}
                  />
                ) : e.type === "select" ? (
                  <select
                    aria-label={e.title}
                    value={String(settings[e.key])}
                    onChange={(event) => setSetting(e.key, event.target.value)}
                  >
                    {e.options?.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <Slider
                    label={e.title}
                    value={Number(settings[e.key])}
                    min={e.min}
                    max={e.max}
                    step={e.step}
                    unit={e.unit}
                    onChange={(v) => setSetting(e.key, v)}
                  />
                )}
              </SettingRow>
            ))}
          </div>
          {!visible.length && search && <EmptyState query={search} />}{" "}
          {section === "Controls" && !search && (
            <div className="keybind-list">
              <h3>Preview controls</h3>
              <p>
                <span>Close dialog</span>
                <kbd>ESC</kbd>
              </p>
              <p>
                <span>Move a focused HUD widget in edit mode</span>
                <kbd>← ↑ ↓ →</kbd>
              </p>
              <p>
                <span>Navigate controls</span>
                <kbd>TAB</kbd>
              </p>
            </div>
          )}
          {section === "About" && !search && (
            <div className="about-card">
              <p className="eyebrow">VEIL CLIENT / CONCEPT 01</p>
              <h2>More than Minecraft.</h2>
              <p>
                A visual study of a quieter, more personal way to play. Built
                around privacy, choice, and thoughtful details.
              </p>
              <p>
                This interactive UI prototype is separate from the native Rust
                launcher. Game features, accounts and performance measurements
                are not connected.
              </p>
              <a
                className="button secondary"
                href="https://github.com/V4n0alt/veil-client"
                target="_blank"
                rel="noreferrer"
              >
                View the open-source project <ArrowUpRight size={16} />
              </a>
            </div>
          )}
          <p className="preview-note">
            Appearance changes apply here. Game and privacy controls are local
            preview preferences.
          </p>
        </div>
      </div>
    </section>
  );
}
