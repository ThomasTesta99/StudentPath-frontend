import { authClient } from "@/lib/auth-client";
import { AuthProvider } from "@refinedev/core";


export const authProvider: AuthProvider = { 
  login: async ({email, password} : {email: string, password: string}) => {
      try {
          const {error} = await authClient.signIn.email({
              email, 
              password,
          });
  
          if(error){
              console.error("Login error from auth client: ", error);
              return {
                  success: false, 
                  error: {
                      name: "Login failed", 
                      message: "Login failed. Please try again later",
                  }
              }
          }
  
          return {
              success: true, 
              redirectTo: '/'
          }
      } catch (error) {
          console.error("Login exception:", error);
          return {
              success: false,
              error: {
              name: "Login failed",
              message: "Please try again later.",
              },
          };
      }
    },
  logout: async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        console.error("Logout error:", error);
        return {
          success: false,
          error: {
            name: "Logout failed",
            message: "Unable to log out. Please try again.",
          },
        };
      }

      return {
        success: true,
        redirectTo: "/login",
      };
    } catch (error) {
      console.error("Logout exception: ", error);
      return {
        success: false, 
        error: {
          name: "Logout failed", 
          message: "Unable to log out. Please try again"
        }
      }
    }
  },
  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    const {data: session, error} = await authClient.getSession();
    
    if(error){
      console.error("Session check error: ", error);
      return {
        authenticated: false, 
        logout: true,
        redirectTo: "/login", 
        error: {
          name: "Unauthorized", 
          message: "Session check failed"
        }
      }
    }

    if(!session?.user){
      return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
      error: {
        name: "Unauthorized",
        message: "Session check failed",
      },
    };
    }
    
    return {
      authenticated: true,
    };
  },

  getIdentity: async () => {
    const {data: session, error} = await authClient.getSession();
    if(error){
      console.error("Get identity error: ", error);
      return null;
    }

    if(!session || !session.user){
      return null;
    }

    return session.user;
  }
}