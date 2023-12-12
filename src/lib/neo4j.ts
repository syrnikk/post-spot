import { driver, auth } from 'neo4j-driver';

// Connect to Neo4j database
const neo4jDriver = driver(
  process.env.NEO4J_URI,
  auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

export default neo4jDriver;