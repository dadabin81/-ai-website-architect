'use client';

import { PlusCircle, Bot, Trash2, Eye, Newspaper, Loader2 } from "lucide-react"
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { firestore, storage } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";

// Define the structure of a saved blog's metadata
interface BlogMeta {
  id: string; // Firestore document ID
  name: string;
  storagePath: string;
  createdAt: string;
}

export default function MyBlogsPage() {
  const [blogs, setBlogs] = useState<BlogMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load blogs from Firestore on component mount
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(firestore, "blogs"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const blogsData: BlogMeta[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        blogsData.push({ 
            id: doc.id, 
            name: data.name,
            storagePath: data.storagePath,
            createdAt: new Date(data.createdAt.seconds * 1000).toLocaleDateString()
        });
      });
      setBlogs(blogsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching blogs: ", error);
        toast({
            variant: "destructive",
            title: "Error loading blogs",
            description: "Could not load your saved blogs from the cloud.",
        });
        setLoading(false);
    });

    return () => unsubscribe(); // Detach listener on cleanup
  }, [user, toast]);

  const handleDeleteBlog = async (blog: BlogMeta) => {
    try {
        // Delete the Firestore document
        await deleteDoc(doc(firestore, "blogs", blog.id));
        
        // Delete the file from Cloud Storage
        const storageRef = ref(storage, blog.storagePath);
        await deleteObject(storageRef);

        toast({
            title: "Blog Deleted",
            description: `"${blog.name}" has been permanently removed.`,
        });

    } catch (error) {
        console.error("Error deleting blog: ", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "There was a problem deleting the blog.",
        });
    }
  }

  const handleViewBlog = async (blog: BlogMeta) => {
    try {
        const storageRef = ref(storage, blog.storagePath);
        const url = await getDownloadURL(storageRef);
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('Error viewing blog:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'An unexpected error occurred while trying to display the blog.',
        });
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">My Blogs</h1>
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
              <Link href="/dashboard/create-blog">
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New Blog
                </span>
              </Link>
            </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center p-8 min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading your blogs from the cloud...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div
          className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-muted min-h-[calc(100vh-12rem)]"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4 relative">
                <Newspaper className="w-16 h-16 text-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse -z-10 scale-125"></div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight font-headline">
              You have no blogs yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ready to share your story? Click the button below to start your first blog with our AI architect.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/create-blog">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Blog
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map(blog => (
            <Card key={blog.id} className="transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg hover:-translate-y-1 bg-card">
              <CardHeader>
                <CardTitle className="truncate">{blog.name}</CardTitle>
                <CardDescription>Generated on {blog.createdAt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video w-full rounded-md border bg-muted/50 flex items-center justify-center p-4">
                  <Newspaper className="w-16 h-16 text-muted-foreground" />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="destructive" size="icon" onClick={() => handleDeleteBlog(blog)}>
                  <Trash2 className="h-4 w-4" />
                   <span className="sr-only">Delete</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleViewBlog(blog)}>
                   <Eye className="mr-2 h-4 w-4" /> View Blog
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
