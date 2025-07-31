
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { generateWebsiteTemplate, type GenerateWebsiteTemplateOutput } from '@/ai/flows/generate-website-template';
import { refineWebsite } from '@/ai/flows/refine-website-flow';
import { suggestWebsiteImprovements, type Task } from '@/ai/flows/suggest-website-improvements';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { firestore, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

// This should be kept in sync with the templates on the gallery page
const templates = [
  { slug: 'modern-tech-startup', title: 'Modern Tech Startup' },
  { slug: 'cozy-coffee-shop', title: 'Cozy Coffee Shop' },
  { slug: 'minimalist-portfolio', title: 'Minimalist Portfolio' },
  { slug: 'vibrant-digital-agency', title: 'Vibrant Digital Agency' },
  { slug: 'personal-finance-blog', title: 'Personal Finance Blog' },
  { slug: 'travel-influencer-blog', title: 'Travel Influencer Blog' },
];

export default function TemplatePreviewPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<GenerateWebsiteTemplateOutput | null>(null);

  // Refinement state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customRequest, setCustomRequest] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [editedHtml, setEditedHtml] = useState('');

  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const templateSlug = params.templateName as string;
  const template = templates.find(t => t.slug === templateSlug);
  const templateTitle = template?.title || 'Website';


  useEffect(() => {
    async function generateInitialTemplate() {
      if (!templateTitle || templateTitle === 'Website') {
          toast({ variant: 'destructive', title: 'Template not found.' });
          router.push('/dashboard/templates');
          return;
      }
      
      setLoading(true);
      try {
        const response = await generateWebsiteTemplate({ businessType: templateTitle });
        setResult(response);
        setEditedHtml(response.htmlContent);
        
        const taskResponse = await suggestWebsiteImprovements({ htmlContent: response.htmlContent });
        setTasks(taskResponse.tasks);

      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Oh no! Something went wrong.",
          description: "There was a problem generating the website from this template.",
        });
      } finally {
        setLoading(false);
      }
    }
    
    generateInitialTemplate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateTitle, router]);

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
        name: templateTitle,
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg text-muted-foreground">Generating your '{templateTitle}' template...</p>
        <p className="text-sm text-muted-foreground">This can take up to a minute, please wait.</p>
      </div>
    );
  }

  if (!result) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[calc(100vh-12rem)]">
            <h3 className="text-2xl font-bold tracking-tight font-headline">
              Generation Failed
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Something went wrong while generating this template. Please try again or choose another one from the gallery.
            </p>
            <Button asChild className="mt-4">
              <a href="/dashboard/templates">Back to Templates</a>
            </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <>
          <Card>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline text-3xl">Template: {templateTitle}</CardTitle>
                <CardDescription>Here is your generated website. Use the tools below to refine it or save it to your sites.</CardDescription>
              </div>
              <Button onClick={handleSaveSite} disabled={saving || isRefining}>
                {saving ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                ) : (
                   <Save className="mr-2 h-4 w-4"/>
                )}
                Save to My Sites
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
                    <Button onClick={handleApplyFromCodeEditor} disabled={isRefining || !result || editedHtml === result.htmlContent}>
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
    </div>
  );
}
