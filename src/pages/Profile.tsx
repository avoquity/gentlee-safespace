
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import UserAvatar from '@/components/UserAvatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
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

  // Handle cancellation of subscription
  const handleCancelSubscription = async () => {
    if (!user || !userProfile?.subscription_id) return;
    
    setUnsubscribing(true);
    
    try {
      // Call the Supabase Edge Function to cancel the subscription
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId: userProfile.subscription_id }
      });
      
      if (error) throw error;
      
      toast({
        title: "Subscription canceled",
        description: "Your subscription will remain active until the end of the current billing period."
      });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        subscription_status: 'canceled',
      });
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Error canceling subscription",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUnsubscribing(false);
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
        <div className="space-y-2">
          <span className="text-green-600 font-medium">
            Active until {formatDate(userProfile.subscription_current_period_end)}
          </span>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 mt-2"
              >
                Cancel subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your subscription will remain active until {formatDate(userProfile.subscription_current_period_end)}, but will not renew after that date.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my subscription</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancelSubscription}
                  className="bg-red-500 hover:bg-red-600"
                  disabled={unsubscribing}
                >
                  {unsubscribing ? 'Canceling...' : 'Yes, cancel my subscription'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    } else if (userProfile.subscription_status === 'trialing') {
      return (
        <span className="text-blue-600 font-medium">
          Trial until {formatDate(userProfile.subscription_current_period_end)}
        </span>
      );
    } else if (userProfile.subscription_status === 'canceled') {
      return (
        <div className="space-y-2">
          <span className="text-amber-600 font-medium">
            Canceled - active until {formatDate(userProfile.subscription_current_period_end)}
          </span>
          <Button 
            onClick={() => navigate('/upgrade')}
            className="bg-muted-sage hover:bg-deep-charcoal text-white mt-2"
          >
            Resubscribe
          </Button>
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
      
      <Footer />
    </div>
  );
};

export default Profile;
