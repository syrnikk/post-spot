"use client";

import { FormEvent, useState } from "react";
import { SignInResponse, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(""); // Reset error message

    const response: SignInResponse | undefined = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if(response === undefined) {
      setErrorMessage("Problem to sign in");
      return;
    }
    if (response.ok) {
      router.push('/'); // Redirect to home page on successful login
    } else {
      // Handle different error scenarios here
      if (response.error === "CredentialsSignin") {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        {errorMessage && (
          <div className="text-red-500 mb-2">{errorMessage}</div>
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2"
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
          placeholder="Password"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Sign In
        </button>
      </form>
    </div>
  );
}