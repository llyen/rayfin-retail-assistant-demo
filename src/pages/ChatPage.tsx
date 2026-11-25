import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MessageBubble from '../components/MessageBubble';
import {
  appendMessage,
  listMessages,
  type MessageItem,
} from '../services/messages';
import {
  createConversation,
  renameConversation,
  touchConversation,
} from '../services/conversations';
import { ask } from '../services/llm';
import { seedKnowledgeIfEmpty } from '../services/seed';

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [seedInfo, setSeedInfo] = useState<string | null>(null);
  const [sidebarTick, setSidebarTick] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seedKnowledgeIfEmpty()
      .then((n) => n > 0 && setSeedInfo(`Załadowano ${n} przykładowych dokumentów do bazy wiedzy.`))
      .catch((e) => console.warn('seed failed', e));
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    listMessages(conversationId)
      .then(setMessages)
      .catch((e) => console.error(e));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;
    setInput('');
    setThinking(true);

    let convId = conversationId;
    let isNew = false;
    try {
      if (!convId) {
        const conv = await createConversation(question.slice(0, 60));
        convId = conv.id;
        isNew = true;
        navigate(`/chat/${convId}`, { replace: true });
      }

      const userMsg = await appendMessage(convId, 'user', question);
      setMessages((m) => [...m, userMsg]);

      const result = await ask(question);
      const assistantMsg = await appendMessage(
        convId,
        'assistant',
        result.content,
        result.citations
      );
      setMessages((m) => [...m, assistantMsg]);

      if (isNew) {
        await renameConversation(convId, question.slice(0, 60));
      } else {
        await touchConversation(convId);
      }
      setSidebarTick((t) => t + 1);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar refreshTick={sidebarTick} />

      <main className="flex flex-1 flex-col bg-slate-100">
        <div className="flex-1 overflow-y-auto p-6">
          {seedInfo && (
            <div className="mx-auto mb-4 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {seedInfo}
            </div>
          )}

          {messages.length === 0 && !thinking && (
            <div className="mx-auto mt-20 max-w-xl text-center text-slate-500">
              <h2 className="mb-2 text-xl font-semibold text-slate-700">
                Cześć! Jak mogę pomóc?
              </h2>
              <p className="text-sm">
                Zapytaj o procedury HR, ekspozycję sezonową, BHP, otwarcie sklepu lub inne polityki firmowe.
                Odpowiadam na podstawie bazy wiedzy w OneLake (Microsoft Fabric).
              </p>
              <ul className="mt-6 space-y-1 text-left text-sm">
                <li>• „Jak złożyć wniosek urlopowy?"</li>
                <li>• „Jak wygląda strój roboczy na hali?"</li>
                <li>• „Co robić przy wypadku w sklepie?"</li>
                <li>• „Pokaż checklistę porannego otwarcia sklepu"</li>
              </ul>
            </div>
          )}

          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {thinking && (
              <div className="text-sm text-slate-500">Asystent szuka odpowiedzi…</div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <form
          onSubmit={send}
          className="border-t border-slate-200 bg-white px-6 py-4"
        >
          <div className="mx-auto flex max-w-3xl gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Zadaj pytanie…"
              disabled={thinking}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Wyślij
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
