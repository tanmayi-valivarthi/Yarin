import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useStore } from '@/store';
import { PageHeader, Card, SectionTitle, Button } from '@/components/ui';

export default function MessagesPage() {
  const { messages, addMessage, role } = useStore();
  const [text, setText] = useState('');

  const sorted = [...messages].sort((a, b) => b.time - a.time);

  const send = () => {
    if (!text.trim()) return;
    addMessage({
      id: `MSG-${Date.now()}`,
      time: Date.now(),
      from: role ?? 'Citizen',
      to: 'Authority',
      text: text.trim(),
    });
    setText('');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader
        title="Messages"
        subtitle="Contextual communication with response teams"
        icon={<MessageSquare className="h-6 w-6" />}
      />

      <Card className="mb-4">
        <SectionTitle className="mb-2">Send Message</SectionTitle>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Type a message to authority or response team…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="mt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={send}>
            <Send className="h-3.5 w-3.5" /> Send
          </Button>
        </div>
      </Card>

      <SectionTitle className="mb-3">Communication Log</SectionTitle>
      <div className="space-y-2">
        {sorted.map((m) => (
          <Card key={m.id}>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-gray-600">{m.from}</span>
              <span>→</span>
              <span className="font-semibold text-gray-600">{m.to}</span>
              {m.emergencyId && (
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                  {m.emergencyId}
                </span>
              )}
              <span className="ml-auto">
                {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-gray-700">{m.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
