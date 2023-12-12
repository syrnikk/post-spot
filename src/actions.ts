"use server";

import bcrypt from "bcryptjs";
import neo4jDriver from "./lib/neo4j";

export async function registerUser(email, password, firstName, lastName) {
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

    return result.records[0]?.get("u").properties;
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export async function authenticateUser(email, password) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      "MATCH (u:User {email: $email}) RETURN u",
      { email }
    );

    const user = result.records[0]?.get("u").properties;
    if (user && (await bcrypt.compare(password, user.password))) {
      return { email: user.email, firstName: user.firstName, lastName: user.lastName }; 
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Error verifying user: " + error.message);
  } finally {
    await session.close();
  }
}

export async function createPost(userEmail, textContent) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      "MATCH (u:User {email: $userEmail}) " +
        "CREATE (p:Post {uuid: apoc.create.uuid(), textContent: $textContent, createdAt: datetime()}) " +
        "CREATE (u)-[:CREATED]->(p) " +
        "RETURN p",
      { userEmail, textContent }
    );
    const response = result.records[0]?.get("p").properties;
    return JSON.stringify(response);
  } catch (error) {
    throw new Error("Error creating post: " + error.message);
  } finally {
    await session.close();
  }
}

export async function getAllPosts() {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      'MATCH (u:User)-[:CREATED]->(p:Post) ' +
      'OPTIONAL MATCH (p)<-[:ON]-(c:Comment) ' +
      'RETURN p AS post, u AS user, count(c) AS commentCount ' +
      'ORDER BY p.createdAt DESC'
    );
    const response = result.records.map(record => ({
      post: record.get('post').properties,
      user: record.get('user').properties,
      commentsCount: record.get('commentCount').toInt()
    }));
    return JSON.stringify(response);
  } catch (error) {
    throw new Error('Error fetching posts: ' + error.message);
  } finally {
    await session.close();
  }
}

export async function getCommentsByPostUuid(postUuid) {
  const session = neo4jDriver.session();
  try {
    const result = await session.run(
      'MATCH (p:Post {uuid: $postUuid})<-[:ON]-(c:Comment)<-[:WROTE]-(u:User) ' +
      'RETURN c AS comment, u AS user ' +
      'ORDER BY c.createdAt DESC',
      { postUuid }
    );
    const response = result.records.map(record => ({
      comment: record.get('comment').properties,
      user: record.get('user').properties,
    }));
    return JSON.stringify(response);
  } catch (error) {
    throw new Error('Error fetching comments: ' + error.message);
  } finally {
    await session.close();
  }
}

export async function addCommentToPost(postUuid, userEmail, commentText) {
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
    throw new Error('Error adding comment: ' + error.message);
  } finally {
    await session.close();
  }
}

export async function deletePostAndComments(postUuid, userEmail) {
  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (u:User {email: $userEmail})-[:CREATED]->(p:Post {uuid: $postUuid}) ' +
      'OPTIONAL MATCH (p)-[:HAS_COMMENT]->(c:Comment) ' +
      'DETACH DELETE p, c',
      { postUuid, userEmail }
    );
  } catch (error) {
    throw new Error('Error deleting post and comments: ' + error.message);
  } finally {
    await session.close();
  }
}

export async function deleteComment(commentUuid, userEmail) {
  const session = neo4jDriver.session();
  try {
    await session.run(
      'MATCH (c:Comment {uuid: $commentUuid})<-[:WROTE]-(u:User {email: $userEmail}) ' +
      'DETACH DELETE c',
      { commentUuid, userEmail }
    );
  } catch (error) {
    throw new Error('Error deleting comment: ' + error.message);
  } finally {
    await session.close();
  }
}