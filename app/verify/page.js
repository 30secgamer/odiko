"use client";

import { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputs = useRef([]);
  const params = useSearchParams();
  const router = useRouter();

  const phone = params.get("phone");
  const lang = params.get("lang") || "en";
  const devOtp = params.get("otp");

  const text = {
    en: {
      title: "Verify OTP",
      subtitle: `Code sent to +91 ${phone}`,
      button: "Verify",
    },
    ml: {
      title: "OTP സ്ഥിരീകരിക്കുക",
      subtitle: `+91 ${phone} ലേക്ക് കോഡ് അയച്ചു`,
      button: "സ്ഥിരീകരിക്കുക",
    },
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp: finalOtp }),
      });

      if (!res.ok) {
        alert("Invalid OTP");
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);

      localStorage.setItem(
  "token",
  data.token
);

if (data.onboardingCompleted) {

  router.push("/dashboard");

} else {

  router.push("/onboarding");
}

    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

          <h1 className="text-lg font-semibold text-gray-900 mb-1">
            {text[lang].title}
          </h1>

          <p className="text-sm text-gray-500 mb-6">
            {text[lang].subtitle}
          </p>
          {devOtp && (

  <div className="mb-5 bg-black text-white rounded-xl p-4 text-center">

    <p className="text-xs text-gray-400 mb-1">
      Test OTP
    </p>

    <p className="text-3xl font-bold tracking-[10px]">
      {devOtp}
    </p>

  </div>

)}

          {/* UPDATED OTP BOXES */}
          <div className="flex justify-between mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                style={{ color: "#000" }}
                className="
                  w-12 h-14
                  text-center
                  text-2xl font-semibold
                  text-black caret-black
                  bg-white
                  border border-gray-300
                  rounded-lg
                  focus:border-black
                  focus:ring-2 focus:ring-black/10
                  outline-none
                  transition
                "
              />
            ))}
          </div>

          <button
            onClick={verifyOtp}
            disabled={!isComplete || loading}
            className={`w-full py-3 rounded-lg text-sm font-medium transition ${
              !isComplete || loading
                ? "bg-gray-200 text-gray-400"
                : "bg-black text-white hover:bg-[#111] active:scale-[0.98]"
            }`}
          >
            {loading ? "Verifying..." : text[lang].button}
          </button>

        </div>

      </div>
    </div>
  );
}