import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <footer className="border-t border-purple-900/30 mt-16 py-8 text-center">
        <p className="text-muted-foreground text-sm font-oswald tracking-widest">
          YAKUDZA <span className="text-purple-400">52</span> · STANDOFF 2 · 2026
        </p>
        <p className="text-muted-foreground/50 text-xs mt-1">Сила. Точность. Победа.</p>
      </footer>
    </div>
  );
}
