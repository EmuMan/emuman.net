"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

interface Song {
  id: string;
  index: number;
  title: string;
  songId: string;
  description: string;
}

interface MusicPlayerProps {
  songs: Song[];
  musicPath: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getInitialSongId(songs: Song[]): string {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("id");
    if (urlId && songs.some((s) => s.songId === urlId)) {
      return urlId;
    }
  }
  return songs[0]?.songId || "";
}

export default function MusicPlayer({ songs, musicPath }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSongId, setCurrentSongId] = useState<string>(() =>
    getInitialSongId(songs),
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(0.8);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [hoveredSong, setHoveredSong] = useState<string | null>(null);

  const currentSong = songs.find((s) => s.songId === currentSongId);

  const getSongUrl = useCallback(
    (songId: string) => {
      return `${musicPath}${songId}.mp3`;
    },
    [musicPath],
  );

  useEffect(() => {
    songs.forEach((song) => {
      const audio = new Audio(getSongUrl(song.songId));
      audio.addEventListener("loadedmetadata", () => {
        setDurations((prev) => ({
          ...prev,
          [song.songId]: audio.duration,
        }));
      });
    });
  }, [songs, getSongUrl]);

  useEffect(() => {
    if (currentSongId) {
      window.history.replaceState(null, "", `?id=${currentSongId}`);
    }
  }, [currentSongId]);

  const playSong = (songId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(getSongUrl(songId));
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      nextSong();
    });

    setCurrentSongId(songId);
    audio.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      playSong(currentSongId);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    const currentIndex = songs.findIndex((s) => s.songId === currentSongId);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex].songId);
  };

  const prevSong = () => {
    const currentIndex = songs.findIndex((s) => s.songId === currentSongId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex].songId);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) {
        audioRef.current.volume = lastVolume;
      }
      setVolume(lastVolume);
    } else {
      setLastVolume(volume);
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  return (
    <div className="text-center">
      {/* Song table */}
      <div className="mx-auto max-w-4xl overflow-y-auto h-75">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-[10%] text-center sticky top-0 bg-accent-100 px-4 py-2">
                #
              </th>
              <th className="text-left sticky top-0 bg-accent-100 px-4 py-2">
                Title
              </th>
              <th className="text-right sticky top-0 bg-accent-100 px-4 py-2">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => {
              const isCurrentSong = currentSongId === song.songId;
              const isHovered = hoveredSong === song.songId;
              return (
                <tr
                  key={song.id}
                  onClick={() => playSong(song.songId)}
                  onMouseEnter={() => setHoveredSong(song.songId)}
                  onMouseLeave={() => setHoveredSong(null)}
                  className={`cursor-pointer transition-colors ${
                    isHovered
                      ? "bg-accent-200"
                      : isCurrentSong
                        ? "bg-accent-200"
                        : "bg-accent-000"
                  }`}
                >
                  <td className="text-center py-2 px-4">
                    {isHovered ? (
                      <Image
                        src="/images/small_arrow.png"
                        alt="Play"
                        width={16}
                        height={16}
                        className="inline"
                      />
                    ) : (
                      song.index
                    )}
                  </td>
                  <td className="text-left px-4">{song.title}</td>
                  <td className="text-right px-4">
                    {durations[song.songId]
                      ? formatDuration(durations[song.songId])
                      : "--:--"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Player controls */}
      <div className="mt-8">
        <p className="text-lg">- Now playing -</p>
        <p className="text-3xl font-bold my-2">{currentSong?.title || ""}</p>

        <div className="my-4">
          <input
            type="range"
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            className="w-[70%] accent-neutral-900"
          />
          <span className="ml-4">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button onClick={prevSong} className="hover:opacity-70">
              <Image
                src="/images/prev.png"
                alt="Previous"
                width={32}
                height={32}
              />
            </button>
            <button onClick={togglePlay} className="hover:opacity-70">
              <Image
                src={isPlaying ? "/images/pause.png" : "/images/play.png"}
                alt={isPlaying ? "Pause" : "Play"}
                width={48}
                height={48}
              />
            </button>
            <button onClick={nextSong} className="hover:opacity-70">
              <Image src="/images/next.png" alt="Next" width={32} height={32} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-start gap-2">
            <button onClick={toggleMute} className="hover:opacity-70">
              <Image
                src={isMuted ? "/images/mute.png" : "/images/speaker.png"}
                alt={isMuted ? "Unmute" : "Mute"}
                width={32}
                height={32}
              />
            </button>
            <input
              type="range"
              value={isMuted ? 0 : volume * 100}
              max={100}
              onChange={handleVolumeChange}
              className="w-[min(40%,150px)] accent-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Song description */}
      <div className="mt-8 px-[20%]">
        {currentSong && (
          <p dangerouslySetInnerHTML={{ __html: currentSong.description }} />
        )}
      </div>
    </div>
  );
}
