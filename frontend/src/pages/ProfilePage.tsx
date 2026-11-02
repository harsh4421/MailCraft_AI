import React, { useState } from 'react';
import { User, Lock, Briefcase, Mail, CheckCircle2, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { authApi } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName || 'Harsh Kumar');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || 'Computer Science Student');
  const [defaultSenderName, setDefaultSenderName] = useState(user?.defaultSenderName || user?.fullName || 'Harsh Kumar');
  const [isUpdating, setIsUpdating] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updated = await authApi.updateProfile({
        fullName,
        jobTitle,
        defaultSenderName,
      });
      updateUser(updated);
      toast.success('Profile details successfully updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsChangingPass(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password successfully changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Password update failed');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          User Profile Management
        </h2>
        <p className="text-xs text-slate-500">
          Manage your personal details and sender information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Profile Card */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Personal Information
            </span>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                value={user?.email || 'harsh@example.com'}
                disabled
                icon={<Mail className="w-4 h-4" />}
                hint="Email address cannot be changed."
              />

              <Input
                label="Job Title / Role"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                icon={<Briefcase className="w-4 h-4" />}
                placeholder="e.g. Student, Software Engineer"
              />

              <Input
                label="Default Sign-Off Sender Name"
                value={defaultSenderName}
                onChange={(e) => setDefaultSenderName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                hint="Used as default sender in the email generator."
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isUpdating}
              >
                Save Profile Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Change Account Password
            </span>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Key className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Key className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="secondary"
                className="w-full mt-2"
                isLoading={isChangingPass}
              >
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
