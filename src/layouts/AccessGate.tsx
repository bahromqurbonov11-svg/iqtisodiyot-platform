  import { Lock, ArrowLeft } from 'lucide-react';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/ui';
import { paths } from '@/navigation/paths';

export function AccessGate({ required }: { required: 'student' | 'admin' }) {
  const isAdmin = required === 'admin';

  return (
    <div className="gate">
      <div className="gate__card">
        <Brand />
        <div className="gate__icon"><Lock size={26} /></div>
        <h1 className="gate__title">{isAdmin ? 'Administrator paneli' : 'Talaba kabineti'}</h1>
        <p className="muted">
          {isAdmin ? 'Fan administratori hisobi bilan kiring.' : 'Tasdiqlangan talaba hisobi bilan kiring.'}
        </p>
        <Button to="/kirish" size="lg" block>Kirish</Button>
        <Button to={paths.home} variant="ghost" icon={<ArrowLeft size={16} />}>Bosh sahifaga qaytish</Button>
      </div>
    </div>
  );
}
