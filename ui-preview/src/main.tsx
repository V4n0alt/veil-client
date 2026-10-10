import { createRoot } from "react-dom/client";
import { Provider } from "./state";
import { App } from "./App";
import "./theme.css";
import "./styles.css";
createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>,
);
