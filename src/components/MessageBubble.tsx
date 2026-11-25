import { useEffect, useState } from 'react';
import type { MessageItem } from '../services/messages';
import { getFeedbackForMessage, submitFeedback } from '../services/feedback';

interface Props {
  message: MessageItem;
}

export default function MessageBubble({ message }: Props) {
  const isAssistant = message.role === 'assistant';
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAssistant) return;
    getFeedbackForMessage(message.id)
      .then((fb) => {
        if (fb) {
          setFeedback(fb.positive);
          setComment(fb.comment);
          setSaved(true);
        }
      })
      .catch((e) => console.warn(e));
  }, [message.id, isAssistant]);

  const handleVote = async (positive: boolean) => {
    setFeedback(positive);
    setShowComment(true);
    try {
      await submitFeedback(message.id, positive, comment);
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-3xl whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isAssistant ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
        }`}
      >
        <div>{message.content}</div>

        {isAssistant && message.citations.length > 0 && (
          <div className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500">
            <div className="font-semibold">Źródła:</div>
            <ol className="list-decimal pl-5">
              {message.citations.map((c, i) => (
                <li key={`${c.docId}-${i}`}>{c.title}</li>
              ))}
            </ol>
          </div>
        )}

        {isAssistant && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <button
              onClick={() => handleVote(true)}
              className={`rounded-full px-2 py-1 ${feedback === true ? 'bg-green-100 text-green-700' : 'hover:bg-slate-100'}`}
              aria-label="Pomocna"
            >
              👍
            </button>
            <button
              onClick={() => handleVote(false)}
              className={`rounded-full px-2 py-1 ${feedback === false ? 'bg-red-100 text-red-700' : 'hover:bg-slate-100'}`}
              aria-label="Niepomocna"
            >
              👎
            </button>
            {saved && !showComment && <span>zapisano</span>}
            {showComment && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (feedback === null) return;
                  await submitFeedback(message.id, feedback, comment);
                  setSaved(true);
                  setShowComment(false);
                }}
                className="flex flex-1 gap-2"
              >
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Komentarz (opcjonalnie)"
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                />
                <button
                  type="submit"
                  className="rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
                >
                  Zapisz
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
