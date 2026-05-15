"use client";

import { useState } from "react";

export default function UserSignup() {

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const signup = async () => {

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      alert("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        "/api/user-signup",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            phone,
            password,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert(
        "Account created successfully"
      );

     localStorage.setItem(
  "user",
  JSON.stringify(data.user)
);

localStorage.setItem(
  "userToken",
  data.token
);

window.location.href =
  "/booking";

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 overflow-hidden relative">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-100px] left-[-100px] w-[260px] h-[260px] rounded-full bg-black/5 blur-3xl" />

      <div className="absolute bottom-[-120px] right-[-100px] w-[260px] h-[260px] rounded-full bg-gray-300/30 blur-3xl" />

      <div className="w-full max-w-md relative z-10">

        {/* LOGO */}
        <div className="mb-8 text-center">

          <div className="relative w-24 h-24 mx-auto rounded-[32px] bg-black text-white flex items-center justify-center shadow-2xl">

            <div className="absolute inset-0 rounded-[32px] bg-white/10 backdrop-blur-xl" />

            <span className="relative text-4xl font-black tracking-tight">
              A
            </span>

          </div>

          <h1 className="text-[34px] font-black text-gray-900 mt-6 tracking-tight leading-none">
            Create Account
          </h1>

          <p className="text-gray-500 mt-3 text-[15px] leading-relaxed">
            Create your account and start booking rides instantly
          </p>

        </div>

        {/* CARD */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-white shadow-[0_10px_50px_rgba(0,0,0,0.08)] p-6">

          <div className="space-y-4">

            {/* NAME */}
            <div>

              <p className="text-[13px] font-semibold text-gray-700 mb-2 ml-1">
                Full Name
              </p>

              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-[#fafafa] outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white transition-all"
              />

            </div>

            {/* EMAIL */}
            <div>

              <p className="text-[13px] font-semibold text-gray-700 mb-2 ml-1">
                Email Address
              </p>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-[#fafafa] outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white transition-all"
              />

            </div>

            {/* PHONE */}
            <div>

              <p className="text-[13px] font-semibold text-gray-700 mb-2 ml-1">
                Phone Number
              </p>

              <input
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-[#fafafa] outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white transition-all"
              />

            </div>

            {/* PASSWORD */}
            <div>

              <p className="text-[13px] font-semibold text-gray-700 mb-2 ml-1">
                Password
              </p>

              <input
                type="password"
                placeholder="Create a secure password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-[#fafafa] outline-none text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:border-black focus:bg-white transition-all"
              />

            </div>

            {/* BUTTON */}
            <button
              onClick={signup}
              disabled={loading}
              className="w-full h-14 mt-2 rounded-2xl bg-black text-white font-semibold text-[15px] tracking-wide active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >

              {loading
                ? "Creating Account..."
                : "Create Account"}

            </button>

          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-[1px] bg-gray-200" />

            <p className="text-xs text-gray-400 font-medium">
              OR
            </p>

            <div className="flex-1 h-[1px] bg-gray-200" />

          </div>

          {/* LOGIN */}
          <div className="text-center">

            <p className="text-[14px] text-gray-500">

              Already have an account?{" "}

              <button
                onClick={() =>
                  window.location.href =
                    "/user-login"
                }
                className="text-black font-bold hover:opacity-70 transition"
              >
                Login
              </button>

            </p>

          </div>

        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed px-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>

    </div>
  );
}