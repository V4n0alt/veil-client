import { useState } from "react";
import { X, ArrowRight, RotateCcw, Shield, Leaf, Sun } from "lucide-react";
import { useVeil } from "../state";
import {
  Slot,
  ItemIcon,
  starterItems,
  itemNames,
  type Item,
} from "../components/Items";
import { Badge, IconButton, Button } from "../components/ui";
export function Inventory() {
  const { navigate, notify } = useVeil();
  const [items, setItems] = useState<(Item | null)[]>(starterItems);
  const [selected, setSelected] = useState<number | null>(null);
  const [crafted, setCrafted] = useState(false);
  const select = (i: number) => {
    if (selected === null) {
      if (items[i]) setSelected(i);
    } else {
      setItems((old) => {
        const next = [...old];
        [next[i], next[selected]] = [next[selected], next[i]];
        return next;
      });
      setSelected(null);
    }
  };
  return (
    <section className="inventory-scene enter">
      <div className="inventory-heading">
        <span className="eyebrow">EVERYTHING IN ITS PLACE</span>
        <h1>Ready for the next chapter.</h1>
        <p>Classic items. Your familiar inventory.</p>
      </div>
      <div className="inventory-layout">
        <div className="inventory-panel glass">
          <header>
            <div>
              <h2>Inventory</h2>
              <span>
                Player <i /> Survival preview
              </span>
            </div>
            <IconButton
              icon={X}
              label="Close inventory"
              onClick={() => navigate("Main menu")}
            />
          </header>
          <div className="equipment">
            <div className="armor-slots">
              {["helmet", "chest", "legs", "boots"].map((k) => (
                <Slot
                  key={k}
                  item={{ kind: k }}
                  onClick={() =>
                    notify(
                      `${k[0].toUpperCase() + k.slice(1)} · Diamond equipment preview`,
                    )
                  }
                />
              ))}
            </div>
            <div className="character-stage">
              <span className="stage-glow" />
              <div className="pixel-player">
                <div className="head">
                  <i />
                  <i />
                </div>
                <div className="torso" />
                <div className="arm left" />
                <div className="arm right" />
                <div className="leg left" />
                <div className="leg right" />
              </div>
              <Badge tone="muted">Player</Badge>
            </div>
            <div className="crafting">
              <p className="eyebrow">CRAFTING</p>
              <div className="crafting-row">
                <div className="crafting-grid">
                  {[0, 1, 2, 3].map((i) => (
                    <Slot
                      key={i}
                      item={!crafted && i === 0 ? { kind: "log" } : null}
                      onClick={() =>
                        notify("Sample recipe: one log makes four planks.")
                      }
                    />
                  ))}
                </div>
                <ArrowRight size={19} />
                <Slot
                  item={crafted ? null : { kind: "planks", count: 4 }}
                  disabled={crafted}
                  onClick={() => {
                    const index = items.findIndex((i) => i === null);
                    if (index < 0) {
                      notify("No free inventory slots.");
                      return;
                    }
                    setItems((old) =>
                      old.map((item, i) =>
                        i === index ? { kind: "planks", count: 4 } : item,
                      ),
                    );
                    setCrafted(true);
                    notify("Crafted 4 planks in the preview.");
                  }}
                />
              </div>
              <small>
                {crafted ? "Planks added to inventory." : "Log → 4 planks"}
              </small>
            </div>
          </div>
          <div className="inventory-divider">
            <span>BACKPACK</span>
            <span>{items.filter(Boolean).length} / 36 slots</span>
          </div>
          <div className="slot-grid backpack">
            {items.slice(9).map((item, i) => (
              <Slot
                key={i}
                index={i + 9}
                item={item}
                selected={selected === i + 9}
                onClick={() => select(i + 9)}
              />
            ))}
          </div>
          <div className="slot-grid inventory-hotbar">
            {items.slice(0, 9).map((item, i) => (
              <Slot
                key={i}
                index={i}
                item={item}
                selected={selected === i}
                onClick={() => select(i)}
              />
            ))}
          </div>
          <footer>
            <span>
              {selected === null
                ? "Select an item, then a slot to move it."
                : "Choose a destination slot."}
            </span>
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={() => {
                setItems(starterItems);
                setSelected(null);
                setCrafted(false);
              }}
            >
              Reset
            </Button>
          </footer>
        </div>
        <aside className="inventory-side">
          <div className="effect-card glass">
            <Sun size={20} />
            <div>
              <strong>Golden hour</strong>
              <span>A moment to take it all in.</span>
            </div>
          </div>
          <div className="item-detail glass">
            <div className="detail-item">
              <ItemIcon
                kind={
                  selected === null ? "sword" : items[selected]?.kind || "sword"
                }
              />
            </div>
            <Badge>{selected === null ? "Equipment" : "Selected item"}</Badge>
            <h3>
              {selected === null
                ? "Diamond Sword"
                : itemNames[items[selected]?.kind || "sword"]}
            </h3>
            <p>
              {selected === null
                ? "A trusty companion for whatever comes next."
                : "Select an empty slot to move this item, or another item to swap."}
            </p>
            <div>
              <Shield size={14} />
              <span>Sample inventory</span>
            </div>
          </div>
          <p className="quiet-note">
            <Leaf size={14} /> Familiar by design.
            <br />
            No game inventory is changed.
          </p>
        </aside>
      </div>
    </section>
  );
}
