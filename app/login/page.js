"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const text = {
    en: {
      title: "Driver Login",
      subtitle: "Enter your mobile number to continue",
      button: "Continue",
    },
    ml: {
      title: "ഡ്രൈവർ ലോഗിൻ",
      subtitle: "തുടരാൻ നിങ്ങളുടെ ഫോൺ നമ്പർ നൽകുക",
      button: "തുടരുക",
    },
  };

  const sendOtp = async () => {
    if (phone.length !== 10) {
      alert("Enter valid number");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      router.push(
  `/verify?phone=${phone}&lang=${lang}&otp=${data.otp}`
);
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

  const token =
    localStorage.getItem("token");

  if (token) {
    window.location.href =
      "/dashboard";
  }

}, []);

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all">

          {/* Language */}
          <div className="flex justify-end text-xs mb-5">
            <button
              onClick={() => setLang("en")}
              className={`mr-3 transition ${
                lang === "en" ? "text-black font-medium" : "text-gray-400"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ml")}
              className={`transition ${
                lang === "ml" ? "text-black font-medium" : "text-gray-400"
              }`}
            >
              ML
            </button>
          </div>

          {/* Title */}
          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            {text[lang].title}
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            {text[lang].subtitle}
          </p>

          {/* Phone Field */}
          <div className="mb-6">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus-within:border-black focus-within:bg-white transition">

              <span className="text-gray-500 text-sm mr-2">+91</span>

              <input
                type="tel"
                maxLength="10"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter mobile number"
                className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Button */}
          <button
            onClick={sendOtp}
            disabled={loading || phone.length !== 10}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${
              loading || phone.length !== 10
                ? "bg-gray-200 text-gray-400"
                : "bg-black text-white hover:bg-[#111] active:scale-[0.98]"
            }`}
          >
            {loading ? "Please wait..." : text[lang].button}
          </button>

        </div>

      </div>
    </div>
  );
}