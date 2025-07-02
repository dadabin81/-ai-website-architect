
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Globe, Trash2, Loader2, Link, Info, Server } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { firestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';

const domainSchema = z.object({
  domainName: z.string().min(3, { message: 'Domain must be at least 3 characters.' }).regex(/^(?!https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, { message: 'Please enter a valid domain name (e.g., example.com).' }),
});

interface Domain {
  id: string;
  name: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoadingDomains(false);
      return;
    }
    setLoadingDomains(true);
    
    const q = query(collection(firestore, "domains"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const domainsData: Domain[] = [];
      querySnapshot.forEach((doc) => {
        domainsData.push({ id: doc.id, name: doc.data().name });
      });
      setDomains(domainsData);
      setLoadingDomains(false);
    }, (error) => {
      console.error("Error fetching domains: ", error);
      toast({
        variant: "destructive",
        title: "Error loading domains",
        description: "Could not load your connected domains from the cloud.",
      });
      setLoadingDomains(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const form = useForm<z.infer<typeof domainSchema>>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domainName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof domainSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to add a domain.",
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'domains'), {
        userId: user.uid,
        name: values.domainName,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Domain Added!',
        description: `${values.domainName} is now connected to your project.`,
      });
      
      form.reset();
    } catch (error) {
      console.error("Error adding domain:", error);
      toast({
        variant: "destructive",
        title: "Failed to Add Domain",
        description: "There was a problem saving the domain to the cloud.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDomain(id: string) {
    try {
      await deleteDoc(doc(firestore, "domains", id));
      toast({
        title: 'Domain Removed',
        description: 'The domain has been disconnected.',
      });
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast({
        variant: "destructive",
        title: 'Deletion Failed',
        description: "There was a problem deleting the domain.",
      });
    }
  }

  return (
    <div className="grid gap-8">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Custom Domains</h1>
      </div>

      <Alert>
        <Server className="h-4 w-4" />
        <AlertTitle>Looking to publish your site for free?</AlertTitle>
        <AlertDescription>
          This page is for connecting a custom domain you already own (e.g., `your-domain.com`). The ability to publish to a free subdomain (e.g., `your-site.a-i-architect.com`) will be available soon from the 'My Sites' page.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Connect a Custom Domain</CardTitle>
                <CardDescription>Add a domain you already own to point it to your website.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
                    <FormField
                        control={form.control}
                        name="domainName"
                        render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormLabel>Domain Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., your-awesome-site.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <Link />}
                        <span className="ml-2 hidden sm:inline">Add Domain</span>
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Connected Custom Domains</CardTitle>
                    <CardDescription>These domains are pointing to your projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingDomains ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : domains.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                            <Globe className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-muted-foreground">You haven't connected any custom domains yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {domains.map(domain => (
                                    <TableRow key={domain.id}>
                                        <TableCell className="font-medium">{domain.name}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400">
                                                Connected
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteDomain(domain.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1">
            <Card className="sticky top-20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5"/>
                        How to Connect
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm">
                    <p>To connect your domain, you need to update the DNS records with your domain registrar (e.g., GoDaddy, Namecheap, Google Domains).</p>
                    
                    <div>
                        <h4 className="font-semibold mb-2">Step 1: Add A Record</h4>
                        <Alert>
                            <AlertDescription className="grid gap-1">
                                <span>Type: <code className="font-mono bg-muted px-1 py-0.5 rounded">A</code></span>
                                <span>Name: <code className="font-mono bg-muted px-1 py-0.5 rounded">@</code></span>
                                <span>Value: <code className="font-mono bg-muted px-1 py-0.5 rounded">74.125.131.121</code></span>
                                <span>TTL: <code className="font-mono bg-muted px-1 py-0.5 rounded">1 Hour</code></span>
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Step 2: Add CNAME Record</h4>
                        <Alert>
                             <AlertDescription className="grid gap-1">
                                <span>Type: <code className="font-mono bg-muted px-1 py-0.5 rounded">CNAME</code></span>
                                <span>Name: <code className="font-mono bg-muted px-1 py-0.5 rounded">www</code></span>
                                <span>Value: <code className="font-mono bg-muted px-1 py-0.5 rounded">your-site.a-i-architect.com</code></span>
                                <span>TTL: <code className="font-mono bg-muted px-1 py-0.5 rounded">1 Hour</code></span>
                            </AlertDescription>
                        </Alert>
                    </div>

                    <p className="text-muted-foreground text-xs pt-2">DNS changes can take up to 48 hours to propagate across the internet. Don't worry if it doesn't work immediately.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
