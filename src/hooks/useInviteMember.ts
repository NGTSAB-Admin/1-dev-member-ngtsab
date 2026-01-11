import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicRole } from '@/contexts/AuthContext';

interface InviteMemberData {
  email: string;
  full_name: string;
  public_role: PublicRole;
  phone?: string;
  state?: string;
  organization?: string;
  current_projects?: string;
  duties_and_responsibilities?: string;
  biography?: string;
  linkedin?: string;
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InviteMemberData) => {
      const { data: result, error } = await supabase.functions.invoke('invite-member', {
        body: data,
      });
      
      if (error) throw error;
      if (result?.error) throw new Error(result.error);
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
