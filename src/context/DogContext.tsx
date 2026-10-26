"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DogProfile } from "@/types";
import { getDogs } from "@/services/dogService";

interface DogContextType {
  dogs: DogProfile[];
  activeDog: DogProfile | null;
  activeDogId: string; // "all" or specific dog id
  setActiveDogId: (id: string) => void;
  refreshDogs: () => Promise<void>;
  isLoading: boolean;
}

const DogContext = createContext<DogContextType | undefined>(undefined);

export function DogProvider({ children }: { children: React.ReactNode }) {
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [activeDogId, setActiveDogId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshDogs = async () => {
    setIsLoading(true);
    try {
      const list = await getDogs();
      setDogs(list);
      
      // If activeDogId is not "all" and not found in list, fallback
      if (activeDogId !== "all" && !list.find((d) => d.id === activeDogId)) {
        setActiveDogId(list.length > 0 ? list[0].id : "all");
      } else if (activeDogId === "all" && list.length > 0) {
        // default select the first dog for focused activity tracking
        setActiveDogId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load dogs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDogs();
  }, []);

  const activeDog = dogs.find((d) => d.id === activeDogId) || null;

  return (
    <DogContext.Provider
      value={{
        dogs,
        activeDog,
        activeDogId,
        setActiveDogId,
        refreshDogs,
        isLoading
      }}
    >
      {children}
    </DogContext.Provider>
  );
}

export function useDogContext() {
  const context = useContext(DogContext);
  if (!context) {
    throw new Error("useDogContext must be used within a DogProvider");
  }
  return context;
}
