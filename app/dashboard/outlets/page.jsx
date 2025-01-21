"use client";
import OutletsTable from "@/components/dashboard/outletspage/OutletsTable";
import PageHead from "@/components/global/pageHead/PageHead";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchOutlets } from "@/redux/slice/outletSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Branch() {
  const dispatch = useDispatch();
  const outlets = useSelector((state) => state?.outlets?.outlets?.outlet);

  useEffect(() => {
    dispatch(fetchOutlets());
  }, [dispatch]);

  const AllOutlets = outlets || [];

  return (
    <main>
      {AllOutlets.length >= 1 ? (
        <div>
          <PageHead pageHead="Outlets" />
          <OutletsTable AllOutlets={AllOutlets} />
        </div>
      ) : (
        <Skeleton />
      )}
    </main>
  );
}
