
import React from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import UserAvatar from './UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { User, Calendar, CreditCard, BookOpen, LogOut } from 'lucide-react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export const UserMenu = () => {
  const { logout, user } = useAuth();
  const { wisdomLibrary } = useFeatureFlags();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
          <UserAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/entries" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Entries
          </Link>
        </DropdownMenuItem>
        {wisdomLibrary && (
          <DropdownMenuItem asChild>
            <Link to="/library" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Wisdom Library
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/upgrade" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
