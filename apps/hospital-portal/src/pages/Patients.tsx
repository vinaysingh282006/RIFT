import { Search, Plus, MoreHorizontal } from 'lucide-react';

const Patients = () => {
  // Mock patient data
  const patients = [
    { id: 1, name: 'John Doe', dob: '1985-06-15', condition: 'Hypertension', status: 'Active' },
    { id: 2, name: 'Jane Smith', dob: '1992-03-22', condition: 'Diabetes', status: 'Monitoring' },
    { id: 3, name: 'Robert Johnson', dob: '1978-11-08', condition: 'Asthma', status: 'Stable' },
    { id: 4, name: 'Emily Davis', dob: '1995-01-30', condition: 'Migraine', status: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-2">Manage patient records and information</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus size={18} />
            <span>New Patient</span>
          </button>
        </div>

        <div className="glass-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date of Birth</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Condition</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-border last:border-0 hover:bg-accent/10">
                    <td className="py-3 px-4 text-foreground">{patient.name}</td>
                    <td className="py-3 px-4 text-foreground">{patient.dob}</td>
                    <td className="py-3 px-4 text-foreground">{patient.condition}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        patient.status === 'Active' 
                          ? 'bg-destructive/20 text-destructive' 
                          : patient.status === 'Monitoring' 
                            ? 'bg-warning/20 text-warning' 
                            : 'bg-success/20 text-success'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 text-foreground hover:text-primary rounded-md">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;