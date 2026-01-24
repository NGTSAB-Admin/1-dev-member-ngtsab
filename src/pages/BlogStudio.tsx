import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Studio } from 'sanity';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { config } from '@/sanity/sanity.config';

export default function BlogStudio() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setIsCheckingRole(false);
        return;
      }

      try {
        // Check if user has admin or blogger role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'blogger']);

        if (error) {
          console.error('Error checking role:', error);
          setHasAccess(false);
        } else {
          setHasAccess(data && data.length > 0);
        }
      } catch (err) {
        console.error('Error checking access:', err);
        setHasAccess(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    if (!authLoading) {
      checkAccess();
    }
  }, [user, authLoading]);

  // Show loading while checking auth and role
  if (authLoading || isCheckingRole) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    navigate('/login', { state: { from: '/admin/blog' } });
    return null;
  }

  // Show access denied if no admin/blogger role
  if (!hasAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the blog studio. 
            Only users with admin or blogger roles can access this area.
          </p>
          <button
            onClick={() => navigate('/directory')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Studio config={config} />
    </div>
  );
}
