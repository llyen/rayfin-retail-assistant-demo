import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { listConversations, type ConversationItem } from '../services/conversations';
import { useAuth } from '../hooks/AuthContext';

interface Props {
  refreshTick: number;
}

export default function Sidebar({ refreshTick }: Props) {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [busy, setBusy] = useState(false);
  const { conversationId } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    listConversations()
      .then((res) => !cancelled && setItems(res))
      .catch((e) => console.error(e))
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 p-4">
        <h1 className="text-lg font-bold text-slate-900">Ask RetailCo</h1>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
      </div>

      <button
        onClick={() => navigate('/chat')}
        className="m-3 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
      >
        + Nowa rozmowa
      </button>

      <nav className="flex-1 overflow-y-auto px-2">
        {busy && <div className="px-3 py-2 text-xs text-slate-400">Ładowanie…</div>}
        {!busy && items.length === 0 && (
          <div className="px-3 py-2 text-xs text-slate-400">Brak rozmów</div>
        )}
        <ul className="space-y-1">
          {items.map((c) => {
            const active = c.id === conversationId;
            return (
              <li key={c.id}>
                <Link
                  to={`/chat/${c.id}`}
                  className={`block truncate rounded-md px-3 py-2 text-sm ${
                    active
                      ? 'bg-slate-200 font-semibold text-slate-900'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {c.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3 text-xs">
        <Link to="/knowledge" className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
          📚 Baza wiedzy
        </Link>
        <button
          onClick={() => signOut()}
          className="block w-full rounded-md px-3 py-2 text-left text-slate-500 hover:bg-slate-100"
        >
          Wyloguj
        </button>
      </div>
    </aside>
  );
}
