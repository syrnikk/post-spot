import { Neo4jDateTime } from "@/types";

export function convertNeo4jDateToDate(neo4jDate: Neo4jDateTime) {
  return new Date(
    neo4jDate.year.low,
    neo4jDate.month.low - 1,
    neo4jDate.day.low,
    neo4jDate.hour.low,
    neo4jDate.minute.low,
    neo4jDate.second.low,
    Math.floor(neo4jDate.nanosecond.low / 1000000)
  );
}

export function formatNeo4jDate(neo4jDate: Neo4jDateTime) {
  const day = neo4jDate.day.low.toString().padStart(2, "0");
  const month = neo4jDate.month.low.toString().padStart(2, "0");
  const year = neo4jDate.year.low;
  const hours = neo4jDate.hour.low.toString().padStart(2, "0");
  const minutes = neo4jDate.minute.low.toString().padStart(2, "0");
  const seconds = neo4jDate.second.low.toString().padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
