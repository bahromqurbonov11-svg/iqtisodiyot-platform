export function SlideCover({ number, floating = false }: { number: number; floating?: boolean }) {
  return <div className={floating ? 'slide-cover topic-slide-preview' : 'slide-cover'}>
    <img src={import.meta.env.BASE_URL + 'slide-covers/' + number + '.svg'} width={960} height={540}
      alt={number + '-mavzu taqdimotining birinchi slaydi'} loading="lazy" decoding="async" />
  </div>;
}
