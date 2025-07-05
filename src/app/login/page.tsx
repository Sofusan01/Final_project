"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import Modal from "@/components/Modal";

export default function LoginPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  // เช็ค session ทุกครั้งที่ mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setModal({ open: true, msg: "เข้าสู่ระบบสำเร็จ กำลังเปลี่ยนหน้า..." });
          setTimeout(() => {
            router.replace("/dashboard");
          }, 1000);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setModal({ open: true, msg: error.message });
    }
    // redirect จะถูก handle ที่ onAuthStateChange
  };

  // Loading skeleton
  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111] via-[#232323] to-[#1a237e]">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111] via-[#232323] to-[#1a237e]">
      <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
      <Modal
        open={modal.open}
        message={modal.msg}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </main>
  );
}