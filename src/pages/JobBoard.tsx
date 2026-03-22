import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Job, Application } from '../types';
import toast from 'react-hot-toast';
import { Search, Building2, Calendar, FileText, CheckCircle2, Loader2, Send } from 'lucide-react';

export const JobBoard = () => {
  const { currentUser, userProfile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        // Fetch Jobs
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, orderBy('createdAt', 'desc'));
        const jobsSnap = await getDocs(q);
        
        const jobsData = jobsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];
        
        setJobs(jobsData);

        // Fetch Student's Applications
        const appRef = collection(db, 'applications');
        const appQuery = query(appRef, where('studentId', '==', currentUser.uid));
        const appSnap = await getDocs(appQuery);
        
        const appliedJobIds = appSnap.docs.map(doc => {
          const data = doc.data() as Application;
          return data.jobId;
        });
        
        setApplications(appliedJobIds);
      } catch (error) {
        console.error("Error fetching jobs and applications:", error);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleApply = async (job: Job) => {
    if (!currentUser || !userProfile) return;
    
    // Validation: Profile should have basics
    if (!userProfile.branch || !userProfile.cgpa) {
      toast.error("Please explicitly set your branch and CGPA in Profile before applying");
      return;
    }

    try {
      setApplyingTo(job.id);
      const application: Omit<Application, 'id'> = {
        jobId: job.id,
        studentId: currentUser.uid,
        status: 'Applied',
        appliedAt: new Date().toISOString(),
        studentName: userProfile.name,
        jobTitle: job.title
      };

      await addDoc(collection(db, 'applications'), application);
      toast.success(`Successfully applied to ${job.company}`);
      setApplications(prev => [...prev, job.id]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit application");
    } finally {
      setApplyingTo(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Available Jobs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Discover and apply to new opportunities</p>
      </div>

      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by role or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <p>No jobs found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map(job => {
            const hasApplied = applications.includes(job.id);
            const isApplying = applyingTo === job.id;

            return (
              <div key={job.id} className="card p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold text-xl uppercase">
                      {job.company.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{job.title}</h3>
                      <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                        <Building2 size={14} className="mr-1" />
                        {job.company}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start">
                    <FileText size={16} className="mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
                    <span className="line-clamp-3">{job.description}</span>
                  </div>
                  <div className="flex items-start">
                    <Calendar size={16} className="mr-2 mt-0.5 flex-shrink-0 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Eligibility: {job.eligibility}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  
                  <button
                    onClick={() => handleApply(job)}
                    disabled={hasApplied || isApplying}
                    className={`btn text-sm px-4 py-2 flex items-center ${
                      hasApplied 
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed border border-transparent'
                      : 'btn-primary'
                    }`}
                  >
                    {isApplying ? (
                      <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Applying...</>
                    ) : hasApplied ? (
                      <><CheckCircle2 className="mr-2 h-4 w-4" /> Applied</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Apply Now</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
