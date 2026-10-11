import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
export type Screen =
  "Main menu" | "Inventory" | "Features" | "HUD" | "Settings" | "Launcher";
export type Profile = {
  name: string;
  version: string;
  preset: "Fresh" | "Quality" | "Performance";
};
export type Settings = Record<string, boolean | number | string>;
export const defaults: Settings = {
  reducedMotion: false,
  reducedBlur: false,
  uiScale: 100,
  renderDistance: 12,
  particles: 75,
  fpsLimit: 144,
  graphics: "High",
  language: "English",
  accent: "Lavender",
  coordinates: true,
  keybinds: true,
  armor: true,
  effects: true,
  crosshair: "Cross",
  telemetry: false,
  analytics: false,
  crashUploads: false,
  presence: false,
  smartAnimation: false,
  subtitles: false,
  highContrast: false,
  showTooltips: true,
  masterVolume: 70,
};
type AppState = {
  screen: Screen;
  navigate: (s: Screen) => void;
  settings: Settings;
  setSetting: (k: string, v: boolean | number | string) => void;
  resetSettings: (keys: string[]) => void;
  profiles: Profile[];
  addProfile: (p: Profile) => void;
  selected: number;
  selectProfile: (n: number) => void;
  modules: Record<string, boolean>;
  toggleModule: (name: string) => void;
  notify: (message: string) => void;
  toast: string;
};
const Context = createContext<AppState>(null!);
export function Provider({ children }: { children: ReactNode }) {
  const [screen, navigate] = useState<Screen>("Main menu");
  const [settings, updateSettings] = useState(defaults);
  const [profiles, updateProfiles] = useState<Profile[]>([
    { name: "Fresh vanilla", version: "1.21.1", preset: "Fresh" },
  ]);
  const [selected, selectProfile] = useState(0);
  const [modules, updateModules] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const notify = (message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4200);
  };
  const addProfile = (p: Profile) => {
    updateProfiles((x) => [...x, p]);
    selectProfile(profiles.length);
    notify(`${p.name} created in this preview. No mods installed.`);
  };
  return (
    <Context.Provider
      value={{
        screen,
        navigate,
        settings,
        setSetting: (k, v) => updateSettings((s) => ({ ...s, [k]: v })),
        resetSettings: (keys) =>
          updateSettings((s) => ({
            ...s,
            ...Object.fromEntries(keys.map((k) => [k, defaults[k]])),
          })),
        profiles,
        addProfile,
        selected,
        selectProfile,
        modules,
        toggleModule: (name) =>
          updateModules((s) => ({ ...s, [name]: !s[name] })),
        notify,
        toast,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useVeil = () => useContext(Context);
