'use client';
import { useState, useEffect } from 'react';
import { IconRefresh } from '@tabler/icons-react';

interface GemFact {
  id: string;
  fact: string;
  gem_type: string;
  source: string;
  is_active: boolean;
}

// Fallback facts array
const fallbackFacts: GemFact[] = [
  {
    id: 'fallback-1',
    fact: "Diamonds are formed deep in the Earth's mantle under extreme pressure and temperature, then brought to the surface through volcanic eruptions.",
    gem_type: 'Diamond',
    source: 'Default',
    is_active: true,
  },
  {
    id: 'fallback-2',
    fact: 'Emeralds were prized by ancient Egyptians and were often buried with pharaohs for protection in the afterlife.',
    gem_type: 'Emerald',
    source: 'Default',
    is_active: true,
  },
  {
    id: 'fallback-3',
    fact: 'Rubies and sapphires are both varieties of the mineral corundum, with ruby being the red variety and sapphire being all other colors.',
    gem_type: 'Corundum',
    source: 'Default',
    is_active: true,
  },
  {
    id: 'fallback-4',
    fact: 'Opals can contain up to 20% water and display a phenomenon called "play of color" due to their unique internal structure.',
    gem_type: 'Opal',
    source: 'Default',
    is_active: true,
  },
  {
    id: 'fallback-5',
    fact: 'Pearls are the only gemstones created by living organisms and can take several years to form naturally.',
    gem_type: 'Pearl',
    source: 'Default',
    is_active: true,
  },
];

export default function GemFacts() {
  const [gemFact, setGemFact] = useState<GemFact | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * fallbackFacts.length);
    return fallbackFacts[randomIndex];
  };

  const getNextFact = () => {
    const nextIndex = (currentFactIndex + 1) % fallbackFacts.length;
    setCurrentFactIndex(nextIndex);
    return fallbackFacts[nextIndex];
  };

  const fetchFactOfTheDay = async (forceNew = false) => {
    setLoading(forceNew ? false : true);

    try {
      const url = forceNew ? '/api/gem-facts?random=true' : '/api/gem-facts';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGemFact(data);
        setLoading(false);
        setRefreshing(false);
        return;
      }
    } catch {
      // API fetch failed, using fallback
    }

    // Use fallback facts only if API fails
    if (forceNew) {
      setGemFact(getNextFact());
    } else {
      setGemFact(fallbackFacts[0]);
      setCurrentFactIndex(0);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchFactOfTheDay();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFactOfTheDay(true); // Force fetch a new/random fact
  };

  if (loading) {
    return (
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!gemFact) {
    return null;
  }

  return (
    <section className="pt-32 pb-16">
      <div className="mx-auto max-w-7xl px-1">
        <div className="text-center">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Gem Facts</h2>
          </div>

          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-4">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                {gemFact.gem_type || 'General'}
              </span>
            </div>

            <p className="text-lg leading-relaxed text-white md:text-xl">{gemFact.fact}</p>

            <div className="mt-6 text-center">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="rounded-lg p-2 text-white transition-colors duration-200 hover:bg-white/10 hover:text-gray-300"
                title="Get new fact"
              >
                <IconRefresh size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
