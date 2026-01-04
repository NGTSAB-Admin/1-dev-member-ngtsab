import { ReactNode } from 'react';
import { UtilityBar } from './UtilityBar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <UtilityBar />
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-primary text-primary-foreground py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className="text-primary-foreground/70">
            © {new Date().getFullYear()} National Gifted & Talented Student Advocacy Board. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
