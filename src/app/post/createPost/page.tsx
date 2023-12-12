'use client'

import React, { useEffect, useState } from 'react';
import { createPost } from '@/actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [textContent, setTextContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPost(session?.user.email, textContent);
      setTextContent('');
      router.push('/');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  useEffect(() => {
    // If there's no session and the session status is not "loading", redirect to the login page
    if (status !== 'loading' && !session) {
      router.push('/auth/signIn');
    }
  }, [session, status, router]);

  if (!session) return <p>Loading...</p>;

  return (
    <div className="flex justify-center items-center mt-6">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl p-5 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create a Post</h2>
        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-32 p-2 mb-4 border border-gray-300 rounded"
        />
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Post
        </button>
      </form>
    </div>
  );
}