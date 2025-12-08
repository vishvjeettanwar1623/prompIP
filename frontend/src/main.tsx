import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './wagmi.config';
import App from './App';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

// Suppress non-critical WalletConnect warnings in development
if (import.meta.env.DEV) {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  // Intercept network errors from fetch/XHR
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      const url = args[0]?.toString() || '';
      
      // Suppress logging of 403 errors from WalletConnect/Reown APIs
      if (
        !response.ok && 
        response.status === 403 && 
        (url.includes('web3modal.org') || 
         url.includes('walletconnect.org') || 
         url.includes('reown.com'))
      ) {
        // Return the response without logging the error
        return response;
      }
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filter out WalletConnect/Reown API errors (expected with placeholder project ID)
    if (
      message.includes('HTTP status code: 403') ||
      message.includes('Failed to fetch remote project configuration') ||
      message.includes('Access to storage is not allowed') ||
      message.includes('Uncaught (in promise)') ||
      message.includes('not found on Allowlist') ||
      message.includes('Origin http://localhost')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filter out development-only warnings
    if (
      message.includes('Lit is in dev mode') ||
      message.includes('React DevTools') ||
      message.includes('Origin http://localhost') ||
      message.includes('not found on Allowlist') ||
      message.includes('[Reown Config]') ||
      message.includes('Failed to fetch remote')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.log = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filter out React DevTools download message
    if (message.includes('React DevTools')) {
      return;
    }
    originalLog.apply(console, args);
  };
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
