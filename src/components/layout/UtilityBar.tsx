import { ExternalLink } from 'lucide-react';

export function UtilityBar() {
  return (
    <div className="bg-primary text-primary-foreground py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <a 
          href="https://ngtsab.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-accent transition-colors font-medium"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          NGTSAB.org
        </a>
        <span className="text-primary-foreground/70">
          Member Portal
        </span>
      </div>
    </div>
  );
}
