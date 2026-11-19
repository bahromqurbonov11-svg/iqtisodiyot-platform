import { useState } from 'react';
import { PageHeader, Card, Button } from '@/components/ui';
import { useI18n } from '@/i18n';

const labels = {
  uz: ['Bozor muvozanati', 'Birlik solig‘i', 'Boshlang‘ich talab', 'Boshlang‘ich taklif', 'Miqdor', 'Narx', 'Talab', 'Taklif', 'Xaridor narxi', 'Sotuvchi oladigan narx'],
  ru: ['Рыночное равновесие', 'Налог на единицу', 'Исходный спрос', 'Исходное предложение', 'Количество', 'Цена', 'Спрос', 'Предложение', 'Цена покупателя', 'Цена продавца'],
  en: ['Market equilibrium', 'Tax per unit', 'Baseline demand', 'Baseline supply', 'Quantity', 'Price', 'Demand', 'Supply', 'Buyer price', 'Seller price'],
};

export function SimulatorPage() {
  const { locale } = useI18n();
  const [tax, setTax] = useState(0);
  const [demand, setDemand] = useState(100);
  const [supply, setSupply] = useState(20);
  const [title, taxLabel, demandLabel, supplyLabel, quantityLabel, priceLabel, demandLine, supplyLine, buyerLabel, sellerLabel] = labels[locale];
  const quantity = (demand - supply - tax) / 2;
  const price = demand - quantity;
  const x = (q: number) => 45 + q * 4;
  const y = (p: number) => 230 - p * 1.45;
  const delta = (value: number) => value > 0 ? '+' + value : String(value);
  const resetText = { uz: 'Boshlang‘ich holat', ru: 'Сбросить настройки', en: 'Reset values' }[locale];
  const changesText = { uz: 'Boshlang‘ich holatga nisbatan', ru: 'Изменения относительно исходного состояния', en: 'Change from baseline' }[locale];

  return <div className="container page">
    <PageHeader title={title} />
    <div className="grid grid--2-1">
      <Card title={title}>
        <svg viewBox="0 0 385 275" width="100%" role="img" aria-label={title}>
          <path d="M45 22V230H370" fill="none" stroke="#546b63" />
          <text x="8" y="24" fontSize="12">{priceLabel}</text>
          <text x="355" y="255" textAnchor="end" fontSize="12">{quantityLabel}</text>
          {demand !== 100 && <line x1={x(0)} x2={x(75)} y1={y(100)} y2={y(25)} stroke="#246b58" opacity=".3" strokeDasharray="5 4" />}
          <line x1={x(0)} x2={x(75)} y1={y(demand)} y2={y(demand-75)} stroke="#246b58" strokeWidth="3" />
          {(tax > 0 || supply !== 20) && <line x1={x(0)} x2={x(75)} y1={y(20)} y2={y(95)} stroke="#9b4d24" opacity=".35" strokeDasharray="5 4" />}
          <line x1={x(0)} x2={x(75)} y1={y(supply+tax)} y2={y(supply+tax+75)} stroke="#9b4d24" strokeWidth="3" />
          <path d={`M45 ${y(price)}H${x(quantity)}V230`} fill="none" stroke="#546b63" strokeDasharray="4 4" />
          <circle cx={x(quantity)} cy={y(price)} r="6" fill="#173e32" />
          <text x={x(quantity) + 9} y={y(price) - 7} fontSize="12">E(P*, Q*)</text>
          <text x={x(75) + 5} y={y(demand-75)} fontSize="12" fill="#246b58">D</text>
          <text x={x(75) + 5} y={y(supply+tax+75)} fontSize="12" fill="#9b4d24">S</text>
        </svg>
        <p className="small"><span style={{ color: '#246b58' }}>D · {demandLine}</span> / <span style={{ color: '#9b4d24' }}>S · {supplyLine}</span></p>
        <p role="status">{changesText}: {quantityLabel} {delta(quantity - 40)} · {buyerLabel} {delta(price - 60)} · {sellerLabel} {delta(price - tax - 60)}.</p>
      </Card>
      <Card title={quantityLabel + ' / ' + priceLabel}>
        <div className="stack">
          <label>{taxLabel} · {tax}<input className="sim-range" type="range" min={0} max={25} value={tax} onChange={e => setTax(Number(e.target.value))} /></label>
          <label>{demandLabel} · {demand}<input className="sim-range" type="range" min={75} max={140} value={demand} onChange={e => setDemand(Number(e.target.value))} /></label>
          <label>{supplyLabel} · {supply}<input className="sim-range" type="range" min={10} max={45} value={supply} onChange={e => setSupply(Number(e.target.value))} /></label>
          <strong>{quantityLabel} · {quantity}</strong>
          <span>{buyerLabel} · {price}</span>
          <span>{sellerLabel} · {price-tax}</span>
          <Button variant="secondary" onClick={() => { setTax(0); setDemand(100); setSupply(20); }}>{resetText}</Button>
        </div>
      </Card>
    </div>
  </div>;
}
