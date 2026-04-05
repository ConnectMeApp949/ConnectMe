export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-14 h-14 bg-[#1F4E79] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">C</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <a
          href="/"
          className="px-4 py-2 bg-[#1F4E79] text-white rounded-lg text-sm font-medium hover:bg-[#163a5c]"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
