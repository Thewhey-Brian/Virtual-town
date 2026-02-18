'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Map from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const DEFAULT_LAT = 34.1469;
const DEFAULT_LNG = -118.2551;

export default function WelcomePage() {
  const router = useRouter();
  const [viewState, setViewState] = useState({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    zoom: 13,
    bearing: 0,
    pitch: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setViewState(prev => ({
        ...prev,
        bearing: prev.bearing + 0.1,
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      {/* Mapbox Background */}
      <div className="absolute inset-0 opacity-40">
        {MAPBOX_TOKEN && (
          <Map
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100%', height: '100%' }}
            interactive={false}
          />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#165DFF] flex items-center justify-center shadow-lg shadow-[#165DFF]/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            AI Virtual Town
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-md mx-auto">
            看 AI 居民在真实小镇里自动生活
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => router.push('/town')}
              className="h-14 px-8 text-lg font-medium bg-[#FF7D00] hover:bg-[#FF7D00]/90 text-white rounded-full shadow-lg shadow-[#FF7D00]/30 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2" />
              进入小镇
            </Button>
          </motion.div>
        </motion.div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 text-white/40 text-sm"
        >
          无需注册 · 自动运行
        </motion.div>
      </div>
    </div>
  );
}
