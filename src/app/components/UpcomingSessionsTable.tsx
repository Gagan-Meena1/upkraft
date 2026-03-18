import React, { type ReactNode } from "react";
import Link from "next/link";

export interface UpcomingSessionRow {
  id: string;
  date: string;
  time: string;
  course: string;
  secondary: ReactNode;
  onJoin: () => void;
}

interface UpcomingSessionsTableProps {
  title?: string;
  timezone?: string;
  viewAllHref: string;
  /**
   * Table headers in the exact order of columns rendered:
   * [Date, Time, Class/Course, Secondary (e.g. Student/Tutor), Action]
   */
  headers: string[];
  rows: UpcomingSessionRow[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  joinLabel?: string;
}

const UpcomingSessionsTable: React.FC<UpcomingSessionsTableProps> = ({
  title = "Upcoming Sessions",
  timezone,
  viewAllHref,
  headers,
  rows,
  isLoading = false,
  error = null,
  emptyMessage = "No upcoming lessons",
  joinLabel = "Join",
}) => {
  return (
    <div className="card-box table-sec">
      <div className="head-com-sec d-flex align-items-center justify-content-between mb-4">
        <div className="flex gap-2 items-center flex-column">
          <h2 className="!text-[20px] !mb-0">{title}</h2>
          {timezone && (
            <span className="!text-sm text-gray-500">(Timezone: {timezone})</span>
          )}
        </div>
        <Link href={viewAllHref} className="btn-text">
          View All
        </Link>
      </div>

      <div className="table-responsive">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-danger">{error}</div>
        ) : (
          <table className="table align-middle m-0">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-3">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.time}</td>
                    <td>{row.course}</td>
                    <td>{row.secondary}</td>
                    <td>
                      <button
                        onClick={row.onJoin}
                        className="bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        {joinLabel}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UpcomingSessionsTable;
