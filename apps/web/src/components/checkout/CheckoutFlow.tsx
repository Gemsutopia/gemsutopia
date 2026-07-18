'use client';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PaymentError from '@/components/error-states/PaymentError';
import { PageLoader } from '@/components/ui/page-loader';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGemPouch } from '@/contexts/GemPouchContext';
import { useInventory } from '@/contexts/InventoryContext';
import { clearStoredReferralCode, getStoredReferralCode } from '@/hooks/useReferralTracking';
import { store } from '@/lib/store';
import CartReview from './CartReview';
import CustomerInfo from './CustomerInfo';
import OrderSuccess from './OrderSuccess';
import PaymentForm from './PaymentForm';
import PaymentMethods from './PaymentMethods';

type CheckoutCurrency = 'CAD' | 'USD';

const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

function convertCheckoutAmount(
  amount: number,
  fromCurrency: CheckoutCurrency,
  toCurrency: CheckoutCurrency,
  cadToUsdRate: number
) {
  if (fromCurrency === toCurrency) return roundMoney(amount);
  if (fromCurrency === 'CAD' && toCurrency === 'USD') return roundMoney(amount * cadToUsdRate);
  return roundMoney(amount / cadToUsdRate);
}

function getShippingCountryCode(country: string) {
  const normalized = country.toLowerCase().trim();
  if (normalized === 'canada' || normalized === 'ca' || normalized === 'can') return 'CA';
  if (
    normalized === 'united states' ||
    normalized === 'usa' ||
    normalized === 'us' ||
    normalized === 'united states of america'
  ) {
    return 'US';
  }
  return country;
}

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown checkout error';
}

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
  paymentMethod: 'paypal' | null;
  orderTotal: number;
}

type CheckoutStep = 'cart' | 'customer' | 'payment-method' | 'payment' | 'success' | 'error';
type CheckoutErrorAction = 'payment' | 'cart' | 'return' | 'support';

