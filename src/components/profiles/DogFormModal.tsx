"use client";

import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { DogProfile } from "@/types";
import { createDog, updateDog } from "@/services/dogService";
import { uploadDogImage, fileToDataUrl } from "@/lib/storageHelper";
import { calculateAge } from "@/lib/utils";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";

interface DogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dogToEdit: DogProfile | null;
  onSuccess: () => void;
}

export default function DogFormModal({
  isOpen,
  onClose,
  dogToEdit,
  onSuccess
}: DogFormModalProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState("");
  const [color, setColor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [weight, setWeight] = useState<string>("");
  const [microchipNo, setMicrochipNo] = useState("");
  const [notes, setNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [maxDate, setMaxDate] = useState("");

  useEffect(() => {
    setMaxDate(new Date().toISOString().split("T")[0]);
    if (dogToEdit) {
      setName(dogToEdit.name || "");
      setSpecies(dogToEdit.species || "Dog");
      setBreed(dogToEdit.breed || "");
      setDob(dogToEdit.dob || "");
      setColor(dogToEdit.color || "");
      setImageUrl(dogToEdit.imageUrl || "");
      setWeight(dogToEdit.weight ? dogToEdit.weight.toString() : "");
      setMicrochipNo(dogToEdit.microchipNo || "");
      setNotes(dogToEdit.notes || "");
    } else {
      setName("");
      setSpecies("Dog");
      setBreed("");
      setDob("");
      setColor("");
      setImageUrl("");
      setWeight("");
      setMicrochipNo("");
      setNotes("");
    }
    setErrorMsg("");
  }, [dogToEdit, isOpen]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setErrorMsg("");
      const uploadedUrl = await uploadDogImage(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
      setErrorMsg("Failed to upload image. Please try another file.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Dog name is required.");
      return;
    }
    if (!dob) {
      setErrorMsg("Date of Birth is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");

      const payload = {
        name: name.trim(),
        species: species.trim() || "Dog",
        breed: breed.trim() || undefined,
        dob,
        color: color.trim() || "N/A",
        imageUrl: imageUrl.trim() || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        microchipNo: microchipNo.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (dogToEdit) {
        await updateDog(dogToEdit.id, payload);
      } else {
        await createDog(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving dog profile:", err);
      setErrorMsg(err.message || "Failed to save dog profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedAge = dob ? calculateAge(dob) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dogToEdit ? `Edit Profile: ${dogToEdit.name}` : "Create New Dog Profile"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Profile Image Preview & Upload */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative group w-24 h-24 rounded-2xl overflow-hidden bg-amber-100 dark:bg-zinc-800 border-2 border-dashed border-amber-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 shadow-inner">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Dog avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px]">No Photo</span>
              </div>
            )}
            
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-2 text-center sm:text-left">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Dog Photo
            </label>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-sm transition">
                <Camera className="w-3.5 h-3.5" />
                <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              type="url"
              placeholder="Or paste an image web URL (e.g. https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Basic Info Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Dog Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lucky, Milo, Bella"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Species <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="Dog"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Breed
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="e.g. Golden Retriever, Beagle"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Golden Cream, Black & Tan"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Date of Birth (DOB) <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dob}
              max={maxDate}
              onChange={(e) => setDob(e.target.value)}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            {calculatedAge && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                Current Age: {calculatedAge}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 28.5"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Microchip # (Optional)
            </label>
            <input
              type="text"
              value={microchipNo}
              onChange={(e) => setMicrochipNo(e.target.value)}
              placeholder="e.g. 985141002345678"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notes & Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dietary requirements, allergies, favorite toys, personality traits..."
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploadingImage}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : dogToEdit ? (
              "Save Changes"
            ) : (
              "Create Profile"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
