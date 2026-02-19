import { Link } from "react-router-dom";
// Component uses JSX but doesn't need explicit React import in React 17+

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center glass-card p-12 rounded-lg border border-border backdrop-blur-sm max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;