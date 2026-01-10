import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useProfile } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, MapPin, Building2, Briefcase, Linkedin, Loader2, Lock, Edit2 } from "lucide-react";
import { PublicRole } from "@/contexts/AuthContext";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";

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

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading, refetch } = useProfile(id || "");
  const { user, isAdmin, refreshProfile } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const isOwnProfile = user?.id === id;
  const canEdit = isOwnProfile || isAdmin;
  const canViewPrivateInfo = isOwnProfile || isAdmin || profile?.contact_visibility;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p className="text-muted-foreground mb-6">This profile doesn't exist or you don't have permission to view it.</p>
            <Link to="/directory">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditSuccess = () => {
    refetch();
    if (isOwnProfile) {
      refreshProfile();
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/directory" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Link>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={profile.profile_photo_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                  <Badge className={roleColors[profile.public_role]}>
                    {roleLabels[profile.public_role]}
                  </Badge>
                </div>
                {profile.organization && (
                  <p className="text-lg text-muted-foreground">{profile.organization}</p>
                )}
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
              {canViewPrivateInfo ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <a href={`mailto:${profile.email}`} className="hover:text-foreground transition-colors">
                      {profile.email}
                    </a>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a href={`tel:${profile.phone}`} className="hover:text-foreground transition-colors">
                        {profile.phone}
                      </a>
                    </div>
                  )}
                  {profile.state && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{profile.state}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Contact information is private</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Professional Information */}
            <div className="grid gap-6 md:grid-cols-2">
              {profile.duties_and_responsibilities && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Duties & Responsibilities
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.duties_and_responsibilities}</p>
                </div>
              )}

              {profile.current_projects && (
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Current Projects
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.current_projects}</p>
                </div>
              )}
            </div>

            {/* Biography */}
            {profile.biography && (
              <>
                <Separator />
                <div>
                  <h2 className="text-lg font-semibold mb-3">Biography</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{profile.biography}</p>
                </div>
              </>
            )}

            {/* Empty State for New Profiles */}
            {!profile.biography && !profile.duties_and_responsibilities && !profile.current_projects && (
              <>
                <Separator />
                <div className="text-center py-8 text-muted-foreground">
                  <p>No additional information available for this profile.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <ProfileEditDialog
        profile={profile}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </Layout>
  );
}
