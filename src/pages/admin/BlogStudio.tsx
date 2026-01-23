import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Studio } from 'sanity';
import baseConfig from '@/sanity/sanity.config';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Stable history instance at module scope
const history = createBrowserHistory({ window });

// Stable config at module scope - never recreated
const studioConfig = {
  ...baseConfig,
  unstable_history: history,
};

export default function BlogStudio() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

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
    queueMicrotask(() => navigate('/login'));
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

  return (
    <div style={{ height: '100vh' }}>
      <Studio config={studioConfig} />
    </div>
  );
}
