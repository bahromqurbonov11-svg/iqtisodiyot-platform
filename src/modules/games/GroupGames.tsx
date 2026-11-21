import type { ReactNode } from 'react';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';
import { ClassroomPage } from './ClassroomPage';
import { BusinessGamePage } from './business/BusinessGame';

function TeacherGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'admin') return children;
  return <div className="container page"><Card title="O‘qituvchi rejimi">
    <p>Guruhli o‘yinni administrator hisobi orqali boshlash mumkin.</p>
    {!user && <Button to={paths.login}>Kirish</Button>}
  </Card></div>;
}

export const ClassroomGated = () => <TeacherGate><ClassroomPage /></TeacherGate>;
export const BusinessGated = () => <TeacherGate><BusinessGamePage /></TeacherGate>;
