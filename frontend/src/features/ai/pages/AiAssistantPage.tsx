import { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { aiApi } from '../api/ai';

export function AiAssistantPage() {
  const toast = useToast();
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant for the ZP School ERP. I can help you find student information, analyze performance trends, or explain school policies. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await aiApi.askQuestion(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error: any) {
      toast.error('Failed to get response from AI');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please ensure the AI backend is properly configured.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 800, margin: '0 auto', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div style={{ padding: 'var(--space-3)', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))', color: 'white', borderRadius: 'var(--radius-md)' }}>
          <Sparkles size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            AI Assistant
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: '2px' }}>
            Powered by advanced LLMs to help manage your school better.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: 'var(--space-4)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
              maxWidth: '80%',
              display: 'flex',
              gap: 'var(--space-3)'
            }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}
              <div style={{ 
                background: msg.role === 'user' ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
                color: msg.role === 'user' ? 'white' : 'var(--color-neutral-900)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                borderTopRightRadius: msg.role === 'user' ? 4 : 'var(--radius-lg)',
                borderTopLeftRadius: msg.role === 'assistant' ? 4 : 'var(--radius-lg)',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
             <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 'var(--space-3)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} />
                </div>
                <div style={{ background: 'var(--color-neutral-100)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', borderTopLeftRadius: 4, color: 'var(--color-neutral-500)' }}>
                  Thinking...
                </div>
             </div>
          )}
        </div>

        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <div style={{ flex: 1 }}>
              <Input 
                name="prompt" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder="Ask something about students, attendance, or performance..." 
                autoComplete="off"
              />
            </div>
            <Button type="submit" variant="primary" disabled={isLoading || !input.trim()}>
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
