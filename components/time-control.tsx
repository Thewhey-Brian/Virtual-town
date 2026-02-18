'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Clock,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudFog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSimulation, TimeOfDay, WeatherType } from '@/lib/simulation-context';

const timeOfDayIcons: Record<TimeOfDay, React.ReactNode> = {
  dawn: <Sun className="w-4 h-4 text-orange-400" />,
  morning: <Sun className="w-4 h-4 text-yellow-400" />,
  noon: <Sun className="w-4 h-4 text-yellow-500" />,
  afternoon: <Sun className="w-4 h-4 text-orange-400" />,
  evening: <Sun className="w-4 h-4 text-orange-500" />,
  night: <Moon className="w-4 h-4 text-blue-300" />,
};

const timeOfDayGradients: Record<TimeOfDay, string> = {
  dawn: 'from-orange-400/20 via-pink-300/20 to-blue-300/20',
  morning: 'from-yellow-200/30 via-orange-100/20 to-blue-100/20',
  noon: 'from-blue-100/20 via-yellow-100/20 to-orange-100/20',
  afternoon: 'from-orange-100/20 via-yellow-200/20 to-blue-200/20',
  evening: 'from-orange-400/30 via-pink-300/20 to-purple-400/20',
  night: 'from-indigo-900/40 via-purple-900/30 to-blue-900/40',
};

const weatherIcons: Record<WeatherType, React.ReactNode> = {
  sunny: <Sun className="w-4 h-4 text-yellow-500" />,
  cloudy: <Cloud className="w-4 h-4 text-gray-400" />,
  rainy: <CloudRain className="w-4 h-4 text-blue-400" />,
  foggy: <CloudFog className="w-4 h-4 text-gray-300" />,
  clear: <Sun className="w-4 h-4 text-yellow-300" />,
};

const speedOptions = [
  { value: 1, label: '1x', description: '正常速度' },
  { value: 2, label: '2x', description: '2倍速' },
  { value: 5, label: '5x', description: '5倍速' },
];

export function TimeControl() {
  const {
    currentTime,
    isPlaying,
    speed,
    timeOfDay,
    weather,
    togglePlay,
    setSpeed,
    setTime,
    getCurrentTimeString,
    getTimeOfDayLabel,
  } = useSimulation();
  
  const [showTimeSlider, setShowTimeSlider] = useState(false);
  
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const timeProgress = ((hours * 60 + minutes) / (24 * 60)) * 100;
  
  const handleTimeSliderChange = (value: number[]) => {
    const totalMinutes = Math.floor((value[0] / 100) * 24 * 60);
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    setTime(newHours, newMinutes);
  };
  
  const skipTime = (minutes: number) => {
    const newTime = new Date(currentTime.getTime() + minutes * 60000);
    setTime(newTime.getHours(), newTime.getMinutes());
  };
  
  return (
    <div className={`
      relative rounded-2xl overflow-hidden
      bg-gradient-to-br ${timeOfDayGradients[timeOfDay]}
      border border-white/20 backdrop-blur-sm
      transition-all duration-1000
    `}>
      {/* Main Controls */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Time Display */}
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center shadow-lg"
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
            >
              {timeOfDayIcons[timeOfDay]}
            </motion.div>
            <div>
              <div className="text-3xl font-bold text-gray-800 font-mono tracking-tight">
                {getCurrentTimeString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{getTimeOfDayLabel()}</span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  {weatherIcons[weather]}
                  <span className="capitalize">{weather === 'sunny' ? '晴朗' : weather === 'cloudy' ? '多云' : weather === 'rainy' ? '下雨' : weather === 'foggy' ? '雾天' : '晴朗'}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Play Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => skipTime(-30)}
              className="bg-white/80 hover:bg-white border-0"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlay}
              className={`
                w-12 h-12 rounded-xl shadow-lg transition-all duration-300
                ${isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }
              `}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => skipTime(30)}
              className="bg-white/80 hover:bg-white border-0"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Speed Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">模拟速度</span>
          </div>
          <div className="flex gap-1 bg-white/60 rounded-lg p-1">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSpeed(option.value)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                  ${speed === option.value 
                    ? 'bg-[#e59a3d] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-white/50'
                  }
                `}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Time Slider Toggle */}
        <button
          onClick={() => setShowTimeSlider(!showTimeSlider)}
          className="w-full text-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showTimeSlider ? '收起时间轴 ▲' : '展开时间轴 ▼'}
        </button>
      </div>
      
      {/* Expandable Time Slider */}
      <motion.div
        initial={false}
        animate={{ height: showTimeSlider ? 'auto' : 0 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4">
          <div className="bg-white/80 rounded-xl p-4">
            {/* Time markers */}
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
            
            {/* Slider */}
            <Slider
              value={[timeProgress]}
              max={100}
              step={0.1}
              onValueChange={handleTimeSliderChange}
              className="cursor-pointer"
            />
            
            {/* Day phases */}
            <div className="flex justify-between mt-3">
              {(['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night'] as TimeOfDay[]).map((phase) => (
                <button
                  key={phase}
                  onClick={() => {
                    const phaseHours: Record<TimeOfDay, number> = {
                      dawn: 6,
                      morning: 9,
                      noon: 12,
                      afternoon: 15,
                      evening: 18,
                      night: 21,
                    };
                    setTime(phaseHours[phase]);
                  }}
                  className={`
                    flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                    ${timeOfDay === phase ? 'bg-[#e59a3d]/10 text-[#e59a3d]' : 'text-gray-400 hover:bg-gray-100'}
                  `}
                >
                  {timeOfDayIcons[phase]}
                  <span className="text-[10px]">
                    {phase === 'dawn' ? '黎明' : 
                     phase === 'morning' ? '上午' : 
                     phase === 'noon' ? '中午' : 
                     phase === 'afternoon' ? '下午' : 
                     phase === 'evening' ? '傍晚' : '夜晚'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Time Progress Bar (always visible at bottom) */}
      <div className="h-1 bg-gray-200/50">
        <motion.div 
          className="h-full bg-[#e59a3d]"
          style={{ width: `${timeProgress}%` }}
          layoutId="timeProgress"
        />
      </div>
    </div>
  );
}
