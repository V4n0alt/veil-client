import {
  Monitor,
  Backpack,
  Sparkles,
  ScanLine,
  Settings2,
  PanelTop,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "./components/ui";
import { useVeil, type Screen } from "./state";
import { MainMenu } from "./screens/MainMenu";
import { Inventory } from "./screens/Inventory";
import { Features } from "./screens/Features";
import { Hud } from "./screens/Hud";
import { Settings } from "./screens/Settings";
import { Launcher } from "./screens/Launcher";
const screens = [
  ["Main menu", Monitor],
  ["Inventory", Backpack],
  ["Features", Sparkles],
  ["HUD", ScanLine],
  ["Settings", Settings2],
  ["Launcher", PanelTop],
] as const;
export function App() {
  const { screen, navigate, settings, toast } = useVeil();
  const pages: Record<Screen, React.ReactNode> = {
    "Main menu": <MainMenu />,
    Inventory: <Inventory />,
    Features: <Features />,
    HUD: <Hud />,
    Settings: <Settings />,
    Launcher: <Launcher />,
  };
  return (
    <div
      className={`app ${settings.reducedMotion ? "reduced-motion" : ""} ${settings.reducedBlur ? "reduced-blur" : ""} ${settings.highContrast ? "high-contrast" : ""}`}
      style={
        { "--ui-scale": Number(settings.uiScale) / 100 } as React.CSSProperties
      }
    >
      <a className="skip-link" href="#preview">
        Skip to preview
      </a>
      <header className="studio-bar">
        <button
          className="studio-brand"
          aria-label="Veil main menu"
          onClick={() => navigate("Main menu")}
        >
          <Logo small />
          <span>DESIGN SYSTEM</span>
        </button>
        <nav aria-label="Preview screens">
          {screens.map(([name, Icon]) => (
            <button
              key={name}
              aria-current={screen === name ? "page" : undefined}
              className={screen === name ? "active" : ""}
              onClick={() => navigate(name)}
            >
              <Icon size={15} />
              <span>{name}</span>
            </button>
          ))}
        </nav>
        <span className="preview-indicator">
          <span className="status-dot" />
          INTERACTIVE PREVIEW
        </span>
      </header>
      <main
        id="preview"
        tabIndex={-1}
        className={`preview-stage screen-${screen.toLowerCase().replace(" ", "-")}`}
      >
        <div className="scene-background" />
        {pages[screen]}
      </main>
      {toast && (
        <div className="toast glass" role="status">
          <CheckCircle2 size={19} />
          {toast}
        </div>
      )}
    </div>
  );
}
