// src/hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  firstName: string;
  lastName: string;
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null | undefined>(undefined);

  useEffect(() => {
    let ignore = false;

    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (!ignore) setUserProfile(null);
          return;
        }

        // ดึงข้อมูล profile จาก profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (!ignore) {
          if (profile) {
            setUserProfile({
              firstName: profile.first_name || '',
              lastName: profile.last_name || ''
            });
          } else {
            // ถ้าไม่มี profile ให้ใช้ข้อมูลจาก user metadata
            setUserProfile({
              firstName: session.user.user_metadata?.firstName || 'User',
              lastName: session.user.user_metadata?.lastName || ''
            });
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (!ignore) setUserProfile(null);
      }
    };

    getProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          return;
        }

        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUserProfile({
              firstName: profile.first_name || '',
              lastName: profile.last_name || ''
            });
          } else {
            setUserProfile({
              firstName: session.user.user_metadata?.firstName || 'User',
              lastName: session.user.user_metadata?.lastName || ''
            });
          }
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  return userProfile;
}
