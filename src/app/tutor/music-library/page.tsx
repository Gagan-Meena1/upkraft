"use client";

import { useEffect, useMemo, useState } from "react";

type SongItem = {
  id?: string;
  title: string;
  artist?: string;
  url?: string;
  fileType?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string | Date;
  tags?: string | string[];
  filename?: string;
};

type SongSearchResponse = {
  items: SongItem[];
  total?: number;
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

function formatDate(d?: string | Date) {
  if (!d) return "-";
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    return new Date(date).toLocaleDateString();
  } catch {
    return "-";
  }
}

function formatSize(n?: number | null) {
  if (n == null) return "-";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export default function MusicLibrary() {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 20;

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
        const res = await fetch(`/Api/songs/search?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(body || `Failed to load songs (${res.status})`);
        }
        const data: SongSearchResponse = await res.json();
        if (!ignore) {
          setSongs(Array.isArray(data?.items) ? data.items : []);
          setTotalPages(data?.totalPages || 1);
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Unable to fetch songs");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [query, page]);

  const filtered = useMemo(() => {
    // Server already filters by q, but keep light client-side filter for safety
    const q = query.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => {
      const tagString = Array.isArray(s.tags) ? s.tags.join(" ") : s.tags || "";
      return (
        (s.title || "").toLowerCase().includes(q) ||
        (s.artist || "").toLowerCase().includes(q) ||
        tagString.toLowerCase().includes(q)
      );
    });
  }, [songs, query]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="bg-white shadow rounded-xl p-6 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 m-0">Music Library</h2>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder="Search songs, artists or tags"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4995 17.5L13.8828 13.8833" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-left text-sm font-semibold text-gray-600 border-b border-[#EEEEEE]">
                <th className="p-3">Title</th>
                <th className="p-3">Artist</th>
                <th className="p-3">Type</th>
                <th className="p-3">MIME</th>
                <th className="p-3">Size</th>
                <th className="p-3">Uploaded</th>
                <th className="p-3">Tags</th>
                <th className="p-3">File</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Loading songs...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="p-6 text-red-600">{error}</td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-gray-500">No songs found.</td>
                </tr>
              )}
              {!loading && !error && filtered.map((s, i) => (
                <tr key={s.id || s.url || s.filename || i} className="border-b border-[#EEEEEE] hover:bg-gray-50 transition-colors">
                  <td className="p-3">{s.title}</td>
                  <td className="p-3">{s.artist || "-"}</td>
                  <td className="p-3">{s.fileType || "-"}</td>
                  <td className="p-3">{s.mimeType || "-"}</td>
                  <td className="p-3">{formatSize(s.size as number)}</td>
                  <td className="p-3">{formatDate(s.uploadedAt)}</td>
                  <td className="p-3 truncate max-w-[240px]" title={Array.isArray(s.tags) ? s.tags.join(", ") : (s.tags as string) || "-"}>
                    {Array.isArray(s.tags) ? s.tags.join(", ") : (s.tags as string) || "-"}
                  </td>
                  <td className="p-3">
                    {s.url ? (
                      <a
                        className="text-indigo-600 hover:underline"
                        href={`/visualizer.html?songUrl=${encodeURIComponent(s.url!)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-1 mt-4">
          <button
            disabled={!canPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          {/* Simple page window */}
          {(() => {
            const windowSize = 5;
            const windowStart = Math.max(1, Math.min(page - 2, Math.max(1, totalPages - windowSize + 1)));
            const buttons = [] as number[];
            for (let pnum = windowStart; pnum <= Math.min(totalPages, windowStart + windowSize - 1); pnum++) {
              buttons.push(pnum);
            }
            return buttons.map((pnum) => (
              <button
                key={pnum}
                onClick={() => setPage(pnum)}
                className={`px-3 py-1.5 text-sm rounded border ${pnum === page ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-300"}`}
              >
                {pnum}
              </button>
            ));
          })()}
          <button
            disabled={!canNext}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 text-sm rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
