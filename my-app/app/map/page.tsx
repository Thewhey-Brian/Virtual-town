'use client';

import { motion } from 'framer-motion';
import { MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { TownMap } from '@/components/town-map';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { locations } from '@/lib/data';

export default function MapPage() {
  const locationTypes = [
    { type: 'home', label: '住宅', count: locations.filter(l => l.type === 'home').length, icon: '🏠' },
    { type: 'cafe', label: '咖啡馆', count: locations.filter(l => l.type === 'cafe').length, icon: '☕' },
    { type: 'restaurant', label: '餐厅', count: locations.filter(l => l.type === 'restaurant').length, icon: '🍜' },
    { type: 'shop', label: '商店', count: locations.filter(l => l.type === 'shop').length, icon: '👗' },
    { type: 'park', label: '公园', count: locations.filter(l => l.type === 'park').length, icon: '🌳' },
    { type: 'library', label: '图书馆', count: locations.filter(l => l.type === 'library').length, icon: '📚' },
    { type: 'work', label: '工作', count: locations.filter(l => l.type === 'work').length, icon: '💼' },
    { type: 'transport', label: '交通', count: locations.filter(l => l.type === 'transport').length, icon: '🚇' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefbf7] via-[#fdf6ed] to-[#f9e8d0]">
      <Navigation />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-[#e59a3d]" />
                  小镇地图
                </h1>
                <p className="text-muted-foreground">探索虚拟小镇的每一个角落</p>
              </div>
            </div>

            {/* Location Stats */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {locationTypes.map((item) => (
                <Card key={item.type} className="p-3 text-center glass hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                  <p className="text-lg font-bold text-[#e59a3d]">{item.count}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Full Screen Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="h-[calc(100vh-280px)] min-h-[500px] rounded-2xl overflow-hidden shadow-xl"
          >
            <TownMap />
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              点击地点查看详情
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#e59a3d]" />
              头像表示居民位置
            </span>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
