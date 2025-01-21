"use client";
import Image from "next/image";
import dum from "@/public/image/dum.png";
import { useEffect, useState } from "react";
import useImgBBUpload from "@/utils/useImgBBUpload";
import Loading from "../../loading";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "@/redux/slice/usersSlice";
import { fetchApi } from "@/utils/FetchApi";
import { useRouter } from "next/navigation";
import AddOutletDynamicHead from "@/components/dashboard/outletspage/dynamic/AddOutletDynamicHead";
import { fetchCities } from "@/redux/slice/citiesSlice";
import { removeImage } from "@/redux/slice/imagesSlice";
import ImageUploadModal from "@/components/global/modal/ImageUploadModal ";

export default function AddOutlet() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const selectedImages = useSelector((state) => state.images.selectedImages);

  const dispatch = useDispatch();
  const router = useRouter();
  const users = useSelector((state) => state?.users?.users?.users);
  const cities = useSelector((state) => state.cities);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCities());
  }, [dispatch]);

  const { error, handleUpload, imageUrl, uploading } = useImgBBUpload();

  const handleUserImgFileChange = async (event) => {
    const file = event.target.files[0];
    setIsLoading(true);

    try {
      const uploadedImageUrl = await handleUpload(file);

      setIsLoading(false);
      console.log(uploadedImageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsLoading(false);
    }
  };

  const handleManagerChange = (event) => {
    const managerId = event.target.value;
    const manager = users?.find((user) => user?._id === managerId);
    if (manager) {
      setManagerEmail(manager.email);
      setManagerPhone(manager.phoneNumber);
      setSelectedManager(manager);
    } else {
      setManagerEmail("");
      setManagerPhone("");
      setSelectedManager(null);
    }
  };

  const OutletManager = users?.filter((user) => user?.role === "BA");

  const handleUploadOutlet = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
      outletName: formData.get("outletName"),
      outletLocation: formData.get("outletLocation"),

      outletManager: selectedManager?._id,
      outletManagerEmail: managerEmail,
      outletManagerPhone: managerPhone,
      outletImage:
        selectedImages || "http://service.bestelectronics.com.bd/media/images/user.png",
      cityName: selectedCity?.cityName,
      areaName: formData.get("area"),
    };

    try {
      const response = fetchApi("/outlet/outletCreate", "POST", data);

      if (response) {
        setIsLoading(false);
        router.push("/dashboard/outlets");
        dispatch(removeImage());

      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleCitiesChange = (event) => {
    const cityId = event.target.value;
    if (cityId === "") {
      setSelectedCity(null);
      return;
    }
    const city = cities?.cities?.find((city) => city?._id === cityId);
    setSelectedCity(city);
  };
  const handleRemoveProductPicture = () => {
    dispatch(removeImage());
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className="">
      <form onSubmit={handleUploadOutlet} action="" className="w-full">
        <section className="mt-10 flex justify-between items-center">
          <AddOutletDynamicHead title={"Add New Outlet"} />
          <button
            type="submit"
            className="text-sm text-white bg-black rounded-md px-3 py-2 text-nowrap"
          >
            {uploading ? "Uploading..." : "Add Outlet"}
          </button>
        </section>

        <section className="grid grid-cols-1 justify-between items-start gap-5 w-full my-10">
          <div className="flex flex-col justify-start items-center w-full col-span-2 space-y-5">
            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Outlet info</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 justify-between items-start gap-5">
                {/* {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="user"
                    width={145}
                    height={145}
                    className="w-[145px] h-[145px] object-cover rounded-md"
                  />
                ) : (
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="z-20 flex flex-col-reverse items-center justify-center w-[145px] h-[145px] cursor-pointer border py-2 bg-gray-200 rounded-md"
                    >
                      <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.0925 2.4917C6.35684 2.4917 4.48901 2.4917 3.32849 3.65177C2.16797 4.81185 2.16797 6.67896 2.16797 10.4132C2.16797 14.1473 2.16797 16.0145 3.32849 17.1746C4.48901 18.3347 6.35684 18.3347 10.0925 18.3347C13.8281 18.3347 15.6959 18.3347 16.8565 17.1746C18.017 16.0145 18.017 14.1473 18.017 10.4132V9.99626"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4.66602 17.4913C8.17433 13.5319 12.117 8.28093 17.9993 12.2192"
                          stroke="black"
                          strokeWidth="1.25"
                        />
                        <path
                          d="M15.4982 1.66504V8.33847M18.8362 4.98087L12.1602 4.99327"
                          stroke="black"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </label>
                    <span className="text-xs text-red-500">
                      outlet image is required *
                    </span>
                  </div>
                )} */}
                <div className="flex flex-col justify-between items-start space-y-3">
                  <div className="flex flex-col w-[145px]">
                    {selectedImages && (
                      <div className={`flex flex-col w-full`}>
                        <Image
                          width={145}
                          height={145}
                          src={selectedImages}
                          alt="Uploaded"
                          className="w-[145px] h-[145px] object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveProductPicture}
                          className="text-sm text-red-500 flex justify-start py-2 underline underline-offset-2"
                        >
                          Remove product Outlet
                        </button>
                      </div>
                    )}

                    {!selectedImages ? (
                      <div
                        onClick={openModal}
                        className={` flex flex-col w-full`}
                      >
                        <div className="z-20 flex flex-col-reverse items-center justify-center w-[145px] h-[145px] cursor-pointer border py-2 bg-gray-200 rounded-md">
                          <svg
                            width="21"
                            height="20"
                            viewBox="0 0 21 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.0925 2.4917C6.35684 2.4917 4.48901 2.4917 3.32849 3.65177C2.16797 4.81185 2.16797 6.67896 2.16797 10.4132C2.16797 14.1473 2.16797 16.0145 3.32849 17.1746C4.48901 18.3347 6.35684 18.3347 10.0925 18.3347C13.8281 18.3347 15.6959 18.3347 16.8565 17.1746C18.017 16.0145 18.017 14.1473 18.017 10.4132V9.99626"
                              stroke="black"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                            />
                            <path
                              d="M4.66602 17.4913C8.17433 13.5319 12.117 8.28093 17.9993 12.2192"
                              stroke="black"
                              strokeWidth="1.25"
                            />
                            <path
                              d="M15.4982 1.66504V8.33847M18.8362 4.98087L12.1602 4.99327"
                              stroke="black"
                              strokeWidth="1.25"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  {!selectedImages && (
                    <div className="mt-5">
                      <p className="text-xs text-red-500">
                        * Upload an image for the Outlet
                      </p>
                    </div>
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-2 justify-between items-center gap-5">
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Outlet Name
                    </label>
                    <input
                      type="text"
                      id="outletName"
                      name="outletName"
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletLocation"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Outlet Location
                    </label>
                    <input
                      type="text"
                      id="outletLocation"
                      name="outletLocation"
                      required
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="city"
                      className="text-sm font-semibold text-gray-600"
                    >
                      City
                    </label>
                    <div className="">
                      <div>
                        <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                          <select
                            id="city"
                            name="city"
                            required
                            onChange={handleCitiesChange}
                            className=" text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                          >
                            <option value="">Select City</option>
                            {cities?.cities?.map((item, i) => (
                              <option key={i} value={item?._id}>
                                {item?.cityName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="area"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Area
                    </label>
                    <div className="">
                      <div>
                        <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                          <select
                            id="area"
                            name="area"
                            disabled={selectedCity === null}
                            required
                            className=" text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                          >
                            <option>Select Area</option>
                            {selectedCity?.areas?.map((item, i) => (
                              <option key={i} value={item?.areaName}>
                                {item?.areaName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 w-full col-span-2">
                    <label
                      htmlFor="outletManager"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Outlet Manager
                    </label>
                    <div className="flex justify-start items-center border border-gray-300 rounded-md p-2 gap-3">
                      <Image
                        width={32}
                        height={32}
                        className="w-8 h-8"
                        src={dum}
                        alt="img"
                      />
                      <div className=" w-full">
                        <div className="relative flex px-2 rounded-md bg-white">
                          <select
                            id="outletName"
                            name="outletName"
                            onChange={handleManagerChange}
                            required
                            className="text-gray-600 font-semibold h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                          >
                            <option value="">Chose a Manager</option>
                            {OutletManager?.map((user, i) => (
                              <option key={i} value={user?._id}>
                                {user?.firstName + " " + user?.lastName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletManagerPhone"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Manager Phone Number
                    </label>
                    <input
                      type="text"
                      id="outletManagerPhone"
                      name="outletManagerPhone"
                      value={managerPhone}
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletManagerEmail"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Manager Email Address
                    </label>
                    <input
                      type="email"
                      id="outletManagerEmail"
                      name="outletManagerEmail"
                      value={managerEmail}
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
      <div>
        <ImageUploadModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </main>
  );
}
