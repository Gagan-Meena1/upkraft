"use client";

const MusicLibrary = () => {
  const songs = [
    {
      song: "Wonderwall (Ver 1)",
      artist: "Oasis",
      instrument: "Guitar",
      genre: "Britpop/Rock",
      difficulty: "Beginner",
      year: 1995,
      notes: "Open chords, strumming patterns",
      skills: "Alternate Picking, Travis Picking, Power Chords",
      midi: "-",
    },
    {
      song: "Let it Be (Ver 1)",
      artist: "The Beatles",
      instrument: "Piano",
      genre: "Pop/Rock",
      difficulty: "Beginner",
      year: 1970,
      notes: "I–V–vi progressions, block chords",
      skills: "Triads, Arpeggios, Broken Chords",
      midi: "-",
    },
    {
      song: "Hey Jude (Ver 1)",
      artist: "The Beatles",
      instrument: "Piano",
      genre: "Pop/Rock",
      difficulty: "Intermediate",
      year: 1968,
      notes: "Simple chord patterns, singalong",
      skills: "Seventh Chords, Broken Chords, Ostinato Patterns",
      midi: "-",
    },
    // Add more rows as needed
  ];

  return (
    <div className="flex flex-col h-full w-full p-6">
      {/* White container */}
      <div className="bg-white shadow rounded-xl p-6 min-h-screen">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Music Library
        </h2>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                <tr className="text-left text-sm font-semibold text-gray-600 border-b border-[#EEEEEE]">
                    <th className="p-3">Song</th>
                    <th className="p-3">Artist</th>
                    <th className="p-3">Instrument</th>
                    <th className="p-3">Genre</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3">Skills</th>
                    <th className="p-3">MIDI File (Link)</th>
                </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                {songs.map((s, i) => (
                    <tr
                    key={i}
                    className="border-b border-[#EEEEEE] hover:bg-gray-50 transition-colors"
                    >
                    <td className="p-3">{s.song}</td>
                    <td className="p-3">{s.artist}</td>
                    <td className="p-3">{s.instrument}</td>
                    <td className="p-3">{s.genre}</td>
                    <td className="p-3">{s.difficulty}</td>
                    <td className="p-3">{s.year}</td>
                    <td className="p-3">{s.notes}</td>
                    <td className="p-3">{s.skills}</td>
                    <td className="p-3 text-indigo-600">{s.midi}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default MusicLibrary;
