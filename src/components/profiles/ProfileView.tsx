"use client";

import React, { useState } from "react";
import { useDogContext } from "@/context/DogContext";
import DogCard from "./DogCard";
import DogFormModal from "./DogFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import { DogProfile } from "@/types";
import { deleteDog } from "@/services/dogService";
import { Plus, Search, Dog as DogIcon, Sparkles } from "lucide-react";

export default function ProfileView() {
  const { dogs, activeDogId, setActiveDogId, refreshDogs, isLoading } = useDogContext();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dogToEdit, setDogToEdit] = useState<DogProfile | null>(null);
  
  const [dogToDelete, setDogToDelete] = useState<DogProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredDogs = dogs.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.breed && d.breed.toLowerCase().includes(q)) ||
      d.color.toLowerCase().includes(q) ||
      d.species.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setDogToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dog: DogProfile) => {
    setDogToEdit(dog);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!dogToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDog(dogToDelete.id);
      await refreshDogs();
      setDogToDelete(null);
    } catch (err) {
      console.error("Failed to delete dog:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-6 rounded-3xl border border-amber-200/50 dark:border-amber-900/30">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Dog Profiles</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
              {dogs.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your dogs, track birthdays, breeds, microchips, and keep individual records organized.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-amber-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dog</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, breed, or color..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
        />
      </div>

      {/* Dogs Grid */}
      {filteredDogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDogs.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              isActive={activeDogId === dog.id}
              onSelect={() => setActiveDogId(dog.id)}
              onEdit={() => handleOpenEdit(dog)}
              onDelete={() => setDogToDelete(dog)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-zinc-800 mx-auto flex items-center justify-center text-3xl mb-4 text-amber-600">
            🐶
          </div>
          <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            {search ? "No dogs match your search" : "No dog profiles yet"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
            {search
              ? "Try adjusting your search keywords."
              : "Create your first dog profile to start tracking activities, medical logs, and spa sessions."}
          </p>
          {!search && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Dog Profile</span>
            </button>
          )}
        </div>
      )}

      {/* Dog Form Modal (Add / Edit) */}
      <DogFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        dogToEdit={dogToEdit}
        onSuccess={refreshDogs}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!dogToDelete}
        onClose={() => setDogToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Delete Dog Profile"
        message={`Are you sure you want to delete ${dogToDelete?.name}? This action cannot be undone.`}
      />
    </div>
  );
}
