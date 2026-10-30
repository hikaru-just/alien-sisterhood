# Alien Sisterhood website

A plain HTML/CSS site, ready for GitHub Pages. No build step, nothing to install.

## Pages

| Page | File | Notes |
|---|---|---|
| Home | `index.html` | |
| Stories & Art | `work/index.html` | Combines the old Essay Portfolio and Art Portfolio, with filters |
| Zines | `shop/index.html` | Was "Shop" |
| About + Contact | `about/index.html` | Contact form lives at the bottom (`about/index.html#contact`) |
| Journal | `blogs/` | Kept for search traffic, not in the menu (linked from the footer) |
| Not found | `404.html` | |

Old Squarespace addresses (`/essayportfolio`, `/artportfolio`, `/contact`, `/cart`, the old blog post) redirect to the new pages, so existing links and search results keep working.

## Put it on GitHub Pages

1. On github.com, create a new **public** repository (for example `aliensisterhood`).
2. Click **Add file → Upload files** and drag in everything inside this folder (not the folder itself). Commit.
3. Go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
4. After a minute the site is live at `https://<username>.github.io/<repo>/`.

### Use aliensisterhood.com

1. In **Settings → Pages → Custom domain**, enter `www.aliensisterhood.com` and save. (GitHub adds a `CNAME` file.)
2. At the domain registrar (wherever the domain is managed; if it was bought through Squarespace, it is in Squarespace's Domains panel), set:
   - `CNAME` record: `www` → `<username>.github.io`
   - `A` records for the bare domain (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Back in Settings → Pages, tick **Enforce HTTPS** once it becomes available (can take up to a day).

## Before cancelling Squarespace

- [ ] **Images.** Most portfolio images still load from Squarespace's servers. Run `python3 tools/download-images.py` from this folder to copy them all locally and update the pages, then upload the changed files.
- [ ] **Zine checkout.** Add the Stripe payment links (below).
- [ ] **Domain.** If the domain is registered through Squarespace, either keep it there and just change the DNS records, or transfer it out first.

## Zine checkout (Stripe payment links)

1. Sign in at dashboard.stripe.com (or create an account and finish the business and bank details).
2. Go to **Product catalog → Add product** and create one product per zine (name, $5.00, a cover image).
3. Go to **Payment links → New**, pick the product. Turn on **Collect customers' email** if it isn't already on (it usually is), and, for paper zines, **Collect customers' addresses**. Create the link.
4. Copy each link (it starts with `https://buy.stripe.com/`) into `PAY_LINKS` at the top of `assets/site.js`.

Until a link is filled in, that zine's button says "Ask to buy" and goes to the contact form. Each sale shows up in Stripe with the buyer's email, so you know where to send the zine.

## Contact form (Formspree)

Without setup, "Send message" opens the visitor's email app with the message filled in.
To receive messages straight to email instead:

1. Go to formspree.io and sign up with `hikarujustart@gmail.com` (the free plan allows 50 messages a month). Confirm the email Formspree sends.
2. Click **+ Add New → New Form**, name it "Website contact", and keep the email as `hikarujustart@gmail.com`.
3. The form page shows an endpoint like `https://formspree.io/f/xqkrabcd`. Copy the part after `/f/` (here `xqkrabcd`).
4. Already done: the site uses form `xgaazjpy`. To switch forms later, change `FORMSPREE_ID` at the top of `assets/site.js`.
5. Send a test message from the live site. The first one asks you to confirm in Formspree; after that, messages arrive in Gmail.

## Newsletter

The "Stay in the loop" box sends the email to the Alien Sisterhood Substack signup page in a new tab, where the visitor confirms with one click.

## Editing

- **Text:** open the page's `index.html` in any text editor and change the words between the tags.
- **Colors and fonts:** the top of `assets/style.css` (`--pink`, `--lime`, `--night`, and so on).
- **New artwork:** add the image to `images/`, then copy one `<button …>` line in the art grid in `work/index.html` and change the two image paths.
- **New zine for sale:** create its Stripe payment link, then copy an `<article class="product">` block in `shop/index.html` and add its key to `PAY_LINKS` in `assets/site.js`.
- **New story:** copy one `<a class="card" …>` block in `work/index.html` and change the cover, title and link.
- **Preview locally:** open `index.html` in a browser. All links work from your computer too.
