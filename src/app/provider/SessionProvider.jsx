import { createContext, useContext, useState, useEffect } from 'react';
import { client } from '@/utils/appwrite';
import { Account } from 'appwrite';
import { useRouter } from 'next/navigation';  // or 'next/router' depending on your Next.js version

// Create a Context for the session and user profile
const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);  // Store user profile
  const [loading, setLoading] = useState(true);  // To track loading state
  const [error, setError] = useState(null);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const fetchSession = async () => {
      const account = new Account(client);

      try {
        // Attempt to get the current session
        const sessionData = await account.getSession('current');
        setSession(sessionData);  // Store session data in state
        setError(null);  // Reset any error
        
        // Fetch the current user profile once session is fetched
        const userData = await account.get();  // Get user profile
        setUserProfile(userData);  // Store user profile

      } catch (err) {
        // Handle errors (e.g., no active session)
        setError('No active session found or session expired');
        setSession(null);  // Set session to null if there's no session
        setUserProfile(null);  // Reset user profile
      } finally {
        setLoading(false);  // Stop loading once done
      }
    };

    fetchSession(); // Fetch session on mount
  }, []);  // Empty dependency array to run only once on mount

  // Redirect to login page if no session is found
  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/auth1/login');  // Redirect to login page if no session
      return
    }

    router.push("/")
  }, [loading, session, router]);

  return (
    <SessionContext.Provider value={{ session, userProfile, loading, error }}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
