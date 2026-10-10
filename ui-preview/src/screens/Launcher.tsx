import { useState } from "react";
import {
  Home,
  Play,
  Settings2,
  UserRound,
  Boxes,
  FileText,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Mountain,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useVeil } from "../state";
import { Logo, Button, Badge, Modal } from "../components/ui";
import { ProfileCreator } from "./MainMenu";
const tabs = [
  ["Home", Home],
  ["Launch", Play],
  ["Settings", Settings2],
  ["Accounts", UserRound],
  ["Mods", Boxes],
  ["Patch Notes", FileText],
] as const;
export function Launcher() {
  const { navigate, profiles, selected, selectProfile } = useVeil();
  const [tab, setTab] = useState("Home");
  const [create, setCreate] = useState(false);
  const [launch, setLaunch] = useState(false);
  const profile = profiles[selected];
  return (
    <section className="launcher enter">
      <aside className="launcher-sidebar">
        <Logo small />
        <nav aria-label="Launcher navigation">
          {tabs.map(([name, Icon]) => (
            <button
              className={tab === name ? "active" : ""}
              key={name}
              onClick={() =>
                name === "Settings" ? navigate("Settings") : setTab(name)
              }
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>
        <div className="launcher-profile">
          <span className="avatar">V</span>
          <div>
            <strong>Local player</strong>
            <small>No account connected</small>
          </div>
        </div>
      </aside>
      <div className="launcher-body">
        <header>
          <span className="breadcrumb">
            Your space <span>/</span> {tab}
          </span>
          <Badge>DESIGN PREVIEW</Badge>
        </header>
        {tab === "Home" ? (
          <>
            <div className="launcher-hero">
              <span className="eyebrow">WELCOME TO VEIL</span>
              <h1>
                Adventure,
                <br />
                with a lighter touch.
              </h1>
              <p>Beautiful Performance. More than Minecraft.</p>
              <Button
                variant="primary"
                icon={Play}
                onClick={() => setLaunch(true)}
              >
                Play preview
              </Button>
            </div>
            <div className="launcher-card-grid">
              <div className="launcher-card">
                <div className="card-title">
                  <h3>Your next adventure</h3>
                  <Button
                    variant="ghost"
                    icon={Plus}
                    onClick={() => setCreate(true)}
                  >
                    New profile
                  </Button>
                </div>
                <div className="selected-profile">
                  <span className="profile-cube">
                    <Mountain size={25} />
                  </span>
                  <div>
                    <strong>{profile.name}</strong>
                    <p>
                      Minecraft {profile.version} · {profile.preset}
                    </p>
                  </div>
                  <Badge tone="success">0 mods</Badge>
                </div>
                <label className="field">
                  Selected profile
                  <select
                    aria-label="Launcher profile"
                    value={selected}
                    onChange={(e) => selectProfile(Number(e.target.value))}
                  >
                    {profiles.map((p, i) => (
                      <option key={p.name} value={i}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                className="launcher-card editorial-card"
                onClick={() => setTab("Patch Notes")}
              >
                <span className="eyebrow">A NOTE FROM VEIL</span>
                <h3>
                  Fresh starts.
                  <br />
                  Endless possibilities.
                </h3>
                <span>
                  Explore the design notes <ArrowUpRight size={17} />
                </span>
              </button>
            </div>
            <div className="privacy-strip">
              <ShieldCheck size={18} />
              <span>
                Private by default. No telemetry. No required Veil account.
              </span>
              <button onClick={() => navigate("Settings")}>
                Explore settings <ArrowRight size={15} />
              </button>
            </div>
          </>
        ) : tab === "Launch" ? (
          <div className="launcher-section">
            <p className="eyebrow">YOUR PROFILES</p>
            <h1>Where to next?</h1>
            <p>Every profile starts with your choice.</p>
            <div className="profile-list">
              {profiles.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => selectProfile(i)}
                  className={`profile-entry ${i === selected ? "selected" : ""}`}
                >
                  <Mountain size={26} />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.version} · {p.preset} · No mods installed
                    </small>
                  </span>
                  {i === selected && <Check size={19} />}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <Button icon={Plus} onClick={() => setCreate(true)}>
                New profile
              </Button>
              <Button
                icon={Play}
                variant="primary"
                onClick={() => setLaunch(true)}
              >
                Play preview
              </Button>
            </div>
          </div>
        ) : tab === "Accounts" ? (
          <div className="launcher-section">
            <p className="eyebrow">NO EXTRA ACCOUNT. EVER.</p>
            <h1>Just you and your world.</h1>
            <div className="account-empty">
              <UserRound size={38} />
              <h3>Microsoft sign-in is coming later.</h3>
              <p>
                This prototype doesn’t collect passwords or tokens. Your current
                profile is local.
              </p>
              <Badge tone="muted">Not connected</Badge>
            </div>
          </div>
        ) : tab === "Mods" ? (
          <div className="launcher-section">
            <p className="eyebrow">A CLEAN START</p>
            <h1>Fresh means fresh.</h1>
            <div className="account-empty">
              <Boxes size={42} />
              <h3>No mods installed.</h3>
              <p>
                Quality and Performance are optional choices. Their compatible
                contents must be reviewed before installation.
              </p>
              <Button icon={Sparkles} onClick={() => navigate("Features")}>
                Explore feature designs
              </Button>
            </div>
          </div>
        ) : (
          <div className="launcher-section">
            <p className="eyebrow">DESIGN NOTES / 01</p>
            <h1>A fresh perspective.</h1>
            <div className="notes-list">
              {[
                [
                  "A familiar world, beautifully framed.",
                  "Cinematic scenery, quiet glass surfaces and a consistent purple palette.",
                ],
                [
                  "Your profile. Your choice.",
                  "Fresh is always the default. Quality and Performance remain optional.",
                ],
                [
                  "Details that stay out of the way.",
                  "A modular HUD, clearer inventory and accessible controls.",
                ],
                [
                  "An honest preview.",
                  "No simulated benchmark claims, mod downloads or account connections.",
                ],
              ].map(([title, body], i) => (
                <article key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
      {create && <ProfileCreator onClose={() => setCreate(false)} />}{" "}
      {launch && (
        <Modal
          title="Ready when you are."
          subtitle={`${profile.name} · Minecraft ${profile.version} · ${profile.preset}`}
          onClose={() => setLaunch(false)}
        >
          <div className="notice">
            <Play size={20} />
            <p>
              This opens the main menu design preview. Use START-DEMO.cmd in the
              separate Windows test bundle to launch the actual vanilla demo.
            </p>
          </div>
          <div className="modal-actions">
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate("Main menu")}
            >
              Open main menu
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}
