import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";

export default function DashboardLayout({ children }) {
  return (
    <section>
      <Sidebar />
      {children}
    </section>
  );
}
