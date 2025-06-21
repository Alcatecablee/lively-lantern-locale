import React from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PayPalButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  planName: string;
  amount: string;
  isSubscription?: boolean;
  onSuccess?: (details: unknown) => void;
  onError?: (error: unknown) => void;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  planName,
  amount,
  isSubscription = false,
  onSuccess,
  onError
}) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { toast } = useToast();

  const createOrder = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-order', {
        body: {
          planName,
          amount,
          isSubscription
        }
      });

      if (error) throw error;
      return data.orderID;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      toast({
        title: "Error",
        description: "Failed to create payment order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const onApprove = async (data: unknown) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('capture-paypal-order', {
        body: {
          orderID: data.orderID,
          planName,
          isSubscription
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: `Successfully subscribed to ${planName} plan`,
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
      if (onError) {
        onError(error);
      }
    }
  };

  const onErrorHandler = (error: unknown) => {
    console.error('PayPal error:', error);
    toast({
      title: "Payment Error",
      description: "An error occurred during payment",
      variant: "destructive",
    });
    if (onError) {
      onError(error);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-400">Loading PayPal...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      }}
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onErrorHandler}
    />
  );
};