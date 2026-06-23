'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { useInventory } from '@/contexts/InventoryContext';
import { store } from '@/lib/store';
import CartReview from './CartReview';
import CustomerInfo from './CustomerInfo';
import PaymentMethods from './PaymentMethods';
import PaymentForm from './PaymentForm';
import OrderSuccess from './OrderSuccess';
import PaymentError from '@/components/error-states/PaymentError';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import Image from 'next/image';
import { calculateShipping, ShippingSettings } from '@/lib/utils/shipping';
import { getStoredReferralCode, clearStoredReferralCode } from '@/hooks/useReferralTracking';

interface CheckoutData {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: 'stripe' | 'paypal' | 'polar' | 'reown' | 'shopify' | 'square' | null;
  orderTotal: number;
}

type CheckoutStep = 'cart' | 'customer' | 'payment-method' | 'payment' | 'success' | 'error';

export default function CheckoutFlow() {
  const router = useRouter();
  const { items, clearPouch } = useGemPouch();
  const { formatPrice, formatPriceRaw, currency: currentCurrency } = useCurrency();
  const { refreshShopProducts, refreshProduct } = useInventory();

  // Preserve items and subtotal for OrderSuccess (before clearPouch)
  const [preservedItems, setPreservedItems] = useState(items);
  const [preservedSubtotal, setPreservedSubtotal] = useState(0);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    customer: {
      email: '',
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Canada',
      phone: '',
    },
    paymentMethod: null,
    orderTotal: 0,
  });

  // Load saved customer data and shipping settings on mount
  useEffect(() => {
    const savedCustomerData = localStorage.getItem('customerShippingInfo');
    if (savedCustomerData) {
      try {
        const parsed = JSON.parse(savedCustomerData);
        setCheckoutData(prev => ({
          ...prev,
          customer: parsed,
        }));
      } catch {
        // Invalid saved data, ignore
      }
    }
  }, []);

  // Check for stored referral code from URL tracking
  useEffect(() => {
    const storedRefCode = getStoredReferralCode();
    if (storedRefCode && !appliedDiscount) {
      // Pre-fill the discount code field with the stored referral code
      setDiscountCode(storedRefCode);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle return from payment provider redirects (Stripe, PayPal, Polar, Shopify, Square)
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentMethod = urlParams.get('payment_method');
      const status = urlParams.get('status');

      if (!paymentMethod) return;

      // Handle cancellations
      if (status === 'cancelled') {
        toast.info('Payment cancelled');
        setCurrentStep('payment-method');
        window.history.replaceState({}, '', '/checkout');
        return;
      }

      // Map payment methods to sessionStorage keys
      const storageKeys: Record<string, string> = {
        stripe: 'stripeCheckoutData',
        paypal: 'paypalCheckoutData',
        polar: 'polarCheckoutData',
        shopify: 'shopifyCheckoutData',
        square: 'squareCheckoutData',
      };

      const storageKey = storageKeys[paymentMethod];
      if (!storageKey) return;

      try {
        const checkoutDataStr = sessionStorage.getItem(storageKey);
        if (!checkoutDataStr) {
          toast.error('Checkout data not found. Please try again.');
          setCurrentStep('payment-method');
          return;
        }

        const savedData = JSON.parse(checkoutDataStr);
        const paymentRecord: any = {
          provider: paymentMethod,
          method: paymentMethod,
          amount: savedData.amount,
          currency: savedData.currency,
          status: 'paid',
        };

        // Provider-specific capture/verification
        if (paymentMethod === 'stripe') {
          const sessionId = urlParams.get('session_id');
          if (!sessionId) {
            setCurrentStep('payment-method');
            return;
          }
          paymentRecord.session_id = sessionId;
        } else if (paymentMethod === 'paypal') {
          // Capture the PayPal order via storefront API
          const captureResult = await store.payments.capturePayPalOrder(savedData.orderId);
          if (captureResult.status !== 'COMPLETED') {
            toast.error('PayPal payment not completed');
            setCurrentStep('payment-method');
            return;
          }
          paymentRecord.captureID = captureResult.captureId;
        } else if (paymentMethod === 'polar') {
          paymentRecord.checkoutId = savedData.checkoutId;
        } else if (paymentMethod === 'shopify') {
          paymentRecord.checkoutId = savedData.checkoutId;
        } else if (paymentMethod === 'square') {
          paymentRecord.orderId = savedData.orderId;
          paymentRecord.paymentLinkId = savedData.paymentLinkId;
        }

        // Create order via Quickdash storefront API
        const orderResult = await store.orders.create({
          customer: {
            email: savedData.customerData.email,
            firstName: savedData.customerData.firstName,
            lastName: savedData.customerData.lastName,
            phone: savedData.customerData.phone,
          },
          shippingAddress: {
            firstName: savedData.customerData.firstName,
            lastName: savedData.customerData.lastName,
            addressLine1: savedData.customerData.addressLine1 || savedData.customerData.address || '',
            addressLine2: savedData.customerData.addressLine2 || '',
            city: savedData.customerData.city || '',
            state: savedData.customerData.state || savedData.customerData.province || '',
            postalCode: savedData.customerData.postalCode || savedData.customerData.zip || '',
            country: savedData.customerData.country || 'CA',
            phone: savedData.customerData.phone,
          },
          items: savedData.items.map((item: any) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            productId: item.id,
            image: item.image,
          })),
          payment: paymentRecord,
          totals: {
            subtotal: savedData.subtotal,
            discount: savedData.appliedDiscount?.amount || 0,
            tax: 0,
            shipping: savedData.shipping,
            total: savedData.amount,
          },
          discountCode: savedData.appliedDiscount || null,
        });

        // Apply referral if applicable
        if (savedData.appliedDiscount?.isReferral && savedData.appliedDiscount?.referralId) {
          try {
            await fetch('/api/referrals/apply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referralId: savedData.appliedDiscount.referralId,
                orderId: orderResult.order.id,
                orderTotal: savedData.amount,
                discountApplied: savedData.appliedDiscount.amount,
                referredEmail: savedData.customerData.email,
                referredName: `${savedData.customerData.firstName} ${savedData.customerData.lastName}`,
              }),
            });
            clearStoredReferralCode();
          } catch (error) {
            console.error('Failed to apply referral:', error);
          }
        }

        // Clear stored checkout data
        sessionStorage.removeItem(storageKey);

        // Update state
        setCheckoutData(prev => ({
          ...prev,
          customer: savedData.customerData,
          paymentMethod: paymentMethod as any,
        }));

        setOrderId(orderResult.order.id);
        setPaymentInfo({
          actualAmount: savedData.amount,
          currency: savedData.currency,
        });

        setPreservedItems(savedData.items);
        setPreservedSubtotal(savedData.subtotal);
        setFinalShipping(savedData.shipping);

        setCurrentStep('success');
        clearPouch();
        refreshShopProducts();

        savedData.items.forEach((item: any) => {
          refreshProduct(item.id);
        });

        window.history.replaceState({}, '', '/checkout');
        toast.success('Payment successful! Order created.');
      } catch (err) {
        console.error('Checkout error:', err);
        toast.error('Payment processed but order creation failed. Please contact support.');
        setCurrentStep('error');
        setError('Your payment was successful but we had trouble recording the order. Please contact support with your payment confirmation.');
      }
    };

    handlePaymentReturn();
  }, []);

  const [orderId, setOrderId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<{
    actualAmount: number;
    cryptoAmount?: number;
    currency: string;
    cryptoCurrency?: string;
    cryptoNetwork?: string;
  } | null>(null);
  // TAX REMOVED
  // TAX REMOVED
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: 'percentage' | 'fixed_amount' | 'fixed';
    value: number;
    amount: number;
    free_shipping: boolean;
    // Referral-specific fields
    isReferral?: boolean;
    referralId?: string;
    referrerName?: string;
    description?: string;
    // Discount code specific
    discountCodeId?: string;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string>('');
  const [useCombinedShipping, setUseCombinedShipping] = useState<boolean>(true); // Default to combined shipping

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount
  const discount = appliedDiscount?.amount || 0;
  const subtotalAfterDiscount = subtotal - discount;

  // NO TAX - REMOVED ENTIRELY
  const tax = 0;

  // PRESERVE shipping values at payment completion to prevent recalculation
  const [finalShipping, setFinalShipping] = useState<number>(0);
  const [shippingLocked, setShippingLocked] = useState<boolean>(false); // Prevent recalculation once locked

  // Calculate shipping dynamically with fresh settings
  const [shipping, setShipping] = useState<number>(0); // Start at 0, will load properly
  const [currentShippingSettings, setCurrentShippingSettings] = useState<ShippingSettings | null>(
    null
  );

  // Shipping calculation function (moved outside useEffect so it can be called manually)
  const calculateShippingCost = async (forceRefresh = false) => {
    // Don't recalculate shipping once we're in payment step (unless forced)
    if (shippingLocked && !forceRefresh) {
      return;
    }

    if (appliedDiscount?.free_shipping) {
      setShipping(0);
      return;
    }

    if (items.length === 0) {
      setShipping(0);
      return;
    }

    try {
      // Fetch fresh shipping settings from database
      const url = forceRefresh
        ? `/api/shipping-settings?t=${Date.now()}` // Cache buster for force refresh
        : '/api/shipping-settings';
      const response = await fetch(url);
      if (!response.ok) {
        setShipping(-1); // Keep showing "Calculating..."
        return;
      }

      const data = await response.json();
      const freshSettings = data.settings;
      setCurrentShippingSettings(freshSettings);

      // Use the display currency (what the user selected) for shipping calculation
      const shippingCurrency = currentCurrency as 'CAD' | 'USD';

      // Create modified shipping settings based on user choice
      const modifiedSettings = {
        ...freshSettings,
        // Force the user's checkbox choice - if they unchecked, disable combined shipping
        combinedShippingEnabled: useCombinedShipping && freshSettings.combinedShippingEnabled,
      };

      // Pass destination country for zone-based shipping calculation
      const destinationCountry = checkoutData.customer.country || 'Canada';
      const calculation = calculateShipping(items.length, shippingCurrency, modifiedSettings, destinationCountry);
      setShipping(calculation.shippingCost);
    } catch {
      setShipping(-1); // Keep showing "Calculating..."
    }
  };

  // Function to calculate shipping immediately from current settings (no API call)
  const calculateShippingFromCurrentSettings = () => {
    if (!currentShippingSettings || shippingLocked) {
      return;
    }

    if (appliedDiscount?.free_shipping) {
      setShipping(0);
      return;
    }

    if (items.length === 0) {
      setShipping(0);
      return;
    }

    const shippingCurrency = currentCurrency as 'CAD' | 'USD';

    const modifiedSettings = {
      ...currentShippingSettings,
      combinedShippingEnabled:
        useCombinedShipping && currentShippingSettings.combinedShippingEnabled,
    };

    // Pass destination country for zone-based shipping calculation
    const destinationCountry = checkoutData.customer.country || 'Canada';
    const calculation = calculateShipping(items.length, shippingCurrency, modifiedSettings, destinationCountry);
    setShipping(calculation.shippingCost);
  };

  // Listen for settings updates
  React.useEffect(() => {
    const handleSettingsUpdate = () => {
      // Reset cached settings and force refetch shipping settings when admin updates them
      setCurrentShippingSettings(null);
      calculateShippingCost(true); // Force refresh even if shipping is locked
    };

    // Listen for custom events from Settings component
    window.addEventListener('settings-updated', handleSettingsUpdate);

    // Also listen for storage events (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'site-settings-updated') {
        handleSettingsUpdate();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // UseEffect to trigger shipping calculation when dependencies change
  React.useEffect(() => {
    calculateShippingCost();
  }, [appliedDiscount?.free_shipping, items.length, checkoutData.customer?.country]);

  // Separate effect for checkbox changes - use immediate calculation but only in customer step
  React.useEffect(() => {
    if (currentShippingSettings && !shippingLocked && currentStep === 'customer') {
      calculateShippingFromCurrentSettings();
    }
  }, [useCombinedShipping, currentStep]);

  const total = subtotalAfterDiscount + shipping; // NO TAX!

  // TAX REMOVED - NO CALCULATION NEEDED

  // TAX REMOVED - NO CURRENCY EFFECT NEEDED

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData(prev => ({ ...prev, ...updates }));
  };

  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a code');
      return;
    }

    setDiscountError('');

    try {
      // Use unified endpoint that handles both referral and discount codes
      const response = await fetch('/api/referrals/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: discountCode.trim(),
          customerEmail: checkoutData.customer.email || undefined,
          orderTotal: subtotal,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setDiscountError(result.error?.message || 'Error validating code');
        return;
      }

      const { data } = result;

      if (data.valid && data.discount) {
        // Handle both referral and discount codes
        if (data.type === 'referral') {
          setAppliedDiscount({
            code: data.code,
            type: data.discount.type === 'percentage' ? 'percentage' : 'fixed_amount',
            value: data.discount.value,
            amount: data.discount.amount,
            free_shipping: false,
            isReferral: true,
            referralId: data.referral?.id,
            referrerName: data.referral?.referrerName,
            description: data.discount.description,
          });
        } else {
          // Regular discount code
          setAppliedDiscount({
            code: data.code,
            type: data.discount.type === 'percentage' ? 'percentage' : 'fixed_amount',
            value: data.discount.value,
            amount: data.discount.amount,
            free_shipping: data.discount.freeShipping || false,
            isReferral: false,
            discountCodeId: data.discountCode?.id,
            description: data.discount.description,
          });
        }
        setDiscountCode('');
        toast.success(data.message);
      } else {
        setDiscountError(data.message || 'Invalid code');
      }
    } catch {
      setDiscountError('Error validating code');
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const handleStepComplete = async (step: CheckoutStep, data?: any) => {
    switch (step) {
      case 'cart':
        setCurrentStep('customer');
        break;
      case 'customer':
        updateCheckoutData({ customer: data });
        // Calculate shipping immediately after customer info is entered
        await calculateShippingCost();
        setCurrentStep('payment-method');
        break;
      case 'payment-method':
        updateCheckoutData({ paymentMethod: data });
        // Lock shipping calculation to prevent recalculation in payment step
        setShippingLocked(true);
        setCurrentStep('payment');
        break;
      case 'payment':
        setOrderId(data.orderId);
        setPaymentInfo({
          actualAmount: data.actualAmount || total,
          cryptoAmount: data.cryptoAmount,
          currency: data.currency || 'CAD',
          cryptoCurrency: data.cryptoCurrency,
          cryptoNetwork: data.cryptoNetwork,
        });

        // PRESERVE items, subtotal, tax, and shipping for OrderSuccess BEFORE clearing pouch
        setPreservedItems(items);
        setPreservedSubtotal(subtotal);
        // NO TAX
        setFinalShipping(shipping);

        setCurrentStep('success');
        clearPouch();
        refreshShopProducts(); // Trigger real-time inventory update

        // Also refresh individual product pages for items that were purchased
        items.forEach(item => {
          refreshProduct(item.id);
        });
        break;
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentStep('error');
  };

  const goBack = () => {
    switch (currentStep) {
      case 'cart':
        router.push('/shop');
        break;
      case 'customer':
        setCurrentStep('cart');
        break;
      case 'payment-method':
        // Unlock shipping when going back to customer step
        setShippingLocked(false);
        setCurrentStep('customer');
        break;
      case 'payment':
        // Unlock shipping when going back from payment
        setShippingLocked(false);
        setCurrentStep('payment-method');
        break;
      case 'error':
        setCurrentStep('payment');
        break;
    }
  };

  const stepTitles = {
    cart: 'Review Your Order',
    customer: 'Shipping Information',
    'payment-method': 'Choose Payment Method',
    payment: 'Payment Details',
    success: 'Order Confirmed!',
    error: 'Payment Error',
  };

  // Don't redirect if we're completing a payment return, showing success, or showing an error
  const isPaymentReturn = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('payment_method');
  if (items.length === 0 && currentStep !== 'success' && currentStep !== 'error' && !isPaymentReturn && preservedItems.length === 0) {
    if (typeof window !== 'undefined') {
      window.location.href = '/gem-pouch';
    }
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Background gem logo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/logos/gem2.svg"
          alt=""
          width={800}
          height={800}
          className="h-[120vw] w-[120vw] animate-[spin_60s_linear_infinite] opacity-[0.06] drop-shadow-[0_0_80px_rgba(255,255,255,0.3)] sm:h-[600px] sm:w-[600px]"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-20 xs:px-5 xs:pt-24 sm:px-6 md:px-12 md:pt-24 lg:px-24 lg:pb-20 lg:pt-28 xl:px-32">
        {/* Back Button */}
        {currentStep !== 'success' && (
          <button
            onClick={goBack}
            className="mb-6 inline-flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-sm text-white/70 transition-colors hover:text-white"
          >
            <IconArrowLeft size={18} />
            Back
          </button>
        )}

        {/* Step Progress Indicator */}
        {!['success', 'error'].includes(currentStep) && (
          <div className="mb-6 flex items-center justify-center gap-2 xs:mb-8">
            {(['cart', 'customer', 'payment-method', 'payment'] as const).map((step, index) => {
              const stepLabels = ['Cart', 'Shipping', 'Method', 'Pay'];
              const stepOrder = ['cart', 'customer', 'payment-method', 'payment'];
              const currentIndex = stepOrder.indexOf(currentStep);
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;

              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors xs:h-8 xs:w-8 xs:text-sm ${
                        isCompleted
                          ? 'bg-white text-black'
                          : isCurrent
                            ? 'border-2 border-white bg-white/10 text-white'
                            : 'border border-white/20 bg-transparent text-white/40'
                      }`}
                    >
                      {isCompleted ? (
                        <IconCheck size={14} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`mt-1 font-[family-name:var(--font-inter)] text-[10px] xs:text-xs ${isCurrent ? 'text-white' : 'text-white/40'}`}>
                      {stepLabels[index]}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`mx-1.5 mb-4 h-px w-6 xs:mx-2 xs:w-8 sm:w-12 ${index < currentIndex ? 'bg-white' : 'bg-white/20'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Page Title */}
        {currentStep !== 'error' && (
          <h1
            className={`mb-8 text-center font-[family-name:var(--font-bacasime)] text-3xl text-white xs:text-4xl md:text-5xl lg:text-left ${currentStep === 'success' ? 'lg:text-center' : ''}`}
          >
            {stepTitles[currentStep]}
          </h1>
        )}

        {/* Step Content */}
        <div>
          <div className="text-white">
            {currentStep === 'cart' && (
              <CartReview
                items={items}
                onContinue={() => handleStepComplete('cart')}
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                appliedDiscount={appliedDiscount}
                discountError={discountError}
                validateDiscountCode={validateDiscountCode}
                removeDiscount={removeDiscount}
              />
            )}

            {currentStep === 'customer' && (
              <CustomerInfo
                data={checkoutData.customer}
                onContinue={customerData => handleStepComplete('customer', customerData)}
                onAddressChange={customerData => {
                  updateCheckoutData({ customer: customerData });
                  // TRIGGER SHIPPING RECALCULATION IMMEDIATELY
                  calculateShippingCost();
                }}
              />
            )}

            {currentStep === 'payment-method' && (
              <PaymentMethods onSelect={method => handleStepComplete('payment-method', method)} />
            )}

            {currentStep === 'payment' && (
              <PaymentForm
                paymentMethod={checkoutData.paymentMethod!}
                amount={total}
                customerData={checkoutData.customer}
                items={items}
                appliedDiscount={appliedDiscount}
                subtotal={subtotal}
                shipping={shipping}
                onSuccess={data => handleStepComplete('payment', data)}
                onError={handleError}
              />
            )}

            {currentStep === 'success' && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <OrderSuccess
                    orderId={orderId}
                    customerEmail={checkoutData.customer.email}
                    customerName={`${checkoutData.customer.firstName} ${checkoutData.customer.lastName}`}
                    amount={paymentInfo?.actualAmount || total}
                    cryptoAmount={paymentInfo?.cryptoAmount}
                    currency={paymentInfo?.currency || 'CAD'}
                    cryptoCurrency={paymentInfo?.cryptoCurrency}
                    items={preservedItems}
                    subtotal={preservedSubtotal}
                    shipping={finalShipping || shipping}
                    paymentMethod={checkoutData.paymentMethod || undefined}
                    shippingMethod={useCombinedShipping ? 'combined' : 'flat'}
                    appliedDiscount={appliedDiscount || undefined}
                    shippingAddress={checkoutData.customer}
                  />
                </div>
              </div>
            )}

            {currentStep === 'error' && (
              <PaymentError
                message={error}
                onBack={() => setCurrentStep('payment-method')}
                onRetry={() => setCurrentStep('payment')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
