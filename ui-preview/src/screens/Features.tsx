import { useState } from "react";
import { SlidersHorizontal, ShieldCheck, ArrowLeft, X } from "lucide-react";
import { categories, modules } from "../data";
import { useVeil } from "../state";
import {
  SearchInput,
  Toggle,
  Badge,
  IconButton,
  Modal,
  Slider,
  Button,
  EmptyState,
} from "../components/ui";
export function Features() {
  const { modules: enabled, toggleModule, navigate, notify } = useVeil();
  const [category, setCategory] = useState("Visuals");
  const [search, setSearch] = useState("");
  const [config, setConfig] = useState("");
  const [intensity, setIntensity] = useState<Record<string, number>>({});
  const visible = modules.filter(
    (m) =>
      (search || m.category === category) &&
      `${m.name} ${m.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="window-shell enter">
      <aside className="sidebar">
        <p className="eyebrow">MAKE IT YOURS</p>
        <h2>
          Features<span>.</span>
        </h2>
        <nav aria-label="Feature categories">
          {categories.map((c) => (
            <button
              className={category === c.name && !search ? "active" : ""}
              key={c.name}
              onClick={() => {
                setCategory(c.name);
                setSearch("");
              }}
            >
              <c.icon size={18} />
              <span>{c.name}</span>
              <small>
                {modules.filter((m) => m.category === c.name).length}
              </small>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={21} />
          <strong>Your choice. Always.</strong>
          <p>No features or mods are added to Fresh profiles.</p>
          <Badge tone="muted">Optional features</Badge>
        </div>
        <button className="back-link" onClick={() => navigate("Main menu")}>
          <ArrowLeft size={16} /> Back to menu
        </button>
      </aside>
      <div className="window-content">
        <header className="window-toolbar">
          <span className="breadcrumb">
            Features <span>/</span> {search ? "Search" : category}
          </span>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Find a feature…"
            label="Search features"
          />
          <IconButton
            icon={X}
            label="Close features"
            onClick={() => navigate("Main menu")}
          />
        </header>
        <div className="content-scroll">
          <div className="section-heading">
            <div>
              <h1>
                {search
                  ? "Find your favorites."
                  : category === "Visuals"
                    ? "A world worth looking at."
                    : category === "Performance"
                      ? "Smooth by design."
                      : category === "HUD"
                        ? "Just the essentials."
                        : `${category}, your way.`}
              </h1>
              <p>
                {category === "Visuals"
                  ? "Subtle details. A whole new atmosphere."
                  : "Choose the details that fit the way you play."}
              </p>
            </div>
            <Badge>
              {Object.values(enabled).filter(Boolean).length} enabled in preview
            </Badge>
          </div>
          <div className="module-grid">
            {visible.map((m) => (
              <article
                className={`module-card ${enabled[m.name] ? "enabled" : ""}`}
                key={m.name}
              >
                <div className="module-top">
                  <span className="module-icon">
                    <m.icon size={23} />
                  </span>
                  <Toggle
                    label={m.name}
                    checked={!!enabled[m.name]}
                    onChange={() => toggleModule(m.name)}
                  />
                </div>
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <div className="module-bottom">
                  <span>
                    {m.key ? <kbd>{m.key}</kbd> : m.tag || m.category}
                  </span>
                  <IconButton
                    icon={SlidersHorizontal}
                    label={`Configure ${m.name}`}
                    onClick={() => setConfig(m.name)}
                  />
                </div>
              </article>
            ))}
          </div>
          {!visible.length && <EmptyState query={search} />}
          <p className="preview-note">
            Feature controls are interactive design samples. They do not modify
            the game or install mods.
          </p>
        </div>
      </div>
      {config && (
        <Modal
          title={config}
          subtitle="Explore this feature’s control design."
          onClose={() => setConfig("")}
        >
          <div className="setting-row">
            <div>
              <h3>Enable in preview</h3>
              <p>Changes this screen’s sample state.</p>
            </div>
            <Toggle
              label={`Enable ${config}`}
              checked={!!enabled[config]}
              onChange={() => toggleModule(config)}
            />
          </div>
          <div className="setting-row">
            <div>
              <h3>Intensity</h3>
              <p>Sample adjustment, without a game effect.</p>
            </div>
            <Slider
              label={`${config} intensity`}
              value={intensity[config] ?? 50}
              onChange={(v) => setIntensity((s) => ({ ...s, [config]: v }))}
              unit="%"
            />
          </div>
          <div className="modal-actions">
            <Button
              variant="primary"
              onClick={() => {
                setConfig("");
                notify("Preview preferences updated.");
              }}
            >
              Done
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
