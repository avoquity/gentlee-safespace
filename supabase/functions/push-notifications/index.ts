
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

// Function to determine message type based on context
function getMessageContext(lastUserMessage: string | null): "negative" | "neutral" | "positive" {
  if (!lastUserMessage) return "neutral";
  
  // Simplified sentiment analysis - in production would use a more sophisticated approach
  const negativeTerms = ["sad", "stress", "anxiety", "worry", "struggle", "hard", "difficult", "tired", "exhausted", "pain"];
  const positiveTerms = ["happy", "joy", "excited", "grateful", "proud", "accomplish", "success", "win", "good", "great"];
  
  // Convert to lowercase for case-insensitive matching
  const lowerCaseMessage = lastUserMessage.toLowerCase();
  
  // Check for negative terms
  for (const term of negativeTerms) {
    if (lowerCaseMessage.includes(term)) return "negative";
  }
  
  // Check for positive terms
  for (const term of positiveTerms) {
    if (lowerCaseMessage.includes(term)) return "positive";
  }
  
  // Default to neutral
  return "neutral";
}

// Function to get notification message based on context and time since last interaction
function getNotificationMessage(context: "negative" | "neutral" | "positive", 
                              hoursSinceLastChat: number, 
                              timeOfDay: "morning" | "midday" | "evening",
                              keyword: string = ""): string {
  // Context follow-up messages (< 24h)
  if (hoursSinceLastChat < 24) {
    if (context === "negative") {
      return `Yesterday felt heavy with ${keyword || "everything"}. How are you holding up?`;
    } else if (context === "positive") {
      return "Loved your proud vibe! Want to capture today's bright bit?";
    } else {
      return "Checking in—any small spark you're planning for today?";
    }
  }
  
  // Time-of-day mindset (24-72h)
  else if (hoursSinceLastChat < 72) {
    if (timeOfDay === "morning") {
      return "New page—one gentle intention for the day?";
    } else if (timeOfDay === "midday") {
      return "Quick pause: what's one win so far?";
    } else {
      return "Wind-down thought: one thing worth a soft smile?";
    }
  }
  
  // Thought-starter (>72h)
  else {
    // Randomly select one of the thought-starter messages
    const thoughtStarters = [
      "If your mood had a colour, what shade shows up?",
      "Talk to yourself like a friend—what would you say right now?"
    ];
    return thoughtStarters[Math.floor(Math.random() * thoughtStarters.length)];
  }
}

