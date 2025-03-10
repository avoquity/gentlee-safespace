
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-ivory">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-deep-charcoal">404</h1>
        <p className="text-xl text-deep-charcoal mb-4">Oops! Page not found</p>
        <p className="text-gray-600 mb-6">
          The page at <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> could not be found.
        </p>
        <Link to="/" className="px-6 py-2 rounded-full bg-deep-charcoal border-2 border-deep-charcoal text-white hover:bg-muted-sage hover:border-muted-sage">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
