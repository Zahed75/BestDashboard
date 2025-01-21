"use client";
import CustomersTable from "@/components/dashboard/customers/CustomerTable";
import PageHead from "@/components/global/pageHead/PageHead";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchCustomers } from "@/redux/slice/customersSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CustomersPage() {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state?.customer?.customers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const AllCustomers = customers?.customer;
  const data = AllCustomers || [];

  console.log("AllCustomers", data);

  return (
    <main>
      {data?.length === 0 ? (
        <Skeleton />
      ) : (
        <div>
          <PageHead pageHead="Customers" />
          <CustomersTable AllCustomers={AllCustomers} />
        </div>
      )}
    </main>
  );
}
