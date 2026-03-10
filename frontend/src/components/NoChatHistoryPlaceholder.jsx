import { useRef } from "react";
import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { compressImage } from "../lib/compressImage";
import toast from "react-hot-toast";

function NoChatHistoryPlaceholder({ name }) {
  const { sendMessage } = useChatStore();
  const fileInputRef = useRef(null);

  const handleQuickMessage = (text) => {
    sendMessage({ text });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      sendMessage({ image: compressed });
    } catch (err) {
      toast.error("Failed to process image");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-400/10 rounded-full flex items-center justify-center mb-5">
        <MessageCircleIcon className="w-8 h-8 text-purple-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-200 mb-3">
        Start your conversation with {name}
      </h3>
      <div className="flex flex-col space-y-3 max-w-md mb-5">
        <p className="text-slate-400 text-sm">
          This is the beginning of your conversation. Send a message to start
          chatting!
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mx-auto"></div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleQuickMessage("👋 Hello!")}
          className="px-4 py-2 text-xs font-medium text-purple-400 bg-purple-500/10 rounded-full hover:bg-purple-500/20 transition-colors"
        >
          👋 Say hello
        </button>
        <button
          onClick={() => handleQuickMessage("🤝 How are you?")}
          className="px-4 py-2 text-xs font-medium text-purple-400 bg-purple-500/10 rounded-full hover:bg-purple-500/20 transition-colors"
        >
          🤝 How are you?
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-xs font-medium text-purple-400 bg-purple-500/10 rounded-full hover:bg-purple-500/20 transition-colors"
        >
          📸 Share a photo
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        className="hidden"
      />
    </div>
  );
}

export default NoChatHistoryPlaceholder;
