import { useState } from "react";
import {
  Play,
  Globe2,
  Settings2,
  Sparkles,
  Shirt,
  LogOut,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Plus,
  Mountain,
  Check,
} from "lucide-react";
import { Button, Badge, Logo, Modal } from "../components/ui";
import { useVeil, type Profile } from "../state";
export function ProfileCreator({ onClose }: { onClose: () => void }) {
  const { addProfile, profiles } = useVeil();
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<Profile["preset"]>("Fresh");
  const [version, setVersion] = useState("1.21.1");
  const duplicate = profiles.some(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase(),
  );
  return (
    <Modal
      title="A world of your own."
      subtitle="Start fresh. Make it yours when you’re ready."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || duplicate) return;
          addProfile({ name: name.trim(), version, preset });
          onClose();
        }}
      >
        <label className="field">
          Profile name
          <input
            autoFocus
            maxLength={40}
            placeholder="My next adventure"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        {duplicate && <p className="error">Choose a different profile name.</p>}
        <label className="field">
          Minecraft version
          <select value={version} onChange={(e) => setVersion(e.target.value)}>
            <option>1.21.1</option>
            <option>1.20.1</option>
          </select>
        </label>
        <p className="field-label">Choose your starting point</p>
        <div className="preset-grid">
          {(["Fresh", "Quality", "Performance"] as const).map((p) => (
            <button
              className={`preset ${preset === p ? "selected" : ""}`}
              type="button"
              aria-pressed={preset === p}
              onClick={() => setPreset(p)}
              key={p}
            >
              {p === "Fresh" ? (
                <Mountain size={22} />
              ) : p === "Quality" ? (
                <Sparkles size={22} />
              ) : (
                <Play size={22} />
              )}
              <strong>{p}</strong>
              <small>
                {p === "Fresh"
                  ? "Pure vanilla. Zero mods."
                  : p === "Quality"
                    ? "Optional visual features."
                    : "Optional optimization tools."}
              </small>
              {preset === p && <Check className="preset-check" size={15} />}
            </button>
          ))}
        </div>
        <div className="notice">
          <ShieldCheck size={18} />
          <div>
            <strong>
              {preset === "Fresh"
                ? "Nothing added. Nothing assumed."
                : "Review before installing."}
            </strong>
            <p>
              {preset === "Fresh"
                ? "No mods, shaders or resource packs. Your profile stays isolated."
                : `${preset} is an optional profile intent in this mockup. Compatible mod lists are not implemented, and nothing will be downloaded.`}
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim() || duplicate}
            icon={Plus}
          >
            Create preview profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function MainMenu() {
  const { navigate, profiles, selected, selectProfile, notify } = useVeil();
  const [modal, setModal] = useState("");
  const [address, setAddress] = useState("");
  const [world, setWorld] = useState("A quiet beginning");
  const [cape, setCape] = useState("Lavender");
  return (
    <section className="main-menu enter">
      <div className="menu-top">
        <span className="micro-label">
          <span className="status-dot" />
          LOCAL PROFILE
        </span>
        <button className="account-chip" onClick={() => navigate("Launcher")}>
          <span className="avatar">V</span>
          <span>
            Player<small>Make yourself at home</small>
          </span>
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="menu-layout">
        <div className="menu-stack">
          <div className="hero-brand">
            <Logo />
            <p>
              Beautiful Performance<span>.</span>
            </p>
          </div>
          <div className="menu-buttons">
            {[
              {
                label: "Singleplayer",
                icon: Play,
                action: () => setModal("worlds"),
              },
              {
                label: "Multiplayer",
                icon: Globe2,
                action: () => setModal("servers"),
              },
              {
                label: "Settings",
                icon: Settings2,
                action: () => navigate("Settings"),
              },
              {
                label: "Features",
                icon: Sparkles,
                action: () => navigate("Features"),
              },
              {
                label: "Cosmetics",
                icon: Shirt,
                action: () => setModal("cosmetics"),
              },
              { label: "Exit", icon: LogOut, action: () => setModal("exit") },
            ].map((m, i) => (
              <button
                key={m.label}
                className={`menu-button ${i === 0 ? "featured" : ""} ${i === 5 ? "exit" : ""}`}
                onClick={m.action}
              >
                <m.icon size={20} />
                <span>{m.label}</span>
                {i === 0 ? (
                  <ArrowRight size={19} />
                ) : (
                  <span className="menu-shortcut">{i + 1}</span>
                )}
              </button>
            ))}
          </div>
          <div className="profile-mini">
            <div className="profile-cube">
              <Mountain size={19} />
            </div>
            <label>
              <span>CURRENT PROFILE</span>
              <select
                aria-label="Current profile"
                value={selected}
                onChange={(e) => selectProfile(Number(e.target.value))}
              >
                {profiles.map((p, i) => (
                  <option value={i} key={p.name}>
                    {p.name} · {p.version}
                  </option>
                ))}
              </select>
            </label>
            <button
              aria-label="New profile"
              title="New profile"
              onClick={() => setModal("profile")}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <div className="scene-caption">
          <span className="scene-line" />
          <p>FIND YOUR NEXT HORIZON</p>
          <h2>
            More than
            <br />
            Minecraft.
          </h2>
          <span>Your world. A little more beautiful.</span>
        </div>
        <button className="news-card" onClick={() => navigate("Launcher")}>
          <span className="news-image" />
          <span>
            <span className="eyebrow">A FRESH PERSPECTIVE</span>
            <strong>Room for your next adventure.</strong>
            <small>
              Explore the Veil design preview <ArrowRight size={13} />
            </small>
          </span>
        </button>
      </div>
      <footer className="menu-footer">
        <span>
          VEIL CLIENT <i /> UI CONCEPT 01
        </span>
        <span>
          <ShieldCheck size={14} /> Privacy by default
        </span>
        <span>Original concept art · No measured FPS claims</span>
      </footer>
      {modal === "profile" && <ProfileCreator onClose={() => setModal("")} />}
      {modal === "worlds" && (
        <Modal
          title="Your next adventure."
          subtitle="Sample worlds for this interface preview."
          onClose={() => setModal("")}
        >
          <div className="world-list">
            {["A quiet beginning", "Lavender valley", "Creative horizons"].map(
              (w, i) => (
                <button
                  className={`world-row ${world === w ? "selected" : ""}`}
                  onClick={() => setWorld(w)}
                  key={w}
                >
                  <span className={`world-thumb scene-${i}`} />
                  <span>
                    <strong>{w}</strong>
                    <small>
                      {i === 2 ? "Creative" : "Survival"} · Minecraft 1.21.1 ·
                      Sample world
                    </small>
                  </span>
                  {world === w && <Check size={18} />}
                </button>
              ),
            )}
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setModal("")}>
              Back
            </Button>
            <Button
              variant="primary"
              icon={Play}
              onClick={() => {
                navigate("HUD");
                notify(
                  "World preview opened. No Minecraft process was started.",
                );
              }}
            >
              Preview world
            </Button>
          </div>
        </Modal>
      )}
      {modal === "servers" && (
        <Modal
          title="Better, together."
          subtitle="Preview the connection flow. No network connection is made."
          onClose={() => setModal("")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              notify(
                `Connection preview for ${address}. Multiplayer integration is not available yet.`,
              );
              setModal("");
            }}
          >
            <label className="field">
              Server address
              <input
                autoFocus
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="play.example.com"
                required
                pattern="[a-zA-Z0-9.\-:]+"
              />
            </label>
            <div className="notice">
              <Globe2 size={18} />
              <p>
                Microsoft sign-in and multiplayer launching belong to a later
                launcher milestone.
              </p>
            </div>
            <div className="modal-actions">
              <Button
                variant="primary"
                type="submit"
                disabled={!address.trim()}
                icon={ArrowRight}
              >
                Preview connection
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "cosmetics" && (
        <Modal
          title="A little more you."
          subtitle="Color studies for optional cosmetics. Nothing is installed."
          onClose={() => setModal("")}
        >
          <div className="cape-preview">
            <div
              style={{
                background:
                  cape === "Lavender"
                    ? "#9B6BFF"
                    : cape === "Rose"
                      ? "#e1a7ff"
                      : "#5b6172",
              }}
            >
              <Logo small />
            </div>
          </div>
          <div className="segmented">
            {["Lavender", "Rose", "Graphite"].map((c) => (
              <button
                key={c}
                aria-pressed={cape === c}
                className={cape === c ? "active" : ""}
                onClick={() => setCape(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </Modal>
      )}
      {modal === "exit" && (
        <Modal
          title="Until the next adventure."
          subtitle="Return to the launcher preview?"
          onClose={() => setModal("")}
        >
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setModal("")}>
              Stay here
            </Button>
            <Button variant="primary" onClick={() => navigate("Launcher")}>
              Return to launcher
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
