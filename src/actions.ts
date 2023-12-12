'use server'

import bcrypt from 'bcryptjs';
import neo4jDriver from './lib/neo4j';

export async function registerUser(email, password, firstName, lastName) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const session = neo4jDriver.session();
  try {
    // Check if a user with the given email already exists
    const existingUserResult = await session.run(
      'MATCH (u:User {email: $email}) RETURN u',
      { email }
    );

    if (existingUserResult.records.length > 0) {
      throw new Error('EmailExists');
    }

    // Proceed with creating the new user
    const result = await session.run(
      'CREATE (u:User {email: $email, password: $hashedPassword, firstName: $firstName, lastName: $lastName}) RETURN u',
      { email, hashedPassword, firstName, lastName }
    );

    return result.records[0]?.get('u').properties;
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
        'MATCH (u:User {email: $email}) RETURN u',
        { email }
      );
  
      const user = result.records[0]?.get('u').properties;
      if (user && await bcrypt.compare(password, user.password)) {
        return { email: user.email, name: user.name }; // Return user details (excluding password)
      } else {
        return null;
      }
    } catch (error) {
      throw new Error('Error verifying user: ' + error.message);
    } finally {
      await session.close();
    }
  }
