"use client";

import { useRouter } from "next/navigation";

interface Props {
  initialSeason: string;
}

export default function CBRendersClient({ initialSeason }: Props) {
  const router = useRouter();

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/cbrenders?season=${e.target.value}`);
  };

  return (
    <select
      name="season"
      id="season"
      value={initialSeason}
      onChange={handleSeasonChange}
      className="bg-[var(--clr-accent-100)] text-[var(--clr-neutral-900)] p-2 rounded border border-[var(--clr-neutral-400)]"
    >
      <option value="1">Season 1</option>
      <option value="6">Season 6</option>
    </select>
  );
}
