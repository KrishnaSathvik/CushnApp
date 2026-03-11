import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Laptop,
  Shield,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { AuthPageHeader, AuthSplitLayout, Field } from "./AuthPages";

export default function GuestEntry() {
  const [name, setName] = useState("");
  const { T } = useTheme()
  const { loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectParam = new URLSearchParams(location.search).get("redirect");
  const redirectTo =
    redirectParam && redirectParam.startsWith("/") ? redirectParam : "/add";

  const handleStart = async () => {
    await loginAsGuest(name.trim() || "Guest");
    navigate(redirectTo);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") void handleStart();
  };

  return (
    <AuthSplitLayout
      mode="signup"
      blurb="Start in guest mode with local-first subscription tracking now, then create an account later if you want sync across devices."
      valuePoints={[
        "Keep everything local on this device to start",
        "Create an account later to sync across devices",
        "See your recurring spend before committing",
      ]}
    >
      <AuthPageHeader
        title="Continue in guest mode"
        subtitle="See what your subscriptions are really costing with local storage now, then create an account later if you want sync."
      />

      <div className="motion-rise-in motion-delay-1 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        <div
          className="rounded-lg px-3 py-2"
          style={{
            background: T.bgElevated,
            border: `1px solid ${T.border}`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Shield size={12} color={T.accentPrimary} />
            <span className="font-mono text-[10px] font-bold" style={{ color: T.accentPrimary }}>
              LOCAL-FIRST
            </span>
          </div>
          <p className="text-[11px] leading-[1.5] m-0" style={{ color: T.fgSecondary }}>
            Your guest data stays on this device.
          </p>
        </div>
        <div
          className="rounded-lg px-3 py-2"
          style={{
            background: T.bgElevated,
            border: `1px solid ${T.border}`,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Laptop size={12} color={T.accentPrimary} />
            <span className="font-mono text-[10px] font-bold" style={{ color: T.accentPrimary }}>
              UPGRADE ANYTIME
            </span>
          </div>
          <p className="text-[11px] leading-[1.5] m-0" style={{ color: T.fgSecondary }}>
            Sign up later to sync across devices.
          </p>
        </div>
      </div>

      <div className="motion-rise-in motion-delay-2" onKeyDown={handleKeyDown}>
        <Field
          label="What should we call you? (Optional)"
          placeholder="Guest"
          icon={User}
          value={name}
          onChange={setName}
        />
      </div>

      {/* Start button */}
      <button
        onClick={() => void handleStart()}
        className="motion-rise-in motion-delay-3 interactive-btn interactive-btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[14px] mt-2 transition-all duration-200 cursor-pointer"
        style={{
          background: T.accentPrimary,
          border: "none",
          color: "#fff",
          boxShadow: `0 0 24px ${T.accentPrimary}44`,
          opacity: 1,
          cursor: "pointer",
        }}
      >
        <Sparkles size={16} /> See what I am spending <ArrowRight size={14} />
      </button>

      <div className="motion-rise-in motion-delay-3 mt-8 text-center">
        <span className="text-[13px]" style={{ color: T.fgTertiary }}>
          Already have an account?{" "}
        </span>
        <Link
          to="/login"
          className="text-[13px] font-semibold cursor-pointer"
          style={{ color: T.accentPrimary }}
        >
          Sign in
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
