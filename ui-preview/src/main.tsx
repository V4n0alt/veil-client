import { createRoot } from "react-dom/client";
import { Provider } from "./state";
import { App } from "./App";
import "./theme.css";
import "./styles.css";
createRoot(document.getElementById("root")!, {
  onUncaughtError(error) {
    window.dispatchEvent(
      new CustomEvent("veil-startup-error", {
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
  },
}).render(
  <Provider>
    <App />
  </Provider>,
);
