import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Studio, type StudioProps } from 'sanity';
import config from '@/sanity/sanity.config';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Create a custom history adapter for Sanity Studio to work with React Router
function useSanityHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const listenersRef = useRef(new Set<() => void>());

  // Notify Sanity listeners whenever React Router location changes
  useEffect(() => {
    listenersRef.current.forEach((fn) => fn());
  }, [location.pathname, location.search, location.hash]);

  const toStudioPath = (path: string) => {
    const normalized = path?.startsWith('/') ? path : `/${path ?? ''}`;
    return normalized === '/' ? '' : normalized;
  };

  const toAppPath = (path: string) => `/admin/blog${toStudioPath(path)}`;

  return useMemo(
    () => ({
      get location() {
        return {
          pathname: location.pathname.replace('/admin/blog', '') || '/',
          search: location.search,
          hash: location.hash,
        };
      },
      push: (path: string) => {
        navigate(toAppPath(path));
      },
      replace: (path: string) => {
        navigate(toAppPath(path), { replace: true });
      },
      createHref: (path: string) => toAppPath(path),
      listen: (listener: () => void) => {
        listenersRef.current.add(listener);
        return () => listenersRef.current.delete(listener);
      },
    }),
    [navigate, location]
  );
}

export default function BlogStudio() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const history = useSanityHistory();
  const [isBlogger, setIsBlogger] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBloggerRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking blogger role:', error);
        setIsBlogger(false);
      } else {
        const hasAccess = data?.some(r => r.role === 'blogger' || r.role === 'admin') ?? false;
        setIsBlogger(hasAccess);
      }
      setChecking(false);
    };

    if (!authLoading) {
      checkBloggerRole();
    }
  }, [user, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!isBlogger) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h1 className="text-2xl font-bold text-foreground mb-4">Not Authorized</h1>
        <p className="text-muted-foreground mb-6">
          You need blogger or admin privileges to access the Blog Studio.
        </p>
        <button
          onClick={() => navigate('/directory')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Directory
        </button>
      </div>
    );
  }

  const studioConfig = {
    ...config,
    unstable_history: history,
  } as StudioProps['config'];

  return (
    <div style={{ height: '100vh' }}>
      <Studio config={studioConfig} />
    </div>
  );
}
