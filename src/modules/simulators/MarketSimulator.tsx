import { useMemo, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUp, Minus, RotateCcw } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { baseParams, solveMarket, type Control, type MarketParams, type MarketResult } from './marketModel';

const W = 560;
const H = 360;
const L = 64;
const R = 20;
const T = 22;
const B = 48;
const PW = W - L - R;
const PH = H - T - B;

const fmt = (n: number, digits = 1) => String(Number(n.toFixed(digits)));
const nice = (value: number, step: number) => Math.max(step, Math.ceil(value / step) * step);
const cssPath = (d: string) => ({ d: "path('" + d + "')" }) as unknown as CSSProperties;
const tr = (px: number, py: number, sx = 1, sy = 1): CSSProperties => ({ transform: 'translate(' + px + 'px,' + py + 'px) scale(' + sx + ',' + sy + ')' });

const presets: { label: string; params: MarketParams }[] = [
  { label: 'Boshlang‘ich holat', params: baseParams },
  { label: 'Daromad oshdi (talab +40)', params: { ...baseParams, a: 240 } },
  { label: 'Texnologiya (minimal narx 20 → 10)', params: { ...baseParams, p0: 10 } },
  { label: 'Birlik solig‘i 10', params: { ...baseParams, t: 10 } },
  { label: 'Subsidiya 10', params: { ...baseParams, t: -10 } },
  { label: 'Narx shipi 45', params: { ...baseParams, control: 'ceiling', level: 45 } },
  { label: 'Narx poli 75', params: { ...baseParams, control: 'floor', level: 75 } },
];

function Param({ label, unit, hint, min, max, step, value, onChange }: {
  label: string; unit: string; hint: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void;
}) {
  return (
    <div className="sim-param">
      <div className="sim-param__head">
        <label htmlFor={'sim-' + label}>{label}</label>
        <span className="sim-param__box">
          <input type="number" min={min} max={max} step={step} value={value} aria-label={label + ' qiymati'}
            onChange={e => { const v = Number(e.target.value); if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }} />
          <em>{unit}</em>
        </span>
      </div>
      <input id={'sim-' + label} className="sim-range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
      <small className="muted">{hint}</small>
    </div>
  );
}

function Delta({ now, base, digits = 1, goodWhenUp }: { now: number; base: number; digits?: number; goodWhenUp?: boolean }) {
  const diff = now - base;
  if (Math.abs(diff) < Math.pow(10, -digits) / 2) return <span className="sim-delta"><Minus size={13} aria-hidden /> o‘zgarmadi</span>;
  const up = diff > 0;
  const good = goodWhenUp === undefined ? undefined : up === goodWhenUp;
  return <span className={'sim-delta ' + (good === undefined ? '' : good ? 'is-good' : 'is-bad')}>
    {up ? <ArrowUp size={13} aria-hidden /> : <ArrowDown size={13} aria-hidden />} {up ? '+' : ''}{fmt(diff, digits)}
  </span>;
}

