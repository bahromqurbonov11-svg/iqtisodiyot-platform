import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card } from '@/components/ui';
import { supabase } from '@/services/supabase';
import { loadResearchLink, researchUrl } from '@/services/researchLink';

export function ResearchLinkAdminCard() {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void loadResearchLink().then(({ url, error }) => {
      if (!active) return;
      setValue(url ?? '');
      if (error) setMessage('Joriy havolani yuklab bo‘lmadi.');
      setBusy(false);
    });
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = researchUrl(value.trim());
    if (!url) {
      setMessage('To‘liq HTTPS yoki HTTP havolasini kiriting.');
      return;
    }
    setBusy(true);
    setMessage('');
    const { error } = await supabase.rpc('econ_set_research_link', { link: url });
    if (!error) setValue(url);
    setMessage(error ? 'Havolani saqlab bo‘lmadi.' : 'Havola saqlandi.');
    setBusy(false);
  }

  return <Card title="Zamonaviy tadqiqotlar" subtitle="Materiallar sahifasidagi kartadan ochiladigan havola" className="mt-5">
    <form className="stack" onSubmit={save}>
      <label htmlFor="research-link">Tadqiqotlar havolasi</label>
      <input id="research-link" className="search-control" type="url" maxLength={2048}
        required disabled={busy} value={value} onChange={event => setValue(event.target.value)} />
      <Button type="submit" disabled={busy}>Havolani saqlash</Button>
      <p role="status">{message}</p>
    </form>
  </Card>;
}
