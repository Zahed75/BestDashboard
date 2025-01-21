"use client";
import PageHead from "@/components/global/pageHead/PageHead";
import EventsPage from "./EventsPage";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchApi } from "@/utils/FetchApi";
import { useEffect, useState } from "react";

export default function Events() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchApi(`/grid/allProductGrids`, "GET");
        setData(res);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, []);

  const initialItems = data?.grids;
  return (
    <main>
      {initialItems?.length >= 0 ? (
        <div>
          <PageHead pageHead="Products Grid" />
          <EventsPage initialItems={initialItems} />
        </div>
      ) : (
        <Skeleton />
      )}
    </main>
  );
}
