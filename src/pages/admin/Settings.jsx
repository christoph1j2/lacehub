import { useState } from "react";
const Settings = () => {
  const [settings, setSettings] = useState({
    matchingEnabled: true,
    autoMatching: false,
    apiKey: "sk_test_12345abcdef",
    matchingInterval: 60,
    userAccountExpiry: 90,
    emailNotifications: true,
  });
  const handleSaveSettings = () => {
    // Simulate saving settings
    setTimeout(() => {
      alert("Settings saved successfully!");
    }, 500);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-primary-500">Manage your admin panel settings.</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-primary-200">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">General Settings</h3>
          <p className="text-sm text-primary-500 mb-6">
            Configure system-wide settings for your platform.
          </p>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="matching-enabled"
                    className="block text-sm font-medium text-primary-700"
                  >
                    Matching System
                  </label>
                  <p className="text-sm text-primary-500">
                    Enable or disable the matching system.
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="matching-enabled"
                    className="sr-only peer"
                    checked={settings.matchingEnabled}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        matchingEnabled: !settings.matchingEnabled,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-primary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-500"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="auto-matching"
                    className="block text-sm font-medium text-primary-700"
                  >
                    Automatic Matching
                  </label>
                  <p className="text-sm text-primary-500">
                    Run matching algorithm automatically.
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="auto-matching"
                    className="sr-only peer"
                    checked={settings.autoMatching}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        autoMatching: !settings.autoMatching,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-primary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-500"></div>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="api-key"
                  className="block text-sm font-medium text-primary-700"
                >
                  API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, apiKey: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="matching-interval"
                    className="block text-sm font-medium text-primary-700"
                  >
                    Matching Interval (minutes)
                  </label>
                  <input
                    id="matching-interval"
                    type="number"
                    value={settings.matchingInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        matchingInterval: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="account-expiry"
                    className="block text-sm font-medium text-primary-700"
                  >
                    User Account Expiry (days)
                  </label>
                  <input
                    id="account-expiry"
                    type="number"
                    value={settings.userAccountExpiry}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        userAccountExpiry: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="email-notifications"
                    className="block text-sm font-medium text-primary-700"
                  >
                    Email Notifications
                  </label>
                  <p className="text-sm text-primary-500">
                    Send email notifications to users.
                  </p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    className="sr-only peer"
                    checked={settings.emailNotifications}
                    onChange={() =>
                      setSettings({
                        ...settings,
                        emailNotifications: !settings.emailNotifications,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-primary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-500"></div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-primary-200">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2">System Information</h3>
          <p className="text-sm text-primary-500 mb-6">
            Information about your system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-primary-700">
                System Version
              </p>
              <p className="text-sm text-primary-500">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">
                Last Backup
              </p>
              <p className="text-sm text-primary-500">2023-06-30 12:34:56</p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">
                Database Size
              </p>
              <p className="text-sm text-primary-500">256 MB</p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">
                Last Matching Run
              </p>
              <p className="text-sm text-primary-500">2023-06-30 08:15:30</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
