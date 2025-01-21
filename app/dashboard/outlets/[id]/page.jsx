"use client";
import { useEffect, useState } from "react";
import Loading from "../../loading";
import SingleOutlet from "./SingleOutlet";
import { fetchApi } from "@/utils/FetchApi";

export default function Page({ params }) {
  const [isLoading, setIsLoading] = useState(false);

  const id = params.id;

  const [outlet, setOutlet] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchApi(`/outlet/getOutletById/${id}`, "GET");
        setOutlet(data?.outlet);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <main className="">
      {isLoading ? <Loading /> : <SingleOutlet outlet={outlet} />}
    </main>
  );
}
