import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FamilyProfile } from '../types';
import StatusIndicator from './StatusIndicator';
import { AIStatus } from '../types';

interface HeaderProps {
  profiles: FamilyProfile[];
  currentProfile: FamilyProfile;
  onProfileChange: (profile: FamilyProfile) => void;
  aiStatus: AIStatus;
}

export default function Header({ profiles, currentProfile, onProfileChange, aiStatus }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0f1419] border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Family AI System</h1>
              <p className="text-xs text-gray-500">Create, Explore, Imagine</p>
            </div>
          </div>

          <div className="relative flex items-center space-x-4">
            <StatusIndicator status={aiStatus} />
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 transition-colors border border-gray-700"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: currentProfile.color }}
              >
                {currentProfile.avatar}
              </div>
              <span className="text-white font-medium hidden sm:inline">{currentProfile.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      onProfileChange(profile);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                      currentProfile.id === profile.id ? 'bg-gray-700' : ''
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: profile.color }}
                    >
                      {profile.avatar}
                    </div>
                    <span className="text-white font-medium">{profile.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
