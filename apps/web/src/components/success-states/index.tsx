'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import react-checkmark to avoid SSR issues (it accesses window at module scope)
const Checkmark = dynamic(
  () => import('react-checkmark').then((mod) => mod.Checkmark),
  { ssr: false, loading: () => <div className="w-20 h-20 rounded-full bg-green-500/20 animate-pulse" /> }
);

interface SuccessStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'celebration';
}

// Animated Checkmark using react-checkmark - green circle, white checkmark
export function AnimatedCheckmark({ size = 80 }: { size?: number; delay?: number }) {
  return <Checkmark size={size} color="#22c55e" />;
}

// Celebration particles for big wins
function CelebrationParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-celebration-particle"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: i % 2 === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
            animationDelay: `${i * 0.05}s`,
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// Base Success State Component
export function SuccessState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
}: SuccessStateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-4 text-center">
      {variant === 'celebration' && mounted && <CelebrationParticles />}

      {icon && (
        <div
          className={`mb-6 text-white transition-all duration-500 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          {icon}
        </div>
      )}

      <h3
        className={`text-2xl font-semibold text-white mb-3 transition-all duration-500 delay-200 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {title}
      </h3>

      <p
        className={`text-gray-400 max-w-sm mb-8 transition-all duration-500 delay-300 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {description}
      </p>

      {(action || secondaryAction) && (
        <div
          className={`flex flex-col sm:flex-row gap-3 transition-all duration-500 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Order Success - BIG celebration moment
export function OrderSuccess({ orderId, total }: { orderId?: string; total?: string }) {
  const description = orderId
    ? `Your order #${orderId}${total ? ` for ${total}` : ''} has been confirmed. We're preparing your gems with care and will send you tracking details soon.`
    : "Your order has been confirmed. We're preparing your gems with care and will send you tracking details soon.";

  return (
    <SuccessState
      variant="celebration"
      icon={<AnimatedCheckmark size={100} />}
      title="Thank You for Your Order"
      description={description}
      action={{ label: 'View Order Details', href: orderId ? `/account/orders/${orderId}` : '/account/orders' }}
      secondaryAction={{ label: 'Continue Shopping', href: '/shop' }}
    />
  );
}

// Payment Success - BIG celebration moment
export function PaymentSuccess({ amount }: { amount?: string }) {
  return (
    <SuccessState
      variant="celebration"
      icon={<AnimatedCheckmark size={100} />}
      title="Payment Complete"
      description={
        amount
          ? `Your payment of ${amount} was processed successfully. A receipt has been sent to your email.`
          : "Your payment was processed successfully. A receipt has been sent to your email."
      }
      action={{ label: 'View Receipt', href: '/account/orders' }}
    />
  );
}

// Add to Cart Success
export function AddToCartSuccess({ productName }: { productName?: string }) {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Added to Your Gem Pouch"
      description={
        productName
          ? `${productName} is now in your cart and waiting for you.`
          : "Your selection has been added to your cart."
      }
      action={{ label: 'View Gem Pouch', href: '/gem-pouch' }}
      secondaryAction={{ label: 'Keep Shopping', href: '/shop' }}
    />
  );
}

// Wishlist Success
export function WishlistSuccess({ productName }: { productName?: string }) {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Saved to Wishlist"
      description={
        productName
          ? `${productName} has been added to your wishlist. We'll let you know if the price changes.`
          : "This gem has been saved to your wishlist."
      }
      action={{ label: 'View Wishlist', href: '/wishlist' }}
      secondaryAction={{ label: 'Keep Exploring', href: '/shop' }}
    />
  );
}

// Review Submitted Success
export function ReviewSubmittedSuccess({ productName }: { productName?: string }) {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Review Submitted"
      description={
        productName
          ? `Thank you for sharing your thoughts on ${productName}. Your review helps others discover quality gems.`
          : "Thank you for sharing your thoughts. Your review helps others discover quality gems."
      }
      action={{ label: 'Continue Shopping', href: '/shop' }}
    />
  );
}

// Account Created Success - BIG celebration moment
export function AccountCreatedSuccess({ email }: { email?: string }) {
  return (
    <SuccessState
      variant="celebration"
      icon={<AnimatedCheckmark size={100} />}
      title="Welcome to Gemsutopia"
      description={
        email
          ? `Your account has been created. We've sent a verification link to ${email}.`
          : "Your account has been created. Please check your email to verify your account and start exploring our collection."
      }
      action={{ label: 'Explore Our Collection', href: '/shop' }}
      secondaryAction={{ label: 'Go to Account', href: '/account' }}
    />
  );
}

// Password Changed Success
export function PasswordChangedSuccess() {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Password Updated"
      description="Your password has been changed. You can now use your new password to sign in."
      action={{ label: 'Go to Account', href: '/account' }}
    />
  );
}

