'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactUs() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Message sent!', {
          description: "We'll get back to you soon.",
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message', {
          description: data.error?.message || 'Please try again.',
        });
      }
    } catch {
      toast.error('Connection error', {
        description: 'Please check your internet and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="relative min-h-screen grow overflow-hidden px-4 py-24 sm:px-8 md:px-16 lg:px-32">
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

        <div className="relative z-10 mx-auto max-w-2xl">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-1.5 text-sm text-white transition-colors hover:text-white/70"
          >
            <span>←</span>
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-4xl text-white">
              Contact Us
            </h1>
            <p className="text-sm text-white/60">
              Have a question or need help? Send us a message.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-white">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20"
              />
            </div>

            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium text-white">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What's this about?"
                required
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-white">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                required
                rows={5}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/20"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message}
              className={`mt-6 h-10 w-full rounded-md font-[family-name:var(--font-inter)] text-base font-medium transition-all duration-200 ${
                formData.name && formData.email && formData.subject && formData.message
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
