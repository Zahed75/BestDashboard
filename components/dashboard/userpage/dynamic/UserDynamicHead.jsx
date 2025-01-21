import Link from "next/link";

export default function UserDynamicHead({ user }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-start items-center">
        <Link href="/dashboard/usermanagement">
          <svg
            width="19"
            height="32"
            viewBox="0 0 19 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="cursor-pointer w-5 md:w-10 h-5 md:h-10"
          >
            <path d="M17 2L3 16L17 30" stroke="black" strokeWidth="3" />
          </svg>
        </Link>

        <h1 className="text-lg md:text-5xl font-semibold ml-5">
          {user?.firstName + " " + user?.lastName}
        </h1>
      </div>
      <div className="text-lg"></div>
    </div>
  );
}
