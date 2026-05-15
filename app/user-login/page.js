"use client";

import { useState } from "react";

export default function UserLogin() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const login = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "/api/user-login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
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

      localStorage.setItem(
  "userToken",
  data.token
);

localStorage.setItem(
  "user",
  JSON.stringify(data.user)
);

      window.location.href =
        "/booking";

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="mb-8 text-center">

          <div className="w-20 h-20 mx-auto rounded-[28px] bg-black text-white flex items-center justify-center text-3xl font-bold shadow-xl">
            A
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-5">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2 text-sm">
            Login to continue booking rides
          </p>

        </div>

        {/* CARD */}
        <div className="bg-white rounded-[32px] p-6 border border-gray-200 shadow-sm">

          <div className="space-y-4">

            <div>

              <p className="text-sm font-medium text-gray-700 mb-2">
                Email Address
              </p>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-black text-[15px]"
              />

            </div>

            <div>

              <p className="text-sm font-medium text-gray-700 mb-2">
                Password
              </p>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-black text-[15px]"
              />

            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-black text-white font-semibold text-[15px] mt-2 active:scale-[0.99] transition-all disabled:opacity-50"
            >

              {loading
                ? "Please wait..."
                : "Login"}

            </button>

          </div>

          {/* SIGNUP */}
          <div className="mt-6 text-center">

            <p className="text-sm text-gray-500">

              Don't have an account?{" "}

              <button
                onClick={() =>
                  window.location.href =
                    "/user-signup"
                }
                className="font-semibold text-black"
              >
                Create Account
              </button>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}