"use client";
import React, { useEffect, useState } from "react";
import { Music, Folder, Heart, RefreshCw } from "lucide-react";
import Link from "next/link";
import {Button} from "react-bootstrap"

export default function FavouritesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getSongId = (song: any) =>
    String(song._id || song.id || song.url || song.filename || song.title || "");

  // load user id + likedSongs from server (JWT)
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/Api/users/user", { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        const id = data?.user?._id || data?.data?._id || null;
        const liked = Array.isArray(data?.user?.likedSongs)
          ? data.user.likedSongs.map((x: any) => String(x))
          : [];
        if (!ignore) {
          setUserId(id);
          setFavourites(liked);
        }
      } catch (err) {
        console.error("Failed to fetch user/likedSongs", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);
  
  // fetch songs and filter to favourites
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/Api/songs?limit=1000", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch songs (${res.status})`);
        const data = await res.json();
        const items = Array.isArray(data?.songs || data?.items)
          ? (data.songs || data.items)
          : [];
        if (!ignore) {
          if (favourites.length > 0) {
            const favSet = new Set(favourites.map(String));
            setSongs(items.filter((s: any) => favSet.has(String(s._id))));
          } else {
            setSongs([]);
          }
        }
      } catch (err: any) {
        if (!ignore) setError(err?.message || "Unable to load songs");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [favourites]);

  // helpers
  const formatSkills = (skills: any) => {
    if (!skills) return "";
    return typeof skills === "string" ? (skills.length > 50 ? `${skills.substring(0,50)}...` : skills) : String(skills);
  };
  const getFileIcon = (fileType: string, extension?: string) => {
    if (fileType === "audio" || (extension || "").toLowerCase().endsWith("mp3")) {
      return <Music className="w-4 h-4 text-orange-500" />;
    }
    return <span className="w-4 h-4 text-green-500">📄</span>;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-gray-700" />
          <h2 className="text-lg font-semibold">Favourites</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="!flex items-center px-3 !py-1 rounded-md bg-white border hover:bg-gray-50">
          <Link href="/student/musicLibrary" className="">Back</Link>
          </Button>
          <Button onClick={() => window.location.reload()} className="!flex items-center px-3 !py-1 rounded-md bg-white border hover:bg-gray-50">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Song</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Artist</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Instrument</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Genre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Difficulty</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Year</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Skills</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    Loading favourites...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-red-600 bg-red-50">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && songs.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-600">
                    <div className="flex flex-col items-center">
                      <Heart className="w-10 h-10 text-gray-300 mb-3" />
                      <div className="text-lg font-medium">{userId ? "No favourites yet" : "Please sign in to see favourites"}</div>
                      {userId && <div className="text-sm text-gray-500 mt-1">Click the heart on any song to add it to your Favourites.</div>}
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !error && songs.map((song) => (
                <tr key={getSongId(song)} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button title="Liked" className="inline-flex items-center justify-center w-8 h-8 !rounded-md bg-red-100 text-red-600">
                        <Heart size={16} />
                      </button>
                      {song.url ? (
                        <Button className="!px-1 !py-1 !text-white">
                          <Link className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium !text-white" href={`/visualizer.html?songUrl=${encodeURIComponent(song.url)}`} target="_blank" rel="noreferrer">
                            Open
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(song.fileType, song.extension)}
                      <span className="font-medium text-gray-900 truncate max-w-xs">{song.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-800 max-w-xs truncate font-medium">{song.artist || 'Unknown'}</td>
                  <td className="py-3 px-4 text-gray-800 max-w-xs truncate font-medium">{song.primaryInstrumentFocus || 'N/A'}</td>
                  <td className="py-3 px-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-900">{song.genre || 'N/A'}</span></td>
                  <td className="py-3 px-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900">{song.difficulty || 'N/A'}</span></td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{song.year || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm max-w-xs truncate">{song.notes || '-'}</td>
                  <td className="py-3 px-4 text-gray-700 text-sm max-w-xs truncate">{formatSkills(song.skills)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}