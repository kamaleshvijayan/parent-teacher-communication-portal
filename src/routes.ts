import { createBrowserRouter } from "react-router-dom";
import { Root } from "./components/root";
import { Login } from "./components/login";
import { Dashboard } from "./components/dashboard";
import { Messages } from "./components/messages";
import { Compose } from "./components/compose";
import { Announcements } from "./components/announcements";
import { Students } from "./components/students";
import { AdminDashboard } from "./components/admin-dashboard";
import { ManageTeachers } from "./components/manage-teachers";
import { ManageStudents } from "./components/manage-students";
import { ManageAnnouncements } from "./components/manage-announcements";
import { FaceAttendance } from "./components/face-attendance";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "dashboard", Component: Dashboard },
      { path: "messages", Component: Messages },
      { path: "compose", Component: Compose },
      { path: "announcements", Component: Announcements },
      { path: "students", Component: Students },
      { path: "admin", Component: AdminDashboard },
      { path: "admin/teachers", Component: ManageTeachers },
      { path: "admin/students", Component: ManageStudents },
      { path: "admin/announcements", Component: ManageAnnouncements },
      { path: "attendance", Component: FaceAttendance },
    ],
  },
]);
