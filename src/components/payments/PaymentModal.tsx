import React from 'react';
import { X } from 'lucide-react';
import { PayPalButton } from './PayPalButton';

interface PaymentModalProps extends React.HTMLAttributes<HTMLDivElement> {}
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  description: string;
  features: string[];
  isSubscription?: boolean;

export const PaymentModal: React.FC<PaymentModalProps> = ({};
  isOpen,;
  onClose,;
  planName,;
  price,;
  description,;
  features,;
  isSubscription = false;
}) => {
  if (!isOpen) return null;

  const handlePaymentSuccess = (details: unknown) => {
    console.debug('Payment successful:', details);
    // Handle successful payment (e.g., update user subscription status)
    onClose();
  };

  const handlePaymentError = (error: unknown) => {
    console.error('Payment error:', error);
    // Handle payment error
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
           aria-label="Button">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">{planName} Plan</h3>
          <p className="text-gray-400 mb-4">{description}</p>

          <div className="flex items-baseline mb-4">
            <span className="text-3xl font-bold text-white">
              {price === 'Custom' ? 'Custom' : `$${price}`}
            </span>
            {price !== 'Custom' && isSubscription && (
              <span className="text-gray-400 ml-2">/month</span>
            )}
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium text-gray-300">What's included:</p>
            <ul className="space-y-1">
              {features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-sm text-gray-400 flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {price !== 'Custom' && (
          <PayPalButton
            planName={planName}
            amount={price}
            isSubscription={isSubscription}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}

        {price === 'Custom' && (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-4">
              Contact our sales team for custom pricing
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
             aria-label="Button">
              Contact Sales
            </button>
          </div>
        )}
      </div>
    </div>
  );
};