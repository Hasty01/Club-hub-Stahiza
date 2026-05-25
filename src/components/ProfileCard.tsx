import React, { useState } from "react";
import { StudentProfile } from "../types";
import { AVATAR_PRESETS } from "../data";
import { Shield, Sparkles, User, Award, CheckCircle2, ChevronDown, Check } from "lucide-react";

interface ProfileCardProps {
  userProfile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
}

export default function ProfileCard({ userProfile, onUpdateProfile }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(userProfile.name);
  const [userClass, setUserClass] = useState(userProfile.classLevel);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatarSeed);

  const activeAvatarInfo = AVATAR_PRESETS.find(a => a.id === userProfile.avatarSeed) || AVATAR_PRESETS[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    onUpdateProfile({
      name: userName.trim(),
      classLevel: userClass,
      avatarSeed: selectedAvatar
    });
    setIsEditing(false);
  };

  // Level progress statistics calculations
  const levelFloorXp = (userProfile.level - 1) * 300;
  const levelCeilingXp = userProfile.level * 300;
  const xpInCurrentLevel = userProfile.xp - levelFloorXp;
  const xpNeededForNextLevel = 300;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left select-none">
        {/* Big Avatar Frame */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border border-indigo-500/30 flex items-center justify-center text-4xl shadow-lg relative group">
          <span>{activeAvatarInfo.emoji}</span>
          <span className="absolute -bottom-1 -right-1 bg-slate-950 text-indigo-400 border border-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
            LVL {userProfile.level}
          </span>
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-sans text-lg font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-1.5">
                {userProfile.name}
                <Shield className="w-4 h-4 text-indigo-400" title="Verified Member" />
              </h3>
              <p className="text-xs text-indigo-400/90 font-mono font-medium block">
                Class level: {userProfile.classLevel} Representative
              </p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-slate-950 transition-colors shrink-0"
            >
              {isEditing ? "Cancel Setup" : "Update Profile"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px]">
            <span className="bg-slate-950 text-indigo-400 border border-slate-800 px-2 py-0.5 rounded-md">
              🎯 CORE XP: {userProfile.xp} PTS
            </span>
            <span className="bg-slate-950 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-md uppercase">
              RANK: {userProfile.rank}
            </span>
          </div>
        </div>
      </div>

      {/* Editing dialog Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4 animate-fadeIn">
          <h4 className="font-sans font-semibold text-xs text-slate-300 uppercase tracking-wider">Configure Registered Profile</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">Student / Guest Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 p-2 rounded-lg outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1">High School Class Level</label>
              <select
                value={userClass}
                onChange={(e) => setUserClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 p-2 rounded-lg outline-none"
              >
                <option value="Senior 1">Senior One (O-level Core)</option>
                <option value="Senior 2">Senior Two (O-level Core)</option>
                <option value="Senior 3">Senior Three (O-level Core)</option>
                <option value="Senior 4">Senior Four (O-level Core)</option>
                <option value="Senior 5">Senior Five (A-level Subsidiary Math/ICT)</option>
                <option value="Senior 6">Senior Six (A-level Subsidiary Math/ICT)</option>
                <option value="Patron/Teacher">Guest Scholar (Professional Tech)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5">Select Avatar Emoji Preset</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.id)}
                    className={`aspect-square p-2 border rounded-lg hover:bg-slate-900 transition-colors flex flex-col items-center justify-center relative ${
                      selectedAvatar === preset.id
                        ? "bg-slate-900 border-indigo-500 text-slate-100"
                        : "bg-transparent border-slate-800 text-slate-400"
                    }`}
                    title={preset.label}
                  >
                    <span className="text-lg">{preset.emoji}</span>
                    {selectedAvatar === preset.id && (
                      <span className="absolute top-0 right-0 p-0.5 bg-indigo-600 rounded-bl text-[7px] text-slate-100">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Save Student Profile Indices</span>
          </button>
        </form>
      )}

      {/* Level XP Progress indicators */}
      <div className="space-y-2 select-none">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Level {userProfile.level} Progression</span>
          <span className="text-indigo-400 font-semibold">{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[10px] font-mono text-slate-500 text-right">
          Gain {xpNeededForNextLevel - xpInCurrentLevel} XP points to unlock Level {userProfile.level + 1} ranks!
        </p>
      </div>

      {/* Unlocked Badges Cabinet */}
      <div className="pt-2 border-t border-slate-800/60 select-none">
        <h4 className="font-sans font-semibold text-slate-300 text-xs uppercase tracking-wider mb-3">Academic Badge Cabinet</h4>
        <div className="grid grid-cols-2 gap-2">
          {userProfile.unlockedBadges.map((badge, index) => (
            <div
              key={index}
              className="bg-slate-950 border border-slate-850 p-2 rounded-xl flex items-center gap-2"
            >
              <div className="w-7 h-7 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <span className="text-slate-200 font-sans font-medium text-[11px] block">{badge}</span>
                <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Unlocked
                </span>
              </div>
            </div>
          ))}

          {userProfile.unlockedBadges.length === 0 && (
            <div className="col-span-2 text-center py-4 text-[11px] font-mono text-slate-500">
              Cabinet empty. Solve Quests & Sandbox homework to earn prestigious tech badges!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
