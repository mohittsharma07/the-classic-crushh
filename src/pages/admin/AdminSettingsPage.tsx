import React, { useState } from "react";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { Shield, Globe, RotateCcw, Save, AlertTriangle } from "lucide-react";

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaults } = useData();
  const { showToast } = useToast();

  const [email, setEmail] = useState(settings.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMaintenance, setIsMaintenance] = useState(settings.isMaintenanceMode);

  const handleAccountSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword) {
      if (currentPassword !== settings.passwordHash) {
        showToast("Current password is not correct.", "error");
        return;
      }
      if (newPassword.length < 6) {
        showToast("New password must be at least 6 characters.", "error");
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast("New passwords do not match.", "error");
        return;
      }
      updateSettings({
        email: email.trim(),
        passwordHash: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Admin account & password updated successfully.");
    } else {
      updateSettings({ email: email.trim() });
      showToast("Admin email updated.");
    }
  };

  const handleMaintenanceToggle = (val: boolean) => {
    setIsMaintenance(val);
    updateSettings({ isMaintenanceMode: val });
    showToast(val ? "Website switched to Maintenance mode." : "Website is Live!");
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all cafe data to original factory defaults? This will restore original items, orders, and images."
      )
    ) {
      resetToDefaults();
      showToast("All data reset to initial defaults.");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <AdminLayout
      pageTitle="Settings &amp; Access"
      pageSubtitle="Manage admin portal security, maintenance status, and site data."
    >
      <div className="max-w-3xl space-y-8 text-xs">
        {/* Account Credentials */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EFE9DE] pb-2">
            <Shield className="w-4 h-4 text-[#755546]" />
            <h2 className="font-serif text-lg font-bold text-[#1C241E]">
              Admin Security &amp; Credentials
            </h2>
          </div>

          <form onSubmit={handleAccountSave} className="space-y-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-[#3E4340] mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
              />
            </div>

            <div className="pt-2 border-t border-[#EFE9DE] space-y-3">
              <span className="font-semibold text-[#1C241E] block">
                Change Password (Leave blank to keep current)
              </span>

              <div>
                <label className="block text-[#767E7A] mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#767E7A] mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>
                <div>
                  <label className="block text-[#767E7A] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCFAF7] border border-[#E5DFD5] rounded-xl text-xs text-[#1C241E]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-[#26332A] hover:bg-[#1C241E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </form>
        </div>

        {/* Website Status */}
        <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#EFE9DE] pb-2">
            <Globe className="w-4 h-4 text-[#755546]" />
            <h2 className="font-serif text-lg font-bold text-[#1C241E]">
              Website Visibility Mode
            </h2>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F2] border border-[#EFE9DE]">
            <div>
              <span className="font-bold text-sm text-[#1C241E] block">
                {isMaintenance ? "🔴 Maintenance Mode" : "🟢 Store is Live"}
              </span>
              <p className="text-xs text-[#767E7A] mt-0.5 font-light">
                {isMaintenance
                  ? "Customers will see a polite maintenance notice while you update menus or take a holiday."
                  : "All customer pages are publicly accessible and orders are active."}
              </p>
            </div>

            <button
              onClick={() => handleMaintenanceToggle(!isMaintenance)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                isMaintenance
                  ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
              }`}
            >
              {isMaintenance ? "Make Store Live" : "Set Maintenance"}
            </button>
          </div>
        </div>

        {/* Data Reset */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-2xs p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="font-serif text-lg font-bold text-rose-900">
              Restore Factory Defaults
            </h2>
          </div>
          <p className="text-xs text-[#767E7A] font-light leading-relaxed">
            Need to reset your test experiments? This will restore original cafe menu items, categories, demo orders, and gallery items to their initial clean state.
          </p>

          <button
            onClick={handleReset}
            className="mt-2 px-4 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Data to Defaults</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};
