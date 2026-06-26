export type StatusColor = {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
  strikethrough?: string;
};

export const CALENDAR_STATUS_COLORS: Record<string, StatusColor> = {
  present: {
    bg: "bg-green-50",
    border: "border-green-400",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Present",
  },
  absent: {
    bg: "bg-red-50",
    border: "border-red-400",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Absent",
  },
  cancelled: {
    bg: "bg-gray-100",
    border: "border-gray-400",
    text: "text-gray-500",
    dot: "bg-gray-400",
    strikethrough: "line-through",
    label: "Cancelled",
  },
  rescheduled: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Rescheduled",
  },
  edited: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "Edited",
  },
  rescheduled_present: {
    bg: "bg-teal-50",
    border: "border-teal-400",
    text: "text-teal-700",
    dot: "bg-teal-500",
    label: "Rescheduled (Present)",
  },
  pending: {
    bg: "bg-purple-50",
    border: "border-purple-400",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "Pending",
  },
};

export function getCalendarStatusColor(status: string): StatusColor {
  switch (status) {
    case "present":
      return CALENDAR_STATUS_COLORS.present;
    case "absent":
      return CALENDAR_STATUS_COLORS.absent;
    case "cancelled":
    case "canceled":
      return CALENDAR_STATUS_COLORS.cancelled;
    case "rescheduled":
      return CALENDAR_STATUS_COLORS.rescheduled;
    case "edited":
      return CALENDAR_STATUS_COLORS.edited;
    case "rescheduled_present":
      return CALENDAR_STATUS_COLORS.rescheduled_present;
    default:
      return CALENDAR_STATUS_COLORS.pending;
  }
}

export function resolveCalendarClassStatus(
  rawStatusInput: string | undefined,
  attendanceStatusInput: string | undefined,
  hasFeedback: boolean
): string {
  const rawStatus = (rawStatusInput || "").toLowerCase();
  const attendanceStatus = (attendanceStatusInput || "pending").toLowerCase();

  if (rawStatus === "canceled" || rawStatus === "cancelled") {
    return "cancelled";
  }

  if (rawStatus === "reschedule" || rawStatus === "rescheduled") {
    if (hasFeedback && attendanceStatus === "present") {
      return "rescheduled_present";
    }
    return "rescheduled";
  }

  if (rawStatus === "edited") {
    return "edited";
  }

  return attendanceStatus;
}
