import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import apiClient from '../utils/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Calendar, MapPin, Users, Clock, Tag, FileText } from 'lucide-react';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      registrationRequired: true,
      isPublic: true,
      category: 'academic'
    }
  });

  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'competition', label: 'Competition' },
    { value: 'social', label: 'Social' }
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Process tags
      const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      const eventData = {
        ...data,
        tags,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null
      };

      const response = await apiClient.post('/api/events', eventData);
      
      if (response.data.success) {
        toast.success('Event created successfully and submitted for approval!');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      const message = error.response?.data?.message || 'Failed to create event';
      toast.error(message);
      
      // Show validation errors if any
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`${err.param}: ${err.msg}`);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/events')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new event for students and faculty
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter event title"
                    {...register('title', {
                      required: 'Event title is required',
                      minLength: { value: 3, message: 'Title must be at least 3 characters' },
                      maxLength: { value: 200, message: 'Title must be less than 200 characters' }
                    })}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder="Describe your event in detail"
                    {...register('description', {
                      required: 'Event description is required',
                      minLength: { value: 10, message: 'Description must be at least 10 characters' },
                      maxLength: { value: 2000, message: 'Description must be less than 2000 characters' }
                    })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      className="form-select"
                      {...register('category', { required: 'Category is required' })}
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter tags separated by commas"
                      {...register('tags')}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate multiple tags with commas (e.g., networking, workshop, career)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Date & Time
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('eventDate', { required: 'Event date is required' })}
                  />
                  {errors.eventDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    {...register('startTime', { required: 'Start time is required' })}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    className="form-input"
                    {...register('endTime', { required: 'End time is required' })}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Capacity */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location & Capacity
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter venue location"
                    {...register('venue', {
                      required: 'Venue is required',
                      minLength: { value: 3, message: 'Venue must be at least 3 characters' }
                    })}
                  />
                  {errors.venue && (
                    <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Leave empty for unlimited"
                    min="1"
                    max="10000"
                    {...register('maxParticipants', {
                      min: { value: 1, message: 'Must be at least 1' },
                      max: { value: 10000, message: 'Must be less than 10000' }
                    })}
                  />
                  {errors.maxParticipants && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements
                  </label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Any special requirements or prerequisites for participants"
                    {...register('requirements')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Contact email (defaults to your email)"
                      {...register('contactEmail', {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Contact phone number"
                      {...register('contactPhone')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Image URL
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                    {...register('imageUrl', {
                      pattern: {
                        value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                        message: 'Please enter a valid image URL'
                      }
                    })}
                  />
                  {errors.imageUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Settings */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Event Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Registration Required
                    </label>
                    <p className="text-xs text-gray-500">
                      Students need to register to attend
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('registrationRequired')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Public Event
                    </label>
                    <p className="text-xs text-gray-500">
                      Visible to all students and faculty
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('isPublic')}
                  />
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="card">
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="btn-secondary w-full"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Your event will be submitted for approval and will be visible to students once approved by the administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
