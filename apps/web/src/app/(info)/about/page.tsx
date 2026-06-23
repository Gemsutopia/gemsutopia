'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';

const defaultContent: Record<string, string> = {
  subtitle: 'A small Canadian passion project',
  paragraph_1: "First of all, thanks for stopping by! I'm Reese, founder of Gemsutopia and a proud Canadian rockhound based in Alberta.",
  paragraph_2: "At Gemsutopia, we focus on minerals with integrity. Every specimen is hand-selected and personally inspected for quality. Some pieces, like our Blue Jay sapphires, Alberta peridot, and a few of our other Canadian minerals, are collected during my own rockhounding trips. The rest are sourced from trusted small-scale miners and suppliers who value ethical practices.",
  paragraph_3: "This isn't just a business... it's a passion. I don't list anything I wouldn't be proud to have in my own collection. Each order is thoughtfully packed by my amazing spouse (she's the best), and we often include a small bonus gift as a thank-you for supporting our dream.",
  paragraph_4: "Thanks so much for supporting Gemsutopia. You're not just buying a gem... you're also investing in a story, a journey, and a small Canadian business that truly cares.",
};

export default function About() {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/pages/about')
      .then(res => res.json())
      .then(data => {
        if (data?.data?.content && Object.keys(data.data.content).length > 0) {
          setContent(data.data.content);
        }
      })
      .catch(() => {});
  }, []);

  const get = (key: string) => content[key] || defaultContent[key] || '';

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
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-[family-name:var(--font-bacasime)] text-4xl text-white">
              About
            </h1>
            <p className="text-sm text-white/60">
              {get('subtitle')}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-sm leading-relaxed text-white/50">
                {get('paragraph_1')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-sm leading-relaxed text-white/50">
                {get('paragraph_2')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-sm leading-relaxed text-white/50">
                {get('paragraph_3')}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-sm leading-relaxed text-white/50">
                {get('paragraph_4')}
              </p>
            </div>
          </div>

          {/* Signature */}
          <p className="mt-8 text-center text-sm font-medium text-white">
            — Reese @ Gemsutopia
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
