import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React, { useState } from "react";

export default function SearchBar({
  data,
  onSearch,
  setIsSearch,
  placeholder = "",
  variant = "default",
}: {
  data: any[];
  onSearch: any;
  setIsSearch: any;
  placeholder?: string;
  variant?: "default" | "landing";
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const isLanding = variant === "landing";

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filteredData = data.filter((item: any) =>
      Object.values(item).some(
        (value: any) =>
          value &&
          value.toString().toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
    setIsSearch(true);
    onSearch(filteredData);
  };
  return (
    <div className="flex justify-between items-center gap-8 w-full">
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className={cn("h-4 w-4", isLanding ? "text-[var(--dash-text-faint)]" : "text-slate-300")} />
        </div>
        <input
          id="search"
          name="search"
          type="text"
          autoComplete="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearch}
          className={cn(
            "block w-full rounded-md border-0 py-1.5 pl-8 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6",
            isLanding
              ? "dashboard-control h-9 text-[var(--dash-text)] ring-[var(--dash-border-subtle)] placeholder:text-[var(--dash-text-faint)] focus:ring-[var(--dash-brand)]"
              : "text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-rose-600"
          )}
        />
      </div>
    </div>
  );
}
