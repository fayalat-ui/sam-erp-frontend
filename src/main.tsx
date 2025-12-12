import { createRoot } from "react-dom/client";
import App from "./App";
import { msalInstance } from "./auth/msalInstance";

(async () => {
  await msalInstance.initialize();

  const result = await msalInstance.handleRedirectPromise();
  if (result?.account) {
    msalInstance.setActiveAccount(result.account);
  } else {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) msalInstance.setActiveAccount(accounts[0]);
  }

  createRoot(document.getElementById("root")!).render(<App />);
})();