export default function CheckoutFlow() {
  const router = useRouter();
  const { items, clearPouch } = useGemPouch();
  const { convertPrice, currency: currentCurrency, exchangeRate } = useCurrency();
  const { refreshShopProducts, refreshProduct } = useInventory();

  // Preserve items and subtotal for OrderSuccess (before clearPouch)
  const [preservedItems, setPreservedItems] = useState(items);
  const [preservedSubtotal, setPreservedSubtotal] = useState(0);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [isFinalizingPayment, setIsFinalizingPayment] = useState(false);
  const [errorAction, setErrorAction] = useState<CheckoutErrorAction>('payment');
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
        setCheckoutData((prev) => ({
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

  // Handle return from PayPal.
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentMethod = urlParams.get('payment_method');
      const status = urlParams.get('status');

      if (!paymentMethod) return;
      if (paymentMethod !== 'paypal') {
        window.history.replaceState({}, '', '/checkout');
        setError('This payment method is no longer supported. Please use PayPal.');
        setErrorAction('payment');
        setCurrentStep('error');
        return;
      }

      // Handle cancellations
      if (status === 'cancelled') {
        sessionStorage.removeItem('paypalCheckoutData');
        toast.info('Payment cancelled');
        setCheckoutData((prev) => ({ ...prev, paymentMethod: null }));
        setCurrentStep('payment-method');
        window.history.replaceState({}, '', '/checkout');
        return;
      }

      const storageKey = 'paypalCheckoutData';
      let paymentWasCaptured = false;
      setIsFinalizingPayment(true);

      try {
        const checkoutDataStr = sessionStorage.getItem(storageKey);
        if (!checkoutDataStr) {
          const missingDataMessage =
            'Checkout data was not found after returning from payment. If PayPal charged the customer, contact support with the PayPal confirmation.';
          toast.error(missingDataMessage);
          setError(missingDataMessage);
          setErrorAction('support');
          setCurrentStep('error');
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

        const captureResult =
          savedData.captureResult || (await store.payments.capturePayPalOrder(savedData.orderId));
        if (captureResult.status !== 'COMPLETED' && !captureResult.captureId) {
          const paypalMessage = `PayPal payment was not completed. Status: ${captureResult.status || 'unknown'}`;
          toast.error(paypalMessage);
          setError(paypalMessage);
          setErrorAction('return');
          setCurrentStep('error');
          return;
        }
        paymentWasCaptured = true;
        paymentRecord.captureID = captureResult.captureId;
        paymentRecord.externalId = captureResult.captureId || savedData.orderId;
        paymentRecord.orderId = savedData.orderId;

        if (!savedData.captureResult) {
          savedData.captureResult = captureResult;
          sessionStorage.setItem(storageKey, JSON.stringify(savedData));
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
            addressLine1:
              savedData.customerData.addressLine1 || savedData.customerData.address || '',
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
            variantId: item.variantId,
            sku: item.sku,
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
          metadata: {
            paymentProvider: paymentMethod,
            paypalOrderId: savedData.orderId,
            paypalCaptureId: paymentRecord.captureID,
            checkoutAttemptId: savedData.checkoutAttemptId,
          },
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
        setCheckoutData((prev) => ({
          ...prev,
          customer: savedData.customerData,
          paymentMethod: 'paypal',
        }));
        setAppliedDiscount(savedData.appliedDiscount || null);

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
        const detail = getCheckoutErrorMessage(err);
        const supportMessage = paymentWasCaptured
          ? `Your payment was successful, but we could not finish recording the order. It is safe to retry this confirmation. Detail: ${detail}`
          : `We could not finish confirming the PayPal payment. No new payment will be started when you retry. Detail: ${detail}`;
        try {
          localStorage.setItem(
            'lastCheckoutError',
            JSON.stringify({
              message: detail,
              paymentMethod,
              at: new Date().toISOString(),
            })
          );
        } catch {
          // Ignore storage failures.
        }
        toast.error(supportMessage);
        setErrorAction('return');
        setCurrentStep('error');
        setError(supportMessage);
      } finally {
        setIsFinalizingPayment(false);
      }
    };

    handlePaymentReturn();
  }, []);

  const [orderId, setOrderId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [paymentInfo, setPaymentInfo] = useState<{
    actualAmount: number;
    currency: string;
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
  const [shippingCurrency, setShippingCurrency] = useState<CheckoutCurrency>('CAD');
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  // Shipping calculation function (moved outside useEffect so it can be called manually)
  const calculateShippingCost = async (
    forceRefresh = false,
    customer = checkoutData.customer
  ): Promise<boolean> => {
    // Don't recalculate shipping once we're in payment step (unless forced)
    if (shippingLocked && !forceRefresh) {
      return true;
    }

    if (appliedDiscount?.free_shipping) {
      setShipping(0);
      setShippingCurrency(currentCurrency);
      setShippingError(null);
      return true;
    }

    if (items.length === 0) {
      setShipping(0);
      setShippingCurrency(currentCurrency);
      setShippingError(null);
      return true;
    }

    setIsCalculatingShipping(true);
    try {
      const country = getShippingCountryCode(customer.country || 'Canada');
      const ratesResult = await store.shipping.getRates({
        country,
        state: customer.state || undefined,
        subtotal,
      });
      const cheapestRate = ratesResult.rates
        ?.filter((rate) => Number.isFinite(rate.price) && rate.price >= 0)
        .sort((a, b) => a.price - b.price)[0];
      if (!cheapestRate) {
        throw new Error('No shipping rate is available for this address');
      }
      setShipping(cheapestRate.price);
      setShippingCurrency('CAD');
      setShippingError(null);
      return true;
    } catch {
      setShippingError('Shipping could not be calculated. Check the address or try again.');
      return false;
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const displaySubtotal = roundMoney(convertPrice(subtotal));
  const displayDiscount = roundMoney(convertPrice(discount));
  const displaySubtotalAfterDiscount = Math.max(0, displaySubtotal - displayDiscount);
  const displayShipping = roundMoney(
    convertCheckoutAmount(shipping, shippingCurrency, currentCurrency, exchangeRate)
  );
  const displayItems = items.map((item) => ({
    ...item,
    price: roundMoney(convertPrice(item.price)),
  }));
  const total = roundMoney(displaySubtotalAfterDiscount + displayShipping); // NO TAX!

  // TAX REMOVED - NO CALCULATION NEEDED

  // TAX REMOVED - NO CURRENCY EFFECT NEEDED

  const updateCheckoutData = (updates: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...updates }));
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
        if (isCalculatingShipping) return;
        updateCheckoutData({ customer: data });
        if (!(await calculateShippingCost(false, data))) {
          toast.error('Shipping could not be calculated for this address');
          return;
        }
        setCurrentStep('payment-method');
        break;
      case 'payment-method':
        if (shippingError) {
          toast.error(shippingError);
          setCurrentStep('customer');
          return;
        }
        updateCheckoutData({ paymentMethod: data });
        // Lock shipping calculation to prevent recalculation in payment step
        setShippingLocked(true);
        setCurrentStep('payment');
        break;
      case 'payment':
        setOrderId(data.orderId);
        setPaymentInfo({
          actualAmount: data.actualAmount || total,
          currency: data.currency || 'CAD',
        });

        // PRESERVE items, subtotal, tax, and shipping for OrderSuccess BEFORE clearing pouch
        setPreservedItems(displayItems);
        setPreservedSubtotal(displaySubtotal);
        // NO TAX
        setFinalShipping(displayShipping);

        setCurrentStep('success');
        clearPouch();
        refreshShopProducts(); // Trigger real-time inventory update

        // Also refresh individual product pages for items that were purchased
        items.forEach((item) => {
          refreshProduct(item.id);
        });
        break;
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setErrorAction(
      /stock|sold out|changed price|price has changed|return to your cart/i.test(errorMessage)
        ? 'cart'
        : 'payment'
    );
    setCurrentStep('error');
  };

  const handleErrorBack = () => {
    if (errorAction === 'support' || errorAction === 'return') {
      router.push('/contact-us');
      return;
    }
    setCurrentStep(errorAction === 'cart' ? 'cart' : 'payment-method');
  };

  const handleErrorRetry = () => {
    if (errorAction === 'return') {
      window.location.reload();
      return;
    }
    if (errorAction === 'support') {
      router.push('/contact-us');
      return;
    }
    setCurrentStep(errorAction === 'cart' ? 'cart' : 'payment');
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
  const isPaymentReturn =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('payment_method');
  if (isFinalizingPayment) {
    return <PageLoader message="Confirming your PayPal payment and securing your order…" />;
  }
  if (
    items.length === 0 &&
    currentStep !== 'success' &&
    currentStep !== 'error' &&
    !isPaymentReturn &&
    preservedItems.length === 0
  ) {
    if (typeof window !== 'undefined') {
      window.location.href = '/gem-pouch';
    }
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-20 xs:px-5 xs:pt-24 sm:px-6 md:px-12 md:pt-24 lg:px-24 lg:pb-20 lg:pt-28 xl:px-32 3xl:px-40">
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
                      {isCompleted ? <IconCheck size={14} /> : index + 1}
                    </div>
                    <span
                      className={`mt-1 font-[family-name:var(--font-inter)] text-[10px] xs:text-xs ${isCurrent ? 'text-white' : 'text-white/40'}`}
                    >
                      {stepLabels[index]}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`mx-1.5 mb-4 h-px w-6 xs:mx-2 xs:w-8 sm:w-12 ${index < currentIndex ? 'bg-white' : 'bg-white/20'}`}
                    />
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
                onContinue={(customerData) => handleStepComplete('customer', customerData)}
                isCalculatingShipping={isCalculatingShipping}
                shippingError={shippingError}
                onAddressChange={(customerData) => {
                  updateCheckoutData({ customer: customerData });
                  setShippingError(null);
                }}
              />
            )}

            {currentStep === 'payment-method' && (
              <PaymentMethods onSelect={(method) => handleStepComplete('payment-method', method)} />
            )}

            {currentStep === 'payment' && (
              <PaymentForm
                paymentMethod={checkoutData.paymentMethod!}
                amount={total}
                currency={currentCurrency}
                customerData={checkoutData.customer}
                items={displayItems}
                validationItems={items}
                appliedDiscount={
                  appliedDiscount ? { ...appliedDiscount, amount: displayDiscount } : null
                }
                subtotal={displaySubtotal}
                shipping={displayShipping}
                onSuccess={(data) => handleStepComplete('payment', data)}
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
                    currency={paymentInfo?.currency || 'CAD'}
                    items={preservedItems}
                    subtotal={preservedSubtotal}
                    shipping={finalShipping || shipping}
                    appliedDiscount={
                      appliedDiscount ? { ...appliedDiscount, amount: displayDiscount } : undefined
                    }
                    shippingAddress={checkoutData.customer}
                  />
                </div>
              </div>
            )}

            {currentStep === 'error' && (
              <PaymentError
                message={error}
                title={errorAction === 'return' ? 'Order Confirmation Interrupted' : undefined}
                backLabel={
                  errorAction === 'return' || errorAction === 'support'
                    ? 'Contact Support'
                    : errorAction === 'cart'
                      ? 'Review Cart'
                      : 'Back'
                }
                retryLabel={
                  errorAction === 'return'
                    ? 'Retry Confirmation'
                    : errorAction === 'support'
                      ? 'Contact Support'
                      : errorAction === 'cart'
                        ? 'Review Cart'
                        : 'Try Again'
                }
                onBack={handleErrorBack}
                onRetry={handleErrorRetry}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
