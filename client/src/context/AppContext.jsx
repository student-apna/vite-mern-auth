import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  // ✅ Default backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Set credentials for all axios requests
  axios.defaults.withCredentials = true;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // ✅ Get user data after auth success
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch user data");
    }
  };

  // ✅ Check if user is authenticated
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        getUserData(); // Fetch user info
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Auth check failed");
    }
  };

  // ✅ On component mount
  useEffect(() => {
    getAuthState();
  }, []);

  // ✅ Shared context values
  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
