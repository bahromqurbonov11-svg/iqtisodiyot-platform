import { useState } from 'react';
import { PageHeader, Card } from '@/components/ui';
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

  return <div className="container page">
    <PageHeader title={title} />
    <div className="grid grid--2-1">
      <Card title={title}>
        <svg viewBox="0 0 385 275" width="100%" role="img" aria-label={title}>
          <path d="M45 22V230H370" fill="none" stroke="#546b63" />
          <text x="8" y="24" fontSize="12">{priceLabel}</text>
          <text x="355" y="255" textAnchor="end" fontSize="12">{quantityLabel}</text>
          <line x1={x(0)} x2={x(75)} y1={y(demand)} y2={y(demand-75)} stroke="#246b58" strokeWidth="3" />
          {tax > 0 && <line x1={x(0)} x2={x(75)} y1={y(supply)} y2={y(supply+75)} stroke="#b87838" strokeDasharray="5 4" />}
          <line x1={x(0)} x2={x(75)} y1={y(supply+tax)} y2={y(supply+tax+75)} stroke="#9b4d24" strokeWidth="3" />
          <path d={`M45 ${y(price)}H${x(quantity)}V230`} fill="none" stroke="#546b63" strokeDasharray="4 4" />
          <circle cx={x(quantity)} cy={y(price)} r="6" fill="#173e32" />
        </svg>
        <p className="small"><span style={{ color: '#246b58' }}>{demandLine}</span> · <span style={{ color: '#9b4d24' }}>{supplyLine}</span></p>
      </Card>
      <Card title={quantityLabel + ' / ' + priceLabel}>
        <div className="stack">
          <label>{taxLabel} · {tax}<input className="sim-range" type="range" min={0} max={25} value={tax} onChange={e => setTax(Number(e.target.value))} /></label>
          <label>{demandLabel} · {demand}<input className="sim-range" type="range" min={75} max={140} value={demand} onChange={e => setDemand(Number(e.target.value))} /></label>
          <label>{supplyLabel} · {supply}<input className="sim-range" type="range" min={10} max={45} value={supply} onChange={e => setSupply(Number(e.target.value))} /></label>
          <strong>{quantityLabel} · {quantity}</strong>
          <span>{buyerLabel} · {price}</span>
          <span>{sellerLabel} · {price-tax}</span>
        </div>
      </Card>
    </div>
  </div>;
}
