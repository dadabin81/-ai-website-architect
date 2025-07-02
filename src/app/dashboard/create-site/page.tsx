
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateWebsiteTemplate, type GenerateWebsiteTemplateOutput } from '@/ai/flows/generate-website-template';
import { refineWebsite } from '@/ai/flows/refine-website-flow';
import { suggestWebsiteImprovements, type Task } from '@/ai/flows/suggest-website-improvements';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { firestore, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  businessType: z.string().min(3, { message: 'Business type must be at least 3 characters long.' }),
});

interface MediaItem {
  id: string;
  url: string;
  name: string;
}

export default function CreateSitePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<GenerateWebsiteTemplateOutput | null>(null);
  
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(true);

  // Refinement state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customRequest, setCustomRequest] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [editedHtml, setEditedHtml] = useState('');

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessType: '',
    },
  });

  useEffect(() => {
    if (!user) {
      setLoadingMedia(false);
      return;
    };
    setLoadingMedia(true);
    const q = query(collection(firestore, "media"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const items: MediaItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({ id: doc.id, url: data.url, name: data.name });
        });
        setMediaItems(items);
        setLoadingMedia(false);
    });
    return () => unsubscribe();
  }, [user]);

  function handleMediaSelect(url: string) {
    setSelectedMedia(prev => 
      prev.includes(url) ? prev.filter(itemUrl => itemUrl !== url) : [...prev, url]
    );
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    setTasks([]);
    setCustomRequest('');
    setSelectedTasks([]);
    setEditedHtml('');
    try {
      const response = await generateWebsiteTemplate({ 
        businessType: values.businessType,
        mediaLibraryUrls: selectedMedia
      });
      setResult(response);
      setEditedHtml(response.htmlContent);
      
      const taskResponse = await suggestWebsiteImprovements({ htmlContent: response.htmlContent });
      setTasks(taskResponse.tasks);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem generating the website.",
      })
    } finally {
      setLoading(false);
    }
  }

  function handleTaskSelectionChange(taskId: string, isChecked: boolean) {
    setSelectedTasks(prev => 
      isChecked ? [...prev, taskId] : prev.filter(id => id !== taskId)
    );
  }

  async function handleRefinementRequest(request: string) {
    if (!request.trim() || isRefining || !result?.htmlContent) return;
    
    setIsRefining(true);
    try {
        const response = await refineWebsite({
            htmlContent: result.htmlContent,
            request: request,
        });
        const newHtml = response.refinedHtmlContent;
        setResult(prevResult => prevResult ? { ...prevResult, htmlContent: newHtml } : null);
        setEditedHtml(newHtml);
        
        const taskResponse = await suggestWebsiteImprovements({ htmlContent: newHtml });
        setTasks(taskResponse.tasks);
        setCustomRequest('');
        setSelectedTasks([]);

        toast({ title: "Refinement Applied!", description: "The preview has been updated." });
    } catch (error) {
        console.error("Refinement error:", error);
        toast({
            variant: "destructive",
            title: "Refinement Failed",
            description: "Sorry, I couldn't make that change. Please try rephrasing your request.",
        });
    } finally {
        setIsRefining(false);
    }
  }

  const handleApplyFromCodeEditor = () => {
    if (!result) return;
    setResult({ ...result, htmlContent: editedHtml });
    toast({ title: "Code Applied", description: "The preview has been updated from the editor." });
  };

  async function handleApplySelectedTasks() {
    if (selectedTasks.length === 0) {
        toast({
            variant: "destructive",
            title: "No suggestions selected",
            description: "Please select one or more suggestions to apply."
        });
        return;
    }
    const combinedRequest = tasks
        .filter(task => selectedTasks.includes(task.id))
        .map(task => task.description)
        .join('. '); 
    
    await handleRefinementRequest(combinedRequest);
  }

  async function handleSaveSite() {
    if (!result || !user) return;
    
    setSaving(true);
    try {
      const siteId = new Date().getTime().toString();
      const storagePath = `sites/${user.uid}/${siteId}.html`;
      const storageRef = ref(storage, storagePath);

      await uploadString(storageRef, result.htmlContent, 'raw', {
        contentType: 'text/html'
      });

      await addDoc(collection(firestore, 'sites'), {
        userId: user.uid,
        name: form.getValues('businessType'),
        storagePath: storagePath,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Website Saved!",
        description: "Your new website has been saved to the cloud.",
      });

      router.push('/dashboard/sites');
    } catch (error) {
        console.error("Failed to save site:", error);
        toast({
          variant: "destructive",
          title: "Failed to save.",
          description: "There was a problem saving your website to the cloud.",
        });
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Website</CardTitle>
          <CardDescription>Describe your business, and our AI will generate a starting point for your new website.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What is your business about?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A cozy coffee shop, a modern tech startup, a personal portfolio..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <Label>Include Your Images (Optional)</Label>
                <CardDescription>Select images from your media library to give the AI context for your design.</CardDescription>
                {loadingMedia ? (
                   <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                     {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                   </div>
                ) : mediaItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Your media library is empty. Go to the Media tab to upload images.</p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                    {mediaItems.map(item => {
                      const isSelected = selectedMedia.includes(item.url);
                      return (
                        <div key={item.id} className="relative" onClick={() => handleMediaSelect(item.url)}>
                           <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                              <CheckCircle2 className="h-8 w-8 text-white" />
                           </div>
                           {isSelected && (
                              <div className="absolute inset-0 bg-primary/80 ring-2 ring-primary-foreground rounded-lg flex items-center justify-center transition-opacity cursor-pointer">
                                <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
                              </div>
                           )}
                           <Image 
                              src={item.url}
                              alt={item.name}
                              width={150}
                              height={150}
                              className={cn("aspect-square w-full object-cover rounded-lg", isSelected && "opacity-60")}
                           />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Website
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Generating your website, please wait...</p>
        </div>
      )}

      {result && (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Website Preview</CardTitle>
                <CardDescription>Here's what our AI came up with. You can refine it below.</CardDescription>
              </div>
              <Button onClick={handleSaveSite} disabled={saving || isRefining}>
                {saving ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                ) : (
                   <Save className="mr-2 h-4 w-4"/>
                )}
                Save and Exit
              </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Suggested Layout</Label>
                  <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{result.suggestedLayout}</p>
                </div>
                <div>
                  <Label>Suggested Color Scheme</Label>
                  <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">{result.suggestedColorScheme}</p>
                </div>
              </div>

              <div>
                <div className="grid md:grid-cols-2 gap-4 mb-2">
                  <Label>Live Code Editor</Label>
                  <Label>Visual Preview</Label>
                </div>
                <div className="grid md:grid-cols-2 gap-4 h-[600px]">
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={editedHtml}
                      onChange={(e) => setEditedHtml(e.target.value)}
                      className="flex-grow font-code text-xs resize-none"
                      placeholder="HTML code..."
                      disabled={isRefining}
                    />
                    <Button onClick={handleApplyFromCodeEditor} disabled={isRefining || editedHtml === result.htmlContent}>
                      Apply Code to Preview
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-background shadow-sm w-full h-full">
                    <iframe
                      title="Website Preview"
                      srcDoc={result.htmlContent}
                      className="w-full h-full rounded-lg"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Refine Your Website</CardTitle>
              <CardDescription>
                The AI has suggested some improvements. Select the ones you want to apply, or write your own custom request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isRefining && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Applying changes...</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="font-semibold">AI Suggestions</Label>
                {tasks.length > 0 ? (
                  <div className="space-y-3 rounded-md border p-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => handleTaskSelectionChange(task.id, !!checked)}
                          disabled={isRefining}
                        />
                        <Label htmlFor={`task-${task.id}`} className="font-normal text-sm leading-snug cursor-pointer">
                          {task.description}
                        </Label>
                      </div>
                    ))}
                    <Button onClick={handleApplySelectedTasks} disabled={isRefining || selectedTasks.length === 0} className="mt-4">
                      {isRefining && selectedTasks.length > 0 && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Apply Selected ({selectedTasks.length})
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground pt-2">The AI has no further suggestions. Great work!</p>
                )}
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleRefinementRequest(customRequest); }}>
                <div className="space-y-2">
                  <Label htmlFor="customRequest" className="font-semibold">Custom Request</Label>
                  <Textarea
                      id="customRequest"
                      placeholder="e.g., Change the primary color to a dark blue"
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      disabled={isRefining}
                      className="min-h-[80px]"
                  />
                </div>
                <Button type="submit" disabled={isRefining || !customRequest.trim()} className="mt-4">
                  {isRefining && selectedTasks.length === 0 && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Apply Custom Change
                </Button>
              </form>

            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
