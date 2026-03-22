import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Job } from '../types';
import toast from 'react-hot-toast';
import { Plus, Trash2, Building2, Calendar, FileText, Loader2 } from 'lucide-react';

export const ManageJobs = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    eligibility: ''
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      const newJob = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        eligibility: formData.eligibility,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'jobs'), newJob);
      toast.success("Job posted successfully!");
      setFormData({ title: '', company: '', description: '', eligibility: '' });
      setShowForm(false);
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to post job");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await deleteDoc(doc(db, 'jobs', id));
      toast.success("Job deleted successfully");
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Jobs</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Post and manage placement opportunities</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : <><Plus size={20} className="mr-2" /> Post New Job</>}
        </button>
      </div>

      {showForm && (
        <div className="card p-6 border-l-4 border-l-primary-500">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Post a New Job</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. Google"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Eligibility Criteria</label>
                <input
                  type="text"
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. B.Tech CS, CGPA > 8.0"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Job Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[120px] resize-y"
                  placeholder="Job roles, responsibilities, and requirements..."
                  required
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Publish Job'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center text-slate-500">
          <Building2 size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No jobs posted yet</h3>
          <p>Click "Post New Job" to add the first opportunity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="card p-5 flex flex-col hover:border-primary-500 dark:hover:border-primary-400">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold text-xl uppercase">
                  {job.company.charAt(0)}
                </div>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Job"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">{job.title}</h3>
              <div className="flex items-center text-slate-600 dark:text-slate-400 mb-4 mt-1">
                <Building2 size={16} className="mr-1.5" />
                <span className="text-sm font-medium">{job.company}</span>
              </div>
              
              <div className="space-y-2 mt-auto text-sm">
                <div className="flex items-start text-slate-600 dark:text-slate-400">
                  <FileText size={16} className="mr-2 mt-0.5 mt-0.5 text-slate-400" />
                  <span className="line-clamp-2">{job.description}</span>
                </div>
                <div className="flex items-start text-slate-600 dark:text-slate-400">
                  <Calendar size={16} className="mr-2 mt-0.5 text-slate-400" />
                  <span className="line-clamp-1">{job.eligibility}</span>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-dark-border text-xs text-slate-500 dark:text-slate-500">
                Posted: {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
