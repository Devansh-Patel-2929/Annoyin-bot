// src/components/Chat.jsx
import { useState } from 'react';

const BRUTAL_STICKERS = [
  'https://media.tenor.com/0XU4Jt3qQE0AAAAi/ronaldo-siuu.gif',
  'https://media.tenor.com/9R5OZbxyW8AAAAAd/csk-whistle-podu.gif',
  'https://media.tenor.com/7NDPf8sG5C0AAAAM/ashok-leyland-truck.gif',
  'https://media.tenor.com/5E5z4QKqYVkAAAAj/real-madrid-champions-league.gif',
  'https://media.tenor.com/6xqG-ZGzHjMAAAAC/rcb-win.gif'
];

const STATS_DATABASE = {
  messi: {
    ucl_knockout_goals: 49,
    worldcups: 1
  },
  ronaldo: {
    ucl_knockout_goals: 67,
    international_goals: 128
  },
  csk: {
    ipl_titles: 5,
    last_win: 2023
  },
  mumbai: {
    ipl_titles: 5,
    last_win: 2020
  }
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const getBrutalSticker = () => BRUTAL_STICKERS[Math.floor(Math.random() * BRUTAL_STICKERS.length)];

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Immediate sticker response for specific triggers
      const triggers = {
        'mumbai indians': BRUTAL_STICKERS[1],
        'barcelona': BRUTAL_STICKERS[3],
        'messi': BRUTAL_STICKERS[0],
        'ashok leyland': BRUTAL_STICKERS[2]
      };

      const matchedTrigger = Object.keys(triggers).find(key => 
        input.toLowerCase().includes(key)
      );

      if (matchedTrigger) {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: triggers[matchedTrigger], 
            isBot: true, 
            isSticker: true 
          }]);
        }, 500);
        return;
      }

      // Get AI response
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: input,
          stats: STATS_DATABASE 
        })
      });
      
      const data = await response.json();
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: data.reply, 
          isBot: true,
          isSticker: data.isSticker 
        }]);
      }, 1000);

    } catch (error) {
      console.error(error);
    }
    
    setInput('');
  };
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isBot ? 'bot' : ''}`}>
            {msg.isSticker ? (
              <img src={msg.text} className="sticker" alt="annoying sticker" />
            ) : (
              <p>{msg.text}</p>
            )}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your stupid message here..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}