"use client";

import { useEffect, useState } from "react";
import SingleCoupon from "./SingleCoupon";
import { fetchApi } from "@/utils/FetchApi";
import Skeleton from "@/components/global/skeleton/Skeleton";

export default function CouponId({ params }) {
  const id = params.id;

  const [coupon, setCoupon] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchApi(`/discount/getCouponById/${id}`, "GET");
        setCoupon(data?.coupon);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <main>
      {coupon?._id && <SingleCoupon coupon={coupon} />}
      {!coupon?._id && <Skeleton />}
    </main>
  );
}
