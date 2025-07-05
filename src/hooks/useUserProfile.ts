// src/hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  firstName: string;
  lastName: string;
}

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null | undefined>(undefined);

  // Hydrate from localStorage on client only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('userProfile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUserProfile(parsed);
        } catch (e) {
          console.error('Failed to parse cached profile:', e);
          localStorage.removeItem('userProfile');
        }
      }
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const setAndCacheProfile = (profile: UserProfile | null) => {
      if (!ignore) {
        setUserProfile(profile);
        if (typeof window !== 'undefined') {
          if (profile) {
            localStorage.setItem('userProfile', JSON.stringify(profile));
          } else {
            localStorage.removeItem('userProfile');
          }
        }
      }
    };

    const getProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAndCacheProfile(null);
          return;
        }

        if (!session?.user) {
          setAndCacheProfile(null);
          return;
        }
        
        // ดึงข้อมูล profile จาก profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
        }

        if (!ignore) {
          if (profile) {
            setAndCacheProfile({
              firstName: profile.first_name || '',
              lastName: profile.last_name || ''
            });
          } else {
            setAndCacheProfile({
              firstName: session.user.user_metadata?.firstName || 'User',
              lastName: session.user.user_metadata?.lastName || ''
            });
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        if (!ignore) {
          setAndCacheProfile(null);
        }
      }
    };

    getProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAndCacheProfile(null);
          return;
        }
        
        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', session.user.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile fetch error:', profileError);
            }
            
            if (profile) {
              setAndCacheProfile({
                firstName: profile.first_name || '',
                lastName: profile.last_name || ''
              });
            } else {
              setAndCacheProfile({
                firstName: session.user.user_metadata?.firstName || 'User',
                lastName: session.user.user_metadata?.lastName || ''
              });
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            setAndCacheProfile({
              firstName: session.user.user_metadata?.firstName || 'User',
              lastName: session.user.user_metadata?.lastName || ''
            });
          }
        } else {
          setAndCacheProfile(null);
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
