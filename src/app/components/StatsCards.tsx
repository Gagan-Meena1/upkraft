import { CARDS } from "@/app/salesHead/studentPackage/constants";
import { CardFilter, Stats } from "@/app/salesHead/studentPackage/types";

interface Props {
    stats: Stats;
    statsLoading: boolean;
    activeCard: CardFilter;
    onCardClick: (key: CardFilter) => void;
}

export default function StatsCards({ stats, statsLoading, activeCard, onCardClick }: Props) {
    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 px-5 pt-5 pb-3">
            {CARDS.map(card => (
                <button key={card.key} onClick={() => onCardClick(card.key)}
                    className={`bg-white rounded-xl p-4 text-left border-t-4 shadow-sm hover:shadow-md transition-all cursor-pointer
            ${activeCard === card.key ? `${card.border} ring-2 ring-offset-1 ring-purple-300` : "border-gray-200 hover:border-gray-300"}`}>
                    <div className={`text-2xl font-extrabold ${card.color}`}>
                        {statsLoading
                            ? <div className="h-7 w-8 bg-gray-200 rounded animate-pulse" />
                            : (stats as any)[card.key] ?? 0}
                    </div>
                    <div className="text-[12px] font-semibold text-gray-700 mt-1">{card.label}</div>
                    <div className="text-[10px] text-gray-400">{card.sub}</div>
                </button>
            ))}
        </div>
    );
}