function Chart({ p, r, qMax, pMax }: { p: MarketParams; r: MarketResult; qMax: number; pMax: number }) {
  const x = (q: number) => L + (q / qMax) * PW;
  const y = (price: number) => T + PH - (price / pMax) * PH;
  const demandAt = (q: number) => (p.a - q) / p.b;
  const supplyAt = (q: number, shift: number) => p.p0 + shift + q / p.d;
  const line = (f: (q: number) => number, q0: number, q1: number) => 'M' + fmt(x(q0), 2) + ' ' + fmt(y(f(q0)), 2) + 'L' + fmt(x(q1), 2) + ' ' + fmt(y(f(q1)), 2);
  const qEnd = qMax * 1.4;
  const demand = line(demandAt, 0, Math.min(p.a, qEnd));
  const supply = line(q => supplyAt(q, 0), 0, qEnd);
  const supplyTax = line(q => supplyAt(q, p.t), 0, qEnd);
  const baseDemand = line(q => (baseParams.a - q) / baseParams.b, 0, Math.min(baseParams.a, qEnd));
  const baseSupply = line(q => baseParams.p0 + q / baseParams.d, 0, qEnd);
  const q = r.quantity;
  const cs = 'M' + x(0) + ' ' + y(p.a / p.b) + 'L' + x(0) + ' ' + y(r.buyerPrice) + 'L' + x(q) + ' ' + y(r.buyerPrice) + 'L' + x(q) + ' ' + y(demandAt(q)) + 'Z';
  const ps = 'M' + x(0) + ' ' + y(p.p0) + 'L' + x(0) + ' ' + y(r.sellerPrice) + 'L' + x(q) + ' ' + y(r.sellerPrice) + 'L' + x(q) + ' ' + y(supplyAt(q, 0)) + 'Z';
  const pStep = pMax <= 100 ? 20 : 50;
  const qStep = qMax <= 160 ? 40 : 50;
  const ease = 'transform .6s cubic-bezier(.2,.8,.2,1), d .6s cubic-bezier(.2,.8,.2,1), opacity .4s';
  const motion: CSSProperties = { transition: ease, transformOrigin: '0 0' };
  const changed = p.a !== baseParams.a || p.b !== baseParams.b || p.d !== baseParams.d || p.p0 !== baseParams.p0;
  const gap = r.shortage > 0.05 ? 'short' : r.surplus > 0.05 ? 'surplus' : '';
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" role="img" aria-label="Talab va taklif grafigi" className="sim-chart">
      <defs><clipPath id="sim-clip"><rect x={L} y={T} width={PW} height={PH} /></clipPath></defs>
      <rect x={L} y={T} width={PW} height={PH} fill="#f8fbf8" rx="6" />
      {Array.from({ length: Math.floor(pMax / pStep) + 1 }, (_, i) => i * pStep).map(v => (
        <g key={'p' + v}><line x1={L} x2={L + PW} y1={y(v)} y2={y(v)} stroke="#e1eae3" /><text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="12" fill="#566b62">{v}</text></g>
      ))}
      {Array.from({ length: Math.floor(qMax / qStep) + 1 }, (_, i) => i * qStep).map(v => (
        <g key={'q' + v}><line y1={T} y2={T + PH} x1={x(v)} x2={x(v)} stroke="#e1eae3" /><text x={x(v)} y={T + PH + 18} textAnchor="middle" fontSize="12" fill="#566b62">{v}</text></g>
      ))}
      <path d={'M' + L + ' ' + T + 'V' + (T + PH) + 'H' + (L + PW)} fill="none" stroke="#50675d" strokeWidth="1.6" />
      <text x={10} y={14} fontSize="12.5" fontWeight="600" fill="#243b33">Narx (ming so‘m)</text>
      <text x={L + PW} y={H - 8} textAnchor="end" fontSize="12.5" fontWeight="600" fill="#243b33">Miqdor (ming dona)</text>

      <g clipPath="url(#sim-clip)">
        <path d={cs} style={{ ...motion, ...cssPath(cs) }} fill="#2f855a" opacity=".16" />
        <path d={ps} style={{ ...motion, ...cssPath(ps) }} fill="#e0a526" opacity=".22" />
        {p.t !== 0 && <rect width="1" height="1" fill="#c0453a" opacity=".2" style={{ ...motion, ...tr(L, y(Math.max(r.buyerPrice, r.sellerPrice)), x(q) - L, Math.abs(y(r.sellerPrice) - y(r.buyerPrice))) }} />}
        {changed && <path d={baseDemand} fill="none" stroke="#236753" strokeWidth="2" strokeDasharray="5 5" opacity=".35" />}
        {changed && <path d={baseSupply} fill="none" stroke="#a35429" strokeWidth="2" strokeDasharray="5 5" opacity=".35" />}
        <path d={demand} style={{ ...motion, ...cssPath(demand) }} fill="none" stroke="#236753" strokeWidth="4" strokeLinecap="round" />
        <path d={supply} style={{ ...motion, ...cssPath(supply) }} fill="none" stroke="#a35429" strokeWidth="4" strokeLinecap="round" />
        {p.t !== 0 && <path d={supplyTax} style={{ ...motion, ...cssPath(supplyTax) }} fill="none" stroke="#c0453a" strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" />}
        {p.control !== 'none' && <line x1={0} y1={0} x2={1} y2={0} stroke="#47508a" strokeWidth="2.4" strokeDasharray="8 5" vectorEffect="non-scaling-stroke" style={{ ...motion, ...tr(L, y(p.level), PW, 1) }} />}
        {gap && <line x1={0} y1={0} x2={1} y2={0} strokeWidth="9" vectorEffect="non-scaling-stroke" className={'gg-gap gg-gap--' + gap}
          style={{ ...motion, ...tr(x(Math.min(r.demandQty, r.supplyQty)), y(r.buyerPrice), Math.abs(r.demandQty - r.supplyQty) / qMax * PW, 1) }} />}
      </g>

      <line x1={0} y1={0} x2={1} y2={0} stroke="#50675d" strokeWidth="1.4" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" style={{ ...motion, ...tr(L, y(r.buyerPrice), x(q) - L, 1) }} />
      <line x1={0} y1={0} x2={0} y2={1} stroke="#50675d" strokeWidth="1.4" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" style={{ ...motion, ...tr(x(q), y(r.buyerPrice), 1, T + PH - y(r.buyerPrice)) }} />
      <g style={{ ...motion, ...tr(x(q), y(r.buyerPrice)) }}>
        <circle r="14" fill="#2f855a" opacity=".18" className="gg-pulse" />
        <circle r="7" fill="#153a32" stroke="#fff" strokeWidth="2" />
      </g>
      <g style={{ ...motion, ...tr(L + 6, y(r.buyerPrice) - 6) }}><text fontSize="12.5" fontWeight="700" fill="#153a32">{fmt(r.buyerPrice)}</text></g>
      <g style={{ ...motion, ...tr(x(q) + 6, T + PH - 6) }}><text fontSize="12.5" fontWeight="700" fill="#153a32">{fmt(q)}</text></g>
      <text x={x(Math.min(p.a - 6, qMax * 0.9))} y={y(demandAt(Math.min(p.a - 6, qMax * 0.9))) - 10} fontSize="15" fontWeight="700" fill="#236753" clipPath="url(#sim-clip)">D</text>
      <text x={x(qMax * 0.92)} y={y(supplyAt(qMax * 0.92, 0)) + 20} fontSize="15" fontWeight="700" fill="#a35429" clipPath="url(#sim-clip)">S</text>
    </svg>
  );
}

