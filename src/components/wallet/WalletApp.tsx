import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  Menu,
  Bell,
  UserRound as User,
  Store,
  ArrowDownUp,
  WalletMinimal as Wallet,
  Search,
  Info,
  QrCode,
  ChevronRight,
  SlidersHorizontal,
  Smartphone,
  Lock,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Settings,
  LifeBuoy,
  RefreshCw,
  MessagesSquare,
  LogOut,
  Copy,
  Send,
  FileText,
  BanknoteArrowDown,
  Eye,
  EyeOff,
  X,
  Delete,
  Plus,
  CheckCircle,
  ChevronDown,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import {
  txns,
  contacts,
  fmt,
  user,
  balance,
  card,
  appVersion,
  activityPeriod,
  notifications,
  invoices,
  type Txn,
  type Contact,
  type Invoice,
  type InvoiceItem,
} from "./data";
import "./wallet.css";

type Screen =
  | "login"
  | "home"
  | "send"
  | "wallet"
  | "notifications"
  | "profile"
  | "menu"
  | "invoices"
  | "invoice-create"
  | "invoice-item"
  | "invoice-tax"
  | "invoice-options"
  | "invoice-preview"
  | "invoice-success";
type WalletTab = "wallet" | "activity";
type Navigate = (screen: Screen, tab?: WalletTab) => void;
type ShowNotice = (title: string, message?: string) => void;
type OpenTransaction = (transaction: Txn) => void;
type DetailView = { type: "transaction"; transaction: Txn } | { type: "amount"; contact: Contact };

function Brand({ variant = "solid" }: { variant?: "solid" | "outline" | "notification" }) {
  return (
    <svg className={`brand brand-${variant}`} viewBox="0 0 70 84" aria-label="PayPal" role="img">
      {variant === "outline" ? (
        <g fill="none" stroke="#073477" strokeWidth="2.5" strokeLinejoin="round">
          <path d="M13 2h27c19 0 23 12 19 25-3 11-13 16-26 16H23l-4 24H3Z" />
          <path d="M27 19h22c15 0 22 10 18 23-3 11-13 18-27 18h-5l-4 23H16Z" />
        </g>
      ) : (
        <>
          <path
            fill={variant === "notification" ? "#60cdf5" : "#009cde"}
            d="M29 19h20c18 0 23 10 19 26-3 13-13 20-28 20h-5l-3 18H16l5-30Z"
          />
          <path fill="#003087" d="M14 2h25c20 0 25 11 21 27-4 15-14 22-31 22h-7l-4 26H1Z" />
          <path
            fill={variant === "notification" ? "#009cde" : "#012169"}
            d="M26 26h24c4 0 7 0 10 1-3 16-13 24-31 24h-7Z"
          />
        </>
      )}
    </svg>
  );
}

function StatusBar({ screen }: { screen: Screen }) {
  const time =
    screen === "login"
      ? "9:10"
      : ["profile", "notifications", "menu"].includes(screen)
        ? "9:08"
        : "9:07";
  return (
    <div className="status-bar" aria-label={`Time ${time}`}>
      <span>{time}</span>
      <svg viewBox="0 0 126 28" aria-hidden="true">
        <g fill="currentColor">
          <rect x="1" y="15" width="5" height="8" rx="1" />
          <rect x="9" y="11" width="5" height="12" rx="1" />
          <rect x="17" y="7" width="5" height="16" rx="1" />
          <rect x="25" y="3" width="5" height="20" rx="1" />
        </g>
        <g fill="#c8c9cc">
          <rect x="1" y="25" width="5" height="3" rx="1" />
          <rect x="9" y="25" width="5" height="3" rx="1" />
          <rect x="17" y="25" width="5" height="3" rx="1" />
          <rect x="25" y="25" width="5" height="3" rx="1" />
        </g>
        <path
          d="M44 10q12-11 24 0m-20 6q8-8 16 0m-12 5q4-4 8 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <rect
          x="80"
          y="4"
          width="40"
          height="20"
          rx="6"
          fill="none"
          stroke="#97999b"
          strokeWidth="2"
        />
        <rect x="83" y="7" width="10" height="14" rx="3" fill="currentColor" />
        <path d="M123 10v8q5-4 0-8" fill="#97999b" />
      </svg>
    </div>
  );
}

function RoundBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button className="round-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

function Toolbar({
  go,
  send = false,
  notice,
  showLogo = true,
}: {
  go: Navigate;
  send?: boolean;
  notice: ShowNotice;
  showLogo?: boolean;
}) {
  return (
    <div className="toolbar">
      <RoundBtn label="Menu" onClick={() => go("menu")}>
        <Menu />
      </RoundBtn>
      {showLogo && <Brand />}
      <div>
        {send ? (
          <RoundBtn
            label="Scan QR"
            onClick={() => notice("Scan QR", "QR scanning is unavailable in this static demo.")}
          >
            <QrCode />
          </RoundBtn>
        ) : (
          <RoundBtn label="Notifications" onClick={() => go("notifications")}>
            <Bell />
          </RoundBtn>
        )}
      </div>
    </div>
  );
}

