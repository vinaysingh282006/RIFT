import { CalendarIcon, FileTextIcon, BarChartIcon } from 'lucide-react';

// Component uses JSX but doesn't need explicit React import in React 17+

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Hospital Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening today.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-lg border border-border p-6 backdrop-blur-sm hover:teal-glow transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                <CalendarIcon size={24} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Patient Management</h2>
            </div>
            <p className="text-muted-foreground mb-4">Manage patient records and appointments</p>
            <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
              View Patients →
            </button>
          </div>
          
          <div className="glass-card rounded-lg border border-border p-6 backdrop-blur-sm hover:teal-glow transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                <FileTextIcon size={24} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Reports</h2>
            </div>
            <p className="text-muted-foreground mb-4">View and generate medical reports</p>
            <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
              Generate Report →
            </button>
          </div>
          
          <div className="glass-card rounded-lg border border-border p-6 backdrop-blur-sm hover:teal-glow transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                <BarChartIcon size={24} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
            </div>
            <p className="text-muted-foreground mb-4">Monitor hospital performance metrics</p>
            <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
              View Metrics →
            </button>
          </div>
        </div>
        
        <div className="mt-8 glass-card rounded-lg border border-border p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="mr-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">JD</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">John Doe created a new patient record</p>
                <p className="text-sm text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="mr-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">AS</span>
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">Alice Smith generated a report</p>
                <p className="text-sm text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;