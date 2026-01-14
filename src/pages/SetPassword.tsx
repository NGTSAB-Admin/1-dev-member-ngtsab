import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

export default function SetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check if user arrived with a valid session from email link
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession?.user?.email) {
          const userEmail = currentSession.user.email.toLowerCase();
          setEmail(userEmail);
          setSession(currentSession);

          // Check if they already completed registration (have a profile)
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (profile) {
            navigate('/directory');
            return;
          }

          // User has session but no profile - they can set password
          // Check if pending invitation exists (for additional validation)
          const { data: verifyData } = await supabase.functions.invoke('verify-invitation', {
            body: { email: userEmail },
          });

          if (verifyData?.exists) {
            setIsVerified(true);
          } else {
            // No pending invitation but user exists - they may have already used the link
            // Allow them to set password anyway since they have a valid session
            setIsVerified(true);
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes (handles the redirect from email)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession?.user?.email) {
          const userEmail = newSession.user.email.toLowerCase();
          setEmail(userEmail);
          setSession(newSession);

          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-invitation', {
            body: { email: userEmail },
          });

          if (!verifyError && verifyData?.exists) {
            setIsVerified(true);
          }

          setIsLoading(false);
        }
      }
    );

    checkSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    try {
      const trimmedEmail = email.toLowerCase().trim();

      // RLS prevents client-side reads of pending_invitations for invited users.
      // Verify via edge function instead.
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-invitation', {
        body: { email: trimmedEmail },
      });

      if (verifyError) {
        setError('An error occurred while checking your invitation. Please try again.');
        return;
      }

      if (!verifyData?.exists) {
        setError('No pending invitation found for this email address. Please check your email or contact an administrator.');
        return;
      }

      setIsVerified(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedEmail = email.toLowerCase().trim();
      
      // If we have a session (user clicked email link), update password directly
      if (session) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          setError(updateError.message);
          return;
        }

        // Complete registration
        const { error: regError } = await supabase.functions.invoke('complete-registration', {
          body: { email: trimmedEmail },
        });

        if (regError) {
          console.error('Registration error:', regError);
          // Continue anyway - profile might already exist
        }

        navigate('/directory');
        return;
      }

      // No session - user manually entered email without clicking invite link
      // Since inviteUserByEmail creates the user, we need to send a password reset
      setError(
        'Please click the invitation link in your email to set your password. ' +
        'If you cannot find the email, please contact an administrator to resend the invitation.'
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setIsVerified(false);
    setError(null);
    setPassword('');
    setConfirmPassword('');
    if (!session) {
      setEmail('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isVerified ? <Lock className="h-6 w-6 text-primary" /> : <Mail className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle className="text-2xl">
            {isVerified ? 'Set Your Password' : 'Verify Your Invitation'}
          </CardTitle>
          <CardDescription>
            {isVerified 
              ? 'Create a password to complete your account setup.'
              : 'Enter the email address where you received your invitation.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isVerified ? (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Set Password & Continue
                  </>
                )}
              </Button>

              {!session && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Email Verification
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
