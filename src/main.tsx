import { createRoot } from "react-dom/client";
import App from "./App";
import { initMsal } from "./auth/initMsal";

(async () => {
  await initMsal();
  createRoot(document.getElementById("root")!).render(<App />);
})();
