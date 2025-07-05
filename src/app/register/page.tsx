"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import Modal from "@/components/Modal";

export default function RegisterPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

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

  const handleRegister = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: firstName || '',
            lastName: lastName || ''
          }
        }
      });

      if (error) {
        setModal({ open: true, msg: error.message });
        return;
      }

      // เพิ่มข้อมูล profile (optional)
      const userId = data.user?.id;
      if (userId && firstName && lastName) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: userId,
            first_name: firstName,
            last_name: lastName,
            email: email
          }
        ]);
        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      setModal({
        open: true,
        msg: "สมัครสมาชิกสำเร็จ! ตรวจสอบอีเมลเพื่อยืนยันตัวตน แล้วเข้าสู่ระบบ",
      });
      setTimeout(() => router.replace("/login"), 2200);

    } catch (err) {
      console.error('Registration error:', err);
      setModal({ open: true, msg: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
    } finally {
      setLoading(false);
    }
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
      <AuthForm type="register" onSubmit={handleRegister} loading={loading} />
      <Modal
        open={modal.open}
        message={modal.msg}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </main>
  );
}
