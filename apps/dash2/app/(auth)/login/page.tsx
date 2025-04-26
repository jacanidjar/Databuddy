"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { authClient, signIn } from "@databuddy/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Mail, Loader2, ChevronLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"password" | "magic" | "forgot" | "magic-sent" | "verification-needed">("password");
  const [verifyingToken, setVerifyingToken] = useState(false);

  // Check for magic link token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setVerifyingToken(true);
      verifyMagicLink(token);
    }
  }, [searchParams]);

  const verifyMagicLink = async (token: string) => {
    try {
      const { error } = await authClient.magicLink.verify({
        query: { token },
        fetchOptions: {
          onSuccess: (ctx) => {
            const authToken = ctx.response.headers.get("set-auth-token")
            if (authToken) {
              localStorage.setItem("authToken", authToken);
            }
          },
          onError: () => {
            toast.error("Failed to verify magic link. Please try again.");
            router.push("/login");
          }
        }
      });

      if (error) {
        toast.error("Invalid or expired magic link. Please try again.");
        router.push("/login");
      } else {
        toast.success("Login successful!");
        router.push("/home");
      }
    } catch (error) {
      toast.error("Failed to verify magic link. Please try again.");
      router.push("/login");
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    signIn.social({
      provider: "google",
      callbackURL: "/home",
      fetchOptions: {
        onSuccess: (ctx) => {
          toast.success("Login successful!");
          const authToken = ctx.response.headers.get("set-auth-token")
          if (authToken) {
            localStorage.setItem("authToken", authToken);
          }
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Google login failed. Please try again.");
        },
      },
    });
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/home",
        fetchOptions: {
          onSuccess: (ctx) => {
            toast.success("Login successful!");
            const authToken = ctx.response.headers.get("set-auth-token")
            if (authToken) {
              localStorage.setItem("authToken", authToken);
            }
          },
          onError: (error: any) => {
            setIsLoading(false);
            if (error?.code === "EMAIL_NOT_VERIFIED" || error?.message?.toLowerCase().includes("not verified")) {
              setView("verification-needed");
            } else {
              toast.error(error?.message || "Login failed. Please check your credentials and try again.");
            }
          },
        },
      });

      if (result?.error) {
        toast.error("Invalid credentials");
        return;
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/home",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Verification email sent!");
          },
          onError: () => {
            toast.error("Failed to send verification email. Please try again later.");
          },
        },
      });
    } catch (error) {
      toast.error("Failed to send verification email. Please try again later.");
    }
  };

  const handleMagicLinkLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.magicLink({
        email,
        callbackURL: "/home",
        fetchOptions: {
          onSuccess: (ctx) => {
            const authToken = ctx.response.headers.get("set-auth-token")
            if (authToken) {
              localStorage.setItem("authToken", authToken);
            }
            setIsLoading(false);
            toast.success("Magic link sent! Please check your email.");
            setView("magic-sent");
          },
          onError: () => {
            setIsLoading(false);
            toast.error("Failed to send magic link. Please try again.");
          },
        },
      });
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to send magic link. Please try again.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.forgetPassword({
        email,
        fetchOptions: {
          onSuccess: () => {
            setIsLoading(false);
            toast.success("Password reset instructions sent to your email.");
          },
          onError: () => {
            setIsLoading(false);
            toast.error("Failed to send reset instructions. Please try again.");
          },
        },
      });
    } catch (error) {
      setIsLoading(false);
      toast.error("An error occurred. Please try again later.");
    }
  };

  // Show loading spinner while verifying token
  if (verifyingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-slate-400">Verifying your login...</p>
        </div>
      </div>
    );
  }

  // Render different forms based on the current view
  const renderForm = () => {
    switch (view) {
      case "magic-sent":
        return (
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setView("password");
                setIsLoading(false);
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
            <Button
              variant="default"
              className="w-full"
              disabled={isLoading}
              onClick={(e: React.MouseEvent) => handleMagicLinkLogin(e as any)}
            >
              Resend magic link
            </Button>
          </div>
        );
      case "verification-needed":
        return (
          <div className="space-y-4">
            <Button
              variant="default"
              className="w-full"
              disabled={isLoading}
              onClick={sendVerificationEmail}
            >
              Resend verification email
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setView("password");
                setIsLoading(false);
              }}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </div>
        );
      case "forgot":
        return (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setView("password")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-white">Email address</Label>
              <Input
                id="forgot-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/10"
              />
            </div>
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        );
      case "magic":
        return (
          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setView("password")}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
            <div className="space-y-2">
              <Label htmlFor="magic-email" className="text-white">Email address</Label>
              <Input
                id="magic-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/10"
              />
            </div>
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                "Send magic link"
              )}
            </Button>
          </form>
        );
      default:
        return (
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/80 hover:text-white text-slate-100"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/80 hover:text-white text-slate-100"
                onClick={() => setView("magic")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Magic Link
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">
                  Or continue with email
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/10"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Button
                  variant="link"
                  className="text-xs text-sky-400 hover:text-sky-300 p-0 h-auto"
                  onClick={() => setView("forgot")}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/10"
              />
            </div>
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        );
    }
  };

  // Page title and header content based on current view
  const getHeaderContent = () => {
    switch (view) {
      case "magic-sent":
        return (
          <div className="space-y-2">
            <CardTitle className="text-2xl font-medium text-white">Check your email</CardTitle>
            <CardDescription className="text-slate-400">
              We've sent a magic link to <strong>{email}</strong>. Click the link to sign in.
            </CardDescription>
          </div>
        );
      case "verification-needed":
        return (
          <div className="space-y-2">
            <CardTitle className="text-2xl font-medium text-white">Verify your email</CardTitle>
            <CardDescription className="text-slate-400">
              Please check your email at <strong>{email}</strong> and click the verification link to activate your account.
            </CardDescription>
          </div>
        );
      case "forgot":
        return (
          <div className="space-y-2">
            <CardTitle className="text-2xl font-medium text-white">Reset your password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </div>
        );
      case "magic":
        return (
          <div className="space-y-2">
            <CardTitle className="text-2xl font-medium text-white">Sign in with magic link</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email and we'll send you a one-time sign in link.
            </CardDescription>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <CardTitle className="text-2xl font-medium text-white">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your account to continue
            </CardDescription>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 antialiased">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-2xl font-bold bg-gradient-to-r from-sky-400 to-sky-600 bg-clip-text text-transparent hover:from-sky-300 hover:to-sky-500 transition-all duration-200"
            aria-label="Go to Databuddy homepage"
          >
            Databuddy
          </Link>
        </div>
        <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm shadow-xl">
          <CardHeader>
            {getHeaderContent()}
          </CardHeader>
          <CardContent>
            {renderForm()}
          </CardContent>
          {view === "password" && (
            <CardFooter>
              <div className="text-center w-full text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/register" 
                  className="text-sky-400 hover:text-sky-300 transition-colors duration-200"
                >
                  Create one now
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
} 