import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Application } from '../types';
import toast from 'react-hot-toast';
import { FileText, Loader2, Check, X, Clock } from 'lucide-react';

export const AdminApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const appRef = collection(db, 'applications');
      const q = query(appRef, orderBy('appliedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
      
      setApplications(appsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Application['status']) => {
    try {
      setUpdatingId(id);
      const appRef = doc(db, 'applications', id);
      await updateDoc(appRef, { status: newStatus });
      
      toast.success(`Status updated to ${newStatus}`);
      
      // Optimitic update
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Review Applications</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and update student application statuses</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p>No applications received yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 font-medium tracking-wider text-sm uppercase">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Job Role</th>
                  <th className="p-4">Date Applied</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {app.studentName || 'Student'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 dark:text-slate-300">
                        {app.jobTitle || 'Unknown Job'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                        ${app.status === 'Selected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
                      `}>
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        {updatingId === app.id ? (
                          <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Selected')}
                              disabled={app.status === 'Selected'}
                              className="p-1.5 rounded text-green-600 hover:bg-green-50 dark:text-green-500 dark:hover:bg-green-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Mark Selected"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                              disabled={app.status === 'Rejected'}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Mark Rejected"
                            >
                              <X size={18} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Applied')}
                              disabled={app.status === 'Applied'}
                              className="p-1.5 rounded text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Mark Pending (Applied)"
                            >
                              <Clock size={18} />
                            </button>
                          </>
                        )}
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
