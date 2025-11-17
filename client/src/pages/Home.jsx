import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

export default function Home() {
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* ---------- HEADER ---------- */}
      <header className="w-full border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#5865f2] flex items-center justify-center font-bold">
              RC
            </div>
            <div>
              <h1 className="text-lg font-semibold">Realtime Chat</h1>
              <p className="text-xs text-slate-400">
                Connect with friends instantly
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* LEFT SIDE – marketing / intro (hidden on very small screens) */}
            <section className="hidden md:flex flex-col justify-between bg-gradient-to-br from-sky-500/20 via-slate-900 to-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
              <div>
                <h2 className="text-2xl font-bold mb-3">
                  Chat in realtime with your crew
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Create an account, join your friends and enjoy low-latency,
                  realtime messaging. Simple, fast and secure all inside your
                  browser.
                </p>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                <li>• Online status & instant delivery</li>
                <li>• Secure authentication</li>
                <li>• Works on desktop & mobile</li>
              </ul>

              <p className="mt-8 text-xs text-slate-500">
                Tip: Use a single account across all your devices.
              </p>
            </section>

            {/* RIGHT SIDE – auth card with tabs */}
            <section className="bg-[#202225] rounded-2xl border border-slate-800 shadow-xl p-6 sm:p-8 flex flex-col">
              {/* Tabs */}
              <div className="flex mb-6 rounded-full bg-[#2f3136] p-1 text-sm font-semibold">
                <button
                  className={`flex-1 py-2 rounded-full transition ${
                    activeTab === "login"
                      ? "bg-[#5865f2] text-white shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("login")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`flex-1 py-2 rounded-full transition ${
                    activeTab === "register"
                      ? "bg-[#5865f2] text-white shadow"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("register")}
                  type="button"
                >
                  Register
                </button>
              </div>

              {/* Form */}
              <div className="flex-1">
                {activeTab === "login" ? <Login /> : <Register />}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="flex justify-center items-center py-3 bg-slate-950 border-t border-slate-800 text-slate-500 text-xs">
        © {new Date().getFullYear()} Realtime Chat. All rights reserved.
      </footer>
    </div>
  );
}
