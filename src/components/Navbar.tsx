'use client'

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

const Navbar = () => {
    const { data: session } = useSession();
  
    return (
      <nav className="bg-gray-800 text-white p-4 flex justify-between">
        <div className="flex space-x-8">
          <Link href="/" className="text-white hover:text-gray-300">
            POST SPOT
          </Link>
          <Link href="/post/createPost" className="text-white hover:text-gray-300">
            New Post
          </Link>
        </div>
  
        <div className="flex space-x-4">
          {session ? (
            <>
              <span className="flex items-center">
                <span className="mr-2">{session.user.email}</span>
                <button onClick={() => signOut()} className="text-white hover:text-gray-300">Sign out</button>
              </span>
            </>
          ) : (
            <>
              <Link href="/auth/signIn" className="text-white hover:text-gray-300">
                Sign In
              </Link>
              <Link href="/auth/signUp" className="text-white hover:text-gray-300">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    );
  };

export default Navbar;