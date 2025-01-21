"use client";
import { useEffect, useState } from "react";
import AddUserDynamicHead from "./dynamic/AddUserDynamicHead";
import { fetchApi } from "@/utils/FetchApi";
import useImgBBUpload from "@/utils/useImgBBUpload";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { removeImage } from "@/redux/slice/imagesSlice";
import ImageUploadModal from "@/components/global/modal/ImageUploadModal ";
import { fetchOutlets } from "@/redux/slice/outletSlice";

export default function AddUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const selectedImages = useSelector((state) => state.images.selectedImages);
  const user = useSelector((state) => state.auth.user);
  const outlets = useSelector((state) => state?.outlets?.outlets?.outlet);
  const router = useRouter();

  const dispatch = useDispatch();
  const { error, handleUpload, imageUrl, uploading } = useImgBBUpload();

  useEffect(() => {
    dispatch(fetchOutlets());
  }, [dispatch]);

  const AllOutlets = outlets || [];

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

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);

    formData.set(
      "userName",
      formData.get("userName").replace(/\s/g, "").toLowerCase()
    );

    const data = {
      userName:
        formData.get("userName") ||
        formData.get("firstName").replace(/\s/g, "").toLowerCase() +
        formData.get("lastName").replace(/\s/g, "").toLowerCase(),
      outletId: formData.get("outletName"),
      role: formData.get("userRole"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phoneNumber: formData.get("phoneNumber"),
      password: formData.get("password"),
      email: formData.get("email"),
      profilePicture:
        selectedImages || "http://service.bestelectronics.com.bd/media/images/user.png",
    };

    try {
      const response = fetchApi("/auth/userManage", "POST", data);

      if (response) {
        setIsLoading(false);
        router.push("/dashboard/usermanagement");
        dispatch(removeImage());
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const handleRemoveUserPicture = () => {
    dispatch(removeImage());
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <form onSubmit={handleUserSubmit}>
        <section className="mt-10 flex justify-between items-center">
          <AddUserDynamicHead title={"Add New User"} />
          <button
            type="submit"
            className="text-sm text-white bg-black rounded-md px-3 py-2"
          >
            {isLoading ? "Adding User..." : "Add New User"}
          </button>
        </section>
        <section className="grid grid-cols-1 justify-between items-start gap-5 w-full my-10">
          <div className="flex flex-col justify-start items-center w-full col-span-2 space-y-5">
            <div className="p-5 border bg-white rounded-md shadow-md w-full">
              <h5 className="text-md font-bold mb-3">Personal info</h5>
              <div className="grid grid-cols-3 justify-between items-start gap-5">
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
                      User image is required *
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
                          onClick={handleRemoveUserPicture}
                          className="text-sm text-red-500 flex justify-start py-2 underline underline-offset-2"
                        >
                          Remove product User
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
                        * Upload an image for the User
                      </p>
                    </div>
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-2 justify-between items-center gap-5">
                  <div className="flex flex-col col-span-2 space-y-1 w-full">
                    <label
                      htmlFor="userName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      User Name
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      placeholder="username"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="">
                    <label
                      htmlFor="outletName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Outlet
                    </label>
                    <br />
                    <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                      <select
                        id="outletName"
                        name="outletName"
                        // required
                        className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                      >
                        {/* <option value={"Banani"}>Banani</option>
                        <option value={"Gulshan"}>Gulshan</option>
                        <option value={"Motizhill"}>Motizhill</option>
                        <option value={"Merul"}>Merul</option>
                        <option value={"Demra"}>Demra</option> */}
                        <option value="" disabled selected>
                          Choose an Outlet
                        </option>
                        {AllOutlets.map((outlet) => (
                          <option
                            key={outlet?._id}
                            value={outlet?.outletName}
                          >
                            {outlet?.outletName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="">
                    <label
                      htmlFor="userRole"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Role
                    </label>
                    <br />
                    <div className="relative flex border border-gray-300 px-2 mt-1 rounded-md bg-white hover:border-gray-400">
                      <select
                        id="userRole"
                        name="userRole"
                        required
                        className="text-gray-600 h-10 pl-5 pr-10 w-full focus:outline-none appearance-none"
                      >
                        <option value={"BA"}>Branch Admin</option>
                        <option value={"HQ"}>Head Office</option>
                        <option value={"AD"}>Admin</option>
                        <option value={"MGR"}>Manager</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      placeholder="First Name"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletLocation"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletName"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Phone Number
                    </label>
                    <input
                      type="number"
                      id="phoneNumber"
                      name="phoneNumber"
                      required
                      defaultValue={880}
                      placeholder="Phone Number"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <label
                      htmlFor="outletLocation"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      defaultValue="@bestelectronics.com.bd"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none "
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full md:col-span-2">
                    <label
                      htmlFor="outletLocation"
                      className="text-sm font-semibold text-gray-600"
                    >
                      Password
                    </label>
                    <input
                      type="text"
                      id="password"
                      name="password"
                      required
                      placeholder="********"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none"
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
    </div>
  );
}