// Function to send a push notification
async function sendPushNotification(subscription: any, message: string, title: string = "Gentlee") {
  try {
    const webPush = await import("https://esm.sh/web-push@3.6.1");
    
    const vapidDetails = {
      subject: "mailto:contact@gentlee.app",
      publicKey: Deno.env.get("VAPID_PUBLIC_KEY") as string,
      privateKey: Deno.env.get("VAPID_PRIVATE_KEY") as string,
    };
    
    const payload = JSON.stringify({
      title: title,
      message: message,
      url: "/chat", // Open to chat page
      type: "check-in",
    });
    
    await webPush.sendNotification(subscription, payload, { vapidDetails });
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

// Main function to process and send notifications
async function processNotifications() {
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  // Determine if it's morning (7-10), midday (11-15), or evening (16-22)
  let timeOfDay: "morning" | "midday" | "evening" = "midday";
  if (currentHour >= 7 && currentHour <= 10) {
    timeOfDay = "morning";
  } else if (currentHour >= 16 && currentHour <= 22) {
    timeOfDay = "evening";
  }
  
  // Get users who have check-in enabled and are due for a notification
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, checkin_time, last_notif_sent_at, notif_this_week_count')
    .eq('checkin_enabled', true);
  
  if (profilesError || !profiles) {
    console.error("Error fetching profiles:", profilesError);
    return { success: false, error: profilesError };
  }
  
  const results = [];
  
  for (const profile of profiles) {
    try {
      // Skip if we've already sent max notifications this week
      if (profile.notif_this_week_count >= 4) {
        results.push({
          userId: profile.id,
          status: "skipped",
          reason: "weekly_limit_reached"
        });
        continue;
      }
      
      // Skip if we sent a notification less than MIN_INTERVAL_BETWEEN_NOTIFS ago
      const lastNotifTime = profile.last_notif_sent_at ? new Date(profile.last_notif_sent_at) : null;
      if (lastNotifTime) {
        const hoursSinceLastNotif = (now.getTime() - lastNotifTime.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastNotif < 18) { // MIN_INTERVAL_BETWEEN_NOTIFS = 18h
          results.push({
            userId: profile.id,
            status: "skipped",
            reason: "min_interval_not_reached"
          });
          continue;
        }
      }
      
      // Check if user has had recent chat activity
      const { data: latestMessages, error: messagesError } = await supabase
        .from('messages')
        .select('created_at, content, user_role')
        .eq('sender_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        continue;
      }
      
      // If there are recent messages, check if we should skip notification
      if (latestMessages && latestMessages.length > 0) {
        const lastMessageTime = new Date(latestMessages[0].created_at);
        const hoursSinceLastMessage = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
        
        // Skip if user has had a conversation in the last 36 hours
        if (hoursSinceLastMessage < 36) {
          // Check if conversation has at least 3 messages (user engagement)
          const recentUserMessages = latestMessages.filter(msg => 
            msg.user_role === 'user' && 
            (new Date(msg.created_at).getTime() > now.getTime() - 36 * 60 * 60 * 1000)
          );
          
          if (recentUserMessages.length >= 3) {
            // Track this as an analytics event
            await supabase
              .from('analytics_events')
              .insert([{
                user_id: profile.id,
                event_type: 'push_skipped_due_to_recent_chat',
                event_data: { message_count: recentUserMessages.length }
              }]);
              
            results.push({
              userId: profile.id,
              status: "skipped",
              reason: "recent_conversation"
            });
            continue;
          }
        }
        
        // Determine context from last user message
        const lastUserMessage = latestMessages.find(msg => msg.user_role === 'user')?.content || null;
        const messageContext = getMessageContext(lastUserMessage);
        
        // Extract a keyword for personalization
        let keyword = "";
        if (lastUserMessage) {
          const keywords = lastUserMessage.split(/\s+/).filter(word => word.length > 4);
          if (keywords.length > 0) {
            keyword = keywords[Math.floor(Math.random() * keywords.length)].toLowerCase();
            // Remove any punctuation
            keyword = keyword.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
          }
        }
        
        // Get notification message based on context and time since last chat
        const notificationMessage = getNotificationMessage(
          messageContext,
          hoursSinceLastMessage,
          timeOfDay,
          keyword
        );
        
        // Get user's push subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('push_subscriptions')
          .select('subscription')
          .eq('user_id', profile.id)
          .single();
          
        if (subscriptionError || !subscriptionData) {
          console.error("Error fetching subscription:", subscriptionError);
          continue;
        }
        
        // Apply random jitter to send time (±25 minutes)
        const shouldSendNow = Math.random() > 0.5;
        if (shouldSendNow) {
          const subscription = JSON.parse(subscriptionData.subscription);
          const sendResult = await sendPushNotification(subscription, notificationMessage);
          
          if (sendResult) {
            // Update profile with last notification time and increment weekly count
            await supabase
              .from('profiles')
              .update({
                last_notif_sent_at: now.toISOString(),
                notif_this_week_count: profile.notif_this_week_count + 1
              })
              .eq('id', profile.id);
              
            // Track this as an analytics event
            await supabase
              .from('analytics_events')
              .insert([{
                user_id: profile.id,
                event_type: 'push_sent',
                event_data: {
                  context: messageContext,
                  hours_since_last_chat: Math.round(hoursSinceLastMessage),
                  notif_message: notificationMessage
                }
              }]);
              
            results.push({
              userId: profile.id,
              status: "sent",
              message: notificationMessage
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error processing notifications for user ${profile.id}:`, error);
    }
  }
  
  return { success: true, results };
}

// Reset weekly notification counts on Sunday
async function resetWeeklyCounts() {
  const now = new Date();
  // If it's Sunday (day 0)
  if (now.getUTCDay() === 0) {
    await supabase
      .from('profiles')
      .update({ notif_this_week_count: 0 })
      .eq('checkin_enabled', true);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Reset weekly counts if needed
    await resetWeeklyCounts();
    
    // Process and send notifications
    const result = await processNotifications();
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
