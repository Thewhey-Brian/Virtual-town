'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Users, 
  Map, 
  History, 
  BookHeart, 
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: '居民', href: '/', icon: Users },
  { label: '地图', href: '/map', icon: Map },
  { label: '记录', href: '/logs', icon: History },
  { label: '日记', href: '/journals', icon: BookHeart },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#f0e0cc]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e59a3d] to-[#d97f28] flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-foreground leading-tight">虚拟小镇</h1>
            <p className="text-[10px] text-muted-foreground">Virtual Town v2.0</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500" />
            )}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-[#fefbf7]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e59a3d] to-[#d97f28] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg">虚拟小镇</h1>
                    <p className="text-xs text-muted-foreground">Virtual Town v2.0</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <MobileNavLink 
                      key={item.href} 
                      item={item} 
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-[#f0e0cc]">
                  <p className="text-xs text-muted-foreground px-2">
                    © 2026 Virtual Town
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  
  return (
    <Link href={item.href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[#fdf6ed] transition-colors"
      >
        <Icon className="w-4 h-4" />
        {item.label}
      </motion.div>
    </Link>
  );
}

function MobileNavLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = item.icon;
  
  return (
    <Link href={item.href} onClick={onClick}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-[#fdf6ed] transition-colors">
        <div className="w-10 h-10 rounded-lg bg-[#f9e8d0] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#d97f28]" />
        </div>
        <span className="font-medium">{item.label}</span>
      </div>
    </Link>
  );
}
