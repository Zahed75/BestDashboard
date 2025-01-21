"use client";
import { useDispatch, useSelector } from "react-redux";
import CustomAreaChart from "./CustomAreaChart";
import { useEffect, useState } from "react";
import { fetchReport } from "@/redux/slice/reportSlice";

export default function Analytics() {
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dispatch = useDispatch();
  const report = useSelector((state) => state.report.report);

  useEffect(() => {
    dispatch(fetchReport({ startDate, endDate }));
  }, []);

  const salesData = report?.totalSalesAndNet?.totalSalesAndNet || [];
  const salesMatrix = report?.totalSalesAndNet || [];

  return (
    <section className="border bg-white rounded-md shadow-md w-full p-5 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-start gap-5">
        <div className="md:col-span-2">
          <CustomAreaChart salesData={salesData} />
        </div>
        <div
          id="overviewscroll"
          className="border bg-white rounded-md shadow-md p-5 w-full divide-y-2 space-y-5 h-96 overflow-y-scroll"
        >
          <div className="w-full">
            <span className="text-lg text-gray-500">Gross Sales</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                ৳{salesMatrix?.grossSales}
              </span>
            </div>
          </div>
          <div className="w-full pt-5">
            <span className="text-lg text-gray-500">Avg Gross Daily Sales</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                ৳{salesMatrix?.avgGrossDailySales}
              </span>
            </div>
          </div>
          <div className="w-full pt-5">
            <span className="text-lg text-gray-500">Net Sales</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                ৳{salesMatrix?.netSales}
              </span>
            </div>
          </div>
          <div className="w-full pt-5">
            <span className="text-lg text-gray-500">Avg Net Daily Sales</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                ৳{salesMatrix?.avgNetDailySales}
              </span>
            </div>
          </div>
          <div className="w-full pt-5">
            <span className="text-lg text-gray-500">Orders Placed Today</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                {salesMatrix?.ordersPlacedToday}
              </span>
            </div>
          </div>
          <div className="w-full pt-5">
            <span className="text-lg text-gray-500">Items Purchased Today</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                {salesMatrix?.itemsPurchasedToday}
              </span>
            </div>
          </div>
          <div className="w-full pt-5">
            <span className="text-lg text-gray-500">Refunded</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                ৳{salesMatrix?.refunded}
              </span>
            </div>
          </div>
          <div className="w-full pt-5">
            <span className="text-lg text-gray-500">DeliveryCharge</span>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">
                ৳{salesMatrix?.deliveryCharge}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
