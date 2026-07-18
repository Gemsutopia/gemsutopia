'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const defaultContent: Record<string, string> = {
  subtitle: 'A small Canadian passion project',
  paragraph_1:
    "First of all, thanks for stopping by! I'm Reese, founder of Gemsutopia and a proud Canadian rockhound based in Alberta.",
  paragraph_2:
    'At Gemsutopia, we focus on minerals with integrity. Every specimen is hand-selected and personally inspected for quality. Some pieces, like our Blue Jay sapphires, Alberta peridot, and a few of our other Canadian minerals, are collected during my own rockhounding trips. The rest are sourced from trusted small-scale miners and suppliers who value ethical practices.',
  paragraph_3:
    "This isn't just a business... it's a passion. I don't list anything I wouldn't be proud to have in my own collection. Each order is thoughtfully packed by my amazing spouse (she's the best), and we often include a small bonus gift as a thank-you for supporting our dream.",
  paragraph_4:
    "Thanks so much for supporting Gemsutopia. You're not just buying a gem... you're also investing in a story, a journey, and a small Canadian business that truly cares.",
};

export default function About() {
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_QUICKDASH_PAGE_CONTENT !== 'true') return;

    fetch('/api/pages/about')
      .then(response => response.json())
      .then(data => {
        if (data?.data?.content && Object.keys(data.data.content).length > 0) {
          setContent(data.data.content);
        }
      })
      .catch(() => {});
  }, []);

  const get = (key: string) => content[key] || defaultContent[key] || '';

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />

      <main className="grow px-4 pb-24 pt-28 xs:px-5 sm:px-6 sm:pt-32 md:px-6 lg:px-6 lg:pb-32 xl:px-6 3xl:px-6">
        <article className="mx-auto max-w-5xl">
          <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <p className="mb-4 text-xs font-medium tracking-[0.22em] text-white/40 uppercase">
              Our story
            </p>
            <h1 className="font-[family-name:var(--font-bacasime)] text-5xl leading-none text-white sm:text-6xl">
              About Gemsutopia
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
              {get('subtitle')}, rooted in Alberta and shaped by a genuine love for minerals.
            </p>
          </header>

          <figure className="mb-14 sm:mb-20">
            <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-neutral-900 sm:rounded-3xl">
              <Image
                src="/images/pfp/business.jpg"
                alt="A selection of colourful Canadian ammolite specimens"
                fill
                priority
                sizes="(min-width: 1280px) 1024px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-xs text-white/35">
              A selection of Canadian ammolite, chosen piece by piece.
            </figcaption>
          </figure>

          <section className="grid gap-8 border-b border-white/10 pb-14 sm:pb-20 md:grid-cols-[0.75fr_1.25fr] md:gap-16">
            <div>
              <p className="mb-4 text-xs font-medium tracking-[0.2em] text-white/35 uppercase">
                From the founder
              </p>
              <h2 className="font-[family-name:var(--font-bacasime)] text-3xl leading-tight text-white sm:text-4xl">
                Built from curiosity, care, and a lot of time spent rockhounding.
              </h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-white/65 sm:text-lg">
              <p>{get('paragraph_1')}</p>
              <p>{get('paragraph_2')}</p>
              <p>{get('paragraph_3')}</p>
            </div>
          </section>

          <section className="mx-auto max-w-2xl py-14 text-center sm:py-20">
            <p className="font-[family-name:var(--font-bacasime)] text-3xl leading-tight text-white sm:text-4xl">
              {get('paragraph_4')}
            </p>
            <p className="mt-6 text-sm text-white/45">— Reese at Gemsutopia</p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-7 text-sm font-medium text-black transition-colors hover:bg-white/90"
              >
                Explore the collection
              </Link>
              <Link
                href="/sourcing"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-7 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
              >
                How we source
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
