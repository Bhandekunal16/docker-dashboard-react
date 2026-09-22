import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RotateCcw, Activity } from 'lucide-react';
import { Button } from '../common/Button';
import { useConfig } from '../../context/ConfigContext';
import { DEFAULT_API_BASE_URL } from '../../api/client';
import axios from 'axios';

export const ApiConfigModal: React.FC = () => {
  const {
    isApiConfigModalOpen,
    setIsApiConfigModalOpen,
    apiBaseUrl,
    setApiBaseUrl,
    resetApiBaseUrl,
  } = useConfig();

  const [inputUrl, setInputUrl] = useState(apiBaseUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  useEffect(() => {
    if (isApiConfigModalOpen) {
      setInputUrl(apiBaseUrl);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isApiConfigModalOpen, apiBaseUrl]);

  if (!isApiConfigModalOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const cleanUrl = inputUrl.trim().replace(/\/+$/, '');
      const res = await axios.get(`${cleanUrl}/get/all/containers`, { timeout: 5000 });
      if (Array.isArray(res.data)) {
        setTestStatus('success');
        setTestMessage(`Successfully connected! Found ${res.data.length} container(s).`);
      } else {
        setTestStatus('success');
        setTestMessage('API responded successfully.');
      }
    } catch (err: unknown) {
      setTestStatus('failed');
      if (axios.isAxiosError(err)) {
        setTestMessage(err.message || 'Connection refused or timed out.');
      } else {
        setTestMessage('Failed to reach backend at specified URL.');
      }
    }
  };

  const handleSave = () => {
    setApiBaseUrl(inputUrl);
    setIsApiConfigModalOpen(false);
  };

  const handleReset = () => {
    setInputUrl(DEFAULT_API_BASE_URL);
    resetApiBaseUrl();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        onClick={() => setIsApiConfigModalOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-config-title"
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150"
      >
        <button
          onClick={() => setIsApiConfigModalOpen(false)}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="p-2.5 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 id="api-config-title" className="text-base font-semibold text-zinc-100">
              API Connection Settings
            </h3>
            <p className="text-xs text-zinc-400">
              Configure the Docker REST API backend target URL
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Backend Base URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://0.0.0.0:5000"
                className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-700/80 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            {/* Quick Presets for Hick's Law & Fitts's Law */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-zinc-500 mr-1">Presets:</span>
              {[
                'http://0.0.0.0:5000',
                'http://localhost:5000',
                'http://127.0.0.1:5000',
                'http://localhost:3000',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInputUrl(preset)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    inputUrl === preset
                      ? 'bg-blue-950/80 border-blue-600 text-blue-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500 mt-2">
              Default: <code className="text-zinc-300">{DEFAULT_API_BASE_URL}</code>. Configured via <code className="text-zinc-400">VITE_API_BASE_URL</code> or runtime override.
            </p>
          </div>

          {/* Test connection output */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                testStatus === 'testing'
                  ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
                  : testStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}
            >
              {testStatus === 'testing' && <Activity className="w-4 h-4 animate-spin text-blue-400 shrink-0 mt-0.5" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {testStatus === 'failed' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
              <div className="flex-1">
                <span className="font-semibold">
                  {testStatus === 'testing' && 'Testing connection...'}
                  {testStatus === 'success' && 'Connection OK:'}
                  {testStatus === 'failed' && 'Connection Failed:'}
                </span>{' '}
                <span className="font-mono text-[11px]">{testMessage}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              isLoading={testStatus === 'testing'}
              leftIcon={<Activity className="w-3.5 h-3.5" />}
            >
              Test Connection
            </Button>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Default
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <Button variant="ghost" size="sm" onClick={() => setIsApiConfigModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save & Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
