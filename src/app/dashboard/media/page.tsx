'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Copy, Image as ImageIcon, Loader2, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { firestore, storage } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


interface MediaItem {
  id: string; // Firestore document ID
  name: string;
  url: string;
  storagePath: string;
  size: number; // size in bytes
  createdAt: string;
}

const MAX_STORAGE_MB = 100; // Increased limit for cloud storage
const MAX_STORAGE_BYTES = MAX_STORAGE_MB * 1024 * 1024;

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const q = query(collection(firestore, "media"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mediaData: MediaItem[] = [];
      let usedSpace = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usedSpace += data.size;
        mediaData.push({ 
            id: doc.id, 
            name: data.name,
            url: data.url,
            storagePath: data.storagePath,
            size: data.size,
            createdAt: new Date(data.createdAt?.seconds * 1000).toLocaleDateString()
        });
      });
      setMedia(mediaData);
      setStorageUsed(usedSpace);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching media: ", error);
        toast({
            variant: "destructive",
            title: "Error loading media",
            description: "Could not load your saved media from the cloud.",
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleFileSelect = () => fileInputRef.current?.click();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !user) return;
    
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    let successfulUploads = 0;

    await Promise.all(files.map(async (file) => {
      if (!file.type.startsWith('image/')) {
        toast({ variant: "destructive", title: "Invalid File Type", description: `"${file.name}" is not an image.` });
        return;
      }
      if (storageUsed + file.size > MAX_STORAGE_BYTES) {
        toast({ variant: "destructive", title: "Storage Full", description: `Cannot upload "${file.name}". You have exceeded your ${MAX_STORAGE_MB}MB storage limit.` });
        return;
      }

      try {
        const storagePath = `media/${user.uid}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(firestore, 'media'), {
          userId: user.uid,
          name: file.name,
          url: url,
          storagePath: storagePath,
          size: file.size,
          createdAt: serverTimestamp(),
        });
        successfulUploads++;
      } catch (error) {
        console.error("Failed to upload file:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: `Could not upload "${file.name}".` });
      }
    }));
    
    if (successfulUploads > 0) {
      toast({ title: "Upload Successful", description: `${successfulUploads} image(s) have been added to your library.` });
    }

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setUploading(false);
  };

  const handleDelete = async (item: MediaItem) => {
    if (!user) return;
    try {
        await deleteDoc(doc(firestore, "media", item.id));
        const storageRef = ref(storage, item.storagePath);
        await deleteObject(storageRef);
        toast({ title: "Image Deleted", description: `"${item.name}" has been removed from your library.` });
    } catch (error) {
        console.error("Error deleting image:", error);
        toast({ variant: "destructive", title: "Deletion Failed", description: "There was a problem deleting the image." });
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to Clipboard!",
      description: "The public image URL is ready to be pasted."
    });
  };
  
  const storagePercentage = Math.round((storageUsed / MAX_STORAGE_BYTES) * 100);

  if (loading && !user) {
    return null; // or a different loading state if user is not yet available
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <ImageIcon className="h-6 w-6" />
              Media Library
            </CardTitle>
            <CardDescription>
              Upload, manage, and use images across all your projects.
            </CardDescription>
          </div>
          <Button onClick={handleFileSelect} disabled={uploading || !user}>
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload Images
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
            multiple
          />
        </CardHeader>
        <CardContent>
           <Alert>
              <AlertTitle>Cloud Storage Usage</AlertTitle>
              <AlertDescription className="flex items-center gap-4 mt-2">
                <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                        className={cn(
                            "bg-primary h-2.5 rounded-full transition-all",
                            storagePercentage > 85 && "bg-destructive"
                        )} 
                        style={{width: `${storagePercentage}%`}}
                    ></div>
                </div>
                <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {storagePercentage}% ({ (storageUsed / (1024*1024)).toFixed(2) } / {MAX_STORAGE_MB} MB)
                </div>
              </AlertDescription>
           </Alert>
        </CardContent>
      </Card>
      
      {loading ? (
         <div className="flex items-center justify-center p-8 min-h-[calc(100vh-24rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading your media from the cloud...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted min-h-[calc(100vh-24rem)]">
          <div className="flex flex-col items-center gap-2 text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold tracking-tight font-headline">
              Your Media Library is Empty
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Click the "Upload Images" button to add your first image and start building.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {media.map(item => (
            <Card key={item.id} className="group relative overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={item.url}
                  alt={item.name}
                  width={200}
                  height={200}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
              </CardContent>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="icon" onClick={() => handleCopy(item.url)}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy URL</span>
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                  <p className="text-xs font-semibold truncate">{item.name}</p>
                   <p className="text-xs opacity-80">{ (item.size / 1024).toFixed(1) } KB</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
