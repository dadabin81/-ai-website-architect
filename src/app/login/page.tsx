"use client"

import { useEffect } from 'react';
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Rocket, Loader2 } from "lucide-react"
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" {...props}>
    <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.686H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
    <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.213 12.244-45.257 12.244-34.522 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.34 221.728 79.925 261.1 130.55 261.1" />
    <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.98l-1.615.035C5.9 82.731 0 97.435 0 113.49c0 16.054 5.9 30.758 13.577 41.565l42.704-32.99z" />
    <path fill="#EB4335" d="M130.55 50.479c19.205 0 36.344 6.698 49.088 18.938l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.925 0 35.34 39.372 13.643 71.965l42.231 32.783c10.59-31.477 39.894-54.271 74.676-54.271" />
  </svg>
);

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signInWithEmail(values.email, values.password);
  }

  if (loading || (!loading && user)) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
       </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Rocket className="h-8 w-8 text-primary" />
            <span className="ml-2 font-headline text-xl font-semibold">AI Website Architect</span>
          </div>
          <CardTitle className="text-2xl font-headline text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to continue to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" type="button" onClick={signInWithGoogle}>
            <GoogleIcon className="mr-2 h-5 w-5"/>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline font-semibold hover:text-primary">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
