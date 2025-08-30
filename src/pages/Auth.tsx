import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const codeVerifySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'Security code must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AuthFormData = z.infer<typeof authSchema>;
type ResetFormData = z.infer<typeof resetSchema>;
type CodeVerifyFormData = z.infer<typeof codeVerifySchema>;

const Auth: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    mode: 'onSubmit',
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForm,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: 'onSubmit',
  });

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
    reset: resetCodeForm,
    setValue: setCodeValue,
  } = useForm<CodeVerifyFormData>({
    resolver: zodResolver(codeVerifySchema),
    mode: 'onSubmit',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setResetLoading(true);
    
    try {
      const response = await fetch('https://kbfbbkcaxhzlnbqxwgoz.supabase.co/functions/v1/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to send security code';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          // If JSON parsing fails, use the raw text or default message
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Security code sent',
          description: 'Check the edge function logs for your 6-digit security code.',
        });
        
        setResetEmail(data.email);
        setCodeValue('email', data.email);
        setShowCodeForm(true);
        resetForm();
      } else {
        throw new Error(result.error || 'Failed to send security code');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const onResendCode = async () => {
    setResetLoading(true);
    
    try {
      const response = await fetch('https://kbfbbkcaxhzlnbqxwgoz.supabase.co/functions/v1/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to resend security code';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Security code resent',
          description: 'Check the edge function logs for your new 6-digit security code.',
        });
      } else {
        throw new Error(result.error || 'Failed to resend security code');
      }
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const onCodeSubmit = async (data: CodeVerifyFormData) => {
    setCodeLoading(true);
    
    try {
      // Send both code and new password to reset password
      const response = await fetch('https://kbfbbkcaxhzlnbqxwgoz.supabase.co/functions/v1/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          code: data.code,
          newPassword: data.password,
        }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to reset password';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Password reset successful',
          description: 'Your password has been updated. You can now sign in.',
        });
        
        setShowCodeForm(false);
        setShowPasswordForm(false);
        resetCodeForm();
        setActiveTab('signin');
      } else {
        throw new Error(result.error || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Invalid security code or failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCodeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img 
            src="https://raw.githubusercontent.com/3sc0rp/Blunari/refs/heads/main/logo-bg.png" 
            alt="Blunari Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Manage your restaurant operations</p>
        </div>

        <Card className="shadow-medium">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="reset">Reset Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <CardHeader>
                <CardTitle className="text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Sign in to your restaurant dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register('email')}
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password')}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground text-center">
                    Account created by restaurant admin? Check your email for login credentials.
                  </p>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="reset">
              <CardHeader>
                <CardTitle className="text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  {!showCodeForm ? 'Enter your email to receive a security code' : 
                   'Enter the security code and your new password'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showCodeForm ? (
                  <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        {...registerReset('email')}
                        className={resetErrors.email ? 'border-destructive' : ''}
                      />
                      {resetErrors.email && (
                        <p className="text-sm text-destructive">{resetErrors.email.message}</p>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      {resetLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Code'
                      )}
                    </Button>
                    
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setActiveTab('signin')}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Back to sign in
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCodeSubmit(onCodeSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code-email">Email</Label>
                      <Input
                        id="code-email"
                        type="email"
                        value={resetEmail}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="security-code">Security Code</Label>
                      <Input
                        id="security-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        {...registerCode('code')}
                        className={codeErrors.code ? 'border-destructive' : ''}
                      />
                      {codeErrors.code && (
                        <p className="text-sm text-destructive">{codeErrors.code.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Enter new password"
                        {...registerCode('password')}
                        className={codeErrors.password ? 'border-destructive' : ''}
                      />
                      {codeErrors.password && (
                        <p className="text-sm text-destructive">{codeErrors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm new password"
                        {...registerCode('confirmPassword')}
                        className={codeErrors.confirmPassword ? 'border-destructive' : ''}
                      />
                      {codeErrors.confirmPassword && (
                        <p className="text-sm text-destructive">{codeErrors.confirmPassword.message}</p>
                      )}
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={codeLoading}>
                      {codeLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                    
                    <div className="text-center space-y-2">
                      <Button
                        type="button"
                        variant="link"
                        onClick={onResendCode}
                        disabled={resetLoading}
                        className="text-sm text-primary hover:text-primary/80 disabled:opacity-50"
                      >
                        {resetLoading ? 'Sending...' : "Didn't receive the code? Resend"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setShowCodeForm(false)}
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        Back to email entry
                      </Button>
                      <br />
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          setShowCodeForm(false);
                          setActiveTab('signin');
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Back to sign in
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;