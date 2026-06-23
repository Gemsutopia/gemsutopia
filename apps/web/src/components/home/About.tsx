'use client';
import { useCMSContent } from '@/hooks/useCMSContent';
import GemFacts from './GemFacts';

export default function About() {
  const { getContent, loading } = useCMSContent();

  const title = getContent('about', 'section_title') || '💎 About Gemsutopia 💎';
  const content =
    getContent('about', 'section_content') ||
    "Hi, I'm Reese, founder of Gemsutopia and a proud Canadian gem dealer from Alberta. Every gemstone is hand-selected, ethically sourced, and personally inspected by me. Many pieces are even mined by yours truly! This isn't just a business – it's a passion, and you're supporting a small Canadian dream built on integrity and care.";

  if (loading) {
    return (
      <section className="bg-black py-8 text-white md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-0 text-white md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold md:mb-8 md:text-4xl">{title}</h2>
          <div
            className="mx-auto max-w-3xl text-base text-gray-300 md:text-lg"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* Gem Facts Section */}
      <GemFacts />
    </section>
  );
}
