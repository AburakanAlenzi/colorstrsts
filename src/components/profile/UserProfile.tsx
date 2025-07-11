'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useForm } from 'react-hook-form';
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile,
  UserProfile as UserProfileType,
  formatTimestamp
} from '@/lib/firebase-user';
import TestHistory from './TestHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Settings,
  TestTube,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfileProps {
  translations: any;
  isRTL: boolean;
  lang: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  city: string;
  occupation: string;
  bio: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  notifications: boolean;
  emailUpdates: boolean;
}

export default function UserProfile({ translations, isRTL, lang }: UserProfileProps) {
  const { user } = useAuth();
  
  // State management
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form management
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let userProfile = await getUserProfile(user.uid);
      
      // Create profile if it doesn't exist
      if (!userProfile) {
        await createUserProfile(user.uid, user.email || '');
        userProfile = await getUserProfile(user.uid);
      }
      
      if (userProfile) {
        setProfile(userProfile);
        
        // Populate form with profile data
        reset({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          displayName: userProfile.displayName || '',
          phoneNumber: userProfile.phoneNumber || '',
          dateOfBirth: userProfile.dateOfBirth || '',
          country: userProfile.country || '',
          city: userProfile.city || '',
          occupation: userProfile.occupation || '',
          bio: userProfile.bio || '',
          language: userProfile.preferences?.language || 'ar',
          theme: userProfile.preferences?.theme || 'light',
          notifications: userProfile.preferences?.notifications ?? true,
          emailUpdates: userProfile.preferences?.emailUpdates ?? true
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error(translations.messages.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (data: ProfileFormData) => {
    if (!user || !profile) return;
    
    try {
      setSaving(true);
      
      const updates: Partial<UserProfileType> = {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        country: data.country,
        city: data.city,
        occupation: data.occupation,
        bio: data.bio,
        preferences: {
          language: data.language,
          theme: data.theme,
          notifications: data.notifications,
          emailUpdates: data.emailUpdates
        }
      };
      
      await updateUserProfile(user.uid, updates);
      
      // Update local state
      setProfile({ ...profile, ...updates });
      setEditing(false);
      
      toast.success(translations.messages.updateSuccess);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(translations.messages.updateError);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        country: profile.country || '',
        city: profile.city || '',
        occupation: profile.occupation || '',
        bio: profile.bio || '',
        language: profile.preferences?.language || 'ar',
        theme: profile.preferences?.theme || 'light',
        notifications: profile.preferences?.notifications ?? true,
        emailUpdates: profile.preferences?.emailUpdates ?? true
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {translations.messages.loadError}
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {translations.title}
          </h1>
          <p className="text-gray-600 mt-1">
            {translations.subtitle}
          </p>
        </div>
        
        {activeTab === 'overview' && (
          <Button
            onClick={() => setEditing(!editing)}
            variant={editing ? "outline" : "default"}
          >
            {editing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                {translations.form.cancel}
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                {translations.navigation.editProfile}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 mr-2 inline" />
            {translations.navigation.overview}
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TestTube className="h-4 w-4 mr-2 inline" />
            {translations.navigation.testHistory}
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            {translations.navigation.settings}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{translations.personalInfo}</CardTitle>
              <CardDescription>
                {editing ? 'Edit your personal information' : 'Your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editing ? (
                <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">{translations.form.firstName}</label>
                      <Input
                        id="firstName"
                        {...register('firstName', {
                          required: translations.form.validation.firstNameRequired
                        })}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">{translations.form.lastName}</label>
                      <Input
                        id="lastName"
                        {...register('lastName', {
                          required: translations.form.validation.lastNameRequired
                        })}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">{translations.form.displayName}</label>
                    <Input
                      id="displayName"
                      {...register('displayName')}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {translations.form.updating}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {translations.form.save}
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      {translations.form.cancel}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{translations.form.displayName}</p>
                        <p className="font-medium">{profile.displayName || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">{translations.form.email}</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>{translations.accountSettings}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">{translations.account.createdAt}</p>
                <p className="font-medium">
                  {formatTimestamp(profile.createdAt, isRTL ? 'ar-SA' : 'en-US')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">{translations.account.accountStatus}</p>
                <Badge variant={profile.isActive ? "default" : "secondary"}>
                  {profile.isActive ? translations.account.active : translations.account.inactive}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test History Tab */}
      {activeTab === 'history' && (
        <TestHistory 
          translations={translations} 
          isRTL={isRTL} 
          lang={lang}
        />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>{translations.preferences}</CardTitle>
            <CardDescription>Manage your preferences and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{translations.form.language}</label>
                <select
                  value={watch('language')}
                  onChange={(e) => setValue('language', e.target.value as 'ar' | 'en')}
                  className="w-full mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
