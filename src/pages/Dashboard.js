import React, { useState, useEffect } from 'react';
import apiClient from '../utils/axios';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch events data instead of dashboard stats
      const response = await apiClient.get('/api/events');
      if (response.data.success) {
        const events = response.data.data.events;
        
        // Create simple stats from events data
        const stats = {
          totalEvents: events.length,
          approvedEvents: events.filter(e => e.status === 'approved').length,
          pendingEvents: events.filter(e => e.status === 'pending').length,
          rejectedEvents: events.filter(e => e.status === 'rejected').length,
          cancelledEvents: events.filter(e => e.status === 'cancelled').length,
          upcomingEvents: events.filter(e => e.startDate && new Date(e.startDate) > new Date()).length,
          recentEvents: events.slice(0, 5), // Get first 5 events
          eventsByCategory: getEventsByCategory(events),
          eventsByStatus: getEventsByStatus(events)
        };
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default stats if API fails
      setStats({
        totalEvents: 0,
        approvedEvents: 0,
        pendingEvents: 0,
        upcomingEvents: 0,
        recentEvents: [],
        eventsByCategory: [],
        eventsByStatus: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventsByCategory = (events) => {
    const categories = {};
    events.forEach(event => {
      const category = event.eventType || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getEventsByStatus = (events) => {
    const statuses = {};
    events.forEach(event => {
      const status = event.status || 'Unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load dashboard statistics.</p>
      </div>
    );
  }

  const statusCards = [
    {
      name: 'Total Events',
      value: stats.totalEvents || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Pending Approval',
      value: stats.pendingEvents || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Approved Events',
      value: stats.approvedEvents || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Upcoming Events',
      value: stats.upcomingEvents || 0,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  // Prepare chart data
  const categoryData = (stats.eventsByCategory || []).map(item => ({
    category: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    count: item.value
  }));

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your events and activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${card.bgColor} rounded-md flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${card.textColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Events by Category</h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No events created yet
            </div>
          )}
        </div>

        {/* Status Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Event Status Overview</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-yellow-800">Pending Approval</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingEvents}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-green-800">Approved</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.approvedEvents}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-red-800">Rejected</span>
              </div>
              <span className="text-lg font-bold text-red-600">{stats.rejectedEvents}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-800">Cancelled</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{stats.cancelledEvents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Events</h3>
          <Link
            to="/events"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View all events
          </Link>
        </div>
        
        {stats.recentEvents.length > 0 ? (
          <div className="overflow-hidden">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Event Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {stats.recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="font-medium text-gray-900">{event.title}</td>
                    <td className="text-gray-500">
                      {event.startDate ? format(new Date(event.startDate), 'MMM dd, yyyy') : 'Date TBD'}
                    </td>
                    <td>
                      <span className={`status-badge status-${event.status}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-gray-500">{event.participantCount || 0}</td>
                    <td>
                      <Link
                        to={`/events/${event.id}`}
                        className="text-primary-600 hover:text-primary-500"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
            <div className="mt-6">
              <Link
                to="/events/create"
                className="btn-primary"
              >
                Create Event
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/events/create"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Create New Event</h4>
              <p className="text-sm text-gray-500">Add a new event or activity</p>
            </div>
          </div>
        </Link>

        <Link
          to="/events?status=pending"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Pending Events</h4>
              <p className="text-sm text-gray-500">{stats.pendingEvents} awaiting approval</p>
            </div>
          </div>
        </Link>

        <Link
          to="/events?status=approved"
          className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Active Events</h4>
              <p className="text-sm text-gray-500">{stats.upcomingEvents} upcoming events</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
