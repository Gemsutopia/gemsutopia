// Utility functions for order processing

export interface PaymentDetails {
  method: string;
  payment_id: string;
  amount: number;
  currency?: string;
  crypto_type?: string;
  crypto_amount?: number;
  crypto_currency?: string;
  wallet_address?: string;
  network?: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  customerName: string | null;
  total: string | null;
  subtotal?: string | null;
  shipping?: string | null;
  tax?: string | null;
  status: string | null;
  createdAt: string | null;
  items: unknown;
  paymentDetails?: PaymentDetails;
}

// Utility function to detect test orders
export const isTestOrder = (order: { paymentDetails?: PaymentDetails | unknown }): boolean => {
  const paymentDetails = order.paymentDetails as PaymentDetails | undefined;

  if (!paymentDetails) {
    return true; // No payment details = test order
  }

  // Check for test Stripe payments
  if (paymentDetails.method === 'stripe') {
    // Test Stripe payment IDs start with specific prefixes
    if (
      paymentDetails.payment_id?.startsWith('pi_test_') ||
      paymentDetails.payment_id?.startsWith('cs_test_') ||
      paymentDetails.payment_id?.startsWith('ch_test_') ||
      paymentDetails.payment_id?.startsWith('pm_test_') ||
      paymentDetails.payment_id?.includes('test')
    ) {
      return true;
    }

    // If using test Stripe keys (check environment variables if available)
    const usingTestKeys =
      process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');
    if (usingTestKeys) {
      return true;
    }

    // Non-test Stripe payment IDs (live) start with pi_, cs_, etc. without "test_"
    return false;
  }

  // Check for test PayPal payments
  if (paymentDetails.method === 'paypal') {
    // PayPal sandbox (test) environment
    if (
      paymentDetails.payment_id?.includes('sandbox') ||
      paymentDetails.payment_id?.includes('test')
    ) {
      return true;
    }

    // Check if using PayPal sandbox client ID
    const usingSandbox =
      process.env.PAYPAL_CLIENT_ID?.includes('sandbox') ||
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.includes('sandbox');
    if (usingSandbox) {
      return true;
    }

    // Live PayPal payments
    return false;
  }

  // Check for test crypto currencies and networks
  if (paymentDetails.method === 'crypto') {
    const testNetworks = [
      'devnet',
      'testnet',
      'sepolia',
      'goerli',
      'rinkeby',
      'kovan',
      'ropsten',
      'mumbai',
      'polygon-mumbai',
      'bitcoin testnet',
      'ethereum sepolia',
    ];

    // Check if it's on a test network
    if (
      paymentDetails.network &&
      testNetworks.some(network =>
        paymentDetails.network!.toLowerCase().includes(network.toLowerCase())
      )
    ) {
      return true;
    }

    // Check for test cryptocurrencies or wallet addresses
    if (
      paymentDetails.crypto_currency === 'tBTC' ||
      paymentDetails.crypto_currency?.toLowerCase().includes('test') ||
      paymentDetails.wallet_address?.startsWith('tb1') || // Bitcoin testnet
      paymentDetails.payment_id?.includes('testnet')
    ) {
      return true;
    }

    // Bitcoin mainnet vs testnet detection
    if (paymentDetails.crypto_currency === 'BTC') {
      // Testnet addresses start with 'tb1', 'm', 'n', or '2'
      // Mainnet addresses start with '1', '3', or 'bc1'
      if (paymentDetails.wallet_address) {
        const addr = paymentDetails.wallet_address;
        if (
          addr.startsWith('tb1') ||
          addr.startsWith('m') ||
          addr.startsWith('n') ||
          addr.startsWith('2')
        ) {
          return true; // Testnet
        }
      }

      // Check for testnet transaction patterns
      if (paymentDetails.network?.toLowerCase().includes('testnet')) {
        return true;
      }
    }

    // Ethereum mainnet vs testnet detection
    if (paymentDetails.crypto_currency === 'ETH') {
      if (
        paymentDetails.network?.toLowerCase().includes('sepolia') ||
        paymentDetails.network?.toLowerCase().includes('goerli') ||
        paymentDetails.network?.toLowerCase().includes('testnet')
      ) {
        return true; // Testnet
      }
    }

    // Solana mainnet vs devnet detection
    if (paymentDetails.crypto_currency === 'SOL') {
      if (
        paymentDetails.network?.toLowerCase().includes('devnet') ||
        paymentDetails.network?.toLowerCase().includes('testnet')
      ) {
        return true; // Devnet/Testnet
      }
    }
  }

  // If we can't determine, assume it's live (real order)
  return false;
};

// Generic order type for filtering (accepts any order-like object with paymentDetails)
type OrderLike = { paymentDetails?: PaymentDetails | unknown };

// Filter out test orders from an array
export const filterLiveOrders = <T extends OrderLike>(orders: T[]): T[] => {
  return orders.filter(order => !isTestOrder(order));
};

// Get only test orders from an array
export const filterTestOrders = <T extends OrderLike>(orders: T[]): T[] => {
  return orders.filter(order => isTestOrder(order));
};

// Filter orders based on mode (live shows only live orders, dev shows only test orders)
export const filterOrdersByMode = <T extends OrderLike>(orders: T[], mode: 'live' | 'dev'): T[] => {
  return mode === 'live' ? filterLiveOrders(orders) : filterTestOrders(orders);
};
