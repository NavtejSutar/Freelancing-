export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FreelanceHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-2 sm:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
