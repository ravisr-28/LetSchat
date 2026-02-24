import React, { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { LogOutIcon, LoaderIcon, Volume2Icon, VolumeOffIcon } from "lucide-react";
const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  console.log("Auth User:", authUser);

  const [selectedImg, setSelectedImg] = useState(null);
  const fileInputRef = useRef(null);
  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
              disabled={isUpdatingProfile}
            >
              <img
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="User image"
                className={`size-full object-cover ${isUpdatingProfile ? "opacity-40" : ""}`}
              />
              {isUpdatingProfile ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoaderIcon className="size-6 text-white animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs">change</span>
                </div>
              )}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImgUpload}
              className="hidden"
            />
          </div>
          {/* Username & Online text */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authUser?.username}
            </h3>
            <p className="text-slate-400">Online</p>
          </div>
        </div>
        {/* Button */}

        <div className="flex gap-4 items-center">
          {/* Logout btn */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>
          {/* Sound toggle btn */}

          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failded:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
