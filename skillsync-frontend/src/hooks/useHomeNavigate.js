import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const HOME_BY_ROLE = {
  student: "/student/dashboard",
  mentor: "/mentor/dashboard",
  admin: "/admin/dashboard",
};

export default function useHomeNavigate() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return () => {
    navigate(HOME_BY_ROLE[user?.role] || "/");
  };
}
