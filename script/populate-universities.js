import { createClient } from '@supabase/supabase-js'

// Use the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Using service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample universities data for Lebanon
const universities = [
  { name: 'American University of Beirut (AUB)', city: 'Beirut', lat: 33.9, lng: 35.48 },
  { name: 'Lebanese American University (LAU)', city: 'Beirut', lat: 33.89, lng: 35.47 },
  { name: 'Notre Dame University (NDU)', city: 'Zouk Mosbeh', lat: 33.98, lng: 35.62 },
  { name: 'Université Saint-Joseph (USJ)', city: 'Beirut', lat: 33.88, lng: 35.5 },
  { name: 'Lebanese University (LU)', city: 'Beirut', lat: 33.87, lng: 35.51 },
  { name: 'University of Balamand', city: 'Koura', lat: 34.37, lng: 35.76 },
  { name: 'Beirut Arab University (BAU)', city: 'Beirut', lat: 33.88, lng: 35.49 },
  { name: 'Holy Spirit University of Kaslik (USEK)', city: 'Jounieh', lat: 33.98, lng: 35.65 }
]

async function checkAndPopulateUniversities() {
  try {
    console.log('Checking universities table...')
    
    // First, check if the universities table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('universities')
      .select('count(*)', { count: 'exact', head: true })
    
    if (tableError) {
      if (tableError.code === 'PGRST116') {
        console.log('Universities table does not exist. Creating table...')
        
        // Create the universities table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS universities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            lat FLOAT NOT NULL,
            lng FLOAT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
        
        const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
        
        if (createError) {
          console.error('Error creating universities table:', createError)
          
          // Alternative approach: Try to insert directly and let Supabase create the table
          console.log('Trying direct insert to create table...')
          const { error: insertError } = await supabase
            .from('universities')
            .insert(universities)
          
          if (insertError) {
            console.error('Failed to create table via direct insert:', insertError)
            return
          } else {
            console.log('Successfully created universities table and inserted data!')
            return
          }
        }
        
        console.log('Universities table created successfully')
      } else {
        console.error('Error checking universities table:', tableError)
        return
      }
    }
    
    // Check if there are any universities in the table
    const { data: existingUniversities, error: fetchError } = await supabase
      .from('universities')
      .select('*')
    
    if (fetchError) {
      console.error('Error fetching universities:', fetchError)
      return
    }
    
    console.log(`Found ${existingUniversities?.length || 0} universities in the database`)
    
    // If no universities exist, insert the sample data
    if (!existingUniversities || existingUniversities.length === 0) {
      console.log('No universities found. Adding sample data...')
      
      const { data, error } = await supabase
        .from('universities')
        .insert(universities)
        .select()
      
      if (error) {
        console.error('Error inserting universities:', error)
      } else {
        console.log(`Successfully added ${data.length} universities:`)
        data.forEach(uni => console.log(`- ${uni.name} (${uni.city})`))
      }
    } else {
      console.log('Universities already exist in the database:')
      existingUniversities.forEach(uni => console.log(`- ${uni.name} (${uni.city})`))
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the function
checkAndPopulateUniversities()