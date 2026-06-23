'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CheckoutFlow from '@/components/checkout/CheckoutFlow';

export default function Checkout() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="relative z-10 grow">
        <CheckoutFlow />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
