import avatar from "../../assets/nicole-avatar.png";

export type Txn = {
  id: number;
  name: string;
  date: string;
  kind: "Withdrawal to Bank" | "Money Received" | "Invoice sent" | "Request sent" | "Payment";
  category: string;
  amount: number;
  balanceAfter: number;
  status?: string;
  avatar?: string;
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
export const activityPeriod = "Jun - Oct 2026";

const incomeItems = [
  {
    name: "Acacia Digital Ltd",
    date: "7 Oct 2026",
    category: "Consulting",
    amount: 30000,
    kind: "Money Received" as const,
    status: "Money received",
  },
  {
    name: "Lakeview Consulting",
    date: "22 Sep 2026",
    category: "Invoice",
    amount: 33000,
    kind: "Invoice sent" as const,
    status: "Invoice sent",
  },
  {
    name: "Savannah Media Ltd",
    date: "4 Sep 2026",
    category: "Project",
    amount: 27000,
    kind: "Money Received" as const,
    status: "Money received",
  },
  {
    name: "Nairobi Creative Co",
    date: "19 Aug 2026",
    category: "Project",
    amount: 17000,
    kind: "Money Received" as const,
    status: "Money received",
  },
  {
    name: "Kijani Design Studio",
    date: "3 Aug 2026",
    category: "Invoice",
    amount: 19000,
    kind: "Request sent" as const,
    status: "Request sent - Canceled",
  },
  {
    name: "Grace Njeri",
    date: "17 Jul 2026",
    category: "Transfer",
    amount: 2000,
    kind: "Payment" as const,
    status: "Payment",
  },
  {
    name: "Amara Mwangi",
    date: "2 Jul 2026",
    category: "Transfer",
    amount: 3000,
    kind: "Money Received" as const,
    status: "Money received",
  },
  {
    name: "James Otieno",
    date: "18 Jun 2026",
    category: "Transfer",
    amount: 1000,
    kind: "Payment" as const,
    status: "Payment",
  },
  {
    name: "David Kamau",
    date: "2 Jun 2026",
    category: "Transfer",
    amount: 3000,
    kind: "Money Received" as const,
    status: "Money received",
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
    status: "Withdrawal to Bank",
  },
  {
    ...income,
    id: index * 2 + 2,
    balanceAfter: income.amount,
  },
]);

export type Contact = { name: string; handle: string };
export const contacts: Contact[] = [
  { name: "Imposter Here", handle: "@doersjit01" },
  { name: "Amara Mwangi", handle: "@amaramwangi" },
];

export type Invoice = {
  id: string;
  number: string;
  email: string;
  status: "Unpaid" | "Paid" | "Canceled";
  statusDetail: string;
  date: string;
  amount: number;
  items: InvoiceItem[];
};

export type InvoiceItem = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  tax?: number;
  discount?: number;
};

export const invoices: Invoice[] = [
  {
    id: "1",
    number: "0001",
    email: "client@example.com",
    status: "Unpaid",
    statusDetail: "0001 - Unpaid (Sent)",
    date: "7 Oct 2026",
    amount: 190,
    items: [
      {
        name: "Web Design Services",
        description: "Homepage redesign",
        price: 150,
        quantity: 1,
      },
      {
        name: "Consulting",
        description: "Technical consultation",
        price: 40,
        quantity: 1,
      },
    ],
  },
  {
    id: "2",
    number: "0002",
    email: "another@example.com",
    status: "Paid",
    statusDetail: "0002 - Paid",
    date: "22 Sep 2026",
    amount: 330,
    items: [
      {
        name: "Mobile App Development",
        description: "iOS and Android app",
        price: 330,
        quantity: 1,
      },
    ],
  },
];

export const fmt = (
  amount: number,
  signed = false,
  minimumFractionDigits = Number.isInteger(amount) ? 0 : 2,
) =>
  `${signed ? (amount < 0 ? "-" : "+") : ""}US$${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits,
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
    .map((transaction, index) => ({
      title: `You received ${fmt(transaction.amount)}`,
      detail: `from ${transaction.name}`,
      age: transaction.date,
      read: index >= 7,
    })),
];