export function MarketSimulator() {
  const [p, setP] = useState<MarketParams>(baseParams);
  const base = useMemo(() => solveMarket(baseParams), []);
  const r = useMemo(() => solveMarket(p), [p]);
  const set = (patch: Partial<MarketParams>) => setP(prev => ({ ...prev, ...patch }));
  const pMax = nice(Math.max(r.buyerPrice * 1.7, p.level * 1.15, 100), 50);
  const qMax = nice(Math.max(r.free.quantity * 1.8, 160), 40);
  const setControl = (control: Control) => set({ control, level: control === 'ceiling' ? Math.round(r.free.price * 0.75) : control === 'floor' ? Math.round(r.free.price * 1.25) : p.level });

  const tiles: { label: string; value: string; unit: string; now: number; base: number; good?: boolean }[] = [
    { label: 'Xaridor to‘laydigan narx', value: fmt(r.buyerPrice), unit: 'ming so‘m', now: r.buyerPrice, base: base.buyerPrice },
    { label: 'Sotuvchi oladigan narx', value: fmt(r.sellerPrice), unit: 'ming so‘m', now: r.sellerPrice, base: base.sellerPrice },
    { label: 'Savdo miqdori', value: fmt(r.quantity), unit: 'ming dona', now: r.quantity, base: base.quantity, good: true },
    { label: 'Iste’molchi ortiqchasi', value: fmt(r.consumerSurplus, 0), unit: 'mln so‘m', now: r.consumerSurplus, base: base.consumerSurplus, good: true },
    { label: 'Ishlab chiqaruvchi ortiqchasi', value: fmt(r.producerSurplus, 0), unit: 'mln so‘m', now: r.producerSurplus, base: base.producerSurplus, good: true },
    { label: p.t < 0 ? 'Subsidiya xarajati' : 'Soliq tushumi', value: fmt(Math.abs(r.taxRevenue), 0), unit: 'mln so‘m', now: r.taxRevenue, base: base.taxRevenue },
    { label: 'Sof yo‘qotish (DWL)', value: fmt(r.deadweightLoss, 0), unit: 'mln so‘m', now: r.deadweightLoss, base: base.deadweightLoss, good: false },
    { label: 'Talab elastikligi |Ed|', value: fmt(r.elasticityDemand, 2), unit: r.elasticityDemand > 1 ? 'elastik' : 'noelastik', now: r.elasticityDemand, base: base.elasticityDemand },
  ];

  return (
    <div className="sim">
      <div className="sim-presets" role="group" aria-label="Tayyor vaziyatlar">
        {presets.map(pre => <button key={pre.label} type="button" className="chip" onClick={() => setP(pre.params)}>{pre.label}</button>)}
      </div>
      <div className="sim-layout">
        <Card className="sim-board" title="Talab va taklif grafigi" subtitle="Narx — ming so‘m, miqdor — ming dona. Xira chiziqlar — boshlang‘ich holat.">
          <Chart p={p} r={r} qMax={qMax} pMax={pMax} />
          <div className="gg-legend">
            <span className="gg-legend__d">Talab D</span><span className="gg-legend__s">Taklif S</span>
            {p.t !== 0 && <span className="sim-lg sim-lg--tax">Soliq/subsidiya bilan taklif</span>}
            {p.control !== 'none' && <span className="gg-legend__p">{p.control === 'ceiling' ? 'Narx shipi' : 'Narx poli'}</span>}
          </div>
          <p className={'sim-status' + (r.closed ? ' is-bad' : '')} role="status">
            {r.closed ? 'Bu parametrlarda ishlab chiqarish foydasiz: bozor yopiladi (savdo miqdori 0).'
              : r.shortage > 0.05 ? 'Tanqislik: talab miqdori taklifdan ' + fmt(r.shortage) + ' ming dona ko‘p.'
                : r.surplus > 0.05 ? 'Ortiqcha taklif: ' + fmt(r.surplus) + ' ming dona sotilmay qoladi.'
                  : 'Bozor muvozanatda: talab miqdori taklif miqdoriga teng (Qd = Qs = ' + fmt(r.quantity) + ').'}
          </p>
          <p className="small muted">Ortiqchalar samarali taqsimot faraziga ko‘ra hisoblangan. Modelda talab Qd = a − b·P, taklif Qs = d·(P − t − P₀).</p>
        </Card>

        <Card className="sim-controls" title="Parametrlar">
          <Param label="Talab hajmi (a)" unit="ming dona" hint="Narx nolga teng bo‘lgandagi talab. Oshsa, talab o‘ngga siljiydi." min={100} max={300} step={5} value={p.a} onChange={v => set({ a: v })} />
          <Param label="Talabning narxga sezgirligi (b)" unit="dona/so‘m" hint="Narx 1 ming so‘mga oshsa, talab necha ming dona kamayadi." min={1} max={4} step={0.1} value={p.b} onChange={v => set({ b: v })} />
          <Param label="Taklifning narxga sezgirligi (d)" unit="dona/so‘m" hint="Narx 1 ming so‘mga oshsa, taklif necha ming dona ko‘payadi." min={1} max={4} step={0.1} value={p.d} onChange={v => set({ d: v })} />
          <Param label="Minimal taklif narxi (P₀)" unit="ming so‘m" hint="Ishlab chiqaruvchi sota boshlaydigan eng past narx. Kamaysa (texnologiya), taklif ortadi." min={0} max={50} step={1} value={p.p0} onChange={v => set({ p0: v })} />
          <Param label="Birlik solig‘i / subsidiya (t)" unit="ming so‘m" hint="Musbat — sotuvchidan olinadigan soliq, manfiy — subsidiya." min={-20} max={40} step={1} value={p.t} onChange={v => set({ t: v })} />
          <div className="sim-param">
            <div className="sim-param__head"><span>Narx cheklovi</span></div>
            <div className="gg-seg" role="radiogroup" aria-label="Narx cheklovi">
              {([['none', 'Yo‘q'], ['ceiling', 'Narx shipi'], ['floor', 'Narx poli']] as [Control, string][]).map(([v, label]) => (
                <button key={v} type="button" role="radio" aria-checked={p.control === v} className={'gg-seg__btn' + (p.control === v ? ' is-on' : '')} onClick={() => setControl(v)}>{label}</button>
              ))}
            </div>
            {p.control !== 'none' && <Param label="Cheklov darajasi" unit="ming so‘m" hint={p.control === 'ceiling' ? 'Bundan yuqori narxda sotish taqiqlanadi.' : 'Bundan past narxda sotish taqiqlanadi.'} min={10} max={150} step={1} value={p.level} onChange={v => set({ level: v })} />}
          </div>
          <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={() => setP(baseParams)}>Boshlang‘ich holat</Button>
        </Card>
      </div>

      <h3 className="sim-h">Natijalar <span className="small muted">(o‘zgarish boshlang‘ich holatga nisbatan)</span></h3>
      <div className="sim-tiles">
        {tiles.map((tile, i) => (
          <div className="sim-tile" key={tile.label} style={{ animationDelay: i * 50 + 'ms' }}>
            <span className="sim-tile__label">{tile.label}</span>
            <strong>{tile.value} <small>{tile.unit}</small></strong>
            <Delta now={tile.now} base={tile.base} digits={tile.label.includes('|Ed|') ? 2 : tile.unit === 'mln so‘m' ? 0 : 1} goodWhenUp={tile.good} />
          </div>
        ))}
      </div>
    </div>
  );
}
