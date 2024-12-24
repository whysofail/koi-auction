import { Response } from "express";

export const handleMissingFields = (
  res: Response,
  fields: { [key: string]: any }, // Expecting an object with key-value pairs
): boolean => {
  // Find keys with null, undefined, or empty values
  const missingFields = Object.keys(fields).filter(
    (key) => fields[key] == null || fields[key] === "",
  );

  // If there are missing fields, return true and respond with the names of the missing fields
  if (missingFields.length > 0) {
    res.status(400).json({
      message: "Missing required fields",
      missingFields,
    });
    return true;
  }

  return false;
};

// Generalized handleNotFound for any entity
export const handleNotFound = (
  entity: string, // Name of the entity (e.g., User, Auction)
  res: Response,
): boolean => {
  res.status(404).json({ message: `${entity} not found` });
  return true;
};
