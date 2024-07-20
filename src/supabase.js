// supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pfltsmixqnmukxphydyl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbHRzbWl4cW5tdWt4cGh5ZHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkyMTk3NzcsImV4cCI6MjAzNDc5NTc3N30.PLXrDNSEkY4YG6jbJlbPaElgYpm-xHFIf6IkZUa29Z0';

export const supabase = createClient(supabaseUrl, supabaseKey);
