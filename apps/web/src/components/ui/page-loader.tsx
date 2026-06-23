'use client';

import { Spinner } from '@/components/ui/spinner';

const gemFacts = [
  "Diamonds are the hardest natural substance on Earth, scoring 10 on the Mohs scale.",
  "Rubies and sapphires are the same mineral - corundum. Red corundum is ruby, all other colors are sapphire.",
  "The Hope Diamond is believed to be cursed, bringing misfortune to its owners throughout history.",
  "Pearls are the only gemstones created by living creatures - oysters and mussels.",
  "Alexandrite changes color from green in daylight to red in incandescent light.",
  "The largest diamond ever found, the Cullinan, weighed 3,106 carats before cutting.",
  "Emeralds were Cleopatra's favorite gemstone, and she owned extensive emerald mines.",
  "Opals contain up to 20% water trapped within their silica structure.",
  "Tanzanite is found in only one place on Earth - near Mount Kilimanjaro in Tanzania.",
  "Ancient Romans believed amethyst could prevent intoxication from alcohol.",
  "The word 'diamond' comes from the Greek 'adamas,' meaning unconquerable or invincible.",
  "Sapphires come in every color except red - pink sapphires exist but red ones are rubies.",
  "Moonstones appear to glow from within due to a phenomenon called adularescence.",
  "Jade has been treasured in China for over 5,000 years, valued more than gold.",
  "The Star of India sapphire is one of the largest gem-quality blue star sapphires at 563 carats.",
  "Garnets were used as bullets by Asian tribes because they believed they caused deadlier wounds.",
  "Tourmaline can display multiple colors in a single crystal, called watermelon tourmaline.",
  "Ancient Egyptians believed peridot was the 'gem of the sun' and protected against nightmares.",
  "Lapis lazuli was ground into powder to create the ultramarine blue pigment used by Renaissance painters.",
  "The rarest gemstone color is red, making red diamonds and red beryl extremely valuable.",
  "Aquamarine was believed by sailors to calm waves and keep them safe at sea.",
  "Citrine is called the 'merchant's stone' because it's believed to attract wealth.",
  "Black opals from Australia's Lightning Ridge are among the most valuable opals.",
  "Spinels were often mistaken for rubies - the Black Prince's Ruby is actually a spinel.",
  "Topaz in its pure form is colorless; impurities give it various colors.",
  "Morganite was named after banker J.P. Morgan, an avid gem collector.",
  "Chrysoberyl cat's eye exhibits chatoyancy - a moving line of light across its surface.",
  "Zircon is the oldest mineral on Earth, with some crystals dating back 4.4 billion years.",
  "Kunzite fades when exposed to strong sunlight for extended periods.",
  "The ancient Greeks believed diamonds were tears of the gods or splinters from falling stars.",
  "Ammolite is made from fossilized ammonite shells and displays iridescent colors.",
  "Larimar is found only in the Dominican Republic and resembles Caribbean waters.",
  "Benitoite, California's state gem, glows bright blue under UV light.",
  "Paraiba tourmalines contain copper, giving them an electric neon blue-green color.",
  "The 'pigeon blood' red is the most sought-after color in Burmese rubies.",
  "Fluorite gives us the word 'fluorescence' - it glows under ultraviolet light.",
  "Diamonds can burn if heated to about 1,292°F in the presence of oxygen.",
  "Moldavite is a green glass formed by a meteorite impact 15 million years ago.",
  "Kashmir sapphires are so rare that they rarely appear at auction anymore.",
  "Tsavorite garnet rivals emerald in color but is far rarer.",
  "Rhodochrosite's banded pink patterns made it Argentina's national gemstone.",
  "Bloodstone was believed by medieval Christians to have formed from Christ's blood.",
  "Sunstone contains copper inclusions that create a sparkling effect called aventurescence.",
  "Demantoid garnet has higher dispersion than diamond, creating more fire.",
  "Charoite is found only in Siberia along the Chara River.",
  "Sugilite was discovered in 1944 but gem-quality material wasn't found until 1979.",
  "Red beryl is rarer than diamond, found mainly in Utah's Wah Wah Mountains.",
  "Labradorite displays a phenomenon called labradorescence - flashes of blue and green.",
  "Kornerupine is so rare that most gem enthusiasts have never seen one.",
  "Grandidierite is one of the rarest gemstones, first discovered in Madagascar in 1902.",
];

// Get a stable random fact (won't change on re-renders)
function getRandomFact() {
  return gemFacts[Math.floor(Math.random() * gemFacts.length)];
}

interface PageLoaderProps {
  /** Show gem fact below spinner */
  showFact?: boolean;
  /** Custom message instead of gem fact */
  message?: string;
  /** Make it fill the full screen */
  fullScreen?: boolean;
}

export function PageLoader({ showFact = true, message, fullScreen = true }: PageLoaderProps) {
  const fact = getRandomFact();

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
          <Spinner size="48" color="white" />
          {message && <p className="text-white/50 text-sm leading-relaxed">{message}</p>}
          {showFact && !message && <p className="text-white/50 text-sm leading-relaxed">{fact}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-6 max-w-md px-6 text-center">
        <Spinner size="48" color="white" />
        {message && <p className="text-white/50 text-sm leading-relaxed">{message}</p>}
        {showFact && !message && <p className="text-white/50 text-sm leading-relaxed">{fact}</p>}
      </div>
    </div>
  );
}
