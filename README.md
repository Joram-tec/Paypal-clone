# Pesa Wallet — mobile money demo

A mock mobile money wallet: login screen, balance, send/request, wallet cards and
activity, all in USD. The wallet shows US$0, with nine mock receipts each paired
with an equal bank withdrawal (US$135,000 in and out). No real payments, no real
logins, and nothing is sent anywhere.

Built with React, TanStack Start and Tailwind CSS. Requires **Node.js 22 or newer**.
Deployment uses **Bun 1.4.2** and the committed lockfile for reproducible installs.

---

## 1. Put this code on your GitHub

### Option A — let Lovable keep it in sync (easiest)

1. In Lovable, open **Project settings → Git → GitHub** (or the **+** menu next to the
   chat box → **GitHub**).
2. Authorize the Lovable GitHub App and pick the account or organization.
3. Click **Create Repository**. Lovable makes a private repo on your GitHub and copies
   every file into it, including the `.github/workflows/deploy.yml` deploy recipe.
4. From then on, every change you make in Lovable is committed and pushed automatically,
   and anything you push to that branch shows up back in Lovable.

### Option B — push it yourself

From the folder that holds this code:

```sh
git init
git add .
git commit -m "Pesa Wallet demo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/pesa-wallet.git
git push -u origin main
```

Create the empty repository on github.com first (don't add a README to it), and swap
`YOUR-USERNAME/pesa-wallet` for your own GitHub name and the repo name you chose.

---

## 2. Turn on the deploy (once)

1. Open the repository on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's all. From now on every push to the `main` branch runs the workflow in
`.github/workflows/deploy.yml`: it installs the packages, builds the site, checks the
build output, and publishes it to GitHub Pages.

Your site lands at `https://YOUR-USERNAME.github.io/pesa-wallet/` — the repo name is
the web address, so rename the repo if you want a different link.

If your default branch is called something other than `main`, change the `branches:
[main]` line at the top of `.github/workflows/deploy.yml`.

---

## 3. Make a change and see it live

**Working in Lovable:** edit the app, and Lovable pushes the change to GitHub on its
own. Open the repo's **Actions** tab to watch the deploy, or click the **Deploy to
GitHub Pages** job. When it goes green, refresh your Pages URL.

**Working from your own computer:**

```sh
git pull
# edit files in src/
git add .
git commit -m "what you changed"
git push
```

The push triggers the deploy the same way. Allow about a minute, then reload the Pages
URL (hard-refresh with Ctrl+Shift+R / Cmd+Shift+R so you don't see a cached copy).

---

## 4. Check it works

**On your computer:**

```sh
npx --yes bun@1.4.2 install --frozen-lockfile
npm run dev          # live preview at the printed URL, usually http://localhost:5173
npm run lint         # code checks
npm run test         # automated tests
npm run build:pages  # builds the static site into dist/
```

`npm run dev` is the fastest way to check a change — the page updates as you save.
`npm run build:pages` is the build the deploy uses. A successful local build
checks the bundle; publishing also requires GitHub Pages to be enabled and
the workflow to have deployment permissions.

**On GitHub:** the **Actions** tab shows every deploy. Green check = published;
a red cross = the build failed, and opening the run tells you which step broke.

**On the live site:** open the URL, tap **Log In**, then move through Home,
Send/Request and Wallet. The bottom bar should highlight the tab you're on.

---

## Install on your phone

The GitHub Pages version is a Progressive Web App at
<https://joram-tec.github.io/Paypal-clone/>.

- **Android (Chrome):** open the site, then choose **Install app** or
  **Add to Home screen** from the browser menu.
- **iPhone/iPad (Safari):** open the site, tap **Share → Add to Home Screen**,
  leave **Open as Web App** enabled if shown, then tap **Add**. iOS does not show
  an automatic install prompt.

Launch the home-screen icon to use the wallet in its own standalone window.
Installation requires HTTPS (or localhost for development). After the first online
visit finishes caching, the demo screens also load offline. Only static app files
are cached; this does not add real payments or persist wallet changes.
New versions become active after all open app windows/tabs are closed and reopened;
an update will not forcibly reload an in-progress interaction.

`npm run build:pages` defaults to `/Paypal-clone/`. To check installation locally,
run `npm run build:pages` followed by
`npm run preview -- --config vite.pages.config.ts`, then open the printed address
with `/Paypal-clone/` appended. The development server does not install a service worker.
If deploying under another path, set `BASE_PATH` and update `id`, `start_url`, and
`scope` in `public/manifest.json` to match. Lovable's server build is unchanged.

---

## What's in here

| Path | What it does |
| --- | --- |
| `src/components/wallet/WalletApp.tsx` | Every screen of the wallet app |
| `src/components/wallet/data.ts` | The made-up balance, contacts and transactions |
| `src/styles.css` | Colours, fonts and spacing |
| `pages/` | Entry point for the static GitHub Pages build |
| `vite.pages.config.ts` | Build recipe for that static version (`npm run build:pages`) |
| `public/manifest.json` | App identity, standalone display and installation icons |
| `public/icons/` | Android app icons and the iOS home-screen icon |
| `.github/workflows/deploy.yml` | The automatic deploy to GitHub Pages |

The normal `npm run build` still produces the version Lovable hosts, so nothing here
gets in the way of continuing to work in Lovable.
