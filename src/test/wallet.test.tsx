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
    expect(fmt(balance, false, 2)).toBe("US$0.00");
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
      expect(transaction.date).toMatch(/^\d{1,2} (Jun|Jul|Aug|Sep|Oct) 2026$/);
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
    const days = chronological.map((transaction) => Date.parse(transaction.date));
    expect(days).toEqual([...days].sort((a, b) => a - b));
    expect(new Set(txns.map((transaction) => transaction.id)).size).toBe(18);
  });

  it("spaces payment pairs two to three weeks apart across several months", () => {
    const receipts = txns.filter((transaction) => transaction.amount > 0);
    expect(receipts.slice(0, 3).map((transaction) => transaction.date)).toEqual([
      "7 Oct 2026",
      "22 Sep 2026",
      "4 Sep 2026",
    ]);
    for (let index = 1; index < receipts.length; index++) {
      const gap =
        (Date.parse(receipts[index - 1]!.date) - Date.parse(receipts[index]!.date)) / 86400000;
      expect(gap).toBeGreaterThanOrEqual(14);
      expect(gap).toBeLessThanOrEqual(21);
    }
    expect(new Set(receipts.map((transaction) => transaction.date.split(" ")[1])).size).toBe(5);
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
    expect(screen.getByText("US$0.00")).toBeInTheDocument();
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
    expect(screen.getAllByText("US$0.00")).toHaveLength(2);
  });

  it("keeps transfers explicitly mocked and rejects invalid amounts", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "Send/Request" }));
    fireEvent.click(screen.getByRole("button", { name: /Amara Mwangi/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Amount in USD" }), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a positive USD amount");
    fireEvent.change(screen.getByRole("textbox", { name: "Amount in USD" }), {
      target: { value: "12.50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("No money was sent");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByText("US$0.00")).toBeInTheDocument();
  });

  it("opens the Amount screen with recipient details, note and a functional keypad", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "Send/Request" }));
    fireEvent.click(screen.getByRole("button", { name: /Imposter Here/ }));
    expect(screen.getByRole("heading", { name: "Amount" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("main", { name: "Amount screen" })).getByText("@doersjit01"),
    ).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Currency" })).toHaveValue("USD");
    const keypad = within(screen.getByRole("group", { name: "Amount keypad" }));
    for (const key of ["1", "2", "Decimal point", "5", "0"]) {
      fireEvent.click(keypad.getByRole("button", { name: key }));
    }
    const amount = screen.getByRole("textbox", { name: "Amount in USD" });
    expect(amount).toHaveValue("12.50");
    fireEvent.click(keypad.getByRole("button", { name: "1" }));
    expect(amount).toHaveValue("12.50");
    expect(screen.getByRole("alert")).toHaveTextContent("two decimal places");
    fireEvent.click(keypad.getByRole("button", { name: "Backspace" }));
    expect(amount).toHaveValue("12.5");
    fireEvent.click(keypad.getByRole("button", { name: "Decimal point" }));
    expect(screen.getByRole("alert")).toHaveTextContent("one decimal point");
    fireEvent.change(screen.getByRole("textbox", { name: "Add a note" }), {
      target: { value: "Lunch" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Request" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Request US$12.50 from Imposter Here");
    expect(screen.getByRole("dialog")).toHaveTextContent("Lunch");
    expect(screen.getByRole("dialog")).toHaveTextContent("no request was created");
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("heading", { name: "Send and Request" })).toBeVisible();
  });

  it.each(["", "-1", "NaN", "1.234", "1e3"])("rejects invalid payment input %s", (value) => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "Send/Request" }));
    fireEvent.click(screen.getByRole("button", { name: /Imposter Here/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Amount in USD" }), {
      target: { value },
    });
    fireEvent.click(screen.getByRole("button", { name: "Request" }));
    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens receipt details from Home and restores the source view on Back", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: /View Money Received from Acacia/ }));
    const detail = within(screen.getByRole("main", { name: "Transaction Details screen" }));
    expect(detail.getByRole("heading", { name: "Acacia Digital Ltd" })).toBeVisible();
    expect(detail.getByText("+US$30,000.00")).toBeVisible();
    expect(detail.getByText("7 Oct 2026 · Completed")).toBeVisible();
    expect(detail.getByText("Fee (demo)")).toBeVisible();
    expect(detail.getByText("DEMO-2")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("region", { name: "Recent transactions" })).toBeVisible();
  });

  it("opens withdrawal details from Activity and preserves search and filters", () => {
    openHome();
    fireEvent.click(screen.getByRole("button", { name: "See more" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search by name or email" }), {
      target: { value: "Equity" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Filter transactions" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Transaction type" }), {
      target: { value: "Withdrawal to Bank" },
    });
    fireEvent.click(screen.getByRole("button", { name: /View Withdrawal.*22 Sep 2026/ }));
    expect(screen.getByText("-US$33,000.00")).toBeVisible();
    expect(screen.getByText("Total withdrawn")).toBeVisible();
    expect(screen.getByText("DEMO-3")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("textbox", { name: "Search by name or email" })).toHaveValue("Equity");
    expect(screen.getByRole("combobox", { name: "Transaction type" })).toHaveValue(
      "Withdrawal to Bank",
    );
    expect(
      within(screen.getByRole("region", { name: "Completed transactions" })).getAllByRole(
        "article",
      ),
    ).toHaveLength(9);
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
