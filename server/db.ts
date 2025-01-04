import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Error: SUPABASE_URL and SUPABASE_ANON_KEY must be defined in .env");
    process.exit(1); // Exit the process with an error code
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*async function checkSupabaseConnection() {
    try {
        // Check the connection by executing a simple query
        const { data, error } = await supabase.from('users').select('id').limit(1); // Request minimal data

        if (error) {
            console.error("Error connecting to Supabase:", error);
            console.error("Error details:", error.message); // Output the error message for debugging
            if (error.details) {
              console.error("Additional details:", error.details);
            }
            if (error.hint) {
              console.error("Hint:", error.hint);
            }
            process.exit(1); // Exit the process if there is an error
        } else if (!data) {
            console.error("Error: The request to Supabase returned an empty result, check the users table");
            process.exit(1);
        } else {
            console.log("Successful connection to Supabase!");
            console.log("The test was successful, received user ID:", data)
            // Additional connection information (optional):
            console.log("Supabase URL:", supabaseUrl);
        }
    } catch (error) {
        console.error("Unexpected error when checking the connection:", error);
        process.exit(1);
    }
}

// Call the check function when importing the module
checkSupabaseConnection();*/

export default supabase;