function StoreIcon({ suggested = false }: { suggested?: boolean }) {
  return (
    <span className={`store-icon${suggested ? " suggested-icon" : ""}`}>
      <span>
        <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" aria-hidden="true">
          <path
            d="M4 14V9l3-6h22l3 6v5M4 10h28M4 14a4.7 4.7 0 0 0 9.3 0 4.7 4.7 0 0 0 9.4 0 4.7 4.7 0 0 0 9.3 0M6 18v15h24V18"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

function TxnRow({ transaction, onOpen }: { transaction: Txn; onOpen: OpenTransaction }) {
  return (
    <article className="transaction">
      <button
        className="transaction-button"
        aria-label={`View ${transaction.kind} ${transaction.amount > 0 ? "from" : "to"} ${transaction.name}, ${transaction.date}, ${fmt(transaction.amount, true)}`}
        onClick={() => onOpen(transaction)}
      >
        <div className="transaction-heading">
          <StoreIcon />
          <div>
            <h3>{transaction.name}</h3>
            <p>{transaction.status || transaction.kind}</p>
          </div>
        </div>
        <div className="transaction-summary">
          <span>{transaction.date}</span>
          <strong className={transaction.amount > 0 ? "received" : ""}>
            {fmt(transaction.amount, true)}
          </strong>
        </div>
      </button>
    </article>
  );
}

function SubHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <header className="sub-header">
      <button aria-label="Back" onClick={onBack}>
        <ArrowLeft />
      </button>
      <h1>{title}</h1>
      <div>{right}</div>
    </header>
  );
}

