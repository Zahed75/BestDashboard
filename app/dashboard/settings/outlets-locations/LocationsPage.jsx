"use client";
import Modal from "@/components/global/modal/Modal";
import { fetchApi } from "@/utils/FetchApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use, useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LocationsPage({ initialItems }) {
  const reducer = (state, action) => {
    switch (action.type) {
      case "TOGGLE_ADD_MENU":
        return { ...state, showAddMenu: !state.showAddMenu };
      case "TOGGLE_UPDATE_MENU":
        return { ...state, showUpdateMenu: !state.showUpdateMenu };
      case "TOGGLE_DELETE_ALERT":
        return { ...state, showDeleteAlert: !state.showDeleteAlert };
      case "TOGGLE_DELETE_AREA_ALERT":
        return { ...state, showDeleteAreaAlert: !state.showDeleteAreaAlert };
      case "SET_ITEMS":
        return { ...state, items: action.payload };
      case "SET_CITES":
        return { ...state, cites: action.payload };
      case "SET_SELECTED_CITY":
        return { ...state, selectedCity: action.payload };
      case "UPDATE_SELECTED_CITY":
        return { ...state, selectedCity: action.payload };
      case "RESET_SELECTED_CITY":
        return { ...state, selectedCity: "" };
      case "SET_SELECTED_CITY_AREA_ID":
        return { ...state, selectedCityAreaId: action.payload };
      case "UPDATE_SELECTED_CITY_AREA_ID":
        return { ...state, selectedCityAreaId: action.payload };
      case "SET_LOADING":
        return { ...state, isLoading: action.payload };
      case "REMOVE_ITEM":
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload),
        };
      case "REMOVE_CITE":
        return {
          ...state,
          cites: state.cites.filter((item) => item.id !== action.payload),
        };
      case "TOGGLE_UPDATE_AREA_MENU":
        return { ...state, showAreaUpdateMenu: !state.showAreaUpdateMenu };
      case "SET_SELECTED_CITY_AREA":
        return {
          ...state,
          selectedCity: {
            ...state.selectedCity,
            areas: action.payload, 
          },
          selectedCityArea: action.payload, 
        };
      case "UPDATE_SELECTED_CITY_AREA":
        return { ...state, selectedCityArea: action.payload };
      case "RESET_SELECTED_CITY_AREA":
        return { ...state, selectedCityArea: [], selectedCityAreaId: "" };
      case "SET_SEARCH_VALUE":
        return { ...state, searchValue: action.payload };
      case "RESET_SEARCH_VALUE":
        return { ...state, searchValue: "" };
      default:
        return state;
    }
  };

  const STATE = {
    showAddMenu: false,
    showUpdateMenu: false,
    showDeleteAlert: false,
    showDeleteAreaAlert: false,
    items: initialItems || [],
    isLoading: false,
    cites: [],
    selectedCity: "",
    showAreaUpdateMenu: false,
    selectedCityArea: [],
    selectedCityAreaId: "",
    searchValue: "",
  };

  const [state, dispatch] = useReducer(reducer, STATE);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await fetchApi("/city/getAllCities", "GET");
      if (response.length >= 0) {
        dispatch({ type: "SET_CITES", payload: response });
      }
      dispatch({ type: "SET_LOADING", payload: false });
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (state.selectedCity) {
      dispatch({
        type: "SET_SELECTED_CITY_AREA",
        payload: state.selectedCity.areas,
      });
    }
  }, [state.selectedCity]);

  const handleErase = (id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const handleCitySubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const city = {
      cityName: data.get("cityName"),
    };
    const response = await fetchApi("/city/createCity", "POST", city);
    if (response._id) {
      const newCity = response;
      dispatch({ type: "SET_CITES", payload: [...state.cites, newCity] });
      dispatch({ type: "TOGGLE_ADD_MENU" });
    }
  };

  const handleAreaSubmit = async (event) => {
    event.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });
    const data = new FormData(event.target);
    const area = {
      areaName: data.get("addAreaName"),
    };
    try {
      const response = await fetchApi(
        `/area/add-Area/${state.selectedCity._id}`,
        "POST",
        area
      );
      if (response._id) {
        dispatch({
          type: "SET_SELECTED_CITY_AREA",
          payload: [...state.selectedCity.areas, response],
        });
        dispatch({ type: "SET_LOADING", payload: false });
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.log(error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleCityDelete = async (id) => {
    const response = await fetchApi(`/city/deleteCityById/${id}`, "DELETE");
    if (response) {
      dispatch({
        type: "SET_CITES",
        payload: state.cites.filter((item) => item._id !== id),
      });
    }
  };

  const handleUpdateAreaSubmit = async (event) => {
    event.preventDefault();
    dispatch({ type: "SET_LOADING", payload: true });
    const formData = new FormData(event.target);
    const areaName = formData.get("updateAreaName");

    try {
      const response = await fetchApi(
        `/area/updateArea/${state.selectedCityAreaId._id}`,
        "PUT",
        { areaName }
      );
      if (response) {
        const newAreas = state.selectedCity.areas.map((item) =>
          item._id === state.selectedCityAreaId._id
            ? { ...item, areaName }
            : item
        );
        dispatch({
          type: "SET_SELECTED_CITY_AREA",
          payload: newAreas,
        });
        dispatch({ type: "TOGGLE_UPDATE_AREA_MENU" });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.log(error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
    event.target.reset();
  };

  const handleAreaDelete = async (id) => {
    try {
      const response = await fetchApi(
        `/area/deleteAreaById/${state.selectedCityAreaId._id}`,
        "DELETE"
      );
      if (response) {
        const newAreas = state.selectedCity.areas.filter(
          (item) => item._id !== id
        );
        dispatch({
          type: "SET_SELECTED_CITY_AREA",
          payload: newAreas,
        });
        dispatch({ type: "TOGGLE_DELETE_AREA_ALERT" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSearchEvent = (event) => {
    const searchValue = event.target.value;
    dispatch({ type: "SET_SEARCH_VALUE", payload: searchValue });
    dispatch({
      type: "SET_SELECTED_CITY_AREA",
      payload: state.selectedCity.areas.filter((item) =>
        item.areaName.toLowerCase().includes(searchValue.toLowerCase())
      ),
    });
  };

  return (
    <main>
      <section className="w-full">
        <div className="flex flex-row justify-between item center mt-4">
          <h3 className="text-sm md:text-lg text-black font-extrabold  py-2">
            All Location
          </h3>
          <button
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_ADD_MENU" })}
            className="text-white bg-black rounded-md px-4 py-2  w-auto flex md:ml-auto mt-2"
          >
            + Add City
          </button>
        </div>
        <div className="w-full mx-auto">
          <div className="flex justify-start items-center">
            <div className="flex flex-grow items-center justify-between space-x-1">
              {state.cites?.length > 0 &&
                state.cites.map((city, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 text-gray-500 px-4 py-2 lg:text-md rounded-md hover:bg-gray-200 hover:text-gray-600 w-auto flex md:ml-auto mt-2 justify-between"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_SELECTED_CITY",
                          payload: city,
                        })
                      }
                      className=""
                    >
                      {city.cityName}
                    </button>
                    <svg
                      className="ml-3 mt-1 w-4 h-4 text-gray-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() => {
                        dispatch({ type: "TOGGLE_DELETE_ALERT" });
                        dispatch({
                          type: "UPDATE_SELECTED_CITY",
                          payload: city,
                        });
                      }}
                    >
                      <path
                        d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                        fill="gray"
                      />
                    </svg>
                  </div>
                ))}
            </div>
          </div>

          <hr className="my-4 border-gray-300" />

          {state.selectedCity && (
            <div>
              <div div className="font-bold py-2 rounded">
                {" "}
                <h1 className="text-2xl font-semibold">
                  {state.selectedCity.cityName}
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 inset-y-0 my-auto h-5 w-5 text-primary"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0" />
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <g id="Interface / Search_Magnifying_Glass">
                        {" "}
                        <path
                          id="Vector"
                          d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z"
                          stroke="gray"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />{" "}
                      </g>{" "}
                    </g>
                  </svg>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    onChange={onSearchEvent}
                    placeholder="Search for location"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-0"
                  />
                </div>

                <form onSubmit={handleAreaSubmit} className="relative">
                  <input
                    type="text"
                    name="addAreaName"
                    id="addAreaName"
                    placeholder="Enter New location"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-0"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-3 flex items-center font-semibold"
                  >
                    ＋ Add Area
                  </button>
                </form>
              </div>

              <div className="">
                {Array.isArray(state.selectedCityArea) &&
                state.selectedCityArea?.length >= 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {state.selectedCityArea?.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center w-full px-2 py-2 border border-gray-300 rounded-md"
                      >
                        <span className="">{item?.areaName}</span>
                        <div className="flex space-x-2">
                          <button
                            className=""
                            onClick={() => {
                              dispatch({ type: "TOGGLE_UPDATE_AREA_MENU" });
                              dispatch({
                                type: "UPDATE_SELECTED_CITY_AREA_ID",
                                payload: item,
                              });
                            }}
                          >
                            <svg
                              fill="black"
                              viewBox="0 0 528.899 528.899"
                              className="w-3 h-3"
                            >
                              <path
                                d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981
                    c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611C532.495,100.753,532.495,77.559,518.113,63.177z
                    M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069L27.473,390.597L0.3,512.69z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              dispatch({ type: "TOGGLE_DELETE_AREA_ALERT" });
                              dispatch({
                                type: "UPDATE_SELECTED_CITY_AREA_ID",
                                payload: item,
                              });
                            }}
                            className=""
                          >
                            <svg
                              className="w-4 h-4 font-semibold"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g strokeWidth="0" />
                              <g strokeLinecap="round" strokeLinejoin="round" />
                              <g>
                                <path
                                  d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                                  fill="black"
                                />
                              </g>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={` flex  justify-center items-center font-semibold w-full h-full mx-auto my-10`}
                  >
                    No Area found !
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Modal addModal={() => dispatch({ type: "TOGGLE_ADD_MENU" })}>
        <div
          id="menu"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
            state.showAddMenu ? "fixed" : "hidden"
          } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-md shadow-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold">Add City Location</span>

                <button
                  onClick={() => dispatch({ type: "TOGGLE_ADD_MENU" })}
                  className="text-gray-400 focus:outline-none"
                  aria-label="close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCitySubmit} className="w-full mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="cityName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      City Name
                    </label>
                    <input
                      type="text"
                      id="cityName"
                      name="cityName"
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 mt-5 bg-black text-white rounded-md w-full"
                >
                  {state.isLoading === true ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal updateModal={() => dispatch({ type: "TOGGLE_UPDATE_MENU" })}>
        <div
          id="update-menu"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
            state.showUpdateMenu ? "fixed" : "hidden"
          } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-md shadow-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold">Update Area Location</span>
                <button
                  onClick={() => setShowUpdateMenu(false)}
                  className="text-gray-400 focus:outline-none"
                  aria-label="close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <form className="w-full mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="updateAreaName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Area Name
                    </label>
                    <input
                      type="text"
                      id="updateAreaName"
                      name="updateAreaName"
                      // defaultValue={ }
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 mt-5 bg-black text-white rounded-md w-full"
                >
                  {state.isLoading === true ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal deleteModal={() => dispatch({ type: "TOGGLE_DELETE_ALERT" })}>
        <div
          id="delete-alert"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
            state.showDeleteAlert ? "fixed" : "hidden"
          } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-md shadow-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold">Delete City Location</span>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_DELETE_ALERT" })}
                  className="text-gray-400 focus:outline-none"
                  aria-label="close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-6">
                <p className="text-center text-gray-600">
                  Are you sure you want to delete this city location?
                </p>
              </div>
              <div className="flex justify-center items-center mt-6 space-x-3">
                <button
                  onClick={() => {
                    handleCityDelete(state.selectedCity._id);
                    dispatch({ type: "TOGGLE_DELETE_ALERT" });
                    dispatch({ type: "RESET_SELECTED_CITY" });
                  }}
                  className="py-2 px-4 bg-black text-white rounded-md w-1/2"
                >
                  {state.isLoading === true ? "Loading..." : "Delete"}
                </button>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_DELETE_ALERT" })}
                  className="py-2 px-4 bg-gray-700 text-white rounded-md w-1/2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal addAreaModal={() => dispatch({ type: "TOGGLE_UPDATE_AREA_MENU" })}>
        <div
          id="menu"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
            state.showAreaUpdateMenu ? "fixed" : "hidden"
          } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-md shadow-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold">Update Area Location</span>

                <button
                  type="button"
                  onClick={() => dispatch({ type: "TOGGLE_UPDATE_AREA_MENU" })}
                  className="text-gray-400 focus:outline-none"
                  aria-label="close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleUpdateAreaSubmit} className="w-full mt-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="updateAreaName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Area Name
                    </label>
                    <input
                      type="text"
                      id="updateAreaName"
                      name="updateAreaName"
                      defaultValue={state.selectedCityAreaId.areaName}
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2 px-4 mt-5 bg-black text-white rounded-md w-full"
                >
                  {state.isLoading === true ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        deleteAreaModal={() => dispatch({ type: "TOGGLE_DELETE_AREA_ALERT" })}
      >
        <div
          id="delete-area-alert"
          className={`w-full h-full bg-gray-900 bg-opacity-80 top-0 right-0 ${
            state.showDeleteAreaAlert ? "fixed" : "hidden"
          } sticky-0 z-30`}
        >
          <div className="flex justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-6 rounded-md shadow-md">
              <div className="flex justify-between items-center w-full">
                <span className="text-2xl font-bold">Delete Area Location</span>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_DELETE_AREA_ALERT" })}
                  className="text-gray-400 focus:outline-none"
                  aria-label="close"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-6">
                <p className="text-center text-gray-600">
                  Are you sure you want to delete this city location?
                </p>
              </div>
              <div className="flex justify-center items-center mt-6 space-x-3">
                <button
                  onClick={() => {
                    handleAreaDelete(state.selectedCityAreaId._id);
                    dispatch({
                      type: "RESET_SELECTED_CITY_AREA",
                    });
                  }}
                  className="py-2 px-4 bg-black text-white rounded-md w-1/2"
                >
                  {state.isLoading === true ? "Loading..." : "Delete"}
                </button>
                <button
                  onClick={() => dispatch({ type: "TOGGLE_DELETE_AREA_ALERT" })}
                  className="py-2 px-4 bg-gray-700 text-white rounded-md w-1/2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </main>
  );
}
