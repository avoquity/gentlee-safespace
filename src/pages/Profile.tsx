
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import UserAvatar from '@/components/UserAvatar';
import { Loader2, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type ProfileFormValues = z.infer<typeof formSchema>;

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { tab: 'signin' } });
    }
  }, [user, navigate]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setUserProfile(data);
          
          // Update form values
          form.reset({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive"
        });
      }
    };
    
    fetchProfile();
  }, [user, toast, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        first_name: values.firstName,
        last_name: values.lastName,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    setCancelLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        method: 'POST',
      });
      
      if (error) throw error;
      
      toast({
        title: "Subscription canceled",
        description: "Your subscription will remain active until the end of the current billing period."
      });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        subscription_status: 'canceled_at_period_end',
      });
      
      setCancelDialogOpen(false);
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error canceling subscription",
        description: error.message || "An error occurred while canceling your subscription.",
        variant: "destructive"
      });
    } finally {
      setCancelLoading(false);
    }
  };

  // Format subscription date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Subscription status display
  const getSubscriptionStatus = () => {
    if (!userProfile) return 'Loading...';
    
    if (userProfile.subscription_status === 'active') {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-green-600 font-medium">
            Active until {formatDate(userProfile.subscription_current_period_end)}
          </span>
          {!userProfile.subscription_status?.includes('cancel') && userProfile.subscription_id && (
            <Button 
              onClick={() => setCancelDialogOpen(true)}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Cancel subscription
            </Button>
          )}
        </div>
      );
    } else if (userProfile.subscription_status === 'canceled_at_period_end') {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-orange-600 font-medium">
            Canceled - Active until {formatDate(userProfile.subscription_current_period_end)}
          </span>
          <Button 
            onClick={() => navigate('/upgrade')}
            className="bg-muted-sage hover:bg-deep-charcoal text-white"
          >
            Renew subscription
          </Button>
        </div>
      );
    } else if (userProfile.subscription_status === 'trialing') {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-blue-600 font-medium">
            Trial until {formatDate(userProfile.subscription_current_period_end)}
          </span>
          {!userProfile.subscription_status?.includes('cancel') && userProfile.subscription_id && (
            <Button 
              onClick={() => setCancelDialogOpen(true)}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Cancel trial
            </Button>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-gray-600">No active subscription</span>
          <Button 
            onClick={() => navigate('/upgrade')}
            className="bg-muted-sage hover:bg-deep-charcoal text-white"
          >
            Upgrade now
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-20 max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <UserAvatar size="lg" />
            <h1 className="text-3xl font-bold text-deep-charcoal">
              Your Profile
            </h1>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-deep-charcoal hover:bg-muted-sage"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Your current subscription information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{user?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                    <p className="mt-1">
                      {userProfile?.subscription_plan || 'Free'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1">
                      {getSubscriptionStatus()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center py-2 text-amber-600 bg-amber-50 px-3 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">Your subscription will remain active until {formatDate(userProfile?.subscription_current_period_end)}</p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelLoading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Profile;
