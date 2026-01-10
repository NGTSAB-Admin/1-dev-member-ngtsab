import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useProfiles, useDeleteMember } from '@/hooks/useProfiles';
import { useAuth, PublicRole, Profile } from '@/contexts/AuthContext';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { AddMemberDialog } from '@/components/AddMemberDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, MapPin, Users, Edit2, Trash2, UserPlus, Loader2, Phone, Building2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roleLabels: Record<PublicRole, string> = {
  president: 'President',
  vice_president: 'Vice President',
  executive_board: 'Executive Board',
  board_of_directors: 'Board of Directors',
  state_representative: 'State Representative',
  advisor: 'Advisor',
  alumni: 'Alumni',
};

const roleColors: Record<PublicRole, string> = {
  president: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  vice_president: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  executive_board: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  board_of_directors: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  state_representative: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  advisor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  alumni: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function Directory() {
  const { profile: currentUserProfile, isAdmin, refreshProfile, user } = useAuth();
  const { data: profiles, isLoading, refetch } = useProfiles();
  const deleteMember = useDeleteMember();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);

  const states = useMemo(() => {
    if (!profiles) return [];
    const uniqueStates = [...new Set(profiles.map(p => p.state).filter(Boolean))];
    return uniqueStates.sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    
    return profiles.filter(profile => {
      const matchesSearch = 
        profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.organization?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || profile.public_role === roleFilter;
      const matchesState = stateFilter === 'all' || profile.state === stateFilter;

      return matchesSearch && matchesRole && matchesState;
    });
  }, [profiles, searchQuery, roleFilter, stateFilter]);

  const handleDelete = async () => {
    if (!deletingProfile) return;
    
    try {
      await deleteMember.mutateAsync(deletingProfile.id);
      toast({
        title: 'Member removed',
        description: `${deletingProfile.full_name} has been removed from the directory.`,
      });
      setDeletingProfile(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const canEdit = (profile: Profile) => {
    return isAdmin || profile.id === user?.id;
  };

  const canDelete = (profile: Profile) => {
    return isAdmin && profile.id !== user?.id;
  };

  const handleEditSuccess = () => {
    refetch();
    if (editingProfile?.id === user?.id) {
      refreshProfile();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
              Member Directory
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with {profiles?.length || 0} advocates across the country
            </p>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state!}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredProfiles.length} member{filteredProfiles.length !== 1 ? 's' : ''}
        </p>

        {/* Member Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map(profile => (
            <Link key={profile.id} to={`/profile/${profile.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.profile_photo_url || undefined} alt={profile.full_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {profile.full_name}
                        </h3>
                        <div className="flex gap-1 shrink-0" onClick={(e) => e.preventDefault()}>
                          {canEdit(profile) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingProfile(profile);
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canDelete(profile) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                setDeletingProfile(profile);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {profile.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className={roleColors[profile.public_role]}>
                          {roleLabels[profile.public_role]}
                        </Badge>
                        {profile.state && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {profile.state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    {profile.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        {profile.phone}
                      </p>
                    )}
                    {profile.organization && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" />
                        {profile.organization}
                      </p>
                    )}
                    {profile.current_projects && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{profile.current_projects}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">No members found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStateFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <ProfileEditDialog
        profile={editingProfile}
        open={!!editingProfile}
        onOpenChange={(open) => !open && setEditingProfile(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProfile} onOpenChange={(open) => !open && setDeletingProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deletingProfile?.full_name} from the directory? 
              This will also delete their account and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMember.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}