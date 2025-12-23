
// Supabase Configuration
// Project URL: https://qwcrzqgktaastahajyhl.supabase.co
// API Key provided by user

const supabaseUrl = 'https://qwcrzqgktaastahajyhl.supabase.co';
const supabaseKey = 'sb_publishable_icTBi0UlgrnInKyHRMFXMA_Gn8rmSke';

// Initialize Supabase Client
// Ensure the library is loaded in HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
let supabase = null;

if (window.supabase) {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Supabase initialized successfully");
} else {
    console.error("Supabase JS library not loaded!");
}
