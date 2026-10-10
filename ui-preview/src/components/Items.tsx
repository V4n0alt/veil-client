export type Item = { kind: string; count?: number };
const colors: Record<string, string> = {
  sword: "#72e5d0",
  pickaxe: "#72e5d0",
  diamond: "#72e5d0",
  grass: "#74a865",
  stone: "#a5a5b2",
  log: "#b28d61",
  planks: "#cfa16c",
  apple: "#ed647c",
  potion: "#cb91ef",
  pearl: "#65c0b6",
  torch: "#ffd08b",
  bread: "#dfa75d",
  map: "#e3d4ac",
  helmet: "#bed1df",
  chest: "#bed1df",
  legs: "#bed1df",
  boots: "#bed1df",
};
export function ItemIcon({ kind }: { kind: string }) {
  let path = "M5 4h14v16H5z";
  if (kind === "sword")
    path =
      "M17 1h6v6h-3v3h-3v3h-3v3h-3v-3H8v-3h3V7h3V4h3z M5 13h3v3h3v3H8v3H5v-3H2v-3h3z";
  if (kind === "pickaxe")
    path =
      "M5 2h13v3h3v10h-3V8h-3V5H5z M12 8h3v4h-3v3H9v3H6v3H3v-3h3v-3h3v-3h3z";
  if (kind === "apple") path = "M11 2h3v4h4v3h3v10h-3v3H6v-3H3V9h3V6h5z";
  if (kind === "diamond" || kind === "pearl")
    path = "M8 3h8v3h3v3h3v6h-3v3h-3v3H8v-3H5v-3H2V9h3V6h3z";
  if (kind === "torch") path = "M8 1h8v8h-2v14h-4V9H8z";
  if (kind === "potion") path = "M9 1h6v3h-1v5h4v3h3v9H3v-9h3V9h4V4H9z";
  if (kind === "helmet") path = "M5 4h14v3h3v13h-6v-5H8v5H2V7h3z";
  if (kind === "chest") path = "M5 3h4v4h6V3h4v3h4v8h-5v9H6v-9H1V6h4z";
  if (kind === "legs") path = "M5 2h14v20h-6V11h-2v11H5z";
  if (kind === "boots") path = "M5 4h6v18H1v-7h4z M14 4h6v11h3v7h-9z";
  if (kind === "bread") path = "M5 5h12v3h4v12H3V8h2z";
  return (
    <svg
      className="item-icon"
      viewBox="0 0 24 24"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path d={path} fill="#17252c" transform="translate(1 1)" />
      <path d={path} fill={colors[kind] || "#bdadce"} />
      <path d="M8 6h5v2H8zm-2 6h3v3H6z" fill="#ffffff55" />
      {kind === "grass" && <path d="M5 4h14v6H5z" fill="#8abf62" />}
    </svg>
  );
}
export const starterItems: (Item | null)[] = [
  { kind: "sword" },
  { kind: "pickaxe" },
  { kind: "grass", count: 64 },
  { kind: "torch", count: 32 },
  { kind: "apple", count: 8 },
  { kind: "pearl", count: 16 },
  { kind: "potion" },
  { kind: "map" },
  { kind: "bread", count: 12 },
  ...Array(9).fill(null),
  { kind: "log", count: 32 },
  { kind: "stone", count: 64 },
  null,
  { kind: "diamond", count: 6 },
  ...Array(14).fill(null),
];
export function Slot({
  item,
  selected = false,
  onClick,
  index,
  disabled = false,
}: {
  item: Item | null;
  selected?: boolean;
  onClick?: () => void;
  index?: number;
  disabled?: boolean;
}) {
  return (
    <button
      className={`slot ${selected ? "selected" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={`${index !== undefined ? `Slot ${index + 1}: ` : ""}${item ? `${item.kind}${item.count ? `, ${item.count}` : ""}` : "empty"}`}
      title={
        item
          ? `${item.kind[0].toUpperCase() + item.kind.slice(1)}${item.count ? ` × ${item.count}` : ""}`
          : "Empty slot"
      }
    >
      {item && (
        <>
          <ItemIcon kind={item.kind} />
          {item.count && <span className="item-count">{item.count}</span>}
        </>
      )}
    </button>
  );
}
