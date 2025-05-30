"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  BarChart3
} from "lucide-react";
import { useUserStats } from "@/hooks/use-admin-data";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalCompletions: number;
  averageCompletionRate: number;
}

interface PathStats {
  path_name: string;
  path_slug: string;
  total_enrollments: number;
  total_completions: number;
  completion_rate: number;
  avg_time_to_complete: number;
}

interface RecentActivity {
  user_email: string;
  challenge_title: string;
  path_name: string;
  completed_at: string;
  time_taken: number;
}

interface TopUser {
  user_email: string;
  total_completions: number;
  paths_enrolled: number;
  last_activity: string;
}

export function UserAnalytics() {
  const { toast } = useToast();
  const { data: userStats, isLoading: userStatsLoading, error: userStatsError } = useUserStats();

  // For now, we'll use placeholder data for path stats, recent activity, and top users
  // These can be implemented as separate hooks later
  const pathStats: PathStats[] = [];
  const recentActivity: RecentActivity[] = [];
  const topUsers: TopUser[] = [];

  const loading = userStatsLoading;

  if (userStatsError) {
    console.error('Error loading user analytics:', userStatsError);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading text="Loading analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.newUsersThisWeek || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalCompletions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.averageCompletionRate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Path Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Path Performance</CardTitle>
            <CardDescription>Enrollment and completion statistics by learning path</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Completions</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pathStats.map((path) => (
                  <TableRow key={path.path_slug}>
                    <TableCell className="font-medium">{path.path_name}</TableCell>
                    <TableCell>{path.total_enrollments}</TableCell>
                    <TableCell>{path.total_completions}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {path.completion_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
            <CardDescription>Most active users by challenge completions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Completions</TableHead>
                  <TableHead>Paths</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {user.user_email.substring(0, 20)}...
                    </TableCell>
                    <TableCell>{user.total_completions}</TableCell>
                    <TableCell>{user.paths_enrolled}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(user.last_activity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest challenge completions across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Challenge</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {activity.user_email.substring(0, 25)}...
                  </TableCell>
                  <TableCell>{activity.challenge_title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{activity.path_name}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(activity.completed_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
