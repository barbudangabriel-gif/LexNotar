import React, { useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll(),
  });

  const events = useMemo(() => {
    return tasks
      .filter((task: any) => task.dueDate)
      .map((task: any) => {
        const dueDate = new Date(task.dueDate);
        
        // Determine color based on priority
        let backgroundColor = '#3B82F6'; // blue for LOW
        if (task.priority === 'MEDIUM') backgroundColor = '#F59E0B'; // amber
        else if (task.priority === 'HIGH') backgroundColor = '#EF4444'; // red
        else if (task.priority === 'URGENT') backgroundColor = '#DC2626'; // dark red
        
        // Add status indicator
        let title = task.title;
        if (task.status === 'DONE') title = '✓ ' + title;
        else if (task.status === 'IN_PROGRESS') title = '⏳ ' + title;

        return {
          id: task.id,
          title,
          start: dueDate,
          end: dueDate,
          resource: task,
          style: {
            backgroundColor,
            opacity: task.status === 'DONE' ? 0.6 : 1,
          },
        };
      });
  }, [tasks]);

  const handleSelectEvent = (event: any) => {
    navigate(`/tasks/${event.resource.id}`);
  };

  const handleSelectSlot = ({ start }: any) => {
    // Navigate to create task page with pre-filled date
    navigate('/tasks/new', { state: { dueDate: start } });
  };

  const eventStyleGetter = (event: any) => {
    return {
      style: event.style,
    };
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading calendar...</div>;
  }

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Task Calendar</h1>
        <p className="text-xs sm:text-sm text-gray-600">
          View and manage task deadlines. Click on a date to create a new task.
        </p>
      </div>

      {/* Legend */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex flex-wrap gap-2 sm:gap-4 items-center text-xs sm:text-sm">
          <span className="font-medium text-gray-700">Priority:</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
            <span className="text-gray-600">Urgent</span>
          </div>
          <span className="text-gray-500 ml-2 sm:ml-4 text-xs">
            ✓ = Done | ⏳ = In Progress
          </span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white shadow rounded-lg p-2 sm:p-6 calendar-mobile-optimized" style={{ height: '500px', minHeight: '400px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.MONTH}
          popup
          tooltipAccessor={(event: any) => {
            const task = event.resource;
            return `${task.title}\nPriority: ${task.priority}\nStatus: ${task.status}${
              task.case ? `\nCase: ${task.case.title}` : ''
            }`;
          }}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-xs sm:text-sm text-gray-500">Total Tasks</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{tasks.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-xs sm:text-sm text-gray-500">With Deadlines</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{events.length}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-xs sm:text-sm text-gray-500">Completed</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">
            {tasks.filter((t: any) => t.status === 'DONE').length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <p className="text-xs sm:text-sm text-gray-500">In Progress</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">
            {tasks.filter((t: any) => t.status === 'IN_PROGRESS').length}
          </p>
        </div>
      </div>
    </div>
  );
};
