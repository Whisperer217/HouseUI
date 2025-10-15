export default function AITypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="text-2xl">🤖</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white">AI Assistant</span>
          <span className="text-xs text-gray-500">typing...</span>
        </div>
        <div className="inline-block px-4 py-2 rounded-lg bg-gray-800 text-white">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
