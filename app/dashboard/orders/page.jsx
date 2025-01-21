"use client";
import PageHead from "@/components/global/pageHead/PageHead";
import OrderTable from "@/components/dashboard/orderpage/OrderTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "@/redux/slice/orderSlice";
import { useEffect, useState } from "react";
import Skeleton from "@/components/global/skeleton/Skeleton";
import { fetchApi } from "@/utils/FetchApi";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state?.orders);
  const [branchBasedOrders, setBranchBasedOrders] = useState([]);
  const [isBranchAdmin, setIsBranchAdmin] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if ((user?.role === "BA" || user?.role === "MGR")) {
        setIsBranchAdmin(true);
        try {
          const response = await fetchApi(
            `/outlet/orders-by-manager/${user.userId}`,
            "GET"
          );

          setBranchBasedOrders(response.orders || []);
        } catch (error) {
          console.error("Error fetching manager orders:", error);
        }
      } else {
        setBranchBasedOrders([]);
      }
    };

    fetchOrders();
  }, []);

  const AllOrders = orders?.orders?.orders || [];
  const data = isBranchAdmin ? branchBasedOrders : AllOrders;

  return (
    <main>
      {data.length === 0 ? (
        <Skeleton />
      ) : (
        <div>
          <PageHead pageHead="Orders" />
          <OrderTable AllOrders={data?.slice().reverse()} />
        </div>
      )}
    </main>
  );
}
