import { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { MOCK_CHAT_ROOMS, MOCK_MESSAGES } from '@/data/mockData';
import { Message } from '@/types/clan';

export default function ChatPage() {
  const { currentUser, isAuthenticated } = useAuth();
  const [activeRoom, setActiveRoom] = useState('general');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomMessages = messages.filter((m) => m.chatId === activeRoom);
  const currentRoom = MOCK_CHAT_ROOMS.find((r) => r.id === activeRoom);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [roomMessages.length]);

  if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />;

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      senderNick: currentUser.nickname,
      content: input.trim(),
      timestamp: new Date().toISOString(),
      chatId: activeRoom,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (ts: string) => {
    return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="font-oswald text-3xl font-bold text-white mb-6 flex items-center gap-2">
          <Icon name="MessageCircle" size={28} className="text-purple-400" />
          Чат клана
        </h1>

        <div className="flex gap-4 h-[600px]">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 card-glass rounded-xl overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Каналы</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {MOCK_CHAT_ROOMS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`w-full text-left px-3 py-3 flex items-center gap-3 transition-all hover:bg-white/5 ${
                    activeRoom === room.id ? 'bg-purple-600/10 border-r-2 border-purple-500' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    room.type === 'general' ? 'bg-purple-500/20 text-purple-400' :
                    room.type === 'tournament' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    <Icon name={room.type === 'general' ? 'Hash' : room.type === 'tournament' ? 'Trophy' : 'Lock'} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{room.name}</p>
                    <p className="text-xs text-muted-foreground">{room.participants.length} участников</p>
                  </div>
                  {room.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center flex-shrink-0">
                      {room.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 card-glass rounded-xl flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-border flex items-center gap-3">
              <Icon name="Hash" size={18} className="text-purple-400" />
              <div>
                <p className="font-medium text-foreground">{currentRoom?.name}</p>
                <p className="text-xs text-muted-foreground">{currentRoom?.participants.length} участников</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {roomMessages.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Icon name="MessageCircle" size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Пока нет сообщений. Начни разговор!</p>
                </div>
              )}

              {roomMessages.map((msg, i) => {
                const isOwn = msg.senderId === currentUser.id;
                const prevMsg = roomMessages[i - 1];
                const showDate = !prevMsg || formatDate(prevMsg.timestamp) !== formatDate(msg.timestamp);
                const showSender = !prevMsg || prevMsg.senderId !== msg.senderId || showDate;

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="text-center text-xs text-muted-foreground my-4">
                        <span className="bg-card px-3 py-1 rounded-full">{formatDate(msg.timestamp)}</span>
                      </div>
                    )}
                    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} ${showSender ? 'mt-3' : 'mt-0.5'}`}>
                      {showSender ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {msg.senderNick[0]}
                        </div>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showSender && (
                          <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs font-medium text-foreground">{msg.senderNick}</span>
                            <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                          </div>
                        )}
                        <div className={`px-3 py-2 rounded-xl text-sm ${
                          isOwn
                            ? 'bg-purple-600/30 text-foreground rounded-tr-sm'
                            : 'bg-white/5 text-foreground rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Написать в ${currentRoom?.name}...`}
                  className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-600/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white flex items-center justify-center transition-all"
                >
                  <Icon name="Send" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}