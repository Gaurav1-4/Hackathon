import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface Task {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const initialTasks: Task[] = [
  { id: '1', title: 'Q3 Financial Review', date: new Date(), completed: false, priority: 'high' },
  { id: '2', title: 'Board Meeting Prep', date: new Date(new Date().setDate(new Date().getDate() + 2)), completed: false, priority: 'high' },
  { id: '3', title: 'Competitor Analysis Update', date: new Date(new Date().setDate(new Date().getDate() + 5)), completed: true, priority: 'medium' },
  { id: '4', title: 'Tax Compliance Filing', date: new Date(new Date().setDate(new Date().getDate() + 7)), completed: false, priority: 'high' },
  { id: '5', title: 'Team Performance Review', date: new Date(new Date().setDate(new Date().getDate() + 10)), completed: false, priority: 'low' },
];

export function TaskCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const selectedTasks = tasks.filter(task => 
    selectedDate ? isSameDay(task.date, selectedDate) : false
  );

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Custom styles for the dark theme day picker
  const css = `
    .rdp {
      --rdp-cell-size: 40px;
      --rdp-accent-color: #10b981;
      --rdp-background-color: #10b98120;
      --rdp-accent-color-dark: #10b981;
      --rdp-background-color-dark: #10b98120;
      --rdp-outline: 2px solid var(--rdp-accent-color);
      --rdp-outline-selected: 2px solid var(--rdp-accent-color);
      margin: 0;
    }
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
      color: white;
      opacity: 1;
      background-color: var(--rdp-accent-color);
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: #2a2a2a;
    }
    .rdp-day_today {
      font-weight: bold;
      color: #10b981;
    }
  `;

  return (
    <div className="bg-[#171717] rounded-2xl p-6 border border-white/5 flex flex-col lg:flex-row gap-8">
      <style>{css}</style>
      
      {/* Calendar Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Task Calendar</span>
          <CalendarIcon className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex justify-center bg-[#212121] rounded-xl p-4 border border-white/5">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="text-gray-300"
            modifiers={{
              hasTask: tasks.map(t => t.date)
            }}
            modifiersStyles={{
              hasTask: { textDecoration: 'underline', textDecorationColor: '#10b981', textUnderlineOffset: '4px' }
            }}
          />
        </div>
      </div>

      {/* Tasks Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            {selectedTasks.length} Tasks
          </span>
        </div>

        <div className="flex-1 bg-[#212121] rounded-xl border border-white/5 p-4 overflow-y-auto max-h-[350px]">
          {selectedTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
              <CalendarIcon className="w-8 h-8 opacity-20" />
              <p className="text-sm">No tasks scheduled for this date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                  onClick={() => toggleTask(task.id)}
                >
                  <button className="mt-0.5 flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