function SearchBox({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="search-box">
      <Search />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function Login({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  return (
    <div className="login-screen page-padding">
      <div className="login-brand">
        <Brand variant="outline" />
      </div>
      <div className="login-user">
        <img src={user.avatar} alt={user.name} />
        <div>
          <strong>{user.name}</strong>
          <p>{user.email}</p>
        </div>
        <button
          className="text-link"
          onClick={() =>
            notice("Change account", "This demo uses the fixed profile shown in the reference.")
          }
        >
          Change
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPassword("");
          go("home");
        }}
      >
        <div className="password-field">
          <label htmlFor="demo-password">Password</label>
          <input
            id="demo-password"
            type={show ? "text" : "password"}
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        </div>
        <button
          type="button"
          className="text-link forgot-password"
          onClick={() =>
            notice(
              "Forgot your password?",
              "This is a visual demo. No password is required or sent anywhere.",
            )
          }
        >
          Forgot your password?
        </button>
        <button type="submit" className="login-button">
          Log In
        </button>
      </form>
    </div>
  );
}

function HomeScreen({
  go,
  notice,
  openTransaction,
}: {
  go: Navigate;
  notice: ShowNotice;
  openTransaction: OpenTransaction;
}) {
  return (
    <div className="home-screen page-padding">
      <Toolbar go={go} notice={notice} />
      <button className="home-balance" onClick={() => go("wallet")}>
        <span className="balance-logo">
          <Brand />
        </span>
        <span>
          <strong>{fmt(balance, false, 2)}</strong>
          <span>PayPal balance</span>
        </span>
      </button>
      <button
        className="account-setup"
        onClick={() =>
          notice(
            "Set up your account",
            "3 of 4 steps completed. Account setup is mocked in this demo.",
          )
        }
      >
        <span className="setup-progress">
          <svg viewBox="0 0 88 88" aria-hidden="true">
            <circle cx="44" cy="44" r="40" fill="none" stroke="#f8f8fa" strokeWidth="5" />
            <circle
              cx="44"
              cy="44"
              r="40"
              fill="none"
              stroke="#0066eb"
              strokeWidth="5"
              strokeDasharray="75 100"
              pathLength="100"
              strokeLinecap="round"
              transform="rotate(-90 44 44)"
            />
          </svg>
          <span>3/4</span>
        </span>
        <span>
          <strong>Set up your account</strong>
          <span>A few more steps left.</span>
        </span>
      </button>
      <section className="transaction-list" aria-label="Recent transactions">
        {txns.slice(0, 6).map((transaction) => (
          <TxnRow key={transaction.id} transaction={transaction} onOpen={openTransaction} />
        ))}
        <button className="see-more text-link" onClick={() => go("wallet", "activity")}>
          See more
        </button>
      </section>
      <div className="home-action-bar">
        <button className="action-icon" onClick={() => go("send")}>
          <span className="action-icon-circle">
            <ArrowDownUp />
          </span>
          <span>Send / Request</span>
        </button>
        <button className="action-icon" onClick={() => go("wallet")}>
          <span className="action-icon-circle">
            <Wallet />
          </span>
          <span>Add card or bank</span>
        </button>
        <button className="action-icon" onClick={() => go("invoices")}>
          <span className="action-icon-circle">
            <FileText />
          </span>
          <span>Create an invoice</span>
        </button>
        <button className="action-icon" onClick={() => go("menu")}>
          <span className="action-icon-circle">
            <MoreVertical />
          </span>
          <span>More</span>
        </button>
      </div>
    </div>
  );
}

function SendScreen({
  go,
  notice,
  openAmount,
}: {
  go: Navigate;
  notice: ShowNotice;
  openAmount: (contact: Contact) => void;
}) {
  const [query, setQuery] = useState("");
  const list = contacts.filter((contact) =>
    `${contact.name} ${contact.handle}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="send-screen page-padding">
      <Toolbar go={go} notice={notice} send />
      <h1>Send and Request</h1>
      <SearchBox placeholder="Name, username or email" value={query} onChange={setQuery} />
      <section className="suggested">
        <h2>Suggested</h2>
        {list.map((contact) => (
          <button key={contact.handle} className="contact" onClick={() => openAmount(contact)}>
            <StoreIcon suggested />
            <span>
              <strong>{contact.name}</strong>
              <span>{contact.handle}</span>
            </span>
            <Info />
          </button>
        ))}
        {list.length === 0 && <p className="empty-results">No matches.</p>}
      </section>
    </div>
  );
}

function AmountScreen({
  contact,
  onBack,
  notice,
}: {
  contact: Contact;
  onBack: () => void;
  notice: ShowNotice;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const updateAmount = (next: string) => {
    setAmount(next);
    setError("");
  };
  const preview = (action: "Request" | "Send") => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || !/^\d+(\.\d{1,2})?$/.test(amount)) {
      setError("Enter a positive USD amount with no more than two decimal places.");
      input.current?.focus();
      return;
    }
    notice(
      `Demo ${action.toLowerCase()}`,
      `${action === "Send" ? "Send" : "Request"} ${fmt(value, false, 2)} ${action === "Send" ? "to" : "from"} ${contact.name} (${contact.handle}).${note.trim() ? ` Note: ${note.trim()}.` : ""} No money was sent and no request was created; your mock balance is unchanged.`,
    );
  };
  const pressKey = (key: string) => {
    if (key === "backspace") {
      updateAmount(amount.slice(0, -1));
    } else if (key === "." && amount.includes(".")) {
      setError("The amount can contain only one decimal point.");
    } else {
      const next = key === "." && amount === "" ? "0." : amount + key;
      if (!/^\d*(\.\d{0,2})?$/.test(next)) {
        setError("Use no more than two decimal places.");
      } else {
        updateAmount(next);
      }
    }
  };
  return (
    <div className="amount-screen">
      <SubHeader title="Amount" onBack={onBack} />
      <div className="amount-recipient page-padding">
        <span className="recipient-avatar" role="img" aria-label={`${contact.name} avatar`}>
          {contact.name
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </span>
        <strong>{contact.name}</strong>
        <p>{contact.handle}</p>
      </div>
      <form
        className="amount-form page-padding"
        onSubmit={(event) => {
          event.preventDefault();
          preview("Send");
        }}
      >
        <div className="amount-entry">
          <span aria-hidden="true">$</span>
          <input
            ref={input}
            aria-label="Amount in USD"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "amount-error" : undefined}
            inputMode="none"
            autoComplete="off"
            value={amount}
            onChange={(event) => updateAmount(event.target.value)}
            placeholder="0"
          />
        </div>
        <select className="currency-pill" aria-label="Currency" defaultValue="USD">
          <option value="USD">USD</option>
        </select>
        <input
          className="payment-note"
          aria-label="Add a note"
          placeholder="Add a note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        {error && (
          <p id="amount-error" role="alert" className="input-error">
            {error}
          </p>
        )}
        <div className="amount-actions">
          <button type="button" onClick={() => preview("Request")}>
            Request
          </button>
          <button type="submit">Send</button>
        </div>
      </form>
      <div className="amount-keypad page-padding" role="group" aria-label="Amount keypad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key === "backspace" ? "Backspace" : key === "." ? "Decimal point" : key}
            onClick={() => pressKey(key)}
          >
            {key === "backspace" ? <Delete /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}

function TransactionDetails({ transaction, onBack }: { transaction: Txn; onBack: () => void }) {
  const incoming = transaction.amount > 0;
  return (
    <div className="transaction-details">
      <SubHeader title="Transaction Details" onBack={onBack} />
      <div className="page-padding">
        <section className="transaction-profile">
          <StoreIcon />
          <h2>{transaction.name}</h2>
          <p>{transaction.kind}</p>
          <strong className={incoming ? "received" : ""}>{fmt(transaction.amount, true, 2)}</strong>
          <p>{transaction.date} · Completed</p>
        </section>
        <dl className="transaction-breakdown">
          <div>
            <dt>{incoming ? "From" : "To"}</dt>
            <dd>{transaction.name}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{transaction.category}</dd>
          </div>
          <div>
            <dt>Amount</dt>
            <dd>{fmt(transaction.amount, false, 2)}</dd>
          </div>
          <div>
            <dt>Fee (demo)</dt>
            <dd>{fmt(0, false, 2)}</dd>
          </div>
          <div>
            <dt>{incoming ? "Total received" : "Total withdrawn"}</dt>
            <dd>{fmt(transaction.amount, false, 2)}</dd>
          </div>
          <div>
            <dt>Balance after transaction</dt>
            <dd>{fmt(transaction.balanceAfter, false, 2)}</dd>
          </div>
          <div>
            <dt>Demo transaction ID</dt>
            <dd>DEMO-{transaction.id}</dd>
          </div>
        </dl>
        <p className="demo-caption">
          Mock transaction only. No real payment or bank transfer occurred.
        </p>
      </div>
    </div>
  );
}

function PaymentIcon() {
  return (
    <span className="payment-icon">
      <Smartphone />
      <Lock />
    </span>
  );
}

function WalletScreen({
  initialTab,
  notice,
  openTransaction,
}: {
  initialTab: WalletTab;
  notice: ShowNotice;
  openTransaction: OpenTransaction;
}) {
  const [tab, setTab] = useState<WalletTab>(initialTab);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const filtered = txns.filter(
    (transaction) =>
      transaction.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || transaction.kind === filter),
  );
  return (
    <div className="wallet-screen page-padding">
      <div className="wallet-tabs" role="tablist" aria-label="Wallet views">
        {(["wallet", "activity"] as const).map((value) => (
          <button
            key={value}
            id={`tab-${value}`}
            role="tab"
            aria-selected={tab === value}
            aria-controls="wallet-panel"
            onClick={() => setTab(value)}
          >
            {value === "wallet" ? "Wallet" : "Activity"}
          </button>
        ))}
      </div>
      <div id="wallet-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "wallet" ? (
          <div className="wallet-content">
            <section className="wallet-balance">
              <div>
                <span>
                  <Brand />
                  PayPal balance
                </span>
                <strong>{fmt(balance, false, 2)}</strong>
              </div>
              <h1>{fmt(balance, false, 2)}</h1>
            </section>
            <div className="banks-heading">
              <h2>Banks and cards</h2>
              <button
                onClick={() =>
                  notice("Add new", "Banks and cards are static fixtures in this demo.")
                }
              >
                Add new <ChevronRight />
              </button>
            </div>
            <button
              className="bank-card"
              aria-label={`Visa ${card.type} ending in ${card.lastFour}`}
              onClick={() =>
                notice(
                  "Visa",
                  `${card.bank} ${card.type} ending in ${card.lastFour}. Demo card only.`,
                )
              }
            >
              <span className="card-block-one" />
              <span className="card-block-two" />
              <strong className="card-number">•• {card.lastFour}</strong>
              <strong className="visa">VISA</strong>
            </button>
            <h2 className="preferences-heading">Preferences</h2>
            <button
              className="purchase-preference"
              onClick={() =>
                notice(
                  "Online purchases",
                  `${card.bank} ${card.type} ••••${card.lastFour} is the mock preferred payment method.`,
                )
              }
            >
              <PaymentIcon />
              <span>
                <strong>Online purchases</strong>
                <span>
                  {card.bank}
                  <br />
                  {card.type} ••••{card.lastFour}
                </span>
              </span>
            </button>
          </div>
        ) : (
          <div className="activity-content">
            <div className="activity-search">
              <SearchBox placeholder="Search by name or email" value={query} onChange={setQuery} />
              <button
                aria-label="Filter transactions"
                aria-expanded={showFilters}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal />
              </button>
            </div>
            {showFilters && (
              <label className="activity-filter">
                Transaction type
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">All</option>
                  <option value="Withdrawal to Bank">Withdrawal to Bank</option>
                  <option value="Money Received">Money Received</option>
                </select>
              </label>
            )}
            <h2>Completed</h2>
            <p className="activity-month">{activityPeriod}</p>
            <section className="transaction-list" aria-label="Completed transactions">
              {filtered.map((transaction) => (
                <TxnRow key={transaction.id} transaction={transaction} onOpen={openTransaction} />
              ))}
              {filtered.length === 0 && <p className="empty-results">No transactions found.</p>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Notifications({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  return (
    <div className="notifications-screen">
      <SubHeader
        title="Notifications"
        onBack={() => go("home")}
        right={
          <button
            aria-label="Notification options"
            onClick={() =>
              notice("Notifications", "These notifications are fixed screenshot fixtures.")
            }
          >
            <MoreVertical />
          </button>
        }
      />
      <div className="page-padding">
        <span className="all-notifications">All</span>
      </div>
      <div className="notification-list page-padding">
        {notifications.map((notification, index) => (
          <article key={index} className={`notification${notification.read ? " is-read" : ""}`}>
            <span className="notification-logo">
              <Brand variant="notification" />
            </span>
            <div>
              <h2>{notification.title}</h2>
              <p>{notification.detail}</p>
              <span>{notification.age}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Profile({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  const links: { icon: LucideIcon; label: string }[] = [
    { icon: LifeBuoy, label: "Help" },
    { icon: RefreshCw, label: "Subscriptions" },
    { icon: MessagesSquare, label: "Message Center" },
  ];
  return (
    <div className="profile-screen">
      <SubHeader title="Profile" onBack={() => go("home")} />
      <div className="page-padding">
        <section className="profile-card">
          <svg
            className="profile-banner"
            viewBox="0 0 683 162"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path fill="#7718cf" d="M0 0h683v162H0z" />
            <path fill="#5d08ad" d="M0 68Q168-48 305 84T683 96v66H0Z" />
            <path
              fill="#9136e4"
              fillOpacity=".75"
              d="M277 162C419 126 511 8 571 45Q628 70 683 77v85Z"
            />
          </svg>
          <div className="profile-details">
            <div className="profile-avatar">
              <img src={user.avatar} alt={user.name} />
              <button
                aria-label="Edit profile photo"
                onClick={() =>
                  notice(
                    "Profile photo",
                    "The avatar is a local image from the supplied reference.",
                  )
                }
              >
                <Pencil />
              </button>
            </div>
            <h2>{user.name}</h2>
            <p>Joined PayPal in {user.joined}</p>
            <div className="profile-actions">
              <button onClick={() => notice("Contact info", user.email)}>
                <User />
                Contact info
              </button>
              <button
                onClick={() =>
                  notice("Settings", "Settings are not connected to an account in this demo.")
                }
              >
                <Settings />
                Settings
              </button>
            </div>
          </div>
        </section>
        <div className="profile-links">
          {links.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() =>
                label === "Message Center"
                  ? go("notifications")
                  : notice(label, "This feature is a local visual demo.")
              }
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
        <button className="logout" onClick={() => go("login")}>
          <LogOut />
          Log out
        </button>
        <div className="profile-footer">
          <button
            className="text-link"
            onClick={() =>
              notice(
                "Legal agreements",
                "This is an independent static UI demo, not a PayPal service.",
              )
            }
          >
            Legal agreements
          </button>
          <p>Version {appVersion}</p>
        </div>
      </div>
    </div>
  );
}

function InvoicesListScreen({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Active");
  const [status, setStatus] = useState("All");
  const filtered = invoices.filter(
    (invoice) =>
      invoice.email.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" || (filter === "Active" && invoice.status === "Unpaid")) &&
      (status === "All" || invoice.status === status),
  );

  return (
    <div className="invoices-screen page-padding">
      <Toolbar go={go} notice={notice} />
      <h1>Invoices</h1>
      <div className="invoice-filters">
        <SearchBox placeholder="Search invoices" value={search} onChange={setSearch} />
        <div className="filter-dropdowns">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="Active">Filter: Active</option>
            <option value="All">Filter: All</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">Status: All</option>
            <option value="Unpaid">Status: Unpaid</option>
            <option value="Paid">Status: Paid</option>
            <option value="Canceled">Status: Canceled</option>
          </select>
        </div>
      </div>
      <section className="invoice-list">
        {filtered.map((invoice) => (
          <article key={invoice.id} className="invoice-item">
            <button
              className="invoice-item-button"
              onClick={() => notice("Invoice", `Invoice ${invoice.number} for ${invoice.email}`)}
            >
              <div className="invoice-item-header">
                <span className="invoice-email">{invoice.email}</span>
                <span className={`invoice-status ${invoice.status.toLowerCase()}`}>
                  {invoice.statusDetail}
                </span>
              </div>
              <div className="invoice-item-footer">
                <span>{invoice.date}</span>
                <strong>{fmt(invoice.amount, true)}</strong>
              </div>
            </button>
          </article>
        ))}
        {filtered.length === 0 && <p className="empty-results">No invoices found.</p>}
      </section>
      <button
        className="fab"
        aria-label="Create new invoice"
        onClick={() => go("invoice-create")}
      >
        <Plus />
      </button>
    </div>
  );
}

function InvoicePreviewScreen({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  const total = 190;
  const subtotal = 190;
  const tax = 0;
  const discount = 0;

  return (
    <div className="invoice-preview-screen page-padding">
      <SubHeader title="Preview Invoice" onBack={() => go("invoice-create")} />
      <div className="invoice-preview-content">
        <div className="invoice-amount">
          <span>Amount Due</span>
          <strong>${total.toFixed(2)} USD</strong>
        </div>
        <div className="invoice-details">
          <div className="invoice-detail-row">
            <span>Bill to</span>
            <strong>client@example.com</strong>
          </div>
          <div className="invoice-detail-row">
            <span>Invoice number</span>
            <strong>0001</strong>
          </div>
          <div className="invoice-detail-row">
            <span>Invoice date</span>
            <strong>7 Oct 2026</strong>
          </div>
          <div className="invoice-detail-row">
            <span>Due date</span>
            <strong>Due on receipt</strong>
          </div>
        </div>
        <div className="invoice-line-items">
          <h3>Items</h3>
          <div className="line-item">
            <div className="line-item-info">
              <strong>Web Design Services</strong>
              <span>Homepage redesign</span>
            </div>
            <strong>$150.00</strong>
          </div>
          <div className="line-item">
            <div className="line-item-info">
              <strong>Consulting</strong>
              <span>Technical consultation</span>
            </div>
            <strong>$40.00</strong>
          </div>
        </div>
        <div className="invoice-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          {tax > 0 && (
            <div className="total-row">
              <span>Tax</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>
          )}
          {discount > 0 && (
            <div className="total-row discount">
              <span>Discount</span>
              <strong>-${discount.toFixed(2)}</strong>
            </div>
          )}
          <div className="total-row final">
            <span>Total</span>
            <strong>${total.toFixed(2)} USD</strong>
          </div>
        </div>
        <button
          className="send-invoice-btn"
          onClick={() => go("invoice-success")}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function InvoiceSuccessScreen({ go }: { go: Navigate }) {
  return (
    <div className="invoice-success-screen page-padding">
      <div className="success-content">
        <div className="success-icon">
          <CheckCircle />
        </div>
        <h2>Your invoice has been sent.</h2>
        <p>Invoice 0001 has been sent to client@example.com</p>
        <button className="done-btn" onClick={() => go("invoices")}>
          Done
        </button>
      </div>
    </div>
  );
}

function InvoiceCreateScreen({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  const [step, setStep] = useState<"item" | "tax" | "options">("item");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [taxes, setTaxes] = useState<{ label: string; rate: number; description?: string }[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<InvoiceItem>>({
    name: "",
    description: "",
    price: 0,
    quantity: 1,
  });
  const [currentTax, setCurrentTax] = useState({ label: "", rate: 0, description: "" });
  const [options, setOptions] = useState({
    terms: "",
    invoiceNumber: "0001",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "Due on receipt",
    reference: "",
    allowPartial: false,
  });

  const addItem = () => {
    if (currentItem.name && currentItem.price) {
      setItems([...items, currentItem as InvoiceItem]);
      setCurrentItem({ name: "", description: "", price: 0, quantity: 1 });
    }
  };

  const addTax = () => {
    if (currentTax.label && currentTax.rate) {
      setTaxes([...taxes, currentTax]);
      setCurrentTax({ label: "", rate: 0, description: "" });
    }
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxTotal = taxes.reduce((sum, tax) => sum + (subtotal * tax.rate) / 100, 0);
    return subtotal + taxTotal;
  };

  return (
    <div className="invoice-create-screen page-padding">
      <SubHeader title="Create Invoice" onBack={() => go("invoices")} />
      {step === "item" && (
        <div className="invoice-form-section">
          <h2>Add New Item</h2>
          <div className="form-field">
            <label>Item name/service</label>
            <input
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              placeholder="Enter item name"
            />
          </div>
          <div className="form-field">
            <label>Detailed description</label>
            <textarea
              value={currentItem.description}
              onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              placeholder="Enter description"
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Price (USD)</label>
              <input
                type="number"
                value={currentItem.price || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, price: Number(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div className="form-field">
              <label>Quantity</label>
              <input
                type="number"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                min="1"
              />
            </div>
          </div>
          <div className="form-field">
            <label>Tax</label>
            <select
              value={currentItem.tax || ""}
              onChange={(e) => setCurrentItem({ ...currentItem, tax: Number(e.target.value) })}
            >
              <option value="">No tax</option>
              {taxes.map((tax, index) => (
                <option key={index} value={tax.rate}>
                  {tax.label} ({tax.rate}%)
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Discount</label>
            <div className="discount-toggle">
              <button
                type="button"
                className={!currentItem.discount ? "active" : ""}
                onClick={() => setCurrentItem({ ...currentItem, discount: undefined })}
              >
                None
              </button>
              <button
                type="button"
                className={typeof currentItem.discount === "number" ? "active" : ""}
                onClick={() => setCurrentItem({ ...currentItem, discount: 0 })}
              >
                USD
              </button>
              <button
                type="button"
                className={typeof currentItem.discount === "number" ? "active" : ""}
                onClick={() => setCurrentItem({ ...currentItem, discount: 0 })}
              >
                %
              </button>
            </div>
            {typeof currentItem.discount === "number" && (
              <input
                type="number"
                value={currentItem.discount}
                onChange={(e) => setCurrentItem({ ...currentItem, discount: Number(e.target.value) })}
                placeholder="0"
              />
            )}
          </div>
          <div className="form-field checkbox-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
              />
              Save item for future invoices
            </label>
          </div>
          <div className="form-actions">
            <button onClick={() => setStep("tax")}>Add Tax</button>
            <button onClick={addItem}>Save Item</button>
          </div>
          {items.length > 0 && (
            <div className="items-list">
              <h3>Added Items</h3>
              {items.map((item, index) => (
                <div key={index} className="item-summary">
                  <span>{item.name}</span>
                  <span>{fmt(item.price * item.quantity, false, 2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === "tax" && (
        <div className="invoice-form-section">
          <h2>Add New Tax</h2>
          <div className="form-field">
            <label>Tax label</label>
            <input
              value={currentTax.label}
              onChange={(e) => setCurrentTax({ ...currentTax, label: e.target.value })}
              placeholder="e.g., VAT"
            />
          </div>
          <div className="form-field">
            <label>Tax rate (%)</label>
            <input
              type="number"
              value={currentTax.rate || ""}
              onChange={(e) => setCurrentTax({ ...currentTax, rate: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="form-field">
            <label>Tax description (optional)</label>
            <textarea
              value={currentTax.description}
              onChange={(e) => setCurrentTax({ ...currentTax, description: e.target.value })}
              placeholder="Enter description"
              rows={2}
            />
          </div>
          <div className="form-field checkbox-field">
            <label className="checkbox-label">
              <input type="checkbox" checked={false} onChange={() => {}} />
              Save this tax for future invoices
            </label>
          </div>
          <div className="form-actions">
            <button onClick={() => setStep("item")}>Back</button>
            <button onClick={addTax}>Save Tax</button>
          </div>
          {taxes.length > 0 && (
            <div className="taxes-list">
              <h3>Added Taxes</h3>
              {taxes.map((tax, index) => (
                <div key={index} className="tax-summary">
                  <span>{tax.label}</span>
                  <span>{tax.rate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === "options" && (
        <div className="invoice-form-section">
          <h2>More Options</h2>
          <div className="form-field">
            <label>Terms & conditions</label>
            <textarea
              value={options.terms}
              onChange={(e) => setOptions({ ...options, terms: e.target.value })}
              placeholder="Enter terms and conditions"
              rows={4}
            />
          </div>
          <div className="form-field">
            <label>Invoice number</label>
            <input
              value={options.invoiceNumber}
              onChange={(e) => setOptions({ ...options, invoiceNumber: e.target.value })}
              placeholder="0001"
            />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Invoice date</label>
              <input
                type="date"
                value={options.invoiceDate}
                onChange={(e) => setOptions({ ...options, invoiceDate: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>Due date</label>
              <select
                value={options.dueDate}
                onChange={(e) => setOptions({ ...options, dueDate: e.target.value })}
              >
                <option value="Due on receipt">Due on receipt</option>
                <option value="No due date">No due date</option>
                <option value="Due in 10 days">Due in 10 days</option>
                <option value="Due in 15 days">Due in 15 days</option>
                <option value="Due in 30 days">Due in 30 days</option>
                <option value="Due in 45 days">Due in 45 days</option>
                <option value="Due in 60 days">Due in 60 days</option>
                <option value="Due in 90 days">Due in 90 days</option>
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Reference (optional)</label>
            <input
              value={options.reference}
              onChange={(e) => setOptions({ ...options, reference: e.target.value })}
              placeholder="Enter reference"
            />
          </div>
          <div className="form-field checkbox-field">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.allowPartial}
                onChange={(e) => setOptions({ ...options, allowPartial: e.target.checked })}
              />
              Allow partial payments
            </label>
          </div>
          <div className="form-field">
            <label>Attach files</label>
            <div className="file-dropzone">
              <p>Drag and drop files here or click to upload</p>
            </div>
          </div>
          <div className="form-actions">
            <button onClick={() => setStep("tax")}>Back</button>
            <button onClick={() => go("invoice-preview")}>Preview Invoice</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuScreen({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  const groups: {
    title: string;
    items: { icon: LucideIcon | typeof PaymentIcon; label: string; to?: Screen }[];
  }[] = [
    {
      title: "Manage finances",
      items: [
        { icon: RefreshCw, label: "Subscriptions" },
        { icon: PaymentIcon, label: "Payment preferences", to: "wallet" },
        { icon: Copy, label: "Add banks and cards", to: "wallet" },
        { icon: Store, label: "Linked businesses" },
      ],
    },
    {
      title: "Send and pay",
      items: [
        { icon: Send, label: "Send to a PayPal account", to: "send" },
        { icon: FileText, label: "Pay bills", to: "send" },
      ],
    },
    { title: "Get paid", items: [{ icon: BanknoteArrowDown, label: "Request money", to: "send" }] },
    {
      title: "Profile and support",
      items: [
        { icon: User, label: "Your Profile", to: "profile" },
        { icon: Wallet, label: "Your wallet", to: "wallet" },
      ],
    },
  ];
  return (
    <div className="menu-screen">
      <SubHeader title="Menu" onBack={() => go("home")} />
      <div className="page-padding">
        {groups.map((group) => (
          <section className="menu-group" key={group.title}>
            <h2>{group.title}</h2>
            <div>
              {group.items.map(({ icon: Icon, label, to }) => (
                <button
                  key={label}
                  onClick={() =>
                    to ? go(to) : notice(label, "This feature is a local visual demo.")
                  }
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ screen, go }: { screen: Screen; go: Navigate }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <button
        className="action-icon"
        aria-current={screen === "send" ? "page" : undefined}
        onClick={() => go("send")}
      >
        <span className="action-icon-circle">
          <ArrowDownUp />
        </span>
        <span>Send / Request</span>
      </button>
      <button
        className="action-icon"
        onClick={() => go("wallet")}
      >
        <span className="action-icon-circle">
          <Wallet />
        </span>
        <span>Add card or bank</span>
      </button>
      <button
        className="action-icon"
        onClick={() => go("invoices")}
      >
        <span className="action-icon-circle">
          <FileText />
        </span>
        <span>Create an invoice</span>
      </button>
      <button
        className="action-icon"
        onClick={() => go("menu")}
      >
        <span className="action-icon-circle">
          <MoreVertical />
        </span>
        <span>More</span>
      </button>
    </nav>
  );
}

export function WalletApp() {
  const [screen, setScreen] = useState<Screen>("login");
  const [walletTab, setWalletTab] = useState<WalletTab>("wallet");
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const [detail, setDetail] = useState<DetailView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const focusDetail = useCallback((element: HTMLElement | null) => element?.focus(), []);
  const openDetail = (next: DetailView) => {
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDetail(next);
  };
  const closeDetail = () => {
    setDetail(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  };
  const openTransaction: OpenTransaction = (transaction) =>
    openDetail({ type: "transaction", transaction });
  const tabbed = screen === "send" || screen === "wallet" || screen === "menu";
  const go: Navigate = (next, tab = "wallet") => {
    setIsLoading(true);
    setTimeout(() => {
      setWalletTab(tab);
      setScreen(next);
      setTimeout(() => setIsLoading(false), 300);
    }, 100);
  };
  const showNotice: ShowNotice = (title, message = "This feature is a local visual demo.") =>
    setNotice({ title, message });
  return (
    <div className="wallet-viewport">
      <div className={`wallet-app screen-${detail?.type ?? screen}`}>
        <StatusBar screen={screen} />
        {isLoading && <div className="loading-progress-bar" />}
        <main
          key={screen}
          hidden={detail !== null}
          className="screen-content"
          aria-label={`${screen} screen`}
        >
          {screen === "login" && <Login go={go} notice={showNotice} />}
          {screen === "home" && (
            <HomeScreen go={go} notice={showNotice} openTransaction={openTransaction} />
          )}
          {screen === "send" && (
            <SendScreen
              go={go}
              notice={showNotice}
              openAmount={(contact) => openDetail({ type: "amount", contact })}
            />
          )}
          {screen === "wallet" && (
            <WalletScreen
              initialTab={walletTab}
              notice={showNotice}
              openTransaction={openTransaction}
            />
          )}
          {screen === "notifications" && <Notifications go={go} notice={showNotice} />}
          {screen === "profile" && <Profile go={go} notice={showNotice} />}
          {screen === "menu" && <MenuScreen go={go} notice={showNotice} />}
          {screen === "invoices" && <InvoicesListScreen go={go} notice={showNotice} />}
          {screen === "invoice-create" && <InvoiceCreateScreen go={go} notice={showNotice} />}
          {screen === "invoice-preview" && <InvoicePreviewScreen go={go} notice={showNotice} />}
          {screen === "invoice-success" && <InvoiceSuccessScreen go={go} />}
        </main>
        {detail && (
          <main
            className="screen-content"
            aria-label={detail.type === "amount" ? "Amount screen" : "Transaction Details screen"}
            tabIndex={-1}
            ref={focusDetail}
          >
            {detail.type === "amount" ? (
              <AmountScreen contact={detail.contact} onBack={closeDetail} notice={showNotice} />
            ) : (
              <TransactionDetails transaction={detail.transaction} onBack={closeDetail} />
            )}
          </main>
        )}
        {tabbed && !detail && <BottomNav screen={screen} go={go} />}
        {notice && (
          <div className="mock-overlay">
            <section
              className="mock-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="notice-title"
            >
              <h2 id="notice-title">{notice.title}</h2>
              <p>{notice.message}</p>
              <button className="mock-primary" autoFocus onClick={() => setNotice(null)}>
                Close
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
