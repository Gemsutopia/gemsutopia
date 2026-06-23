'use client';
import { useState, useEffect } from 'react';
import {
  IconUsers,
  IconPackage,
  IconCalendar,
  IconStar,
  IconChartBar,
  IconTrendingUp,
} from '@tabler/icons-react';

interface Stat {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
  data_source: string;
  is_real_time: boolean;
  sort_order: number;
  is_active: boolean;
}

const iconMap = {
  users: IconUsers,
  package: IconPackage,
  calendar: IconCalendar,
  star: IconStar,
  'bar-chart': IconChartBar,
  'trending-up': IconTrendingUp,
};

export default function Stats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        // Use all stats from backend (up to 6 for optimal display)
        setStats(data.slice(0, 6));
      } else {
        throw new Error('Failed to fetch from API');
      }
    } catch {
      // Only use fallback stats if API completely fails
      setStats(
        [
          {
            id: '1',
            title: 'Happy Customers',
            value: '1000+',
            description: 'Satisfied customers across Canada',
            icon: 'users',
            data_source: 'manual',
            is_real_time: false,
            sort_order: 1,
            is_active: true,
          },
          {
            id: '2',
            title: 'Products Sold',
            value: '500+',
            description: 'Premium gemstones delivered',
            icon: 'package',
            data_source: 'analytics',
            is_real_time: true,
            sort_order: 2,
            is_active: true,
          },
          {
            id: '3',
            title: 'Years of Experience',
            value: '10+',
            description: 'Expertise in gemstone sourcing',
            icon: 'calendar',
            data_source: 'manual',
            is_real_time: false,
            sort_order: 3,
            is_active: true,
          },
          {
            id: '4',
            title: 'Five Star Reviews',
            value: '98%',
            description: 'Customer satisfaction rating',
            icon: 'star',
            data_source: 'reviews',
            is_real_time: true,
            sort_order: 4,
            is_active: true,
          },
          {
            id: '5',
            title: 'Countries Served',
            value: '5+',
            description: 'International shipping',
            icon: 'trending-up',
            data_source: 'manual',
            is_real_time: false,
            sort_order: 5,
            is_active: true,
          },
          {
            id: '6',
            title: 'Gemstone Types',
            value: '25+',
            description: 'Variety of precious stones',
            icon: 'bar-chart',
            data_source: 'manual',
            is_real_time: false,
            sort_order: 6,
            is_active: true,
          },
        ].slice(0, 6)
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-black py-8">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-black pt-0 pb-2 lg:pt-4">
      {/* Mobile: Card format */}
      <div className="px-2 lg:hidden">
        <div className="w-full rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {stats.slice(0, 6).map(stat => {
              const IconComponent = iconMap[stat.icon as keyof typeof iconMap];

              return (
                <div key={stat.id} className="text-center">
                  <div className="mb-2.5 flex justify-center">
                    {IconComponent && <IconComponent size={20} className="text-white opacity-80" />}
                  </div>
                  <div className="mb-1.5 text-lg leading-normal font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs leading-normal font-medium text-white/90">
                    {stat.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Horizontal line format */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-6 gap-4 px-12">
          {stats.map(stat => {
            const IconComponent = iconMap[stat.icon as keyof typeof iconMap];

            return (
              <div key={stat.id} className="text-center">
                <div className="mb-1.5 flex justify-center">
                  {IconComponent && <IconComponent size={16} className="text-white opacity-80" />}
                </div>
                <div className="mb-0.5 text-lg leading-normal font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs leading-normal font-medium text-white/90">{stat.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
