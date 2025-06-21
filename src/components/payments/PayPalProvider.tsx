import React from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

// Note: Client ID will be fetched from backend for security
export const PayPalProvider: React.FC<PayPalProviderProps> = ({ children }) => {
  const initialOptions = {
    clientId: "test", // This will be overridden by the backend configuration
    currency: "USD",
    intent: "capture",
    vault: true,
    components: "buttons",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
};