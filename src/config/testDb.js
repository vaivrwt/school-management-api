import pool from "./db.js";

const UNIQUE_INDEX_NAME = "uk_school_identity";

const createSchoolsTable = async (connection) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL
    )
  `;

  await connection.execute(createTableQuery);
};

const ensureUniqueIndex = async (connection) => {
  const indexLookupQuery = `
    SELECT 1
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'schools'
      AND INDEX_NAME = ?
    LIMIT 1
  `;

  const [indexRows] = await connection.execute(indexLookupQuery, [
    UNIQUE_INDEX_NAME,
  ]);

  if (indexRows.length > 0) {
    return;
  }

  const addUniqueIndexQuery = `
    ALTER TABLE schools
    ADD CONSTRAINT ${UNIQUE_INDEX_NAME}
    UNIQUE (name, address, latitude, longitude)
  `;

  await connection.execute(addUniqueIndexQuery);
};

const testDBConnection = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL Database Connected Successfully");

    await createSchoolsTable(connection);
    await ensureUniqueIndex(connection);

    console.log("schools table is ready with uniqueness constraints");

    connection.release();
  } catch (error) {
    console.error("Database Connection Failed");

    if (error.code === "ER_DUP_ENTRY") {
      console.error(
        "Cannot enforce unique school constraint because duplicate rows already exist in the database.",
      );
      console.error(
        "Please remove duplicate school records, then restart the server.",
      );
    } else {
      console.error(error.message);
    }

    process.exit(1);
  }
};

export default testDBConnection;
