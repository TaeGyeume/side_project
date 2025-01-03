import React, { useState } from "react";
import { addUser } from "./api/userService";

const App = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "male",
    birthdate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, name, email, password, phone, gender, birthdate } = formData;

    try {
      const newUser = await addUser(username, name, email, password, phone, gender, birthdate);
      console.log("User added:", newUser);
      setFormData({
        username: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        gender: "male",
        birthdate: "",
      }); // 입력 필드 초기화
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  };

  return (
    <div>
      <h1>Add User</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input type="date" name="birthdate" placeholder="Birthdate" value={formData.birthdate} onChange={handleChange} required />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
};

export default App;
