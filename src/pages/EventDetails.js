import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../utils/axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Tag,
  Eye,
  Download,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

const EventDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchParticipants();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await apiClient.get(`/api/events/${eventId}`);
      if (response.data.success) {
        setEvent(response.data.data.event);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      setParticipantsLoading(true);
      const response = await apiClient.get(`/api/events/${eventId}/participants`);
      if (response.data.success) {
        setParticipants(response.data.data.participants);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to cancel this event?')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/teacher-portal/events/${eventId}`);
      if (response.data.success) {
        toast.success('Event cancelled successfully');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast.error('Failed to cancel event');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Event not found</h3>
        <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist.</p>
      </div>
    );
  }

  const eventDateTime = new Date(`${event.eventDate}T${event.startTime}`);
  const canEdit = eventDateTime > new Date() && event.status !== 'cancelled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className={`status-badge ${getStatusColor(event.status)} inline-flex items-center`}>
                {getStatusIcon(event.status)}
                <span className="ml-1">
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </span>
              <span className="text-sm text-gray-500">
                Created {format(new Date(event.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/events/${eventId}/edit`}
              className="btn-primary inline-flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Link>
            <button
              onClick={handleDeleteEvent}
              className="btn-danger inline-flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Event
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Event Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description || 'No description provided'}</p>
              </div>

              {event.eventLink && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Event Link</h4>
                  <a 
                    href={event.eventLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Event Link
                  </a>
                </div>
              )}

              {event.requirements && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.requirements}</p>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Participants ({participants.length})
              </h3>
              {participants.length > 0 && (
                <button
                  onClick={() => {
                    // Export participants as CSV
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + "Name,Email,Registration Date\n"
                      + participants.map(p => `${p.name},${p.email},${p.registeredAt}`).join("\n");
                    
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `${event.title}-participants.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="btn-secondary inline-flex items-center text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
              )}
            </div>
            
            {participantsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="loading-spinner"></div>
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">No participants yet</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Participants will appear here once they register for the event.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {participants.map((participant, index) => (
                      <tr key={index}>
                        <td className="font-medium text-gray-900">{participant.name}</td>
                        <td className="text-gray-500">{participant.email}</td>
                        <td className="text-gray-500">
                          {format(new Date(participant.registeredAt), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Event Information</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.eventDate), 'EEEE, MMMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Venue</p>
                  <p className="text-sm text-gray-500">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Capacity</p>
                  <p className="text-sm text-gray-500">
                    {participants.length} registered
                    {event.maxParticipants && ` / ${event.maxParticipants} max`}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Category</p>
                  <p className="text-sm text-gray-500">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  {event.contactEmail}
                </a>
              </div>

              {event.contactPhone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    {event.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Event Settings */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Registration Required</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  event.registrationRequired 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.registrationRequired ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Public Event</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  event.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.isPublic ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Campus</span>
                <span className="text-sm font-medium text-gray-900">
                  {event.campus?.toUpperCase() || 'DUBAI'}
                </span>
              </div>
            </div>
          </div>

          {/* Event Image */}
          {event.imageUrl && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Event Image</h3>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
