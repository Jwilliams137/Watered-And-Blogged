'use client';
import { useRouter } from 'next/navigation'; // Use next/navigation in the new app directory
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase'; // Adjust this path if needed
import { useParams } from 'next/navigation'; // Import useParams

const UserProfilePage = () => {
  const router = useRouter();
  const params = useParams(); // Use useParams to get dynamic route parameters
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = params.id; // Get user ID from params

    if (userId) { // Check if user ID is defined
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          console.log('userDoc:', userDoc.data()); // Log the retrieved document data

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
  }, [params]);

  // Render the user data, loading state, or error message
  return (
    <div>
      {loading && <p>Loading user data...</p>}
      {error && <p>Error: {error}</p>}
      {userData && (
        <>
          <img src={userData.profilePicture} alt={`${userData.name}'s profile`} /> {/* Display profile picture */}
          <h2>{userData.name}</h2> {/* Display user name */}
          <p>{userData.aboutMe}</p> {/* Display user bio */}
        </>
      )}
    </div>
  );
};

export default UserProfilePage;











