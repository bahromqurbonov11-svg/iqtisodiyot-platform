import { useParams } from 'react-router-dom';
import { testCatalog } from '@/data/demo/tests';
import { catalogService } from '@/services/catalog.service';
import { NotFoundPage } from '@/modules/public/NotFoundPage';
import { TestsPage } from './TestsPage';

export function TestDetailPage() {
  const { testId } = useParams();
  const test = testCatalog.find((item) => item.id === testId);
  const topic = test && catalogService.getTopic(test.topicId);
  if (!topic) return <NotFoundPage />;
  return <TestsPage key={topic.id} initialTopic={topic.globalOrder} />;
}
