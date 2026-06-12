import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Avatar from './Avatar';
import { containsProfanity } from '../utils/profanity';

function Chat({ currentUser, users }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  async function loadMessages() {
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    setError('');
    if (!text.trim() || !currentUser) return;
    try { if (containsProfanity(text)) { setError('Mensagem bloqueada: conteúdo impróprio detectado.'); return; } }
    catch { setError('Erro ao verificar mensagem.'); return; }

    const { error: err } = await supabase.from('chat_messages').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      message: text.trim(),
      created_at: new Date().toISOString(),
    });

    if (err) {
      setError(err.message);
      return;
    }

    setText('');
    await loadMessages();
  }

  if (loading) return (
    <div className="chat-page">
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>💬 Resenha</h2>
          <p className="chat-subtitle">Resenha liberada! Manda tua opinião sobre a Copa 2026</p>
        </div>
      </div>
      <p className="empty-msg" style={{ padding: 40, textAlign: 'center' }}>Carregando...</p>
    </div>
  );

  return (
    <div className="chat-page">
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>💬 Resenha</h2>
          <p className="chat-subtitle">Resenha liberada! Manda tua opinião sobre a Copa 2026</p>
        </div>
        <button onClick={loadMessages} style={{ background: 'var(--green-brasil)', color: 'white', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer' }}>Recarregar</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="empty-msg" style={{ padding: 40, textAlign: 'center' }}>Nenhuma mensagem ainda. Seja o primeiro!</p>
        )}
        <div className="chat-msg">
          <div className="chat-msg-body" style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid gold' }}>
            <div className="chat-msg-head">
              <span className="chat-msg-name" style={{ color: 'gold' }}>Sistema</span>
            </div>
            <div className="chat-msg-text">Chat ativo! {messages.length} mensagens carregadas.</div>
          </div>
        </div>
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${currentUser?.id === msg.user_id ? 'chat-msg-own' : ''}`}>
            <Avatar user={users.find(u => u.id === msg.user_id) || { name: msg.user_name }} size={28} />
            <div className="chat-msg-body">
              <div className="chat-msg-head">
                <span className="chat-msg-name">{msg.user_name}</span>
                <span className="chat-msg-time">
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="chat-msg-text">{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {currentUser ? (
        <>
          {error && <div className="chat-error">{error}</div>}
          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              value={text}
              onChange={(e) => { setText(e.target.value); setError(''); }}
              placeholder="Manda a resenha..."
              maxLength={500}
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn" disabled={!text.trim()}>Enviar</button>
          </form>
        </>
      ) : (
        <div className="chat-login-prompt">
          <p>Faça login para participar da resenha!</p>
        </div>
      )}
    </div>
  );
}

export default Chat;
