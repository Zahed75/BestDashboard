"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import "jspdf-autotable";
import Image from "next/image";
import { FaCaretDown, FaFilter } from "react-icons/fa";
import Pagination from "@/components/global/pagination/Pagination";
import { useRouter } from "next/navigation";

export default function CustomersTable({ AllCustomers }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAction, setShowAction] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [customers, setCustomers] = useState(AllCustomers || []);
  const [user, setUser] = useState([]);
  const noPicture = "https://i.ibb.co/sqPhfrt/notimgpng.png";

  const data = customers;

  useEffect(() => {
    setCustomers(AllCustomers);
  }, [AllCustomers]);

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

  const filteredData = data.filter((item) => {
    return item.userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedData = filteredData.sort((a, b) => {
    if (!sortBy) return 0;
    if (sortDirection === "asc") {
      return a[sortBy].localeCompare(b[sortBy]);
    } else {
      return b[sortBy].localeCompare(a[sortBy]);
    }
  });

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

  const handleUpdateCustomer = () => {
    try {
      for (const itemId of selectedItems) {
        router.push(`/dashboard/customers/${itemId}`);
      }
    } catch (error) {
      console.log(
        "An error occurred while updating selected categories.",
        error
      );
    }
  };

  return (
    <section className="w-full my-5">
      <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-center gap-y-3 mt-5 border-b-2 pb-5">
        <div className="flex justify-between md:justify-start items-center w-full">
          <h5 className="text-lg md:text-2xl font-bold">All Customers</h5>
        </div>
        <div className="flex flex-col md:flex-row justify-start items-center gap-3 ml-auto w-full md:col-span-2">
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
              placeholder="Search something.."
            />
          </div>
          <div className="flex justify-between items-center gap-3 ml-auto">
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
                      onClick={handleUpdateCustomer}
                      className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                    >
                      Update
                    </button>
                  </li>
                  <li>
                    <button
                      // onClick={handleDeleteCoupon}
                      className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full disabled cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            {/* <div className="w-10 h-10 bg-[#F9FAFB] shadow-md rounded-full">
              <FaFilter
                className={`${
                  !showFilter ? "block" : "hidden"
                } text-primary cursor-pointer w-6 h-6 flex justify-center items-center mx-auto my-2 p-1`}
                onClick={() => setShowFilter(!showFilter)}
              />
              <MdFilterAltOff
                className={`${
                  showFilter ? "block" : "hidden"
                } text-primary cursor-pointer w-8 h-8 flex justify-center items-center mx-auto my-1 p-1`}
                onClick={() => setShowFilter(!showFilter)}
              />
            </div> */}
          </div>
        </div>
      </div>
      {/* table component*/}
      <div className="w-full mx-auto my-5">
        <div className="flex flex-col">
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden ">
                <table className="min-w-full dark:divide-gray-700">

                  <thead className="bg-gray-100 ">
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
                        className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        User Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Customer Name
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("email")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        Email &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("city")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        City &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("phoneNumber")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Phone Number &#x21d5;
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
                          {user?.role === "HQ" || user?.role === "AD" ? (
                            <div className="flex items-center">
                              <input
                                id={`checkbox_${item._id}`}
                                type="checkbox"
                                className="w-4 h-4  bg-gray-100 rounded border-gray-300"
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
                          ) : (
                            <div className="flex items-center">
                              <input
                                id={`checkbox_${item._id}`}
                                type="checkbox"
                                className="w-4 h-4  bg-gray-100 rounded border-gray-300"
                              />
                              <label
                                htmlFor={`checkbox_${item._id}`}
                                className="sr-only"
                              >
                                checkbox
                              </label>
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {user?.role === "HQ" || user?.role === "AD" ? (
                            <div className="flex justify-start items-center">
                              <Link href={`/dashboard/customers/${item?._id}`}>
                                <span className="underline underline-offset-2">
                                  {item?.userName}
                                </span>
                              </Link>
                            </div>
                          ) : (
                            <span>{item?.userName}</span>
                          )}
                        </td>
                        <td className="px-6 md:px-0 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {user?.role === "HQ" || user?.role === "AD" ? (
                            <Link href={`/dashboard/customers/${item?._id}`}>
                              <div className="flex justify-start items-center">
                                <Image
                                  width={28}
                                  height={28}
                                  className="w-7 h-7 rounded-md"
                                  src={item?.profilePicture || noPicture}
                                  alt={item?.userName}
                                />
                                <span className="ml-2">
                                  {item?.firstName + " " + item?.lastName}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex justify-start items-center">
                              <Image
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-md"
                                src={item?.profilePicture || noPicture}
                                alt={item?.userName}
                              />
                              <span className="ml-2">
                                {item?.firstName + " " + item?.lastName}
                              </span>
                            </div>
                          )}



                          {/* <Link href={`/dashboard/customers/${item?._id}`}>
                            <div className="flex justify-start items-center">
                              <Image
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-md"
                                src={item?.profilePicture || noPicture}
                                alt={item?.userName}
                              />
                              <span className="ml-2">
                                {item?.firstName + " " + item?.lastName}
                              </span>
                            </div>
                          </Link> */}
                        </td>
                        <td className="px-6 md:px-0 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                          {item?.email}
                        </td>
                        <td className="px-6 md:px-0 py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                          <div className="flex justify-center items-center">
                            {item?.city}
                          </div>
                        </td>
                        <td className="px-6 md:px-0 py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                          <div className="flex justify-center items-center">
                            {item?.phoneNumber}
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
