import { useState, type ReactNode } from "react";
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
  activityMonth,
  notifications,
  type Txn,
} from "./data";
import "./wallet.css";

type Screen = "login" | "home" | "send" | "wallet" | "notifications" | "profile" | "menu";
type WalletTab = "wallet" | "activity";
type Navigate = (screen: Screen, tab?: WalletTab) => void;
type ShowNotice = (title: string, message?: string) => void;

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
}: {
  go: Navigate;
  send?: boolean;
  notice: ShowNotice;
}) {
  return (
    <div className="toolbar">
      <RoundBtn label="Menu" onClick={() => go("menu")}>
        <Menu />
      </RoundBtn>
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
        <RoundBtn label="Profile" onClick={() => go("profile")}>
          <User />
        </RoundBtn>
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

function TxnRow({ transaction }: { transaction: Txn }) {
  return (
    <article className="transaction">
      <div className="transaction-heading">
        <StoreIcon />
        <div>
          <h3>{transaction.name}</h3>
          <p>{transaction.date}</p>
        </div>
      </div>
      <div className="transaction-summary">
        <span>
          {transaction.kind} · {transaction.category}
        </span>
        <strong className={transaction.amount > 0 ? "received" : ""}>
          {fmt(transaction.amount, true)}
        </strong>
      </div>
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

function HomeScreen({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  return (
    <div className="home-screen page-padding">
      <Toolbar go={go} notice={notice} />
      <button className="home-balance" onClick={() => go("wallet")}>
        <span className="balance-logo">
          <Brand />
        </span>
        <span>
          <strong>{fmt(balance)}</strong>
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
          <TxnRow key={transaction.id} transaction={transaction} />
        ))}
        <button className="see-more text-link" onClick={() => go("wallet", "activity")}>
          See more
        </button>
      </section>
    </div>
  );
}

function SendScreen({ go, notice }: { go: Navigate; notice: ShowNotice }) {
  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
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
          <button
            key={contact.handle}
            className="contact"
            onClick={() => setRecipient(contact.name)}
          >
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
      {recipient && (
        <div className="mock-overlay">
          <form
            className="mock-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-title"
            onSubmit={(event) => {
              event.preventDefault();
              const value = Number(amount);
              if (!Number.isFinite(value) || value <= 0 || !/^\d+(\.\d{1,2})?$/.test(amount)) {
                setError("Enter a positive USD amount with no more than two decimal places.");
                return;
              }
              setRecipient(null);
              setAmount("");
              setError("");
              notice(
                "Demo transfer",
                `${fmt(value)} to ${recipient}. No money was sent; your mock balance is unchanged.`,
              );
            }}
          >
            <button
              className="dialog-close"
              type="button"
              aria-label="Close"
              onClick={() => {
                setRecipient(null);
                setError("");
              }}
            >
              <X />
            </button>
            <h2 id="send-title">Send to {recipient}</h2>
            <p>Demo only. No money will be sent.</p>
            <label className="amount-field">
              USD
              <input
                aria-label="Amount in USD"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </label>
            {error && (
              <p role="alert" className="input-error">
                {error}
              </p>
            )}
            <button className="mock-primary">Preview transfer</button>
          </form>
        </div>
      )}
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

function WalletScreen({ initialTab, notice }: { initialTab: WalletTab; notice: ShowNotice }) {
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
                <strong>{fmt(balance)}</strong>
              </div>
              <h1>{fmt(balance)}</h1>
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
            <p className="activity-month">{activityMonth}</p>
            <section className="transaction-list" aria-label="Completed transactions">
              {filtered.map((transaction) => (
                <TxnRow key={transaction.id} transaction={transaction} />
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
      <button aria-current={screen === "home" ? "page" : undefined} onClick={() => go("home")}>
        <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M1 20 20 3l19 17M6 17v19h28V17M1 36h38M16 36V24h8v12" strokeLinejoin="round" />
        </svg>
        <span>Home</span>
      </button>
      <button
        className="send-nav"
        aria-current={screen === "send" ? "page" : undefined}
        onClick={() => go("send")}
      >
        <span className="send-nav-icon">
          <ArrowDownUp />
        </span>
        <span>Send/Request</span>
      </button>
      <button aria-current={screen === "wallet" ? "page" : undefined} onClick={() => go("wallet")}>
        <Wallet />
        <span>Wallet</span>
      </button>
    </nav>
  );
}

export function WalletApp() {
  const [screen, setScreen] = useState<Screen>("login");
  const [walletTab, setWalletTab] = useState<WalletTab>("wallet");
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  const tabbed = screen === "home" || screen === "send" || screen === "wallet";
  const go: Navigate = (next, tab = "wallet") => {
    setWalletTab(tab);
    setScreen(next);
  };
  const showNotice: ShowNotice = (title, message = "This feature is a local visual demo.") =>
    setNotice({ title, message });
  return (
    <div className="wallet-viewport">
      <div className={`wallet-app screen-${screen}`}>
        <StatusBar screen={screen} />
        <main key={screen} className="screen-content" aria-label={`${screen} screen`}>
          {screen === "login" && <Login go={go} notice={showNotice} />}
          {screen === "home" && <HomeScreen go={go} notice={showNotice} />}
          {screen === "send" && <SendScreen go={go} notice={showNotice} />}
          {screen === "wallet" && <WalletScreen initialTab={walletTab} notice={showNotice} />}
          {screen === "notifications" && <Notifications go={go} notice={showNotice} />}
          {screen === "profile" && <Profile go={go} notice={showNotice} />}
          {screen === "menu" && <MenuScreen go={go} notice={showNotice} />}
        </main>
        {tabbed && <BottomNav screen={screen} go={go} />}
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
