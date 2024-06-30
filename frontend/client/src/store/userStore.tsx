import { create } from "zustand";

const baseURL = "/api";
const checkAuth = "/checkAuth";
const logOut = "/logout";
const logIn = "/login";

type UserState = {
  loggedIn: boolean;
  logIn: (username: string, password: string) => void;
  logOut: () => void;
  checkAuth: () => void;
};

const useUserStore = create<UserState>((set, get) => ({
  loggedIn: false,
  logIn: async (username: string, password: string) => {
    try {
      const response = await fetch(baseURL + logIn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        mode: "cors",
        credentials: "include",
      });

      if (response.status === 200) {
        set({ loggedIn: true });
        return;
      } else {
        const errorMessage = await response.text();
        console.log("errorMessage", errorMessage);
        alert("Incorrect password!");
        return;
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  },
  checkAuth: async () => {
    let authRes = await fetch(baseURL + checkAuth, {
      method: "POST",
      credentials: "include",
    });
    // let data = authRes.text;
    if (authRes.status === 200) {
      console.log("Success!");
      set({ loggedIn: true });
      return;
    }
    console.log("Failed", authRes);
    return;
  },
  logOut: async () => {
    await fetch(baseURL + logOut, {
      method: "POST",
      credentials: "include",
    });

    set({ loggedIn: false });
    return;
  },
}));

export default useUserStore;
