'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

export default function SettingsPage() {
  const { user, updateUserName } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  useEffect(() => {
    if (user?.displayName) {
      form.reset({ displayName: user.displayName });
    }
  }, [user, form]);
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.displayName === user?.displayName) {
      return; // No changes to save
    }
    setLoading(true);
    await updateUserName(values.displayName);
    setLoading(false);
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <UserCog className="h-6 w-6" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account details and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Email Address</FormLabel>
                <Input value={user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">Your email address cannot be changed.</p>
              </div>
              <Button type="submit" disabled={loading || !form.formState.isDirty}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
