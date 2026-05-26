import React, { useState, useRef } from "react";
import { StudentProfile } from "../types";
import { AVATAR_PRESETS } from "../data";
import { 
  Shield, 
  Sparkles, 
  User, 
  Award, 
  CheckCircle2, 
  Check, 
  Camera, 
  Link, 
  FileText,
  BadgeInfo,
  Calendar,
  Layers,
  Flame,
  UserCheck
} from "lucide-react";

interface ProfileCardProps {
  userProfile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
}

export default function ProfileCard({ userProfile, onUpdateProfile }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // States for Instagram-like edit fields
  const [userName, setUserName] = useState(userProfile.name);
  const [userUsername, setUserUsername] = useState(userProfile.username || "");
  const [userBio, setUserBio] = useState(userProfile.bio || "");
  const [userClass, setUserClass] = useState(userProfile.classLevel);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatarSeed);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCustomImage = userProfile.avatarSeed && (
    userProfile.avatarSeed.startsWith("http") || 
    userProfile.avatarSeed.startsWith("data:") || 
    userProfile.avatarSeed.startsWith("/") || 
    userProfile.avatarSeed.includes("/")
  );

  const currentPreset = AVATAR_PRESETS.find(a => a.id === userProfile.avatarSeed);

  const handleStartEdit = () => {
    setUserName(userProfile.name);
    setUserUsername(userProfile.username || userProfile.email?.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "");
    setUserBio(userProfile.bio || "");
    setUserClass(userProfile.classLevel);
    setSelectedAvatar(userProfile.avatarSeed);
    setUploadError(null);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    // Clean username to keep Alphanumeric + underscore or period like Instagram
    const cleanUsername = userUsername.toLowerCase()
      .trim()
      .replace(/[^a-z0-9_.]/g, "");

    onUpdateProfile({
      name: userName.trim(),
      username: cleanUsername,
      bio: userBio.trim(),
      classLevel: userClass,
      avatarSeed: selectedAvatar
    });
    setIsEditing(false);
  };

  // Level progress calculations
  const levelFloorXp = (userProfile.level - 1) * 300;
  const levelCeilingXp = userProfile.level * 300;
  const xpInCurrentLevel = userProfile.xp - levelFloorXp;
  const xpNeededForNextLevel = 300;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

  // Handle uploaded profile photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Direct check for file size (limit 2MB for fast transfer/local storage base64 capacity)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image must be smaller than 2MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      
      // Keep local state updated instantly for optimistic visual feedback
      setSelectedAvatar(base64data);

      const { isSupabaseConfigured, supabase } = await import("../lib/supabaseClient");
      if (isSupabaseConfigured) {
        try {
          const fileExt = file.name.split('.').pop() || "jpg";
          const randomHex = Math.floor(Math.random() * 1000000).toString(16);
          const fileName = `${userProfile.email?.split('@')[0] || 'profile'}_${randomHex}.${fileExt}`;
          const filePath = `users/${fileName}`;

          // Upload to 'avatars' storage bucket
          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (error) {
            console.warn("Could not save to avatars bucket, falling back to profile record base64 storage.");
            setSelectedAvatar(base64data);
            onUpdateProfile({ avatarSeed: base64data });
          } else {
            // Retrieve public URL
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);

            setSelectedAvatar(publicUrl);
            onUpdateProfile({ avatarSeed: publicUrl });
          }
        } catch (err) {
          console.error("Supabase Storage error:", err);
          onUpdateProfile({ avatarSeed: base64data });
        }
      } else {
        // Safe offline base64 storage
        onUpdateProfile({ avatarSeed: base64data });
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      setUploadError("Failed to read selection.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div id="instagram-profile-wrapper" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      
      {/* Instagram-style Header Part */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between select-none">
        
        {/* Left Circle Photo Section */}
        <div className="relative group">
          {/* Ring representing progression/premium streak */}
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center overflow-hidden relative">
              {isCustomImage ? (
                <img 
                  id="img-profile-photo"
                  src={userProfile.avatarSeed} 
                  alt={userProfile.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-4xl text-slate-100">
                  {currentPreset?.emoji || "🦁"}
                </span>
              )}

              {/* Upload overlay inside avatar circle */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-slate-200 transition-opacity duration-200 cursor-pointer"
              >
                <Camera className="w-5 h-5 text-pink-400 mb-0.5" />
                <span className="text-[8px] tracking-wider uppercase font-bold text-pink-300">New Photo</span>
              </button>
            </div>
          </div>

          <span className="absolute -bottom-1 -right-1 bg-slate-950 text-indigo-400 border border-slate-800 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-extrabold uppercase shadow-lg">
            LVL {userProfile.level}
          </span>
        </div>

        {/* Right Columns Part: Instagram Numbers Grid (XP, Badges, Streak) */}
        <div className="flex-1 w-full max-w-sm">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/20">
              <span className="text-sm font-extrabold text-white block font-sans">
                {userProfile.xp.toLocaleString()}
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">Total XP</span>
            </div>

            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/20">
              <span className="text-sm font-extrabold text-pink-400 block font-sans">
                {userProfile.unlockedBadges.length}
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">Badges</span>
            </div>

            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/20 flex flex-col items-center justify-center">
              <span className="text-sm font-extrabold text-emerald-400 flex items-center justify-center gap-0.5 font-sans">
                {userProfile.streak || 0}
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 inline" />
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mt-0.5">Streak</span>
            </div>
          </div>
        </div>

      </div>

      {/* Hidden File Import */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Bio Information Section */}
      <div className="space-y-1.5 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-sans text-[15px] font-bold text-slate-100 flex items-center gap-1">
            {userProfile.name}
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" title="Registered Pupil" />
          </h3>
          <span className="text-slate-500 font-mono text-xs">
            @{userProfile.username || userProfile.email?.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "pupil"}
          </span>
        </div>

        {userProfile.bio ? (
          <p className="text-slate-300 text-xs italic font-sans leading-relaxed break-words whitespace-pre-wrap">
            "{userProfile.bio}"
          </p>
        ) : (
          <p className="text-slate-500 text-xs italic tracking-wide">
            No professional club bio yet. Tap 'Edit Profile' below to configure.
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 pt-1.5 select-none text-[9px] font-mono font-bold">
          <span className="bg-slate-950 text-indigo-400 border border-indigo-950/60 px-2 py-0.5 rounded-md">
            🏫 UNEB INDEX: {userProfile.classLevel}
          </span>
          <span className="bg-pink-950/60 text-pink-400 border border-pink-900/40 px-2 py-0.5 rounded-md uppercase">
            ⚡ {userProfile.role} PORTAL KEYS
          </span>
        </div>

        {/* Action Button: Edit Profile (Instagram styling) */}
        {!isEditing && (
          <div className="pt-2 select-none">
            <button
              onClick={handleStartEdit}
              className="w-full text-center py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition-all uppercase cursor-pointer tracking-wider"
            >
              Edit Profile Detail Register
            </button>
          </div>
        )}
      </div>

      {/* Editing dialog Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-bold text-xs text-pink-400 uppercase tracking-wider">Configure Registered Credentials</h4>
            <span className="text-[9px] font-mono text-slate-500">Instagram-Like Panel</span>
          </div>

          {uploadError && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-lg text-[10px] font-mono text-rose-400">
              ⚠️ {uploadError}
            </div>
          )}
          
          <div className="space-y-3.5">
            {/* Direct Avatar Trigger */}
            <div className="flex items-center gap-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
              <div className="w-11 h-11 rounded-full bg-pink-600/10 border border-pink-500/20 flex items-center justify-center overflow-hidden">
                {selectedAvatar && (selectedAvatar.startsWith("http") || selectedAvatar.startsWith("data:")) ? (
                  <img src={selectedAvatar} className="w-full h-full object-cover" alt="Selected" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-xl">🎨</span>
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 hover:bg-indigo-600/30 font-mono text-[9px] font-bold rounded uppercase transition-all tracking-wider disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? "Uploading..." : "Upload Profile Photo"}
                </button>
                <span className="block text-[8px] text-slate-500 mt-1 font-mono">JPG, PNG under 2MB. Supports offline simulation</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-bold">Student Full Name</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Joel Hasty"
                className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 text-xs text-slate-100 p-2 rounded-lg outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-bold">Club Username</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-mono">@</span>
                <input
                  type="text"
                  required
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                  placeholder="custom_user"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 text-xs text-slate-100 pl-7 pr-2 py-2 rounded-lg outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Profile Bio</label>
                <span className={`text-[8px] font-mono ${userBio.length > 130 ? 'text-pink-400' : 'text-slate-500'}`}>
                  {userBio.length}/150 Indices
                </span>
              </div>
              <textarea
                value={userBio}
                maxLength={150}
                onChange={(e) => setUserBio(e.target.value)}
                placeholder="Write your professional bio... Enthusiastic about React, ICT..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 text-xs text-slate-100 p-2 rounded-lg outline-none transition-all leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1 font-bold">High School Class Level</label>
              <select
                value={userClass}
                onChange={(e) => setUserClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 text-xs text-slate-200 p-2 rounded-lg outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="Senior 1">Senior One (O-level Core)</option>
                <option value="Senior 2">Senior Two (O-level Core)</option>
                <option value="Senior 3">Senior Three (O-level Core)</option>
                <option value="Senior 4">Senior Four (O-level Core)</option>
                <option value="Senior 5">Senior Five (A-level Subsidiary)</option>
                <option value="Senior 6">Senior Six (A-level Subsidiary)</option>
                <option value="Patron/Teacher">Guest Scholar (Professional Tech)</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer font-mono uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono uppercase"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      )}

      {/* Level XP Progress Indicators */}
      <div className="space-y-2 select-none">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Level {userProfile.level} Progression</span>
          <span className="text-pink-400 font-semibold">{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
        </div>
        <div className="w-full h-2.5 bg-slate-955 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-pink-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[9px] font-mono text-slate-500 text-right">
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
              <div className="w-7 h-7 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-pink-400" />
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
