"use client";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchReport } from "@/redux/slice/reportSlice";
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { MdFilterAltOff } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

export default function ReportingOverView() {
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dispatch = useDispatch();
  const report = useSelector((state) => state.report.report);

  useEffect(() => {
    dispatch(fetchReport({ startDate, endDate }));
  }, []);

  const advanceFilterHandler = (e) => {
    e.preventDefault();
    const startDate = e.target.filterStartDate.value;
    const endDate = e.target.filterEndDate.value;

    dispatch(fetchReport({ startDate, endDate }));
    setShowFilter(false);
  };

  const data = report?.totalSalesAndNet || {};

  return (
    <main>
      {report?.totalSalesAndNet ? (
        <section className="my-5 bg-white">
          <div className="flex justify-between items-center">
            <h5 className="text-2xl font-bold">Overview</h5>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="font-bold py-2 px-4 rounded-lg shadow-md focus:outline-0 focus:ring-0 flex justify-center items-center bg-[#F9FAFB] text-gray-500 hover:bg-gray-100 duration-700 min-w-24"
            >
              Filter
              <FaFilter
                className={`${!showFilter ? "block" : "hidden"
                  } cursor-pointer ml-1 w-4 h-4 flex justify-center items-center mx-auto text-gray-500`}
              />
              <MdFilterAltOff
                className={`${showFilter ? "block" : "hidden"
                  } cursor-pointer ml-1 w-6 h-6 flex justify-center items-center mx-auto text-gray-500`}
              />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 my-3 ">
            <div className="bg-[#F9FAFB] p-5 rounded-md hover:bg-[#c8c9c986] shadow-md duration-700">
              <p className="text-[#6B7280] mb-2">Total Sales</p>
              <div className="flex justify-between items-center">
                <h1 className="text-[22px] lg:text-[30px] font-bold">
                  {data?.totalSalesSum}৳
                </h1>
              </div>
            </div>
            <div className="bg-[#F9FAFB] p-5 rounded-md hover:bg-[#c8c9c986] shadow-md duration-700">
              <p className="text-[#6B7280] mb-2">Net Sales</p>
              <div className="flex justify-between items-center">
                <h1 className="text-[22px] lg:text-[30px] font-bold">{data?.netSalesSum}৳</h1>
              </div>
            </div>
            <div className="bg-[#F9FAFB] p-5 rounded-md hover:bg-[#c8c9c986] shadow-md duration-700">
              <p className="text-[#6B7280] mb-2">Total Order</p>
              <div className="flex justify-between items-center">
                <h1 className="text-[23px] lg:text-[30px] font-bold">
                  {data?.totalOrdersInTimeFrame}
                </h1>
              </div>
            </div>
            <div className="bg-[#F9FAFB] p-5 rounded-md hover:bg-[#c8c9c986] shadow-md duration-700">
              <p className="text-[#6B7280] mb-2">Total Order Today</p>
              <div className="flex justify-between items-center">
                <h1 className="text-[23px] lg:text-[30px] font-bold">
                  {data?.totalOrdersToday}
                </h1>
              </div>
            </div>
          </div>
          <div
            className={`${showFilter ? "flex" : "hidden"
              } fixed top-0 left-0 z-50 w-full h-full bg-black bg-opacity-50 items-center justify-center`}
          >
            <div className="bg-white w-11/12 md:w-1/3 rounded-lg shadow-lg p-5">
              <div className="flex justify-between items-center">
                <h5 className="text-lg font-bold">Filter</h5>
                <IoMdClose
                  onClick={() => setShowFilter(false)}
                  className="p-1 rounded-full bg-gray-100 w-6 h-6 cursor-pointer"
                />
              </div>
              <form
                onSubmit={advanceFilterHandler}
                className="flex flex-col gap-3 mt-5"
              >
                <div>
                  <label
                    htmlFor="filterDateRange"
                    className="text-sm font-semibold text-gray-600"
                  >
                    Start & End Date Range
                  </label>{" "}
                  <br />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                      <input
                        type="date"
                        name="filterStartDate"
                        id="filterStartDate"
                        className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                      />
                    </div>
                    <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                      <input
                        type="date"
                        name="filterEndDate"
                        id="filterEndDate"
                        className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-black text-white w-full mt-5"
                  >
                    Apply Filter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ) : (
        <Skeleton />
      )}
    </main>
  );
}
