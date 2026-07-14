import { CardFilter } from "./types";

export const CARDS: {
    key: CardFilter; label: string; sub: string;
    color: string; border: string; emoji: string;
}[] = [
        { key: "overdue", label: "Overdue", sub: "End date passed", color: "text-rose-700", border: "border-rose-600", emoji: "🚨" },
        { key: "urgent", label: "Urgent", sub: "≤7 days left", color: "text-red-600", border: "border-red-500", emoji: "🔴" },
        { key: "soon", label: "Renew Soon", sub: "8–20 days left", color: "text-amber-600", border: "border-amber-400", emoji: "🟡" },
        { key: "ontrack", label: "On Track", sub: ">20 days", color: "text-emerald-600", border: "border-emerald-500", emoji: "🟢" },
        { key: "completed", label: "Completed", sub: "100% done", color: "text-blue-600", border: "border-blue-500", emoji: "✅" },
        { key: "renewed", label: "Renewed", sub: "Package renewed", color: "text-indigo-600", border: "border-indigo-400", emoji: "♻" },
        { key: "dropped", label: "Dropped", sub: "Student dropped", color: "text-gray-600", border: "border-gray-400", emoji: "⛔" },
    ];