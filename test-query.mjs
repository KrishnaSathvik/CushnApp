import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zvbitbjniciktfhpcpfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Yml0YmpuaWNpa3RmaHBjcGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjQwMjAsImV4cCI6MjA4ODMwMDAyMH0.PTAULfWmt8kIkbCuz5fkjdaCE0cdZY68EL1TTBiwP9c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'krishnasathvikm@gmail.com',
        password: 'Subtrack@2026*'
    });
    if (authErr) {
        console.error("Auth error:", authErr);
        return;
    }

    console.log("Logged in as:", authData.user.id);

    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('renewal_date', { ascending: true });

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log("Data length:", data.length);
    }
}

test();
