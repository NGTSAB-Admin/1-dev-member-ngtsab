import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, BookOpen, LogOut, User } from 'lucide-react';

export function Header() {
  const { user, profile, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/directory', label: 'Directory', icon: Users },
    { to: '/resources', label: 'Resources', icon: BookOpen },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
              <span className="text-lg font-bold text-primary">N</span>
            </div>
            <div>
              <span className="font-semibold text-foreground text-lg">NGTSAB</span>
              <span className="text-muted-foreground text-sm ml-2">Members</span>
            </div>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={isActive(link.to) ? 'secondary' : 'ghost'}
                    className="gap-2"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          )}

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{getDisplayName()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" asChild>
                  <Link to={`/profile/${user?.id}`}>
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}