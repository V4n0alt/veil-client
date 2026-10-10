import { useState, useRef, type ReactNode } from "react";
import {
  Gauge,
  Signal,
  MapPin,
  Grip,
  RotateCcw,
  Move,
  Check,
  ArrowLeft,
  Shield,
  Heart,
  Drumstick,
  FlaskConical,
} from "lucide-react";
import { Button, Badge } from "../components/ui";
import { ItemIcon, Slot, starterItems, itemNames } from "../components/Items";
import { useVeil } from "../state";
function Widget({
  label,
  children,
  editing,
  initial,
}: {
  label: string;
  children: ReactNode;
  editing: boolean;
  initial: { left?: number; right?: number; top: number };
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const frame = useRef<HTMLDivElement>(null);
  const constrain = (x: number, y: number) => {
    const element = frame.current;
    const canvas = element?.parentElement;
    if (!element || !canvas) return { x: 0, y: 0 };
    return {
      x: Math.max(
        -element.offsetLeft,
        Math.min(
          canvas.clientWidth - element.offsetLeft - element.offsetWidth,
          x,
        ),
      ),
      y: Math.max(
        -element.offsetTop,
        Math.min(
          canvas.clientHeight - element.offsetTop - element.offsetHeight,
          y,
        ),
      ),
    };
  };
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  return (
    <div
      ref={frame}
      className={`hud-widget glass ${editing ? "editing" : ""}`}
      style={{
        ...initial,
        transform: `translate(${position.x}px,${position.y}px)`,
      }}
    >
      <button
        className="widget-handle"
        disabled={!editing}
        aria-label={`Move ${label} widget`}
        onKeyDown={(e) => {
          const offsets: Record<string, number[]> = {
            ArrowLeft: [-8, 0],
            ArrowRight: [8, 0],
            ArrowUp: [0, -8],
            ArrowDown: [0, 8],
          };
          if (offsets[e.key]) {
            e.preventDefault();
            const [x, y] = offsets[e.key];
            setPosition((p) => constrain(p.x + x, p.y + y));
          }
        }}
        onPointerDown={(e) => {
          if (!editing) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            px: position.x,
            py: position.y,
          };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setPosition(
            constrain(
              drag.current.px + e.clientX - drag.current.x,
              drag.current.py + e.clientY - drag.current.y,
            ),
          );
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onLostPointerCapture={() => (drag.current = null)}
      >
        {editing ? <Grip size={12} /> : <span className="tiny-dot" />}
        {label}
      </button>
      {children}
    </div>
  );
}
export function Hud() {
  const { settings, navigate } = useVeil();
  const [edit, setEdit] = useState(false);
  const [layout, setLayout] = useState(0);
  const [slot, setSlot] = useState(0);
  return (
    <section className="hud-scene enter">
      <header className="hud-toolbar">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate("Main menu")}
        >
          Back
        </Button>
        <div>
          <Badge>HUD PREVIEW</Badge>
          <span>Sample values · Not a performance measurement</span>
        </div>
        <Button
          icon={edit ? Check : Move}
          variant={edit ? "primary" : "secondary"}
          onClick={() => setEdit(!edit)}
        >
          {edit ? "Done editing" : "Edit layout"}
        </Button>
        {edit && (
          <Button icon={RotateCcw} onClick={() => setLayout((n) => n + 1)}>
            Reset layout
          </Button>
        )}
      </header>
      <div className="hud-canvas" key={layout}>
        <div className="performance-pill glass">
          <Gauge size={15} />
          <strong>144</strong>
          <span>FPS</span>
          <i />
          <Signal size={15} />
          <strong>24</strong>
          <span>ms</span>
          <Badge tone="muted">Sample</Badge>
        </div>
        {settings.coordinates && (
          <Widget
            editing={edit}
            label="Coordinates"
            initial={{ left: 30, top: 78 }}
          >
            <div className="coords">
              <MapPin size={16} />
              <span>
                <small>X</small> 128 <small>Y</small> 72 <small>Z</small> −346
              </span>
            </div>
            <p className="biome">
              Plains <span>↗ North East</span>
            </p>
          </Widget>
        )}
        {settings.keybinds && (
          <Widget
            editing={edit}
            label="Keybinds"
            initial={{ left: 30, top: 207 }}
          >
            <div className="hud-keybind">
              <span>Zoom</span>
              <kbd>C</kbd>
            </div>
            <div className="hud-keybind">
              <span>Free look</span>
              <kbd>ALT</kbd>
            </div>
            <div className="hud-keybind">
              <span>Screenshot</span>
              <kbd>F2</kbd>
            </div>
          </Widget>
        )}
        {settings.armor && (
          <Widget editing={edit} label="Armor" initial={{ right: 30, top: 25 }}>
            <div className="armor-readout">
              {["helmet", "chest", "legs", "boots"].map((k, i) => (
                <div key={k}>
                  <ItemIcon kind={k} />
                  <span>
                    <i style={{ width: `${96 - i * 7}%` }} />
                  </span>
                  <small>{96 - i * 7}%</small>
                </div>
              ))}
            </div>
          </Widget>
        )}
        {settings.effects && (
          <Widget
            editing={edit}
            label="Active effects"
            initial={{ right: 30, top: 222 }}
          >
            <div className="potion-row">
              <FlaskConical size={23} />
              <span>
                Speed II<small>1:42 · Sample</small>
              </span>
            </div>
          </Widget>
        )}
        <div
          className={`crosshair ${String(settings.crosshair).toLowerCase()}`}
          aria-label={`${settings.crosshair} crosshair`}
        >
          <span />
          <i />
        </div>
        <div className="hud-bottom">
          <p className="selected-item-name">
            {itemNames[starterItems[slot]?.kind || ""]}
          </p>
          <div className="vitals">
            <div>
              {Array.from({ length: 10 }, (_, i) => (
                <Shield key={i} size={14} fill="#cbd4e2" />
              ))}
            </div>
            <div>
              {Array.from({ length: 10 }, (_, i) => (
                <Drumstick key={i} size={14} fill="#dfb083" />
              ))}
            </div>
          </div>
          <div className="vitals health">
            <div>
              {Array.from({ length: 10 }, (_, i) => (
                <Heart key={i} size={15} fill={i < 9 ? "#ed829c" : "#4a3745"} />
              ))}
            </div>
            <strong>27</strong>
          </div>
          <div className="xp-track">
            <i />
          </div>
          <div className="hud-hotbar glass">
            {starterItems.slice(0, 9).map((item, i) => (
              <Slot
                key={i}
                item={item}
                index={i}
                selected={slot === i}
                onClick={() => setSlot(i)}
              />
            ))}
          </div>
          <p>
            {edit
              ? "Drag a widget header, or focus it and use arrow keys."
              : "Your world. Nothing in the way."}
          </p>
        </div>
      </div>
    </section>
  );
}
