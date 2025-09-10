import React, { useEffect, useMemo, useState } from "react";
import Pagination from "react-bootstrap/Pagination";
import { useNavigate } from "react-router-dom";
import { apiUrl, getApiBaseUrl } from "@/utils/api";
/** @typedef {import('../../types/tutor/songs').Song} Song */

const MusicLibraryTabs = ({ onSelectSong }) => {
  const [songs, setSongs] = useState(/** @type {Song[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl("/Api/songs"), {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to load songs (${res.status})`);
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        if (!ignore) setSongs(items);
      } catch (e) {
        if (!ignore) setError(e?.message || "Unable to fetch songs");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const rows = useMemo(() => songs, [songs]);

  const goPractice = (song) => {
    const url = song?.url || song?.filename || "";
    const abs = /^https?:\/\//i.test(url);
    const safe = abs ? url : url.startsWith("/") ? url : `/${url}`;
    // Build visualizer URL with query params
    const base = getApiBaseUrl();
    const params = new URLSearchParams();
    if (base) params.set("apiBase", base);
    if (safe) params.set("songUrl", safe);
    const visualizerUrl = `/visualizer.html${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    // Open visualizer in the current tab
    window.location.assign(visualizerUrl);
  };

  return (
    <div className="w-100">
      <div className="table-sec w-100 p-0">
        <div className="table-responsive w-100">
          <table
            className="table align-middle m-0 w-100"
            style={{ tableLayout: "fixed" }}
          >
            <thead>
              <tr>
                <th>Title</th>
                <th>Artist</th>
                <th>Primary Focus</th>
                <th>Genre</th>
                <th>Difficulty</th>
                <th>Year</th>
                <th>Notes</th>
                <th>Skills</th>
                <th>Practice</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-3">
                    Loading songs…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={9} className="text-danger py-3">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-muted py-3">
                    No songs found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                rows.map((s, i) => (
                  <tr key={s.url || s.filename || i}>
                    <td>{s.title}</td>
                    <td>{s.artist || "-"}</td>
                    <td>{s.primaryInstrumentFocus || "-"}</td>
                    <td>{s.genre || "-"}</td>
                    <td>{s.difficulty || "-"}</td>
                    <td>
                      {typeof s.year === "number" ? s.year : s.year || "-"}
                    </td>
                    <td>{s.notes || "-"}</td>
                    <td>{s.skills || "-"}</td>
                    <td>
                      {s.url ? (
                        <button
                          className="btn btn-sm btn-border"
                          onClick={() => goPractice(s)}
                        >
                          Practice
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-sec d-flex align-items-center justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev />
            <Pagination.Item active>{1}</Pagination.Item>
            <Pagination.Item>{2}</Pagination.Item>
            <Pagination.Item>{3}</Pagination.Item>
            <Pagination.Ellipsis />
            <Pagination.Item>{99}</Pagination.Item>
            <Pagination.Next />
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default MusicLibraryTabs;