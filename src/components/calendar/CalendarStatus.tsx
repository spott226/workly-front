'use client';

import { useState } from 'react';

export function CalendarStatus() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="border rounded p-6 max-w-lg">
      <h2 className="text-lg font-semibold mb-2">
        Google Calendar
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        {connected
          ? 'Tu calendario está conectado.'
          : 'Aún no has conectado Google Calendar.'}
      </p>

      <button
        onClick={() => setConnected(true)}
        disabled={connected}
        className={`px-4 py-2 rounded ${
          connected
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-black text-white'
        }`}
      >
        {connected ? 'Conectado' : 'Conectar Google Calendar'}
      </button>
    </div>
  );
}
