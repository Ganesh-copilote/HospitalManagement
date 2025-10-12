import { useState } from "react";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Dark Mode</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="hidden"
            />
            <div
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                darkMode ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;
