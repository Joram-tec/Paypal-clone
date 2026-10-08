import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WalletApp } from "../components/wallet/WalletApp";
import { balance, fmt, notifications, openingBalance, txns, user } from "../components/wallet/data";

afterEach(cleanup);

function openHome() {
  render(<WalletApp />);
  fireEvent.click(screen.getByRole("button", { name: "Log In" }));
}

describe("Wallet fixtures", () => {
  it("uses exact profile, balance, and transaction values", () => {
    expect(user.email).toBe("nicolewnjeri@gmail.com");
    expect(openingBalance).toBe(0);
    expect(balance).toBe(0);
    expect(fmt(balance)).toBe("US$0");
    expect(fmt(-33000, true)).toBe("-US$33,000");
    expect(fmt(27000, true)).toBe("+US$27,000");
    expect(fmt(12.5)).toBe("US$12.50");
    expect(txns).toHaveLength(18);
    expect(txns.map((transaction) => transaction.amount)).toEqual([
      -30000, 30000, -33000, 33000, -27000, 27000, -17000, 17000, -19000, 19000, -2000, 2000, -3000,
      3000, -1000, 1000, -3000, 3000,
    ]);
    expect(notifications).toHaveLength(11);
  });

  it("reconciles every running balance with consistent directions and categories", () => {
    let runningBalance = openingBalance;
    for (const transaction of [...txns].reverse()) {
      runningBalance += transaction.amount;
      expect(transaction.balanceAfter).toBe(runningBalance);
      expect(runningBalance).toBeGreaterThanOrEqual(0);
      expect(transaction.kind).toBe(
        transaction.amount > 0 ? "Money Received" : "Withdrawal to Bank",
      );
      expect(transaction.category).not.toBe("");
      expect(transaction.date).toMatch(/^[1-7] Oct 2026$/);
    }
    expect(runningBalance).toBe(balance);
    expect(
      txns
        .filter((transaction) => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    ).toBe(135000);
    expect(
      txns
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    ).toBe(-135000);
  });

  it("withdraws each receipt exactly once in chronological order", () => {
    const chronological = [...txns].reverse();
    for (let index = 0; index < chronological.length; index += 2) {
      const receipt = chronological[index]!;
      const withdrawal = chronological[index + 1]!;
      expect(receipt.kind).toBe("Money Received");
      expect(withdrawal.kind).toBe("Withdrawal to Bank");
      expect(withdrawal.amount).toBe(-receipt.amount);
      expect(withdrawal.name).toBe("Equity Bank (Kenya) Limited");
      expect(withdrawal.date).toBe(receipt.date);
      expect(receipt.balanceAfter).toBe(receipt.amount);
      expect(withdrawal.balanceAfter).toBe(0);
    }
    const days = chronological.map((transaction) => Number(transaction.date.split(" ")[0]));
    expect(days).toEqual([...days].sort((a, b) => a - b));
    expect(new Set(txns.map((transaction) => transaction.id)).size).toBe(18);
  });

  it("keeps receipt notifications aligned with the incoming ledger", () => {
    expect(
      notifications.slice(2).map(({ title, detail, age }) => ({ title, detail, age })),
    ).toEqual(
      txns
        .filter((transaction) => transaction.amount > 0)
        .map((transaction) => ({
          title: `You received ${fmt(transaction.amount)}`,
          detail: `from ${transaction.name}`,
          age: transaction.date,
        })),
    );
  });
});

describe("Local wallet interactions", () => {
  it("opens without authentication and toggles password visibility", () => {
    render(<WalletApp />);
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));
    expect(screen.getByText("US$0")).toBeInTheDocument();
    expect(screen.getByText("Money Received · Consulting")).toBeInTheDocument();
    expect(screen.getAllByText("Withdrawal to Bank · Transfer")).toHaveLength(3);
    expect(
      within(screen.getByRole("region", { name: "Recent transactions" })).getAllByRole("article"),
    ).toHaveLength(6);
  });

  it("opens full Activity through See more and filters its fixtures", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "See more" }));
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    const region = screen.getByRole("region", { name: "Completed transactions" });
    expect(within(region).getAllByRole("article")).toHaveLength(18);
    fireEvent.change(screen.getByRole("textbox", { name: "Search by name or email" }), {
      target: { value: "Acacia" },
    });
    expect(within(region).getAllByRole("article")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Filter transactions" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Transaction type" }), {
      target: { value: "Withdrawal to Bank" },
    });
    expect(screen.getByText("No transactions found.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Search by name or email" }), {
      target: { value: "" },
    });
    expect(within(region).getAllByRole("article")).toHaveLength(9);
    fireEvent.change(screen.getByRole("combobox", { name: "Transaction type" }), {
      target: { value: "Money Received" },
    });
    expect(within(region).getAllByRole("article")).toHaveLength(9);
    fireEvent.click(screen.getByRole("tab", { name: "Wallet" }));
    expect(screen.getByRole("button", { name: "Visa Debit ending in 6277" })).toBeInTheDocument();
    expect(screen.getAllByText("US$0")).toHaveLength(2);
  });

  it("keeps transfers explicitly mocked and rejects invalid amounts", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "Send/Request" }));
    fireEvent.click(screen.getByRole("button", { name: /Amara Mwangi/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Amount in USD" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview transfer" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a positive USD amount");
    fireEvent.change(screen.getByRole("textbox", { name: "Amount in USD" }), {
      target: { value: "12.50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Preview transfer" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("No money was sent");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByText("US$0")).toBeInTheDocument();
  });

  it("shows the notification and profile references and logs out locally", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Submit info to access your funds")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(11);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Profile" }));
    expect(screen.getByText("Joined PayPal in 2025")).toBeInTheDocument();
    expect(screen.getByText("Version 8.107.2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });
});
