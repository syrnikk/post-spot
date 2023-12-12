'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { registerUser } from '../../../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try{
      await registerUser(email, password, firstName, lastName);
      router.push('/auth/signIn');
    } catch(error) {
      if(error.message == 'EmailExists') {
        setErrorMessage('Email already exists');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
      <form onSubmit={handleRegister} className="w-full max-w-xs flex flex-col gap-4">
        {errorMessage && (
          <div className="text-red-500 mb-2">{errorMessage}</div>
        )}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2" placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2" placeholder="Password" />
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border p-2" placeholder="First Name" />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border p-2" placeholder="Last Name" />
        <button type="submit" className="bg-blue-500 text-white p-2">Register</button>
      </form>
    </div>
  );
};
