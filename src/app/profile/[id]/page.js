'use client'
import { useRouter } from 'next/navigation'; // Use next/navigation in the new app directory
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Adjust this path if needed

const UserProfilePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.asPath) { // Check if router.asPath is defined
      const userId = router.asPath.split('/').pop(); // Extract user ID from the URL

      if (userId) {
        const fetchUserData = async () => {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            console.log('userDoc:', userDoc); // Log the retrieved document

            if (userDoc.exists()) {
              setUserData(userDoc.data());
            } else {
              setError('User not found');
            }
          } catch (err) {
            setError('Failed to fetch user data');
            console.error('Error fetching user data:', err);
          } finally {
            setLoading(false);
          }
        };

        fetchUserData();
      } else {
        setLoading(false);
        setError('User ID not found in the URL');
      }
    }
  }, [router.asPath]);

  // Render the user data, loading state, or error message
  return (
    <div>
      {loading && <p>Loading user data...</p>}
      {error && <p>Error: {error}</p>}
      {userData && (
        <>
          <h2>{userData.name}</h2> {/* Replace with actual user data fields */}
          <p>{userData.bio}</p> {/* Replace with actual user data fields */}
          {/* ... Render other user data as needed */}
        </>
      )}
    </div>
  );
};

export default UserProfilePage;









