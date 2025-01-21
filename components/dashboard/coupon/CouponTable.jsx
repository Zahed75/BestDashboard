"use client";
import Pagination from "@/components/global/pagination/Pagination";
import { fetchApi } from "@/utils/FetchApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCaretDown } from "react-icons/fa";

export default function CouponTable({ AllCoupons }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAction, setShowAction] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [coupons, setCoupons] = useState(AllCoupons || []);
  const [user, setUser] = useState([]);

  const data = coupons;

  useEffect(() => {
    setCoupons(AllCoupons);
  }, [AllCoupons]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchSingleUser = async () => {
      if (!(user?.userId)) return;

      try {
        const res = await fetchApi(
          `/auth/users/${user?.userId}`,
          "GET"
        );
        const data = res?.user;
        setUser(data);
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };
    fetchSingleUser();
  }, [user]);


  const router = useRouter();

  const filteredData = data.filter((item) =>
    item.general?.couponName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortData = (filteredData, sortBy, sortDirection) => {
    if (!sortBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = sortBy.split(".").reduce((o, i) => (o ? o[i] : ""), a);
      const bValue = sortBy.split(".").reduce((o, i) => (o ? o[i] : ""), b);

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });
  };

  const sortedData = sortData(filteredData, sortBy, sortDirection);

  // Pagination
  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = sortedData.slice(indexOfFirstData, indexOfLastData);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const firstItemIndex = (currentPage - 1) * dataPerPage + 1;
  const lastItemIndex = Math.min(currentPage * dataPerPage, data.length);
  const totalItems = data.length;

  const showingText = `Showing ${firstItemIndex}-${lastItemIndex} of ${totalItems}`;

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : [...data.map((item) => item._id)]);
  };

  const handleSelectItem = (itemId) => {
    const selectedIndex = selectedItems.indexOf(itemId);
    if (selectedIndex === -1) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems([
        ...selectedItems.slice(0, selectedIndex),
        ...selectedItems.slice(selectedIndex + 1),
      ]);
    }
  };

  const handleDeleteCoupon = async () => {
    try {
      let updatedCoupons = [...coupons];
      for (const itemId of selectedItems) {
        const response = await fetchApi(
          `/discount/deleteCouponById/${itemId}`,
          "DELETE"
        );
        if (response) {
          updatedCoupons = updatedCoupons.filter((item) => item._id !== itemId);
        } else {
          console.log(`Failed to delete category with ID ${itemId}.`);
        }
      }
      setSelectedItems([]);
      setCoupons(updatedCoupons);
      console.log("Selected categories deleted successfully!");
    } catch (err) {
      console.log("An error occurred while deleting selected categories.", err);
    }
  };

  const handleUpdateCoupon = async () => {
    try {
      for (const itemId of selectedItems) {
        router.push(`/dashboard/coupon/${itemId}`);
      }
    } catch (error) {
      console.log(
        "An error occurred while updating selected categories.",
        error
      );
    }
  };

  function formatDate(dateString) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";

    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }

  return (
    <section className="w-full my-5">
      <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-center gap-y-3 mt-5 border-b-2 pb-5">
        <div className="flex justify-between md:justify-start items-center w-full">
          <h5 className="text-lg md:text-2xl font-bold">All Coupons</h5>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 ml-auto w-full md:col-span-2">
          {/* search bar */}
          <div className="relative flex items-center w-full py-2 rounded-lg focus-within:shadow-lg bg-[#F9FAFB] shadow-md overflow-hidden">
            <div className="grid place-items-center h-full w-12 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              className="peer h-full w-full outline-none text-sm text-gray-500 bg-[#F9FAFB] pr-2"
              type="text"
              id="search"
              name="search"
              placeholder="Search something.."
            />
          </div>

          <div className="flex justify-end items-center gap-3 ml-auto ">
            <div className="flex justify-between items-center gap-3 relative">
              <div className=" bg-[#F9FAFB] rounded-lg shadow-md ">
                <button
                  onClick={() => setShowAction(!showAction)}
                  className="bg-[#F9FAFB] mx-4 py-2 flex justify-center items-center"
                >
                  Action <FaCaretDown className="ml-3" />
                </button>
              </div>
              <div
                onMouseLeave={() => setShowAction(false)}
                className={`
              ${showAction ? "block" : "hidden"}
              absolute top-11 bg-white text-base list-none divide-y divide-gray-100 rounded shadow-md w-full`}
                id="dropdown"
              >
                <ul className="py-1" aria-labelledby="dropdown">
                  <li>
                    <button
                      onClick={handleUpdateCoupon}
                      className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                    >
                      Update
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDeleteCoupon}
                      className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                    >
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            {(user?.role === "HQ" || user?.role === "AD") && (
              <div className="text-white border border-black bg-black rounded-lg shadow-md">
                <Link
                  href="/dashboard/coupon/addcoupon"
                  className="flex justify-center items-center px-2 py-1"
                >
                  <span className="text-xl font-semibold mr-1">+</span>{" "}
                  <span className="text-nowrap">Add Coupon</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* table component*/}
      <div className="w-full mx-auto my-5">
        <div className="flex flex-col">
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full dark:divide-gray-700">
                  {/* table head */}
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="p-4 w-6">
                        <div className="flex items-center">
                          <input
                            id="checkbox_all"
                            type="checkbox"
                            className="w-4 h-4 bg-gray-100 rounded border-gray-300 "
                            onChange={handleSelectAll}
                            checked={selectAll}
                          />
                          <label htmlFor="checkbox-all" className="sr-only">
                            checkbox
                          </label>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        Code
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("general.discountType")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Coupon Type &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("general.couponAmount")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Amount &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() =>
                          handleSort("usageLimit.usageLimitPerCoupon")
                        }
                        className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        limit &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("general.couponExpiry")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        expire date &#x21d5;
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-black">
                    {currentData?.map((item, i) => (
                      <tr
                        key={item._id}
                        className={`${i % 2 !== 0 ? "" : "bg-gray-100"
                          } hover:bg-gray-100 duration-700`}
                      >
                        <td scope="col" className="p-4">
                          <div className="flex items-center">
                            <input
                              id={`checkbox_${item._id}`}
                              type="checkbox"
                              className="w-4 h-4  bg-gray-100 rounded border-gray-300 justify-center"
                              checked={selectedItems.includes(item._id)}
                              onChange={() => handleSelectItem(item._id)}
                            />
                            <label
                              htmlFor={`checkbox_${item._id}`}
                              className="sr-only"
                            >
                              checkbox
                            </label>
                          </div>
                        </td>
                        <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <div className="flex items-center">
                            <Link href={`/dashboard/coupon/${item._id}`}>
                              <span className="">
                                {item?.general?.couponName}
                              </span>
                            </Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <div className="flex justify-center items-center">
                            <span className="">
                              {item?.general?.discountType}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                          <div className="flex justify-center items-center">
                            <span className="">
                              {item?.general?.couponAmount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <div className="flex justify-center items-center">
                            {/* <span className="">
                              {item?.usageLimit?.usageLimitPerCoupon ||
                                "&#8734;"}
                            </span> */}
                            <span>
                              {item?.usageLimit?.usageLimitPerUser || 0}
                            </span>
                            /
                            <span>
                              {/* {item?.usageLimit?.usageLimitPerCoupon || '\u221E'} */}
                              {item?.usageLimit?.usageLimitPerCoupon ? (
                                item.usageLimit.usageLimitPerCoupon
                              ) : (
                                // <span className="text-2xl">∞</span>
                                <span className="text-xl">&#8734;</span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <div className="flex justify-center items-center">
                            <span className="">
                              {formatDate(item?.general?.couponExpiry)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            dataPerPage={dataPerPage}
            totalItems={sortedData.length}
            paginate={paginate}
            showingText={showingText}
            data={sortedData}
          />
        </div>
      </div>
    </section>
  );
}
