'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  getUserTestHistory, 
  getUserTestStats, 
  clearUserTestHistory,
  TestHistoryEntry,
  formatTimestamp,
  getTimeAgo
} from '@/lib/firebase-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  TestTube, 
  Eye, 
  Trash2, 
  TrendingUp,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface TestHistoryProps {
  translations: any;
  isRTL: boolean;
  lang: string;
}

export default function TestHistory({ translations, isRTL, lang }: TestHistoryProps) {
  const { user } = useAuth();
  
  // State management
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        getUserTestHistory(user.uid, 10),
        getUserTestStats(user.uid)
      ]);
      
      setHistory(historyData);
      setStats(statsData);
      setHasMore(historyData.length === 10);
    } catch (error) {
      console.error('Error loading test history:', error);
      toast.error(translations.messages.loadError);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!user || loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const moreHistory = await getUserTestHistory(user.uid, history.length + 10);
      
      if (moreHistory.length <= history.length) {
        setHasMore(false);
      } else {
        setHistory(moreHistory);
      }
    } catch (error) {
      console.error('Error loading more history:', error);
      toast.error(translations.messages.loadError);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    
    try {
      setClearLoading(true);
      await clearUserTestHistory(user.uid);
      setHistory([]);
      setStats({ ...stats, totalTests: 0, totalVisits: 0 });
      setClearDialogOpen(false);
      toast.success(translations.history.historyCleared);
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error(translations.messages.saveError);
    } finally {
      setClearLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">{translations.messages.loadError}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {translations.stats.totalTests}
              </CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {translations.stats.totalVisits}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisits}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {translations.stats.lastVisit}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.lastVisitAt ? getTimeAgo(stats.lastVisitAt, lang) : '-'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {translations.stats.mostVisited}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.mostVisitedTest ? 
                  (isRTL ? stats.mostVisitedTest.testNameAr : stats.mostVisitedTest.testName) : 
                  '-'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{translations.history.title}</CardTitle>
              <CardDescription>{translations.history.subtitle}</CardDescription>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {translations.history.clearHistory}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {translations.history.empty}
              </h3>
              <p className="text-gray-500">
                {translations.history.emptyDescription}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <TestTube className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {isRTL ? entry.testNameAr : entry.testName}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {entry.testType}
                        </Badge>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                          {getTimeAgo(entry.visitedAt, lang)}
                        </div>
                        
                        <div className="flex items-center">
                          <BarChart3 className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                          {entry.visitCount} {entry.visitCount === 1 ? translations.history.visitCount : translations.history.visits}
                        </div>
                      </div>
                      
                      <p className="mt-1 text-xs text-gray-400">
                        {isRTL ? entry.possibleSubstanceAr : entry.possibleSubstance}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Link href={`/${lang}/test/${entry.testId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {translations.history.viewTest}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        {translations.history.loadMore}
                      </div>
                    ) : (
                      translations.history.loadMore
                    )}
                  </Button>
                </div>
              )}
              
              {!hasMore && history.length > 10 && (
                <div className="text-center pt-4 text-sm text-gray-500">
                  {translations.history.noMore}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear History Confirmation - Simplified */}
      {clearDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-2">{translations.history.clearHistory}</h3>
            <p className="text-gray-600 mb-4">{translations.history.confirmClear}</p>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setClearDialogOpen(false)}
                disabled={clearLoading}
              >
                {translations.form.cancel}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleClearHistory}
                disabled={clearLoading}
              >
                {clearLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {translations.history.clearHistory}
                  </div>
                ) : (
                  translations.history.clearHistory
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
