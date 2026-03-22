import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { UserProfile } from '../types';
import toast from 'react-hot-toast';
import { Save, User, Mail, GraduationCap, Award, BookOpen, Loader2, UploadCloud, File, X } from 'lucide-react';

export const StudentProfile = () => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    cgpa: '',
    skills: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        branch: userProfile.branch || '',
        cgpa: userProfile.cgpa || '',
        skills: userProfile.skills?.join(', ') || ''
      });
      setResumeUrl(userProfile.resumeUrl || '');
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    try {
      setLoading(true);
      
      let newResumeUrl = resumeUrl;
      if (resumeFile) {
        const fileRef = ref(storage, `resumes/${currentUser.uid}/${resumeFile.name}`);
        await uploadBytes(fileRef, resumeFile);
        newResumeUrl = await getDownloadURL(fileRef);
      }

      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      const updatedData: Partial<UserProfile> = {
        name: formData.name,
        branch: formData.branch,
        cgpa: formData.cgpa,
        skills: skillsArray,
        resumeUrl: newResumeUrl
      };

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updatedData);

      setUserProfile({
        ...userProfile,
        ...updatedData
      } as UserProfile);

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your personal and academic details</p>
      </div>

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="label">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email cannot be changed.</p>
            </div>

            <div className="space-y-1.5">
              <label className="label">Branch/Department</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label">CGPA</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="e.g. 8.5"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="label">Skills</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none">
                  <Award className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="e.g. React, Node.js, Python (comma separated)"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate individual skills with commas.</p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="label">Resume (PDF)</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:border-dark-border transition-colors group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-slate-400">
                      <UploadCloud className="w-8 h-8 mb-2 group-hover:text-primary-500 transition-colors" />
                      <p className="mb-1 text-sm"><span className="font-semibold text-slate-700 dark:text-slate-300">Click to upload</span> or drag and drop</p>
                      <p className="text-xs">PDF Document (MAX. 5MB)</p>
                    </div>
                  </label>
                </div>
                {(resumeFile || resumeUrl) && (
                  <div className="flex items-center p-3 border border-slate-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card w-full sm:w-64 flex-shrink-0 h-32 shadow-sm">
                    <div className="h-12 w-12 rounded bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <File className="text-primary-500 h-6 w-6" />
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={resumeFile ? resumeFile.name : 'Current Resume.pdf'}>
                        {resumeFile ? resumeFile.name : 'Current Resume.pdf'}
                      </p>
                      {resumeUrl && !resumeFile && (
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-xs text-primary-600 hover:text-primary-700 font-medium bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
                          View Document
                        </a>
                      )}
                    </div>
                    {resumeFile && (
                      <button type="button" onClick={() => setResumeFile(null)} className="ml-auto p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary min-w-[120px]"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
