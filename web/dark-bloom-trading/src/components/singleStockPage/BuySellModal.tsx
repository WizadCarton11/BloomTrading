'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { BankService } from '@/lib/api';
import { useSingleStockSubscription } from '@/hooks/useStockSubscription';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

interface BuySellModalProps {
  symbol: string;
  currentPrice: number;
}

export default function BuySellModal({ symbol }: BuySellModalProps) {
  // const [currentPrice, setCurrentPrice] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<number>(1);
  const {data:currentPrice}=useSingleStockSubscription(symbol);
  const {toast} =useToast()
  // Fetch transaction ID on modal open
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTransactionId(null);

      const fetchTransactionId = async () => {
        try {
          const response =await  BankService.get('api/accounts/initiate_transaction',{}, "getTransactionId");
          console.log('Transaction ID:', response.data.data.transationId);
          setTransactionId(response.data.data.transactionId)
        } catch (error) {
          console.error('Error fetching transaction ID:', error);
          setTransactionId('error');
        } finally {
          setLoading(false);
        }
      }
      fetchTransactionId();
    }
  }, [isOpen]);

  useEffect(() => {
    setShares(1);
  }, [type]);
  const totalPrice = (shares * currentPrice?.price).toFixed(2);

  const submitFormHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await BankService.post(
        'api/accounts/buy_stock',{
          stockSymbol:symbol,
          numberOfShares:Number(shares),
          transactionId:transactionId,
          amount:Number(totalPrice),
          averagePrice:Number(currentPrice?.price),
        },{}, "buyStock")
      console.log('Transaction response:', response);
      if (response) {
        const successToast= toast({
          variant: 'success',
          title: 'Transaction Successful',
          description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${shares} shares of ${symbol} at $${currentPrice?.price} each.`,
        })
        setTimeout(() => {
          successToast.dismiss();
        }, 3000);
        setIsOpen(false); // Close the modal after successful transaction
        setTransactionId(null); // Reset transaction ID for next use
        setShares(1); // Reset shares input
        setType('buy'); // Reset to buy type
        // Optionally, you can show a success message or redirect the user
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const failedToast = toast({
        variant: 'destructive',
        title: 'Transaction Failed',
        description: `Failed to ${type === 'buy' ? 'buy' : 'sell'} ${shares} shares of ${symbol}. Backend error: ${error?.message? error.message : 'Unknown error'}`,
      });
      setTimeout(() => {
        failedToast.dismiss();
      }, 3000);
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-md transition-all duration-300 hover:bg-green-500 hover:shadow-green-400/40 hover:shadow-[0_0_12px]"
      >
        <DollarSign className="w-5 h-5" />
        Trade
      </button>

      {/* Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-green-500/20">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-lg font-medium text-white">
                      {type === 'buy' ? 'Buy' : 'Sell'} {symbol}
                    </Dialog.Title>
                    <button onClick={() => setIsOpen(false)}>
                      <X className="w-5 h-5 text-gray-400 hover:text-red-400 transition" />
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-gray-400 text-sm py-4 text-center">🔄 Initiating transaction...</div>
                  ) : transactionId === 'error' ? (
                    <div className="text-red-400 text-sm py-4 text-center">❌ Failed to initiate transaction.</div>
                  ) : (
                    <form className="space-y-4" onSubmit={submitFormHandler}>
                      <div className="text-xs text-gray-500 mb-1">Transaction ID: {transactionId}</div>

                      {/* Buy/Sell Toggle */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setType('buy')}
                          className={`flex-1 py-2 rounded-md font-medium ${
                            type === 'buy'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          Buy
                        </button>
                        <button
                          type="button"
                          onClick={() => setType('sell')}
                          className={`flex-1 py-2 rounded-md font-medium ${
                            type === 'sell'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          Sell
                        </button>
                      </div>

                      {/* Shares Input */}
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Number of Shares</label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShares(Math.max(1, shares - 1))}
                            className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            className="flex-1 px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                            value={shares}
                            onChange={(e) => setShares(Math.max(1, Number(e.target.value) || 1))}
                          />
                          <button
                            type="button"
                            onClick={() => setShares(shares + 1)}
                            className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Current Price */}
                      <div className="text-sm text-gray-400">
                        <div>
                          Current Price: <span className="text-white">${currentPrice?.price}</span>
                        </div>
                        <div>
                          Total: <span className="text-white">${totalPrice}</span>
                        </div>
                      </div>

                      {/* Confirm Button */}
                      <button
                        type="submit"
                        className="w-full py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
                      >
                        Confirm {type === 'buy' ? 'Purchase' : 'Sell'}
                      </button>
                    </form>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
