'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';

export default function FacebookPage() {
  const [businessUrl, setBusinessUrl] = useState('https://www.facebook.com/gemsutopia');
  const [personalUrl, setPersonalUrl] = useState('');

  useEffect(() => {
    fetch('/api/pages/socials')
      .then(res => res.json())
      .then(data => {
        const content = data?.data?.content;
        if (content) {
          if (content.facebook_business) setBusinessUrl(content.facebook_business);
          if (content.facebook_personal) setPersonalUrl(content.facebook_personal);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="relative flex min-h-screen grow items-center justify-center overflow-hidden px-4 py-24">
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="mb-2 text-center">
            <FontAwesomeIcon icon={faFacebook} className="mb-3 text-4xl text-white/80" />
            <h1 className="font-[family-name:var(--font-bacasime)] text-3xl text-white">
              Facebook
            </h1>
            <p className="mt-2 text-sm text-white/50">Follow us on Facebook</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            {businessUrl && (
              <a
                href={businessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[200px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-8 py-4 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                <FontAwesomeIcon icon={faFacebook} className="text-base" />
                Business
              </a>
            )}
            {personalUrl && (
              <a
                href={personalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[200px] items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-8 py-4 text-sm font-medium text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                <FontAwesomeIcon icon={faFacebook} className="text-base" />
                Personal
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
