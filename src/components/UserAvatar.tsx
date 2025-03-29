
import React, { useState, useEffect } from 'react';
import md5 from 'md5';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const { user } = useAuth();
  const [initials, setInitials] = useState('');
  const [fallbackShown, setFallbackShown] = useState(false);
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          const firstName = data.first_name || '';
          const lastName = data.last_name || '';
          
          // Create initials from name
          const firstInitial = firstName ? firstName[0] : '';
          const lastInitial = lastName ? lastName[0] : '';
          setInitials((firstInitial + lastInitial).toUpperCase());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // If we can't get the name, use email first letter as fallback
        if (user.email) {
          setInitials(user.email[0].toUpperCase());
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Create Gravatar URL
  const getGravatarUrl = (email: string) => {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=404&s=80`;
  };

  const handleImageError = () => {
    setFallbackShown(true);
  };

  if (!user || !user.email) return null;

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {!fallbackShown && (
        <AvatarImage 
          src={getGravatarUrl(user.email)} 
          alt="User Avatar"
          onError={handleImageError}
        />
      )}
      <AvatarFallback 
        className="bg-muted-sage text-white font-medium"
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
