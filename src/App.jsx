import React, { useState } from 'react';
import AIAssistantPanel from './components/AIAssistantPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🎮 Discipline Tracker</h1>
      <AIAssistantPanel />
    </div>
  );
}

export default App;