"use client";
import UsersTable from "@/components/dashboard/userpage/UserTable";
import PageHead from "@/components/global/pageHead/PageHead";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchUsers } from "@/redux/slice/usersSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function UserManagementPage() {
  const dispatch = useDispatch();

  const users = useSelector((state) => state?.users?.users?.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const AllUsers = users ? users : [];
  return (
    <main>
      {AllUsers.length > 0 ? (
        <div>
          <PageHead pageHead="User Management" />
          <UsersTable AllUsers={AllUsers} />
        </div>
      ) : (
        <Skeleton />
      )}
    </main>
  );
}
