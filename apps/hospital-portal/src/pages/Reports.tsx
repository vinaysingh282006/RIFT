import { Download, Eye, Filter, Calendar } from 'lucide-react';

const Reports = () => {
  // Mock report data
  const reports = [
    { id: 1, title: 'Monthly Patient Summary', date: '2024-01-15', type: 'Summary', status: 'Completed' },
    { id: 2, title: 'Pharmacogenomic Analysis Report', date: '2024-01-10', type: 'Analysis', status: 'Completed' },
    { id: 3, title: 'Adverse Drug Reaction Trends', date: '2024-01-05', type: 'Trend', status: 'Processing' },
    { id: 4, title: 'Patient Risk Assessment', date: '2023-12-28', type: 'Assessment', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">Generate and view medical reports</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <select className="pl-10 pr-8 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                <option>All Types</option>
                <option>Summary</option>
                <option>Analysis</option>
                <option>Trend</option>
                <option>Assessment</option>
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <select className="pl-10 pr-8 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                <option>All Time</option>
                <option>Last Month</option>
                <option>Last Quarter</option>
                <option>Last Year</option>
              </select>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Generate New Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="glass-card rounded-lg border border-border p-6 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.status === 'Completed' 
                    ? 'bg-success/20 text-success' 
                    : 'bg-warning/20 text-warning'
                }`}>
                  {report.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm px-3 py-1 bg-secondary rounded-md text-secondary-foreground">
                  {report.type}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 text-foreground hover:text-primary rounded-md hover:bg-accent">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-foreground hover:text-primary rounded-md hover:bg-accent">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;