// Email Verified Success
export function EmailVerifiedSuccess() {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Email Verified"
      description="Your email has been confirmed. You now have full access to your account and exclusive member benefits."
      action={{ label: 'Start Shopping', href: '/shop' }}
      secondaryAction={{ label: 'Go to Account', href: '/account' }}
    />
  );
}

// Bid Placed Success
export function BidPlacedSuccess({ amount, productName }: { amount?: string; productName?: string }) {
  let description = "Your bid has been placed.";
  if (amount && productName) {
    description = `Your bid of ${amount} on ${productName} is now active. We'll notify you if someone outbids you.`;
  } else if (amount) {
    description = `Your bid of ${amount} is now active. We'll notify you if someone outbids you.`;
  } else {
    description = "Your bid is now active. We'll notify you if someone outbids you.";
  }

  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Bid Placed Successfully"
      description={description}
      action={{ label: 'View Auctions', href: '/auctions' }}
      secondaryAction={{ label: 'My Bids', href: '/account/bids' }}
    />
  );
}

// Auction Won Success - BIG celebration moment
export function AuctionWonSuccess({ productName, finalPrice }: { productName?: string; finalPrice?: string }) {
  let description = "Congratulations! You've won the auction. Complete your purchase to secure your gem.";
  if (productName && finalPrice) {
    description = `Congratulations! You've won ${productName} for ${finalPrice}. Complete your purchase to claim your gem.`;
  } else if (productName) {
    description = `Congratulations! You've won the auction for ${productName}. Complete your purchase to claim your gem.`;
  }

  return (
    <SuccessState
      variant="celebration"
      icon={<AnimatedCheckmark size={100} />}
      title="You Won!"
      description={description}
      action={{ label: 'Complete Purchase', href: '/checkout' }}
      secondaryAction={{ label: 'View Details', href: '/account/orders' }}
    />
  );
}

// Contact Form Submitted Success
export function ContactSubmittedSuccess() {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Message Received"
      description="Thank you for reaching out. Our team typically responds within 24 hours on business days."
      action={{ label: 'Back to Home', href: '/' }}
    />
  );
}

// Newsletter Subscribed Success
export function SubscribedSuccess() {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="You're In"
      description="Welcome to our newsletter. You'll be first to know about new arrivals, exclusive offers, and gem insights."
      action={{ label: 'Browse Collection', href: '/shop' }}
    />
  );
}

// Refund Requested Success
export function RefundRequestedSuccess({ orderId }: { orderId?: string }) {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Refund Request Submitted"
      description={
        orderId
          ? `Your refund request for order #${orderId} is being reviewed. We'll update you within 2-3 business days.`
          : "Your refund request has been submitted. We'll review it and get back to you within 2-3 business days."
      }
      action={{ label: 'View Orders', href: '/account/orders' }}
    />
  );
}

// Shipping Address Updated Success
export function AddressUpdatedSuccess() {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title="Address Saved"
      description="Your shipping address has been updated and will be used for future orders."
      action={{ label: 'Go to Account', href: '/account' }}
    />
  );
}

// Sign In Success
export function SignInSuccess({ name }: { name?: string }) {
  return (
    <SuccessState
      icon={<AnimatedCheckmark size={80} />}
      title={name ? `Welcome back, ${name}` : "Welcome Back"}
      description="You're now signed in. Pick up where you left off."
      action={{ label: 'Continue Shopping', href: '/shop' }}
    />
  );
}

// Checkout Success (after full checkout flow)
export function CheckoutSuccess({ orderId, email }: { orderId?: string; email?: string }) {
  let description = "Your order is confirmed and being prepared.";
  if (orderId && email) {
    description = `Order #${orderId} is confirmed. We've sent the details to ${email} and will notify you when it ships.`;
  } else if (orderId) {
    description = `Order #${orderId} is confirmed. We'll send you an email with tracking details when it ships.`;
  } else if (email) {
    description = `Your order is confirmed. We've sent the details to ${email} and will notify you when it ships.`;
  }

  return (
    <SuccessState
      variant="celebration"
      icon={<AnimatedCheckmark size={100} />}
      title="Order Confirmed"
      description={description}
      action={{ label: 'View Order', href: orderId ? `/account/orders/${orderId}` : '/account/orders' }}
      secondaryAction={{ label: 'Continue Shopping', href: '/shop' }}
    />
  );
}
