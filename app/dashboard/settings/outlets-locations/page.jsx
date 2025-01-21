"use client";
import PageHead from "@/components/global/pageHead/PageHead";
import LocationsPage from "./LocationsPage";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchApi } from "@/utils/FetchApi";
import { useEffect, useState } from "react";

export default function Page() {
  const initialItems = [
    { id: 1, name: "Adabor" },
    { id: 2, name: "Aftabnagar" },
    { id: 3, name: "Agargaon" },
    { id: 4, name: "Azimpur" },
    { id: 5, name: "Baily Road" },
  ];

  return (
    <main>
      {initialItems?.length >= 0 ? (
        <div>
          <PageHead pageHead="Outlets Location Setup" />
          <LocationsPage initialItems={initialItems} />
        </div>
      ) : (
        <Skeleton />
      )}
    </main>
  );
}
