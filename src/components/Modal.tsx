"use client";
import React from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
};

export default function Modal({ open, onClose, title, message }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed z-40 inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-xs text-white">
        {title && <h3 className="font-bold text-lg mb-2">{title}</h3>}
        <p>{message}</p>
        <button
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2 transition"
          onClick={onClose}
        >
          ปิด
        </button>
      </div>
    </div>
  );
}
