// app/schedule/page.js
import ScheduleView from '@/components/schedule/ScheduleView';
import Link from 'next/link';

export default function SchedulePage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Class Schedule</h1>
        <Link 
          href="/classes"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Browse Classes
        </Link>
      </div>

      <ScheduleView />
    </div>
  );
}