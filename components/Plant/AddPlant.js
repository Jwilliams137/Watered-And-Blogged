import { useState } from 'react';
import { collection, addDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const AddPlant = () => {
  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const userId = auth.currentUser.uid;
      const plantData = {
        name: plantName,
        type: plantType,
        ownerId: userId, // Optionally store owner ID for reference
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, `users/${userId}/plants`), plantData);
      console.log('Plant added with ID: ', docRef.id);

      // Optionally clear form fields or handle success message
      setPlantName('');
      setPlantType('');
    } catch (error) {
      console.error('Error adding plant: ', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={plantName}
        onChange={(e) => setPlantName(e.target.value)}
        placeholder="Plant Name"
      />
      <input
        type="text"
        value={plantType}
        onChange={(e) => setPlantType(e.target.value)}
        placeholder="Plant Type"
      />
      <button type="submit">Add Plant</button>
    </form>
  );
};

export default AddPlant;



