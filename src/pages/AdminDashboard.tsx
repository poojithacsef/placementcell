import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Users, ArrowRight, Loader2 } from 'lucide-react';

export const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalJobs: 0, 
    totalApplications: 0, 
    totalStudents: 0,
    pendingApplications: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Get total jobs
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        
        // Get all applications
        const appRef = collection(db, 'applications');
        const appSnap = await getDocs(appRef);
        
        let pending = 0;
        appSnap.forEach(doc => {
          if (doc.data().status === 'Applied') pending++;
        });

        // Get students
        const usersRef = collection(db, 'users');
        const studentsQuery = query(usersRef, where('role', '==', 'student'));
        const studentsSnap = await getDocs(studentsQuery);
        
        setStats({
          totalJobs: jobsSnap.size,
          totalApplications: appSnap.size,
          totalStudents: studentsSnap.size,
          pendingApplications: pending
        });
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      <div className="card p-8 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black text-white rounded-2xl">
        <h1 className="text-3xl font-bold mb-2">Admin Control Center</h1>
        <p className="opacity-90 max-w-2xl text-slate-300">
          Welcome {userProfile.name}. Manage placement drives, review applications, and coordinate with students efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
              <Users size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Registered Students</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{loading ? <Loader2 className="animate-spin" size={24}/> : stats.totalStudents}</h3>
        </div>
        
        <div className="card p-6 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500 flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Active Jobs</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{loading ? <Loader2 className="animate-spin" size={24}/> : stats.totalJobs}</h3>
        </div>
        
        <div className="card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Total Applications</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{loading ? <Loader2 className="animate-spin" size={24}/> : stats.totalApplications}</h3>
        </div>

        <div className="card p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">Pending Review</p>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{loading ? <Loader2 className="animate-spin" size={24}/> : stats.pendingApplications}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link to="/admin/jobs" className="card p-6 flex items-center justify-between hover:border-primary-500 dark:hover:border-primary-400 group cursor-pointer transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors text-slate-600 dark:text-slate-300">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Post New Job</h3>
              <p className="text-sm text-slate-500">Add placement drives</p>
            </div>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-primary-500 transition-colors" />
        </Link>
        
        <Link to="/admin/applications" className="card p-6 flex items-center justify-between hover:border-primary-500 dark:hover:border-primary-400 group cursor-pointer transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors text-slate-600 dark:text-slate-300">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Review Apps</h3>
              <p className="text-sm text-slate-500">Update student statuses</p>
            </div>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-primary-500 transition-colors" />
        </Link>
        
        <Link to="/admin/users" className="card p-6 flex items-center justify-between hover:border-primary-500 dark:hover:border-primary-400 group cursor-pointer transition-colors">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors text-slate-600 dark:text-slate-300">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Manage Users</h3>
              <p className="text-sm text-slate-500">View registered students</p>
            </div>
          </div>
          <ArrowRight className="text-slate-300 group-hover:text-primary-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
};
