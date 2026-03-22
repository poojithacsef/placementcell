import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Application } from '../types';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, ArrowRight, UserCircle, Loader2 } from 'lucide-react';

export const StudentDashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalActiveJobs: 0, appliedCount: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        // Get total jobs
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        
        // Get student's applications
        const appRef = collection(db, 'applications');
        const appQ = query(appRef, where('studentId', '==', currentUser.uid));
        const appSnap = await getDocs(appQ);
        
        const allUserApps = appSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Application[];
        allUserApps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        
        setStats({
          totalActiveJobs: jobsSnap.size,
          appliedCount: allUserApps.length
        });
        
        setRecentApps(allUserApps.slice(0, 3));
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      <div className="card p-8 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.name?.split(' ')[0]}! 👋</h1>
        <p className="opacity-90 max-w-2xl text-primary-50">
          Ready to take the next step in your career? Check out the latest opportunities or update your profile to stand out to recruiters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Available Jobs</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : stats.totalActiveJobs}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
            <Briefcase size={24} />
          </div>
        </div>
        
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">My Applications</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{loading ? '-' : stats.appliedCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Profile Status</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {userProfile.branch && userProfile.cgpa ? 'Complete' : 'Incomplete'}
            </h3>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            userProfile.branch && userProfile.cgpa ? 'bg-green-100 text-green-600 dark:bg-green-900/30 text-green-500' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 text-amber-500'
          }`}>
            <UserCircle size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Applications</h2>
            <Link to="/applications" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-6"><Loader2 className="animate-spin text-primary-500" /></div>
          ) : recentApps.length === 0 ? (
            <div className="text-center p-6 text-slate-500">No recent applications</div>
          ) : (
            <div className="space-y-4">
              {recentApps.map(app => (
                <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{app.jobTitle}</h4>
                    <span className="text-xs text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                    app.status === 'Selected' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' : 
                    app.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400' : 
                    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 bg-slate-900 dark:bg-slate-800 text-white flex flex-col justify-center items-center text-center">
            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Briefcase size={32} className="text-primary-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Find Your Next Role</h3>
            <p className="text-slate-400 mb-6 max-w-xs">Explore new openings from top companies right now.</p>
            <Link to="/jobs" className="btn bg-primary-500 hover:bg-primary-600 text-white w-full sm:w-auto">
              Browse Job Board
            </Link>
        </div>
      </div>
    </div>
  );
};
