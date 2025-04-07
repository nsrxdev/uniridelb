import { supabase } from "./supabase"

// Create stored procedures for table creation
export const createStoredProcedures = async () => {
  // Create universities table procedure
  const createUniversitiesTableSQL = `
  CREATE OR REPLACE FUNCTION create_universities_table()
  RETURNS void AS $$
  BEGIN
    CREATE TABLE IF NOT EXISTS universities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      lat FLOAT NOT NULL,
      lng FLOAT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END;
  $$ LANGUAGE plpgsql;
  `

  // Create car_models table procedure
  const createCarModelsTableSQL = `
  CREATE OR REPLACE FUNCTION create_car_models_table()
  RETURNS void AS $$
  BEGIN
    CREATE TABLE IF NOT EXISTS car_models (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END;
  $$ LANGUAGE plpgsql;
  `

  try {
    // Create the stored procedures
    const { error: universitiesError } = await supabase.rpc("create_universities_table_function", {
      sql: createUniversitiesTableSQL,
    })

    if (universitiesError) {
      console.error("Error creating universities table procedure:", universitiesError)
    }

    const { error: carModelsError } = await supabase.rpc("create_car_models_table_function", {
      sql: createCarModelsTableSQL,
    })

    if (carModelsError) {
      console.error("Error creating car_models table procedure:", carModelsError)
    }

    console.log("Stored procedures created successfully")
  } catch (error) {
    console.error("Error creating stored procedures:", error)
  }
}

