import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Application } from '../types';
import { FileText, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const StudentApplications = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const appRef = collection(db, 'applications');
        const q = query(appRef, where('studentId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        
        const appsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Application[];
        
        // Sort manually since compound query with inequality or orderby on different field needs index
        appsData.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [currentUser]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selected': return <CheckCircle2 className="text-green-500 h-5 w-5" />;
      case 'Rejected': return <XCircle className="text-red-500 h-5 w-5" />;
      default: return <Clock className="text-amber-500 h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selected': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50';
      default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Applications</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track the status of your job applications</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p>You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 font-medium tracking-wider text-sm uppercase">
                  <th className="p-4">Job Title</th>
                  <th className="p-4">Applied On</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {app.jobTitle || 'Unknown Job'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                        <span className="mr-1.5">{getStatusIcon(app.status)}</span>
                        {app.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
