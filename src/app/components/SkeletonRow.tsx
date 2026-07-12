export default function SkeletonRow() {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: 18 }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                </td>
            ))}
        </tr>
    );
}