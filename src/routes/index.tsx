import { createFileRoute } from "@tanstack/react-router";
import { WalletApp } from "@/components/wallet/WalletApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pesa Wallet — Mobile money demo" },
      { name: "description", content: "A mobile money wallet mock app with balances, transfers and activity in KES." },
      { property: "og:title", content: "Pesa Wallet — Mobile money demo" },
      { property: "og:description", content: "A mobile money wallet mock app with balances, transfers and activity in KES." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletApp,
});
