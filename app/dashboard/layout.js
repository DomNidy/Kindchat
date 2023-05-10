import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <section>
      <Sidebar />
      {children}
    </section>
  );
}
