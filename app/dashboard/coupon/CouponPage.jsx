"use client";
import CouponTable from "@/components/dashboard/coupon/CouponTable";
import PageHead from "@/components/global/pageHead/PageHead";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchCoupons } from "@/redux/slice/couponSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CouponPage() {
  const dispatch = useDispatch();
  const coupon = useSelector((state) => state?.coupons?.coupons);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const AllCoupons = coupon?.coupons;
  const data = AllCoupons || [];

  return (
    <main>
      {data.length === 0 ? (
        <Skeleton />
      ) : (
        <div>
          <PageHead pageHead="Coupon" />
          <CouponTable AllCoupons={AllCoupons} />
        </div>
      )}
    </main>
  );
}
