import { useState } from 'react';
import axios from 'axios';

const AIAssistantPanel = () => {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');

  const callGPT = async () => {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: '你是一个RPG风格的打卡系统助手，像“独自升级”一样说话' },
        { role: 'user', content: input }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer YOUR_API_KEY`,  // ← 换成你的 OpenAI Key
        'Content-Type': 'application/json'
      }
    });

    setReply(res.data.choices[0].message.content);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl">
      <h2 className="text-xl font-bold mb-2">🧠 AI 系统助手</h2>
      <textarea
        className="w-full p-2 mb-2 text-black rounded"
        rows={3}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="输入问题或请求..."
      />
      <button onClick={callGPT} className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-500">
        请求回应
      </button>
      <div className="mt-4 whitespace-pre-wrap">{reply}</div>
    </div>
  );
};

export default AIAssistantPanel;