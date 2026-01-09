import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Profile, PublicRole, useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';

const publicRoleOptions: { value: PublicRole; label: string }[] = [
  { value: 'president', label: 'President' },
  { value: 'vice_president', label: 'Vice President' },
  { value: 'executive_board', label: 'Executive Board' },
  { value: 'board_of_directors', label: 'Board of Directors' },
  { value: 'state_representative', label: 'State Representative' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'alumni', label: 'Alumni' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  public_role: z.enum(['advisor', 'executive_board', 'board_of_directors', 'president', 'vice_president', 'state_representative', 'alumni']),
  phone: z.string().optional(),
  state: z.string().optional(),
  organization: z.string().optional(),
  current_projects: z.string().optional(),
  duties_and_responsibilities: z.string().optional(),
  biography: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface ProfileEditDialogProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProfileEditDialog({ profile, open, onOpenChange, onSuccess }: ProfileEditDialogProps) {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const updateProfile = useUpdateProfile();
  
  // Only admins can change roles - members editing their own profile cannot
  const canEditRole = isAdmin;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      public_role: 'alumni',
      phone: '',
      state: '',
      organization: '',
      current_projects: '',
      duties_and_responsibilities: '',
      biography: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name,
        email: profile.email,
        public_role: profile.public_role,
        phone: profile.phone || '',
        state: profile.state || '',
        organization: profile.organization || '',
        current_projects: profile.current_projects || '',
        duties_and_responsibilities: profile.duties_and_responsibilities || '',
        biography: profile.biography || '',
        linkedin: profile.linkedin || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: FormData) => {
    if (!profile) return;
    
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        ...data,
        phone: data.phone || null,
        state: data.state || null,
        organization: data.organization || null,
        current_projects: data.current_projects || null,
        duties_and_responsibilities: data.duties_and_responsibilities || null,
        biography: data.biography || null,
        linkedin: data.linkedin || null,
        contact_visibility: true, // Always visible
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your member profile information
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="public_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!canEditRole}
                  >
                    <FormControl>
                      <SelectTrigger className={!canEditRole ? 'opacity-60' : ''}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publicRoleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!canEditRole && (
                    <p className="text-xs text-muted-foreground">Only admins can change roles</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="Your organization (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="current_projects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Projects</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your current projects (optional)" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duties_and_responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duties & Responsibilities</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your duties and responsibilities (optional)" 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about yourself (optional)" 
                      className="resize-none"
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://linkedin.com/in/yourprofile" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}