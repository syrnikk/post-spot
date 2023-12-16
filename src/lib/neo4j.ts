import { driver, auth } from 'neo4j-driver';

// Connect to Neo4j database
const neo4jDriver = driver(
  process.env.NEO4J_URI as string,
  auth.basic(process.env.NEO4J_USER as string, process.env.NEO4J_PASSWORD as string)
);

export default neo4jDriver;