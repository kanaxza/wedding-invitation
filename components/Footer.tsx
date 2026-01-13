export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-gray-400">
          © {new Date().getFullYear()} Som & Gann. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
