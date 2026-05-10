import pool from "../config/db.js";
import calculateDistance from "../utils/calculateDistance.js";
import AppError from "../utils/AppError.js";

const normalizeText = (value) => value.trim().replace(/\s+/g, " ");

const isFiniteCoordinate = (value) => Number.isFinite(value);

export const addSchoolService = async (schoolData) => {
  const normalizedName = normalizeText(schoolData.name);
  const normalizedAddress = normalizeText(schoolData.address);
  const latitude = Number(schoolData.latitude);
  const longitude = Number(schoolData.longitude);

  if (!isFiniteCoordinate(latitude) || !isFiniteCoordinate(longitude)) {
    throw new AppError("Latitude and longitude must be valid numbers", 400);
  }

  const duplicateLookupQuery = `
    SELECT id
    FROM schools
    WHERE LOWER(TRIM(name)) = LOWER(?)
      AND LOWER(TRIM(address)) = LOWER(?)
      AND latitude = ?
      AND longitude = ?
    LIMIT 1
  `;

  const [duplicateRows] = await pool.execute(duplicateLookupQuery, [
    normalizedName,
    normalizedAddress,
    latitude,
    longitude,
  ]);

  if (duplicateRows.length > 0) {
    throw new AppError(
      "Duplicate school detected. A school with the same name, address, latitude, and longitude already exists.",
      409,
    );
  }

  const query = `
        INSERT INTO schools (name, address, latitude, longitude)
        VALUES (?, ?, ?, ?)
    `;

  let result;

  try {
    [result] = await pool.execute(query, [
      normalizedName,
      normalizedAddress,
      latitude,
      longitude,
    ]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new AppError(
        "Duplicate school detected. A school with the same name, address, latitude, and longitude already exists.",
        409,
      );
    }

    throw error;
  }

  return {
    message: "School added successfully",
    schoolId: result.insertId,
  };
};

export const getSchoolsService = async (userLat, userLon) => {
  if (!isFiniteCoordinate(userLat) || !isFiniteCoordinate(userLon)) {
    throw new AppError("Latitude and longitude must be valid numbers", 400);
  }

  const query = `
        SELECT * FROM schools
    `;

  const [schools] = await pool.execute(query);

  const schoolsWithDistance = schools
    .filter(
      (school) =>
        isFiniteCoordinate(Number(school.latitude)) &&
        isFiniteCoordinate(Number(school.longitude)),
    )
    .map((school) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        school.latitude,
        school.longitude,
      );

      return {
        ...school,
        distance: Number(distance.toFixed(2)),
      };
    });

  schoolsWithDistance.sort((a, b) => a.distance - b.distance);

  return schoolsWithDistance;
};
