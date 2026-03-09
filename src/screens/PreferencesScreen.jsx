import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useNotificationPreferences from "../hooks/useNotificationPreferences";
import { useState } from "react";

function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  disabled,
}) {
  const { T } = useTheme();
  return (
    <div
      className="flex items-center justify-between gap-3 w-full"
      style={{
        padding: "16px",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: checked ? T.accentSoft : T.bgGlassStrong,
            border: `1px solid ${checked ? `${T.accentPrimary}33` : T.border}`,
          }}
        >
          <Icon size={18} color={checked ? T.accentPrimary : T.fgMedium} />
        </div>
        <div className="flex flex-col flex-1">
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: T.fgHigh,
              lineHeight: 1.2,
            }}
          >
            {label}
          </div>
          {description && (
            <div
              style={{
                fontSize: 13,
                color: T.fgSubtle,
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className="interactive-btn flex-shrink-0 cursor-pointer"
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: checked ? T.accentPrimary : T.bgGlassStrong,
          border: `1px solid ${checked ? T.accentPrimary : T.border}`,
          position: "relative",
          transition: "all 0.2s",
          padding: 0,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 1,
            left: checked ? 21 : 1,
            transition: "all 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        />
      </button>
    </div>
  );
}

export default function PreferencesScreen() {
  const navigate = useNavigate();
  const { T } = useTheme();
  const { session } = useAuth();
  const { preferences, savePreferences } = useNotificationPreferences();

  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleInApp = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      const next = !preferences.inAppEnabled;
      await savePreferences({ inAppEnabled: next });
      showToast("success", `Push reminders ${next ? "enabled" : "disabled"}`);
    } catch (err) {
      console.error(err);
      showToast("error", "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleEmail = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      const next = !preferences.emailEnabled;
      await savePreferences({ emailEnabled: next });
      showToast("success", `Email reminders ${next ? "enabled" : "disabled"}`);
    } catch (err) {
      console.error(err);
      showToast("error", "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-dvh" style={{ background: T.bgBase }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-end pb-3 px-4"
        style={{
          height: 90,
          background: T.bgGlass,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="w-full max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/settings")}
            className="interactive-btn w-10 h-10 -ml-2 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: "transparent", border: "none" }}
          >
            <ArrowLeft size={24} color={T.fgHigh} />
          </button>
          <div
            className="font-semibold text-[17px] tracking-tight"
            style={{ color: T.fgHigh }}
          >
            Manage Preferences
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Account Info Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: `1px solid ${T.border}`,
              background: `linear-gradient(180deg, ${T.accentSoft}, transparent)`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 700,
                color: T.accentPrimary,
                marginBottom: 8,
              }}
            >
              Account
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.fgHigh }}>
              {session?.user?.email}
            </div>
            <div style={{ fontSize: 13, color: T.fgMedium, marginTop: 4 }}>
              Signed in via Supabase
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div>
          <div
            className="px-2 mb-2"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: T.fgMedium,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Alert Preferences
          </div>
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: T.bgSurface, border: `1px solid ${T.border}` }}
          >
            <SettingToggle
              icon={Bell}
              label="Push Reminders"
              description="Native device alerts for upcoming renewals"
              checked={preferences.inAppEnabled}
              onChange={toggleInApp}
              disabled={isUpdating}
            />
            <SettingToggle
              icon={Mail}
              label="Email Reminders"
              description="Receive renewal notices in your inbox"
              checked={preferences.emailEnabled}
              onChange={toggleEmail}
              disabled={isUpdating}
            />
          </div>
          <div
            className="px-3 mt-3"
            style={{ fontSize: 12, color: T.fgSubtle, lineHeight: 1.5 }}
          >
            Changes made here are saved instantly and sync across all your
            devices.
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className="px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
            style={{
              background: toast.type === "error" ? T.semDanger : T.bgElevated,
              color: toast.type === "error" ? "#fff" : T.fgHigh,
              border: toast.type === "error" ? "none" : `1px solid ${T.border}`,
            }}
          >
            <span className="font-medium text-[14px]">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
