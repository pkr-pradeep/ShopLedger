'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function item(name, price, qty, hsn, gstRate) {
  return { name, price, qty, hsn, gstRate };
}

function figures(order) {
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(order.items, order.coupon);
  return { invoiceFigures, checkoutFigures };
}

function invoiceSummary(result) {
  return {
    subtotal: result.subtotal,
    discount: result.discount,
    tax: result.tax,
    cgst: result.cgst,
    sgst: result.sgst,
    total: result.total,
    rows: result.rows.map(({ gstPercent, line, lineTax }) => ({ gstPercent, line, lineTax }))
  };
}

test('CURRENT BEHAVIOUR: order #1001 mixed 5% and 12% GST with no coupon', () => {
  const order = {
    id: 1001,
    coupon: '',
    items: [
      item('Rice', 100, 2, '1006', 5),
      item('Ghee', 205, 2, '0405', 12)
    ]
  };
  const { invoiceFigures, checkoutFigures } = figures(order);

  assert.deepEqual(invoiceSummary(invoiceFigures), {
    subtotal: 610,
    discount: 0,
    tax: 59.2,
    cgst: 29.6,
    sgst: 29.6,
    total: 669.2,
    rows: [
      { gstPercent: 5, line: 200, lineTax: 10 },
      { gstPercent: 12, line: 410, lineTax: 49.2 }
    ]
  });
  assert.equal(checkoutFigures.tax, 59.2);
  assert.equal(checkoutFigures.total, 669.2);
});

test('Invoice matches checkout for order #1002 SAVE10 discount and GST', () => {
  const order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      item('Rice', 600, 1, '1006', 5),
      item('Tea', 420, 1, '0902', 18)
    ]
  };
  const { invoiceFigures, checkoutFigures } = figures(order);

  assert.deepEqual(invoiceSummary(invoiceFigures), {
    subtotal: 1020,
    discount: 102,
    tax: 95.04,
    cgst: 47.52,
    sgst: 47.52,
    total: 1013.04,
    rows: [
      { gstPercent: 5, line: 600, lineTax: 27 },
      { gstPercent: 18, line: 420, lineTax: 68.04 }
    ]
  });
  assert.equal(checkoutFigures.discount, 102);
  assert.equal(checkoutFigures.tax, 95.04);
  assert.equal(checkoutFigures.total, 1013.04);
});

test('Invoice matches checkout for order #1004 SAVE10 discount cap and GST', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      item('Rice', 1000, 1, '1006', 5),
      item('Ghee', 1240, 1, '0405', 12)
    ]
  };
  const { invoiceFigures, checkoutFigures } = figures(order);

  assert.deepEqual(invoiceSummary(invoiceFigures), {
    subtotal: 2240,
    discount: 150,
    tax: 185.49,
    cgst: 92.75,
    sgst: 92.74,
    total: 2275.49,
    rows: [
      { gstPercent: 5, line: 1000, lineTax: 46.65 },
      { gstPercent: 12, line: 1240, lineTax: 138.84 }
    ]
  });
  assert.equal(checkoutFigures.discount, 150);
  assert.equal(checkoutFigures.tax, 185.49);
  assert.equal(checkoutFigures.total, 2275.49);
});

test('CURRENT BEHAVIOUR: order #1008 all 18% GST with no coupon', () => {
  const order = {
    id: 1008,
    coupon: '',
    items: [item('Tea', 500, 2, '0902', 18)]
  };
  const { invoiceFigures, checkoutFigures } = figures(order);

  assert.deepEqual(invoiceSummary(invoiceFigures), {
    subtotal: 1000,
    discount: 0,
    tax: 180,
    cgst: 90,
    sgst: 90,
    total: 1180,
    rows: [{ gstPercent: 18, line: 1000, lineTax: 180 }]
  });
  assert.equal(checkoutFigures.tax, 180);
  assert.equal(checkoutFigures.total, 1180);
});

test('Invoice matches checkout for order #1004 HSN slab and capped SAVE10 discount', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [item('Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508')]
  };
  const { invoiceFigures, checkoutFigures } = figures(order);

  assert.deepEqual(invoiceSummary(invoiceFigures), {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [{ gstPercent: 5, line: 2240, lineTax: 104.5 }]
  });
  assert.equal(invoiceFigures.subtotal, checkoutFigures.subtotal);
  assert.equal(invoiceFigures.discount, checkoutFigures.discount);
  assert.equal(invoiceFigures.tax, checkoutFigures.tax);
  assert.equal(invoiceFigures.total, checkoutFigures.total);
});
