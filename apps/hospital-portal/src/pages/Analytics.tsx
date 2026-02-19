import { BarChart3, TrendingUp, Activity, Users } from 'lucide-react';

const Analytics = () => {
  // Mock analytics data
  const stats = [
    { title: 'Total Patients', value: '1,248', change: '+12%', icon: Users },
    { title: 'Avg. Wait Time', value: '12 min', change: '-3%', icon: Activity },
    { title: 'Completed Visits', value: '86%', change: '+5%', icon: TrendingUp },
    { title: 'Satisfaction Rate', value: '94%', change: '+2%', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">Monitor hospital performance metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="glass-card rounded-lg border border-border p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-success text-sm mt-3">{stat.change} from last month</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-lg border border-border p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Patient Demographics</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart visualization would appear here
            </div>
          </div>
          <div className="glass-card rounded-lg border border-border p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Visit Trends</h3>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart visualization would appear here
            </div>
          </div>
        </div>

        <div className="mt-6 glass-card rounded-lg border border-border p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <Activity size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Patient registration completed</p>
                    <p className="text-sm text-muted-foreground">Dr. Smith • 2 hours ago</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-secondary rounded text-secondary-foreground">Completed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;