import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg">
      <Sidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <main className="p-6 md:p-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
