import { useSearchParams } from 'react-router-dom';
import { BookOpen, GitCompareArrows, Lightbulb } from 'lucide-react';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';

export function GamesPage() {
  const [params, setParams] = useSearchParams();
  const topics = catalogService.getTopics().data;
  const topic = topics.find((item) => item.id === params.get('mavzu')) ?? topics[0];
  const topicQuery = '?mavzu=' + topic.id;

  return (
    <div className="container page">
      <PageHeader crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'O‘yinlar' }]}
        title="Iqtisodiyot o‘yinlari" description="Marraga yuguring yoki mavzu bo‘yicha mashq qiling." />
      <div className="stack">
        <Card title="Mergan">
          <p>Harakatlanuvchi nishonni markazda tuting va bonus savollarga javob berib qo‘shimcha o‘q oling.</p>
          <Button to={paths.game('mergan')}>O‘ynash</Button>
        </Card>
        <Card title="Grafikni boshqar">
          <p>Talab, taklif va narxni o‘zgartirib, bozor muvozanatini toping.</p>
          <Button to={paths.game('grafikni-boshqar')}>O‘ynash</Button>
        </Card>
        <Card title="Marraga yugurish">
          <p>To‘siqlardan sakrab ball yig‘ing. Har 5 ballik marrada savolga javob bering va talabalar reytingiga kiring.</p>
          <Button to={paths.game('marraga-yugurish')}>O‘yin va reyting</Button>
        </Card>
        <label className="stack stack--sm">
          <strong>Mavzu</strong>
          <select className="search-control" value={topic.id} onChange={(event) => setParams({ mavzu: event.target.value })}>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.globalOrder}. {item.title}</option>)}
          </select>
        </label>
        <div className="grid grid--2">
          <Card title="Tushunchalarni moslashtirish" actions={<Badge tone="info">10 ta juftlik</Badge>}>
            <div className="stack">
              <p>Ikki bosqichda atama va ta’riflarni to‘g‘ri juftlang.</p>
              <div><Button icon={<GitCompareArrows size={16} />} to={paths.game('moslashtirish') + topicQuery}>O‘yinni ochish</Button></div>
            </div>
          </Card>
          <Card title="Vaziyatni tahlil qiling" actions={<Badge tone="info">10 ta vaziyat</Badge>}>
            <div className="stack">
              <p>Amaliy misollar uchun mos iqtisodiy tushunchani va tushunchalar uchun mos vaziyatni tanlang.</p>
              <div><Button icon={<Lightbulb size={16} />} to={paths.game('vaziyatli-qaror') + topicQuery}>O‘yinni ochish</Button></div>
            </div>
          </Card>
        </div>
        <div><Button variant="secondary" icon={<BookOpen size={16} />} to={paths.topic(topic.id)}>Mavzu sahifasi</Button></div>
      </div>
    </div>
  );
}
