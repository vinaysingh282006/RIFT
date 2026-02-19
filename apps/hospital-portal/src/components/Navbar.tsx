import { useState } from 'react';
import { Menu, X, Hospital, User, FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Hospital className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">Hospital Portal</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <BarChart3 size={18} />
                Dashboard
              </Link>
              <Link to="/patients" className="flex items-center gap-2 text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <User size={18} />
                Patients
              </Link>
              <Link to="/reports" className="flex items-center gap-2 text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <FileText size={18} />
                Reports
              </Link>
              <Link to="/analytics" className="flex items-center gap-2 text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <BarChart3 size={18} />
                Analytics
              </Link>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center">
              <button className="flex items-center gap-2 text-foreground hover:text-primary p-2 rounded-full text-sm font-medium transition-colors">
                <User size={18} />
                Dr. Smith
              </button>
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass-card border-t border-border">
            <Link
              to="/"
              className="flex items-center gap-3 text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 size={20} />
              Dashboard
            </Link>
            <Link
              to="/patients"
              className="flex items-center gap-3 text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={20} />
              Patients
            </Link>
            <Link
              to="/reports"
              className="flex items-center gap-3 text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText size={20} />
              Reports
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-3 text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart3 size={20} />
              Analytics
            </Link>
            <button className="flex items-center gap-3 text-foreground hover:text-primary block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors">
              <User size={20} />
              Dr. Smith
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;