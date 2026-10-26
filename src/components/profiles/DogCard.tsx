"use client";

import React from "react";
import { DogProfile } from "@/types";
import { calculateAge } from "@/lib/utils";
import { Edit2, Trash2, Calendar, Scale, Hash, Heart, CheckCircle2 } from "lucide-react";

interface DogCardProps {
  dog: DogProfile;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DogCard({
  dog,
  isActive,
  onSelect,
  onEdit,
  onDelete
}: DogCardProps) {
  const age = calculateAge(dog.dob);

  return (
    <div
      className={`group relative flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border transition-all duration-300 hover:shadow-xl overflow-hidden ${
        isActive
          ? "border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {/* Dog Photo / Header */}
      <div className="relative h-48 w-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={dog.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-amber-600 dark:text-zinc-600">
            <span className="text-6xl mb-1">🐕</span>
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {dog.species}
            </span>
          </div>
        )}

        {/* Species & Breed overlay tag */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-black/60 text-white backdrop-blur-md">
            {dog.breed || dog.species}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 backdrop-blur-md">
            {dog.color}
          </span>
        </div>

        {/* Action icons */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit Dog Profile"
            className="p-2 rounded-xl bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:text-amber-600 dark:hover:text-amber-400 backdrop-blur-md shadow-sm transition hover:scale-105"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Dog Profile"
            className="p-2 rounded-xl bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 backdrop-blur-md shadow-sm transition hover:scale-105"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active badge */}
        {isActive && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Dog</span>
          </div>
        )}
      </div>

      {/* Dog Info Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>{dog.name}</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {age}
            </span>
          </div>

          {/* Quick stats pills */}
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-4">
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate">DOB: {dog.dob}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl">
              <Scale className="w-3.5 h-3.5 text-amber-500" />
              <span>{dog.weight ? `${dog.weight} kg` : "No weight"}</span>
            </div>
            {dog.microchipNo && (
              <div className="col-span-2 flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate font-mono text-[11px]">Chip: {dog.microchipNo}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {dog.notes && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 italic mb-4">
              "{dog.notes}"
            </p>
          )}
        </div>

        {/* Footer Select Button */}
        <button
          onClick={onSelect}
          className={`w-full mt-2 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 ${
            isActive
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 cursor-default"
              : "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 active:scale-95"
          }`}
        >
          {isActive ? "Currently Selected" : `Switch to ${dog.name}`}
        </button>
      </div>
    </div>
  );
}
