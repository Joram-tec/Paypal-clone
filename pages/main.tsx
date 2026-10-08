// Entry point for the static (GitHub Pages) build. It mounts the exact same
// wallet screens the Lovable preview shows — no router, no server, just React.
import { createRoot } from "react-dom/client";
import { WalletApp } from "../src/components/wallet/WalletApp";
import "../src/styles.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<WalletApp />);
}
