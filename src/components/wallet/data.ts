import avatar from "../../assets/nicole-avatar.png";

export type Txn = {
  id: number;
  name: string;
  date: string;
  kind: "Withdrawal to Bank" | "Money Received";
  category: string;
  amount: number;
  balanceAfter: number;
};

// Local fixtures only. No account, authentication, or payment service is used.
export const user = {
  name: "Nicole Wairimu",
  email: "nicolewnjeri@gmail.com",
  avatar,
  joined: 2025,
};

export const openingBalance = 0;
export const balance = 0;
export const card = { bank: "Your Bank", type: "Debit", lastFour: "6277" };
export const appVersion = "8.107.2";
export const activityMonth = "Oct 2026";

const incomeItems = [
  {
    name: "Acacia Digital Ltd",
    date: "7 Oct 2026",
    category: "Consulting",
    amount: 30000,
  },
  {
    name: "Lakeview Consulting",
    date: "6 Oct 2026",
    category: "Invoice",
    amount: 33000,
  },
  {
    name: "Savannah Media Ltd",
    date: "5 Oct 2026",
    category: "Project",
    amount: 27000,
  },
  {
    name: "Nairobi Creative Co",
    date: "4 Oct 2026",
    category: "Project",
    amount: 17000,
  },
  {
    name: "Kijani Design Studio",
    date: "3 Oct 2026",
    category: "Invoice",
    amount: 19000,
  },
  {
    name: "Grace Njeri",
    date: "2 Oct 2026",
    category: "Transfer",
    amount: 2000,
  },
  {
    name: "Amara Mwangi",
    date: "2 Oct 2026",
    category: "Transfer",
    amount: 3000,
  },
  {
    name: "James Otieno",
    date: "1 Oct 2026",
    category: "Transfer",
    amount: 1000,
  },
  {
    name: "David Kamau",
    date: "1 Oct 2026",
    category: "Transfer",
    amount: 3000,
  },
];

// Newest first: each withdrawal follows its receipt in time, so it appears above it.
// Every pair starts and ends at zero; repeated amounts remain separate receipts.
export const txns: Txn[] = incomeItems.flatMap((income, index): Txn[] => [
  {
    id: index * 2 + 1,
    name: "Equity Bank (Kenya) Limited",
    date: income.date,
    kind: "Withdrawal to Bank",
    category: "Transfer",
    amount: -income.amount,
    balanceAfter: 0,
  },
  {
    ...income,
    id: index * 2 + 2,
    kind: "Money Received",
    balanceAfter: income.amount,
  },
]);

export const contacts = [{ name: "Amara Mwangi", handle: "@amaramwangi" }];

export const fmt = (amount: number, signed = false) =>
  `${signed ? (amount < 0 ? "-" : "+") : ""}US$${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

export const notifications = [
  {
    title: "PayPal Customer Support",
    detail: "New messages are waiting for you",
    age: "5h",
    read: true,
  },
  {
    title: "Submit info to access your funds",
    detail:
      "To continue having access to your funds, you'll need to submit the info we've requested.",
    age: "1mo",
    read: false,
  },
  ...txns
    .filter((transaction) => transaction.amount > 0)
    .map((transaction) => ({
      title: `You received ${fmt(transaction.amount)}`,
      detail: `from ${transaction.name}`,
      age: transaction.date,
      read: transaction.date === "1 Oct 2026",
    })),
];
