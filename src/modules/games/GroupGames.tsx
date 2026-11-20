import { PasswordGate } from './PasswordGate';
import { ClassroomPage } from './ClassroomPage';
import { BusinessGamePage } from './business/BusinessGame';

/** Guruhli o‘yinlar: parol bilan kiriladi. */
export const ClassroomGated = () => <PasswordGate><ClassroomPage /></PasswordGate>;
export const BusinessGated = () => <PasswordGate><BusinessGamePage /></PasswordGate>;
