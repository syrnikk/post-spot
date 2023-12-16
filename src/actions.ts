"use server";

import bcrypt from "bcryptjs";
import neo4jDriver from "./lib/neo4j";
import { User } from "./types";

export async function registerUser(email: string, password: string, firstName: string, lastName: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const session = neo4jDriver.session();
  try {
    // Check if a user with the given email already exists
    const existingUserResult = await session.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email }
    );

    if (existingUserResult.records.length > 0) {
      throw new Error("EmailExists");
    }

    // Proceed with creating the new user
    const result = await session.run(
      "CREATE (u:User {email: $email, password: $hashedPassword, firstName: $firstName, lastName: $lastName}) RETURN u",
      { email, hashedPassword, firstName, lastName }
    );
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email }
    );

    const user = result.records[0]?.get("u").properties;
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }; 
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Error verifying user");
  } finally {
    await session.close();
  }
}

export async function createPost(userEmail: string, textContent: string) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      "MATCH (u:User {email: $userEmail}) " +
        "CREATE (p:Post {uuid: apoc.create.uuid(), textContent: $textContent, createdAt: datetime()}) " +
        "CREATE (u)-[:CREATED]->(p) " +
        "RETURN p",
      { userEmail, textContent }
    );
    result.records[0]?.get("p").properties;
  } catch (error) {
    throw new Error("Error creating post");
  } finally {
    await session.close();
  }
}

export async function getAllPosts(userEmail: string) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      'MATCH (u:User)-[:CREATED]->(p:Post) ' +
      'OPTIONAL MATCH (p)<-[:ON]-(c:Comment) ' +
      'WITH p, u, count(c) AS commentCount ' +
      'OPTIONAL MATCH (p)<-[l:LIKES]-() ' +
      'WITH p, u, commentCount, count(l) AS likeCount ' +
      'OPTIONAL MATCH (liked:User {email: $userEmail})-[:LIKES]->(p) ' +
      'RETURN p AS post, ' +
      'u.firstName AS firstName, u.lastName AS lastName, u.email AS email, ' +
      'commentCount, likeCount, ' +
      'exists((liked)-[:LIKES]->(p)) AS isLikedByUser ' +
      'ORDER BY p.createdAt DESC',
      { userEmail }
    );
    const response = result.records.map(record => ({
      post: record.get('post').properties,
      user: {
        firstName: record.get('firstName'),
        lastName: record.get('lastName'),
        email: record.get('email')
      },
      commentsCount: record.get('commentCount').toInt(),
      isLikedByUser: record.get('isLikedByUser'),
      likeCount: record.get('likeCount').low
    }));
    return JSON.stringify(response);
  } catch (error) {
    throw new Error('Error fetching posts');
  } finally {
    await session.close();
  }
}

export async function getCommentsByPostUuid(postUuid: string) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      'MATCH (p:Post {uuid: $postUuid})<-[:ON]-(c:Comment)<-[:WROTE]-(u:User) ' +
      'RETURN c AS comment, ' +
      'u.firstName AS firstName, u.lastName AS lastName, u.email AS email ' +
      'ORDER BY c.createdAt DESC',
      { postUuid }
    );
    const response = result.records.map(record => ({
      comment: record.get('comment').properties,
      user: {
        firstName: record.get('firstName'),
        lastName: record.get('lastName'),
        email: record.get('email')
      }
    }));
    return JSON.stringify(response);
  } catch (error) {
    throw new Error('Error fetching comments');
  } finally {
    await session.close();
  }
}

export async function addCommentToPost(postUuid: string, userEmail: string, commentText: string) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      'MATCH (p:Post {uuid: $postUuid}), (u:User {email: $userEmail}) ' +
      'CREATE (c:Comment {uuid: apoc.create.uuid(), textContent: $commentText, createdAt: datetime()}) ' +
      'CREATE (u)-[:WROTE]->(c)-[:ON]->(p) ' +
      'RETURN c',
      { postUuid, userEmail, commentText }
    );
    const response = result.records[0]?.get('c').properties;
    return JSON.stringify(response);
  } catch (error) {
    throw new Error('Error adding comment');
  } finally {
    await session.close();
  }
}

export async function deletePostAndComments(postUuid: string, userEmail: string) {
  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (u:User {email: $userEmail})-[:CREATED]->(p:Post {uuid: $postUuid}) ' +
      'OPTIONAL MATCH (p)<-[:ON]-(c:Comment) ' +
      'DETACH DELETE p, c',
      { postUuid, userEmail }
    );
  } catch (error) {
    throw new Error('Error deleting post and comments');
  } finally {
    await session.close();
  }
}

export async function deleteComment(commentUuid: string, userEmail: string) {
  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (c:Comment {uuid: $commentUuid})<-[:WROTE]-(u:User {email: $userEmail}) ' +
      'DETACH DELETE c',
      { commentUuid, userEmail }
    );
  } catch (error) {
    throw new Error('Error deleting comment');
  } finally {
    await session.close();
  }
}

export async function likePost(postUuid: string, userEmail: string) {
  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (u:User {email: $userEmail}), (p:Post {uuid: $postUuid}) ' +
      'MERGE (u)-[:LIKES]->(p)',
      { postUuid, userEmail }
    );
  } catch (error) {
    throw new Error('Error liking post');
  } finally {
    await session.close();
  }
}

export async function unlikePost(postUuid: string, userEmail: string) {
  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (u:User {email: $userEmail})-[l:LIKES]->(p:Post {uuid: $postUuid}) ' +
      'DELETE l',
      { postUuid, userEmail }
    );
  } catch (error) {
    throw new Error('Error unliking post');
  } finally {
    await session.close();
  }
}