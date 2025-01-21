"use client"; 
import ReportingOverView from "@/components/dashboard/reporting/ReportingOverview";
import DashboardTable from "@/components/dashboard/table/DashboardTable";
import PageHead from "@/components/global/pageHead/PageHead";
import { withAuth } from "@/components/withAuth";
// import withAuth from "@/components/withAuth";

function DashboardPage() {
  return (
    <main className="w-full">
      <PageHead pageHead="Dashboard" />
      <ReportingOverView />
      <DashboardTable />
    </main>
  );
}

export default withAuth(DashboardPage);