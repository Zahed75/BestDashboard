"use client";
import Pagination from "@/components/global/pagination/Pagination";
import { fetchApi } from "@/utils/FetchApi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CiMenuBurger, CiMenuFries } from "react-icons/ci";
import { FaCaretDown } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
const noPicture = "https://i.ibb.co/sqPhfrt/notimgpng.png";

export default function UsersTable({ AllUsers }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showButton, setShowButton] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAction, setShowAction] = useState(false);
  const [users, setUsers] = useState(AllUsers || []);
  const [user, setUser] = useState([]);
  const dispatch = useDispatch();



  let data = users;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  useEffect(() => {
    setUsers(AllUsers);
  }, [AllUsers]);



  console.log(user);


  const router = useRouter();
  const titleData = ["All", "HQ", "AD", "BA", "MGR"];
  // const userInfo = useSelector((state) => state?.user);
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

  const handleTitleButtonClick = (title) => {
    if (title === "All") {
      setSearchQuery("");
    } else {
      setSearchQuery(title);
    }
  };

  const filteredData = data?.filter((item) =>
    Object.values(item).some(
      (value) =>
        value != null &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sorting function
  const sortedData = filteredData.sort((a, b) => {
    if (!sortBy) return 0;
    if (sortDirection === "asc") {
      return a[sortBy].localeCompare(b[sortBy]);
    } else {
      return b[sortBy].localeCompare(a[sortBy]);
    }
  });

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

  const handleDeleteUser = async () => {
    try {
      let updateUsers = [...users];
      for (const itemId of selectedItems) {
        const response = await fetchApi(`/auth/users/${itemId}`, "DELETE");
        if (response) {
          updateUsers = updateUsers.filter((item) => item._id !== itemId);
        } else {
          console.log(`Failed to delete category with ID ${itemId}.`);
        }
      }
      setSelectedItems([]);
      setUsers(updateUsers);
      console.log("Selected categories deleted successfully!");
    } catch (err) {
      console.log("An error occurred while deleting selected categories.", err);
    }
  };

  const handleUpdateUser = async () => {
    try {
      for (const itemId of selectedItems) {
        router.push(`/dashboard/usermanagement/${itemId}`);
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
        <div className="flex justify-between md:justify-start items-center  w-full">
          <h5 className="text-lg md:text-2xl font-bold">All Users</h5>
          <button
            onClick={() => setShowButton(!showButton)}
            className="text-sm md:text-lg text-gray-500 block md:hidden"
          >
            {showButton ? (
              <CiMenuFries className="text-xl font-bold" />
            ) : (
              <CiMenuBurger className="text-xl font-bold" />
            )}
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 ml-auto w-full md:col-span-2">
          {/* search bar */}
          <div className="relative flex justify-end items-center w-full py-2 rounded-lg focus-within:shadow-lg bg-[#F9FAFB] shadow-md overflow-hidden">
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
                      onClick={handleUpdateUser}
                      className="text-sm hover:bg-gray-100 text-gray-700 block px-4 py-2 w-full"
                    >
                      Update
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleDeleteUser}
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
                  href="/dashboard/usermanagement/adduser"
                  className="flex justify-center items-center px-2 py-1"
                >
                  <span className="text-xl font-semibold mr-1">+</span>{" "}
                  <span className="text-nowrap">Add Users</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* button component */}
      <div
        className={`
      ${showButton ? "flex" : "hidden"}
       flex-col md:flex-row gap-2 pb-5 border-b-2 justify-start items-center mt-5 `}
      >
        {titleData.map((title, index) => (
          <button
            key={index}
            onClick={() => handleTitleButtonClick(title)}
            className="bg-gray-100 text-gray-500 px-10 py-2 text-md rounded-md hover:bg-black hover:text-white duration-700 shadow-md w-full md:w-auto"
          >
            {title === "HQ"
              ? "Head Office"
              : title === "AD"
                ? "Admin"
                : title === "BA"
                  ? "Branch Admin"
                  : title === "MGR"
                    ? "Manager"
                    : title}
          </button>
        ))}
      </div>

      {/* table component*/}
      <div className="w-full mx-auto my-5">
        <div className="flex flex-col">
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden ">
                <table className="min-w-full table-fixed dark:divide-gray-700">
                  {/* table head */}
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
                        className="py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer"
                      >
                        Username
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("role")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Role &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("email")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Email &#x21d5;
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort("phoneNumber")}
                        className="px-3 py-3 text-sm font-medium tracking-wider text-center text-gray-700 uppercase dark:text-gray-400 cursor-pointer text-nowrap"
                      >
                        Phone &#x21d5;
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-black">
                    {/* {currentData?.map((item) => (
                      <tr
                        key={item.id}
                        className={`${item.id % 2 !== 0 ? "" : "bg-gray-100"
                          } hover:bg-gray-100 duration-700`}
                      >
                        <td scope="col" className="p-4">
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
                        </td>
                        <td className="py-4 text-sm font-medium text-gray-500 whitespace-nowrap underline underline-offset-2 cursor-pointer">
                          <Link href={`/dashboard/usermanagement/${item?._id}`}>
                            {item?.userName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <div className="flex justify-start items-center">
                            <Image
                              width={30}
                              height={30}
                              className="w-7 h-7 rounded-md"
                              src={item?.profilePicture || ""}
                              alt=""
                            />
                            <span className="ml-2">
                              {item?.firstName + item?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
                          {item?.role}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                          {item?.email}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap ">
                          {item?.phoneNumber}
                        </td>
                      </tr>
                    ))} */}
                    {user?.role === "HQ" || user?.role === "AD" ? (
                      currentData?.map((item) => (
                        <tr
                          key={item.id}
                          className={`${item.id % 2 !== 0 ? "" : "bg-gray-100"} hover:bg-gray-100 duration-700`}
                        >
                          <td scope="col" className="p-4">
                            <div className="flex items-center">
                              <input
                                id={`checkbox_${item._id}`}
                                type="checkbox"
                                className="w-4 h-4 bg-gray-100 rounded border-gray-300"
                                checked={selectedItems.includes(item._id)}
                                onChange={() => handleSelectItem(item._id)}
                              />
                              <label htmlFor={`checkbox_${item._id}`} className="sr-only">
                                checkbox
                              </label>
                            </div>
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-500 whitespace-nowrap underline underline-offset-2 cursor-pointer">
                            <Link href={`/dashboard/usermanagement/${item?._id}`}>
                              {item?.userName}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex justify-start items-center">
                              <Image
                                width={30}
                                height={30}
                                className="w-7 h-7 rounded-md"
                                src={item?.profilePicture || noPicture}
                                alt=""
                              />
                              <span className="ml-2">{item?.firstName + item?.lastName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                            {item?.role}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {item?.email}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {item?.phoneNumber}
                          </td>
                        </tr>
                      ))
                    ) : (
                      user && (
                        <tr
                          key={user?.userId}
                          className="bg-gray-100 hover:bg-gray-100 duration-700"
                        >
                          <td scope="col" className="p-4">
                            <div className="flex items-center">
                              <input
                                id={`checkbox_${user?.userId}`}
                                type="checkbox"
                                className="w-4 h-4 bg-gray-100 rounded border-gray-300"
                              // checked={selectedItems.includes(user?.userId)}
                              // onChange={() => handleSelectItem(user?.userId)}
                              />
                              <label htmlFor={`checkbox_${user?.userId}`} className="sr-only">
                                checkbox
                              </label>
                            </div>
                          </td>
                          <td className="py-4 text-sm font-medium text-gray-500 whitespace-nowrap  ">
                            {/* <Link href={`/dashboard/usermanagement/${user?.userId}`}> */}
                            {user?.userName}
                            {/* {user?.userId} */}
                            {/* </Link> */}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            <div className="flex justify-start items-center">
                              <Image
                                width={30}
                                height={30}
                                className="w-7 h-7 rounded-md"
                                src={user?.profilePicture || ""}
                                alt=""
                              />
                              <span className="ml-2">{user?.firstName + user?.lastName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                            {user?.role}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {user?.email}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {user?.phoneNumber}
                          </td>
                        </tr>
                      )
                    )}

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
