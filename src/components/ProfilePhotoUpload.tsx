import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl: string | null;
  fullName: string;
  onPhotoChange: (url: string | null) => void;
  disabled?: boolean;
}

export function ProfilePhotoUpload({ 
  userId, 
  currentPhotoUrl, 
  fullName, 
  onPhotoChange,
  disabled 
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Delete old photo if exists
      if (currentPhotoUrl) {
        const oldPath = currentPhotoUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('profile-photos').remove([oldPath]);
      }

      // Upload new photo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      onPhotoChange(publicUrl);
      
      toast({
        title: 'Photo uploaded',
        description: 'Your profile photo has been updated',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    setIsUploading(true);
    try {
      const oldPath = currentPhotoUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('profile-photos').remove([oldPath]);
      onPhotoChange(null);
      
      toast({
        title: 'Photo removed',
        description: 'Your profile photo has been removed',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove photo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <Avatar className="h-24 w-24 text-2xl">
          <AvatarImage src={currentPhotoUrl || undefined} alt={fullName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Camera className="h-4 w-4 mr-1" />
          {currentPhotoUrl ? 'Change' : 'Upload'}
        </Button>
        
        {currentPhotoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={disabled || isUploading}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
