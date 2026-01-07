import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Settings, X, Filter } from 'lucide-react';

// Type definitions
interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'number' | 'date';
    render?: (value: any, row: T) => React.ReactNode;
    cellClassName?: (value: any, row: T) => string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey?: keyof T | string;
    pageSize?: number;
    headerContent?: React.ReactNode;
}

interface SortConfig {
    key: string | null;
    direction: 'asc' | 'desc';
}

interface FilterValue {
    column: string;
    value: string;
    label: string;
}

const CommonTable = <T extends Record<string, any>>({
    columns,
    data,
    rowKey = 'id',
    headerContent,
    pageSize = 5
}: DataTableProps<T>) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
        columns.reduce((acc, col) => ({ ...acc, [col.key as string]: true }), {})
    );
    const [showColumnMenu, setShowColumnMenu] = useState<boolean>(false);
    const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

    // Filter modal state
    const [selectedFilterColumn, setSelectedFilterColumn] = useState<string>('');
    const [filterInputValue, setFilterInputValue] = useState<string>('');

    // Filter data
    const filteredData = useMemo(() => {
        return data.filter((row) => {
            return activeFilters.every((filter) => {
                const value = row[filter.column];
                const filterValue = filter.value.toLowerCase();
                return String(value || '').toLowerCase().includes(filterValue);
            });
        });
    }, [data, activeFilters]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key as string];
            const bVal = b[sortConfig.key as string];

            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();

            if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (key: string) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleApplyFilter = () => {
        if (selectedFilterColumn && filterInputValue.trim()) {
            const column = columns.find(col => col.key === selectedFilterColumn);
            const newFilter: FilterValue = {
                column: selectedFilterColumn,
                value: filterInputValue.trim(),
                label: column?.label || selectedFilterColumn
            };

            // Remove existing filter for same column if exists
            const updatedFilters = activeFilters.filter(f => f.column !== selectedFilterColumn);
            setActiveFilters([...updatedFilters, newFilter]);

            // Reset modal state
            setSelectedFilterColumn('');
            setFilterInputValue('');
            setShowFilterModal(false);
            setCurrentPage(1);
        }
    };

    const handleCancelFilter = () => {
        setSelectedFilterColumn('');
        setFilterInputValue('');
        setShowFilterModal(false);
    };

    const removeFilter = (column: string) => {
        setActiveFilters(activeFilters.filter(f => f.column !== column));
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
        setCurrentPage(1);
    };

    const filterableColumns = columns.filter(col => col.filterable);
    const visibleColumnsArray = columns.filter((col) => visibleColumns[col.key as string]);
    const selectedColumn = columns.find(col => col.key === selectedFilterColumn);

    return (
        <div className="bg-white rounded-lg shadow-lg">
            {/* Header with filters and column visibility */}
            <div className="p-4 border-b border-gray-200">
                <div>{headerContent || null}</div>
                <div className="flex justify-between items-center mb-3">
                    <div></div>
                    <div className="flex gap-2">
                        {/* Filter Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterModal(!showFilterModal)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                            >
                                <Filter size={16} />
                                Filter
                                {activeFilters.length > 0 && (
                                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {activeFilters.length}
                                    </span>
                                )}
                            </button>

                            {/* Filter Modal */}
                            {showFilterModal && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={handleCancelFilter}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <h3 className="font-semibold text-sm text-gray-700">Add Filter</h3>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {/* Column Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select Column
                                                </label>
                                                <select
                                                    value={selectedFilterColumn}
                                                    onChange={(e) => {
                                                        setSelectedFilterColumn(e.target.value);
                                                        setFilterInputValue('');
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    <option value="">Choose a column...</option>
                                                    {filterableColumns.map((col) => (
                                                        <option key={col.key as string} value={col.key as string}>
                                                            {col.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Filter Input */}
                                            {selectedFilterColumn && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Filter Value
                                                    </label>
                                                    {selectedColumn?.filterType === 'date' ? (
                                                        <input
                                                            type="date"
                                                            value={filterInputValue}
                                                            onChange={(e) => setFilterInputValue(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        />
                                                    ) : selectedColumn?.filterType === 'number' ? (
                                                        <input
                                                            type="number"
                                                            value={filterInputValue}
                                                            onChange={(e) => setFilterInputValue(e.target.value)}
                                                            placeholder="Enter number..."
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={filterInputValue}
                                                            onChange={(e) => setFilterInputValue(e.target.value)}
                                                            placeholder="Enter text..."
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Modal Actions */}
                                        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
                                            <button
                                                onClick={handleCancelFilter}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleApplyFilter}
                                                disabled={!selectedFilterColumn || !filterInputValue.trim()}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                                            >
                                                Apply Filter
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Column Visibility Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowColumnMenu(!showColumnMenu)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                            >
                                <Settings size={16} />
                                Columns
                            </button>
                            {showColumnMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowColumnMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 py-2">
                                        <div className="px-4 py-2 border-b border-gray-200 font-semibold text-sm text-gray-700">
                                            Show/Hide Columns
                                        </div>
                                        {columns.map((col) => (
                                            <label
                                                key={col.key as string}
                                                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns[col.key as string]}
                                                    onChange={() => toggleColumn(col.key as string)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Filters Display */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                        {activeFilters.map((filter) => (
                            <div
                                key={filter.column}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                                <span className="font-medium">{filter.label}:</span>
                                <span>{filter.value}</span>
                                <button
                                    onClick={() => removeFilter(filter.column)}
                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {visibleColumnsArray.map((col) => (
                                <th key={col.key as string} className="px-4 py-3 text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {col.label}
                                        </span>
                                        {col.sortable && (
                                            <button
                                                onClick={() => handleSort(col.key as string)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                {sortConfig.key === col.key ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <ChevronUp size={14} className="text-blue-600" />
                                                    ) : (
                                                        <ChevronDown size={14} className="text-blue-600" />
                                                    )
                                                ) : (
                                                    <ChevronDown size={14} className="text-gray-400" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginatedData.map((row) => (
                            <tr key={row[rowKey as string]} className="hover:bg-gray-50 transition-colors">
                                {visibleColumnsArray.map((col) => {
                                    const value = row[col.key as string];
                                    const displayValue = col.render ? col.render(value, row) : value;
                                    const cellClass = col.cellClassName
                                        ? col.cellClassName(value, row)
                                        : '';

                                    return (
                                        <td
                                            key={col.key as string}
                                            className={`px-4 py-3 text-sm text-gray-700 ${cellClass}`}
                                            title={typeof displayValue === 'string' ? displayValue : ''}
                                        >
                                            {displayValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-600">
                        Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{' '}
                        {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
                    </div>
                </div>
                <div className='flex flex-row'>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                        Previous
                    </button>
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-gray-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommonTable;