"use client";

import { useEffect, useState } from "react";
import SingleUser from "./SingleUser";
import { fetchApi } from "@/utils/FetchApi";
import Skeleton from "@/components/global/skeleton/Skeleton";

export default function Page({ params }) {
  const id = params.id;

  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchApi(`/auth/users/${id}`, "GET");
        setUser(data?.user);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <main className="">
      {user?._id && <SingleUser user={user} />}
      {!user?._id && <Skeleton />}
    </main>
  );
}
