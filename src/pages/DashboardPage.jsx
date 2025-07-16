import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaPencilAlt, FaSearch } from 'react-icons/fa';

const LazyLoader = () => (
  <div className="w-full flex justify-start my-2">
    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-200 rounded-2xl max-w-2xl">
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0s]" />
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]" />
    </div>
  </div>
);

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const userHasStarted = messages.some((msg) => msg.from === 'user');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true); // MULAI loading

    const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    if (!apiKey) {
      setMessages((prev) => [...prev, { from: 'bot', text: 'API key tidak tersedia.' }]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'SiJati Chatbot'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'system',
              content: 'Kamu adalah asisten yang membantu dan selalu menjawab dalam bahasa Indonesia.'
            },
            { role: 'user', content: input }
          ]
        })
      });

      const data = await res.json();
      const botReply = data?.choices?.[0]?.message?.content;

      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: botReply || 'Maaf, tidak bisa menjawab saat ini.' }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Terjadi kesalahan saat menghubungi server.' }
      ]);
    } finally {
      setIsLoading(false); // SELESAI loading
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const profileImage =
    user?.photoURL?.startsWith('http')
      ? user.photoURL
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.displayName || 'User'
        )}&background=random&rounded=true`;

  return (
  <div className="flex h-screen bg-[#f5f6fa] overflow-hidden">
    {/* Sidebar */}
    <aside className="w-[250px] fixed top-0 left-0 bottom-0 bg-[#050C56] text-white px-6 py-8 hidden sm:flex flex-col justify-between z-40">
      <div>
        <h2 className="text-3xl font-bold mb-10">SI JATI</h2>
        <div className="flex flex-col space-y-4">
          <button className="flex items-center gap-3 px-2 py-1 hover:bg-white/10 transition text-base font-semibold rounded-lg">
            <FaPencilAlt className="text-lg" />
            New Chat
          </button>
          <button className="flex items-center gap-3 px-2 py-1 hover:bg-white/10 transition text-base font-semibold rounded-lg">
            <FaSearch className="text-lg" />
            Search Chat
          </button>
        </div>

        <div className="mt-12 text-base font-semibold">
          <p>Chats</p>
        </div>
      </div>
    </aside>

    {/* Right Content Area */}
    <div className="flex flex-col flex-1 ml-[250px] h-full overflow-hidden">
      {/* Header */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-end bg-[#f5f6fa] text-sm text-gray-700 z-30">
        <span className="mr-2 hidden sm:block">Welcome, {user?.displayName || 'User'}</span>
        <img
          src={profileImage}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border"
        />
      </header>

      {/* Main Scrollable Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div
          className={`flex flex-col items-center ${
            userHasStarted ? 'pt-4 pb-32' : 'justify-center h-full'
          }`}
        >
          {!userHasStarted && (
            <>
              <h1 className="text-pink-500 text-2xl font-semibold mb-6 text-center">
                What can I help with?
              </h1>
              <div className="w-full max-w-3xl">
                <div className="flex items-center rounded-full bg-white px-6 py-3 shadow-md">
                  <span className="text-gray-400 mr-3 text-xl">＋</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Tulis pertanyaan..."
                    className="flex-1 focus:outline-none text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button
                    onClick={handleSend}
                    className="text-gray-400 ml-3 text-lg"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`w-fit max-w-[80%] sm:max-w-[60%] px-4 py-2 rounded-lg text-sm shadow my-1 whitespace-pre-wrap ${
                msg.from === 'user'
                  ? 'bg-blue-100 self-end text-right ml-auto'
                  : 'bg-gray-200 self-start'
              }`}
            >
              {msg.from === 'bot' ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          ))}
          {isLoading && <LazyLoader />}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Box */}
      {userHasStarted && (
        <div className="fixed bottom-4 sm:bottom-6 left-[250px] right-4 sm:right-6 z-40">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center rounded-full bg-white px-6 py-3 shadow-md">
              <span className="text-gray-400 mr-3 text-xl">＋</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tulis pertanyaan..."
                className="flex-1 focus:outline-none text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="text-gray-400 ml-3 text-lg"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default DashboardPage;