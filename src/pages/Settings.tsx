import React, { useState } from 'react';
import api from '../services/api';

const Settings: React.FC = () => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/telegram-codes/generate');
      setCode(res.data.code || res.data.data?.code);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        setError(errorResponse.response?.data?.message || 'Failed to generate code');
      } else {
        setError('Failed to generate code');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <button
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        onClick={handleGenerateCode}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Telegram Code'}
      </button>
      {code && (
        <div className="mt-4">
          <div className="font-mono text-lg bg-slate-100 p-2 rounded">Code: {code}</div>
          <button
            className="mt-2 px-3 py-1 bg-slate-200 rounded hover:bg-slate-300"
            onClick={() => navigator.clipboard.writeText(code)}
          >
            Copy
          </button>
        </div>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default Settings; 