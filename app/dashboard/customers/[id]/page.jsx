"use client";

import { useState, useEffect } from "react";
import SingleCustomer from "./SingleCustomer";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchApi } from "@/utils/FetchApi";

export default function CustomerId({ params }) {
  const id = params.id;

  const [customer, setCustomer] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchApi(`/customer/info/${id}`, "GET");
        setCustomer(data?.customerInfo);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <main className="">
      {customer?._id && <SingleCustomer customer={customer} />}
      {!customer?._id && <Skeleton />}
    </main>
  );
}
