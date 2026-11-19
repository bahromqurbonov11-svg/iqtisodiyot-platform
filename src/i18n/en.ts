import type { Dictionary } from './uz';
export const en: { nav: Dictionary['nav']; common: Partial<Dictionary['common']> } = {
  nav: {
    home:'Home', about:'About the course', topics:'Topics', materials:'Materials', tests:'Tests', games:'Games', cabinet:'Dashboard',
    admin:'Administration', analytics:'Analytics', login:'Sign in', register:'Register', menu:'Menu', backToSite:'Back to site',
    simulator:'Simulator', overview:'Overview', results:'My results', profile:'Profile', learners:'Students', integration:'Integration',
    study:'Study', manage:'Management', site:'Website',
  },
  common:{ open:'Open', viewAll:'View all', topic:'Topic', topics:'topics', lecture:'Lecture', practice:'Practice', hours:'hours', search:'Search', all:'All', source:'Source' },
};
