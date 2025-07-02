
'use client';

import { PlusCircle, Bot, Trash2, Eye, LayoutTemplate, Loader2, Globe } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { firestore, storage } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { publishSite, unpublishSite } from '@/actions/publish';


interface WebsiteMeta {
  id: string; 
  name: string;
  storagePath: string;
  createdAt: string;
  isPublished: boolean;
  subdomain?: string;
}

export default function MySitesPage() {
  const [sites, setSites] = useState<WebsiteMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState<WebsiteMeta | null>(null);
  const [subdomain, setSubdomain] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(firestore, "sites"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sitesData: WebsiteMeta[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sitesData.push({ 
            id: doc.id, 
            name: data.name,
            storagePath: data.storagePath,
            createdAt: new Date(data.createdAt.seconds * 1000).toLocaleDateString(),
            isPublished: data.isPublished || false,
            subdomain: data.subdomain,
        });
      });
      setSites(sitesData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching sites: ", error);
        toast({
            variant: "destructive",
            title: "Error loading sites",
            description: "Could not load your saved sites from the cloud.",
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);
  
  const handleDeleteSite = async (site: WebsiteMeta) => {
    if (site.isPublished) {
        toast({
            variant: "destructive",
            title: "Cannot Delete Published Site",
            description: "Please unpublish the site before deleting it.",
        });
        return;
    }

    try {
        await deleteDoc(doc(firestore, "sites", site.id));
        const storageRef = ref(storage, site.storagePath);
        await deleteObject(storageRef);
        toast({
            title: "Site Deleted",
            description: `"${site.name}" has been permanently removed.`,
        });
    } catch (error) {
        console.error("Error deleting site: ", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "There was a problem deleting the site.",
        });
    }
  }

  const handleViewSite = async (site: WebsiteMeta) => {
    try {
        const storageRef = ref(storage, site.storagePath);
        const url = await getDownloadURL(storageRef);
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('Error viewing site:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred while trying to display the site.',
        });
    }
  };
  
  const handlePublishClick = (site: WebsiteMeta) => {
    setSelectedSite(site);
    setSubdomain(site.subdomain || site.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30));
    setShowPublishDialog(true);
  };

  const handlePublish = async () => {
    if (!selectedSite || !subdomain) return;
    
    setIsPublishing(true);
    try {
        await publishSite(selectedSite.id, subdomain);
        toast({
            title: "Site Published!",
            description: `Your site is now live at /view/${subdomain}`,
        });
        setShowPublishDialog(false);
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Publication Failed",
            description: error.message,
        });
    } finally {
        setIsPublishing(false);
    }
  };

  const handleUnpublish = async (site: WebsiteMeta) => {
    setIsPublishing(true);
    try {
        await unpublishSite(site.id);
        toast({
            title: "Site Unpublished",
            description: "Your site is no longer public.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Unpublishing Failed",
            description: error.message,
        });
    } finally {
        setIsPublishing(false);
    }
  };

  return (
      <div className="flex flex-col gap-8">
        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Publish Your Website</DialogTitle>
                    <DialogDescription>
                        Choose a unique name for your public URL. This will make your site visible to everyone.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="subdomain">Public URL Name</Label>
                    <Input
                        id="subdomain"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="your-unique-site-name"
                    />
                    <p className="text-sm text-muted-foreground">
                        Your site will be available at: <br />
                        <Link href={`/view/${subdomain}`} target="_blank" className="font-semibold text-primary hover:underline">
                           .../view/{subdomain}
                        </Link>
                    </p>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handlePublish} disabled={isPublishing}>
                        {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish Site
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl font-headline">My Sites</h1>
          <div className="ml-auto flex items-center gap-2">
              <Button asChild size="sm" variant="outline" className="h-8 gap-1">
                <Link href="/dashboard/assistant">
                  <Bot className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    AI Assistant
                  </span>
                </Link>
              </Button>
              <Button asChild size="sm" className="h-8 gap-1">
                <Link href="/dashboard/create-site">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    New Site
                  </span>
                </Link>
              </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-8 min-h-[calc(100vh-12rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading your sites from the cloud...</p>
          </div>
        ) : sites.length === 0 ? (
          <div
            className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted min-h-[calc(100vh-12rem)]"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="p-4 bg-primary/10 rounded-full mb-4 relative">
                  <LayoutTemplate className="w-16 h-16 text-primary" />
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse -z-10 scale-125"></div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight font-headline">
                You have no websites yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ready to bring your vision to life? Click the button below to start creating your first website with our AI architect.
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/create-site">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Site
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sites.map(site => (
              <Card key={site.id} className="transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg hover:-translate-y-1 bg-card flex flex-col">
                <CardHeader>
                  <CardTitle className="truncate">{site.name}</CardTitle>
                  <CardDescription>Generated on {site.createdAt}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                   <div className="aspect-video w-full rounded-md border bg-muted/50 flex items-center justify-center p-4">
                     <LayoutTemplate className="w-16 h-16 text-muted-foreground" />
                   </div>
                   {site.isPublished && site.subdomain && (
                     <div className="mt-4">
                        <span className="flex items-center gap-2 text-sm font-semibold text-green-500">
                           <Globe className="h-4 w-4" /> Published
                        </span>
                        <Link href={`/view/${site.subdomain}`} target="_blank" className="text-primary text-sm hover:underline truncate block">
                           {`/view/${site.subdomain}`}
                        </Link>
                     </div>
                   )}
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteSite(site)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleViewSite(site)}>
                     <Eye className="mr-2 h-4 w-4" /> View HTML
                  </Button>
                  {site.isPublished ? (
                      <Button size="sm" variant="secondary" onClick={() => handleUnpublish(site)} disabled={isPublishing}>
                          {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Globe className="mr-2 h-4 w-4" />}
                           Unpublish
                      </Button>
                  ) : (
                      <Button size="sm" onClick={() => handlePublishClick(site)}>
                          <Globe className="mr-2 h-4 w-4" /> Publish
                      </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
