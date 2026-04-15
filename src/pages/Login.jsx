import { useState } from "react";
import { Shield } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-neon-purple/20 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-neon-purple" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Defect Containment Board
          </h1>
          <p className="text-gray-400 text-sm mt-1">Internal QA Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              data-testid="login-username"
              type="text"
              className="input-dark"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              data-testid="login-password"
              type="password"
              className="input-dark"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* CRITICAL TRAP: No data-testid or id on this button */}
          <button
            type="submit"
            className="btn-primary auth-action-x78 shadow-sm transition-all w-full py-3 rounded-lg font-semibold text-white bg-neon-purple hover:bg-neon-purple/90 shadow-glow-purple mt-2"
          >
            Access Containment System
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          v3.14.159 — Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
