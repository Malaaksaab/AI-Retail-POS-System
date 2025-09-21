import React, { useState } from 'react';
import { CreditCard, Banknote, Calculator, X, CheckCircle } from 'lucide-react';
import { DualPayment } from '../types';

interface DualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentComplete: (payment: DualPayment) => void;
}

export const DualPaymentModal: React.FC<DualPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPaymentComplete
}) => {
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cardAmount, setCardAmount] = useState<number>(totalAmount);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    setCardAmount(Math.max(0, totalAmount - cashAmount));
  }, [cashAmount, totalAmount]);

  const changeAmount = Math.max(0, cashReceived - cashAmount);
  const isValidPayment = (cashAmount + cardAmount) >= totalAmount && cashReceived >= cashAmount;

  const handlePayment = async () => {
    if (!isValidPayment) return;

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const payment: DualPayment = {
      id: `dual-${Date.now()}`,
      transactionId: `TXN-${Date.now()}`,
      cashAmount,
      cardAmount,
      totalAmount,
      cashReceived,
      changeGiven: changeAmount,
      cardTransactionId: cardAmount > 0 ? `CARD-${Date.now()}` : undefined,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    onPaymentComplete(payment);
    setIsProcessing(false);
    onClose();
  };

  const quickCashButtons = [10, 20, 50, 100];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Dual Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Total Amount */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-3xl font-bold text-gray-900">£{totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Cash Payment */}
          <div className="space-y-3">
            <div className="flex items-center">
              <Banknote className="w-5 h-5 text-green-600 mr-2" />
              <label className="font-medium text-gray-900">Cash Amount</label>
            </div>
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(Number(e.target.value) || 0)}
              min="0"
              max={totalAmount}
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
            
            {/* Quick Cash Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickCashButtons.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCashAmount(Math.min(amount, totalAmount))}
                  className="py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  £{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Received */}
          {cashAmount > 0 && (
            <div className="space-y-3">
              <label className="font-medium text-gray-900">Cash Received</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(Number(e.target.value) || 0)}
                min={cashAmount}
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={cashAmount.toFixed(2)}
              />
              {changeAmount > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-700">Change to give:</div>
                  <div className="text-xl font-bold text-yellow-800">£{changeAmount.toFixed(2)}</div>
                </div>
              )}
            </div>
          )}

          {/* Card Payment */}
          <div className="space-y-3">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
              <label className="font-medium text-gray-900">Card Amount</label>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">£{cardAmount.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Automatically calculated</div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cash Payment:</span>
              <span className="font-medium">£{cashAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Card Payment:</span>
              <span className="font-medium">£{cardAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>£{(cashAmount + cardAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={!isValidPayment || isProcessing}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              {isProcessing ? 'Processing...' : 'Process Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};