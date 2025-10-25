
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import { CannaGrowUser } from '@/types';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { CircularProgress } from './ui/circular-progress';

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: CannaGrowUser;
}

export function EditProfileDialog({ isOpen, onOpenChange, user }: EditProfileDialogProps) {
  const { updateUserProfile } = useAuth();
  const { storage } = useFirebase();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setBio(user.bio || '');
    }
  }, [user]);

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !storage) return;

    const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadProgress(0);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploadProgress(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await updateUserProfile({ photoURL: downloadURL });
        setUploadProgress(null);
      }
    );
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    await updateUserProfile({
        displayName: displayName,
        bio: bio,
    });
    setIsSaving(false);
    onOpenChange(false);
  };
  
  const isUploading = uploadProgress !== null && uploadProgress < 100;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tu perfil</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {uploadProgress !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <CircularProgress value={uploadProgress} />
                </div>
              )}
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 bg-background hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleProfileImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="displayName">Nombre de usuario</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
