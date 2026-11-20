/**
 * Bozor muvozanati simulyatorining hisoblash modeli (chiziqli talab va taklif).
 *  Talab:  Qd = a - b * P            (xaridor narxi P)
 *  Taklif: Qs = d * (Ps - p0)        (sotuvchi oladigan narx Ps = P - t)
 * Birliklar: narx — ming so‘m, miqdor — ming dona.
 */
export type Control = 'none' | 'ceiling' | 'floor';
export interface MarketParams { a: number; b: number; d: number; p0: number; t: number; control: Control; level: number }

export const baseParams: MarketParams = { a: 200, b: 2, d: 2, p0: 20, t: 0, control: 'none', level: 60 };

export interface MarketResult {
  buyerPrice: number; sellerPrice: number; quantity: number;
  demandQty: number; supplyQty: number; shortage: number; surplus: number;
  consumerSurplus: number; producerSurplus: number; taxRevenue: number; welfare: number; deadweightLoss: number;
  elasticityDemand: number; elasticitySupply: number;
  free: { price: number; quantity: number };
  closed: boolean; controlBinds: boolean;
}

export function solveMarket(p: MarketParams): MarketResult {
  const { a, b, d, p0, t } = p;
  const freePrice = (a + d * p0) / (b + d);
  const freeQty = a - b * freePrice;
  let buyer = (a + d * (p0 + t)) / (b + d);
  let qty = a - b * buyer;
  let closed = false;
  if (qty <= 0) { closed = true; qty = 0; buyer = Math.max(p0 + t, 0); }
  let demandQty = a - b * buyer;
  let supplyQty = Math.max(0, d * (buyer - t - p0));
  let controlBinds = false;
  if (!closed && p.control === 'ceiling' && p.level < buyer) { controlBinds = true; buyer = p.level; }
  if (!closed && p.control === 'floor' && p.level > buyer) { controlBinds = true; buyer = p.level; }
  if (controlBinds) {
    demandQty = Math.max(0, a - b * buyer);
    supplyQty = Math.max(0, d * (buyer - t - p0));
    qty = Math.min(demandQty, supplyQty);
  } else {
    demandQty = qty; supplyQty = qty;
  }
  const seller = buyer - t;
  // Samarali taqsimot faraz qilinadi: eng yuqori baho beruvchi xaridorlar va eng arzon ishlab chiqaruvchilar savdoda qatnashadi.
  const cs = Math.max(0, (a * qty - qty * qty / 2) / b - buyer * qty);
  const ps = Math.max(0, seller * qty - (p0 * qty + qty * qty / (2 * d)));
  const tax = t * qty;
  const welfare = cs + ps + tax;
  const maxWelfare = 0.5 * (a / b - p0) * freeQty;
  return {
    buyerPrice: buyer, sellerPrice: seller, quantity: qty,
    demandQty, supplyQty,
    shortage: Math.max(0, demandQty - supplyQty), surplus: Math.max(0, supplyQty - demandQty),
    consumerSurplus: cs, producerSurplus: ps, taxRevenue: tax, welfare,
    deadweightLoss: Math.max(0, maxWelfare - welfare),
    elasticityDemand: qty > 0 ? b * buyer / qty : 0,
    elasticitySupply: qty > 0 ? d * seller / qty : 0,
    free: { price: freePrice, quantity: freeQty },
    closed, controlBinds,
  };
}
