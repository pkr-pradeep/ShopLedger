# ShopLedger

## Stack
- Node.js application using Express 4 and body-parser 1; browser UI is static HTML, CSS, and JavaScript.
- Persistent application data is stored in `data/db.json`.

## Module map
- `routes/customers.js` — customer listing and Khata settlement endpoint.
- `routes/orders.js` — order listing, lookup, placement, and cancellation endpoints.
- `routes/products.js` — product and active coupon listing endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, lookup, validation, discount calculation, and active listing.
- `lib/dates.js` — current date, date-key normalization, and fiscal-year helpers.
- `lib/inventory.js` — product lookup, sellable stock, stock checks, reserve/release, and summary.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata order debits/reversals, and settlements.
- `lib/orders.js` — order add, lookup, cancellation, and filtered listing.
- `lib/pricing.js` — checkout subtotal, discount, and tax-inclusive totals.
- `lib/reports.js` — dashboard summary and invoice-to-order GST reconciliation.
- `lib/store.js` — reads and writes `data/db.json` and appends audit entries.
- `lib/tax.js` — GST rate lookup, slab percentage, and CGST/SGST split.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test`.
- `package.json` currently has no test suite; its `npm test` script is a placeholder that exits with an error.

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; they use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
