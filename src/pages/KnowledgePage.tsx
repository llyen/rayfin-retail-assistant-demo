import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createDoc,
  deleteDoc,
  listDocs,
  updateDoc,
  type KnowledgeDocItem,
} from '../services/knowledge';
import { useAuth } from '../hooks/AuthContext';

const AUDIENCES = ['all', 'store', 'manager', 'hq'];
const REGIONS = ['all', 'north', 'south', 'east', 'west'];

interface FormState {
  id?: string;
  title: string;
  body: string;
  tags: string;
  audience: string;
  region: string;
}

const EMPTY: FormState = {
  title: '',
  body: '',
  tags: '',
  audience: 'all',
  region: 'all',
};

export default function KnowledgePage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<KnowledgeDocItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);

  const reload = () => listDocs().then(setDocs).catch((e) => console.error(e));

  useEffect(() => {
    reload();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (form.id) {
        await updateDoc(form.id, {
          title: form.title,
          body: form.body,
          tags: form.tags,
          audience: form.audience,
          region: form.region,
        });
      } else {
        await createDoc({
          title: form.title,
          body: form.body,
          tags: form.tags,
          audience: form.audience,
          region: form.region,
        });
      }
      setForm(EMPTY);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const edit = (d: KnowledgeDocItem) => {
    setForm({
      id: d.id,
      title: d.title,
      body: d.body,
      tags: d.tags,
      audience: d.audience,
      region: d.region,
    });
  };

  const remove = async (id: string) => {
    if (!confirm('Usunąć ten dokument?')) return;
    await deleteDoc(id);
    if (form.id === id) setForm(EMPTY);
    await reload();
  };

  return (
    <div className="flex h-full flex-col bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Baza wiedzy</h1>
          <p className="text-xs text-slate-500">Dokumenty zasilające odpowiedzi asystenta.</p>
        </div>
        <Link to="/chat" className="text-sm text-slate-600 underline">
          ← Wróć do czatu
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section className="w-1/2 overflow-y-auto border-r border-slate-200 p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Dokumenty ({docs.length})
          </h2>
          <ul className="space-y-2">
            {docs.map((d) => {
              const isOwner = user?.id === d.author_id;
              return (
                <li
                  key={d.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900">{d.title}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">
                        audience={d.audience} · region={d.region} · tags={d.tags}
                      </div>
                      <p className="mt-2 line-clamp-3 text-xs text-slate-600">{d.body}</p>
                    </div>
                    {isOwner && (
                      <div className="flex shrink-0 flex-col gap-1">
                        <button
                          onClick={() => edit(d)}
                          className="rounded bg-slate-100 px-2 py-1 text-xs"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => remove(d.id)}
                          className="rounded bg-red-50 px-2 py-1 text-xs text-red-700"
                        >
                          Usuń
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="w-1/2 overflow-y-auto p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {form.id ? 'Edytuj dokument' : 'Nowy dokument'}
          </h2>
          <form onSubmit={save} className="space-y-3">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Tytuł"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <textarea
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Treść (krok po kroku, fakty, kontakty)"
              rows={12}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tagi (CSV) np. hr,urlop,pl"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-slate-500">
                Audience
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-slate-500">
                Region
                <select
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  {REGIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {form.id ? 'Zapisz zmiany' : 'Dodaj dokument'}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm(EMPTY)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  Anuluj
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
