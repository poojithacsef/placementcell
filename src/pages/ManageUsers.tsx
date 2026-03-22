import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types';
import toast from 'react-hot-toast';
import { Users, Trash2, Loader2, User, Mail, BookOpen, GraduationCap } from 'lucide-react';

export const ManageUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const usersData = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as UserProfile[];
      
      setUsers(usersData.filter(u => u.uid !== currentUser?.uid));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const handleDelete = async (uid: string) => {
    if (!window.confirm("Are you sure you want to delete this user profile? This won't delete their Auth account directly from here without backend admin SDK, but it will remove their access.")) return;
    
    try {
      await deleteDoc(doc(db, 'users', uid));
      toast.success("User removed from database");
      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  const students = users.filter(u => u.role === 'student');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage all registered users</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p>No other users found in the system.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Students Section */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-slate-900/50 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-slate-800 dark:text-white flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-primary-500" />
                Registered Students ({students.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-border text-slate-500 dark:text-slate-400 font-medium text-sm">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Branch</th>
                    <th className="p-4">CGPA</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                  {students.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 text-slate-900 dark:text-white font-medium flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mr-3 text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                        <div className="flex items-center"><Mail className="mr-1.5 h-3.5 w-3.5" />{user.email}</div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                        <div className="flex items-center">
                          {user.branch ? <><BookOpen className="mr-1.5 h-3.5 w-3.5" />{user.branch}</> : '-'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                        {user.cgpa ? <span className="font-medium text-slate-700 dark:text-slate-300">{user.cgpa}</span> : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(user.uid)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-block"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">No students found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admins Section */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-slate-900/50 flex justify-between items-center">
              <h2 className="font-semibold text-lg text-slate-800 dark:text-white flex items-center">
                <User className="mr-2 h-5 w-5 text-primary-500" />
                Other Administrators ({admins.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-border text-slate-500 dark:text-slate-400 font-medium text-sm">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                  {admins.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 text-slate-900 dark:text-white font-medium flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400 flex items-center justify-center mr-3 text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                        {user.email}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(user.uid)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors inline-block"
                          title="Delete Admin"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr><td colSpan={3} className="p-4 text-center text-slate-500">No other admins found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
