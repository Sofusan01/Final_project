import { useState } from "react";
import Link from "next/link";

type Props = {
  type: "login" | "register";
  onSubmit: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  loading?: boolean;
};

export default function AuthForm({ type, onSubmit, loading }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSubmit(email, password, firstName, lastName);
        }}
        className="flex flex-col gap-5 w-full max-w-sm bg-neutral-900 p-8 rounded-2xl shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-center mb-2 text-white">
          {type === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h2>
        {type === "register" && (
          <>
            <input
              type="text"
              className="rounded-xl px-4 py-2 bg-neutral-800 text-white border border-neutral-700"
              placeholder="ชื่อ"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              className="rounded-xl px-4 py-2 bg-neutral-800 text-white border border-neutral-700"
              placeholder="นามสกุล"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="email"
          autoComplete="username"
          className="rounded-xl px-4 py-2 bg-neutral-800 text-white border border-neutral-700"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <input
          type="password"
          autoComplete={type === "login" ? "current-password" : "new-password"}
          className="rounded-xl px-4 py-2 bg-neutral-800 text-white border border-neutral-700"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2 transition"
        >
          {loading
            ? "กำลังดำเนินการ..."
            : type === "login"
            ? "เข้าสู่ระบบ"
            : "สมัครสมาชิก"}
        </button>
      </form>
      {/* ส่วนลิงก์สลับหน้า */}
      {type === "login" ? (
        <div className="text-center mt-4 text-neutral-400">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:underline font-semibold"
          >
            สมัครสมาชิก
          </Link>
        </div>
      ) : (
        <div className="text-center mt-4 text-neutral-400">
          มีบัญชีแล้ว?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:underline font-semibold"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      )}
    </div>
  );
}
