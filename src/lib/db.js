import { supabase } from "./supabase";

// User operations
export async function createUser(userData) {
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
    .select();

  return { data, error };
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return { data, error };
}

export async function updateUser(id, updates) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select();

  return { data, error };
}

// Generic query function for compatibility
export async function query(sql, params = []) {
  // For Supabase, we'll use the RPC function or direct table access
  // This is a simplified version - you might want to use specific Supabase methods
  const { data, error } = await supabase.rpc("custom_query", { sql, params });
  return data;
}

export async function queryOne(sql, params = []) {
  const result = await query(sql, params);
  return result?.[0];
}

export async function run(sql, params = []) {
  // For Supabase, this would typically be an insert/update/delete operation
  // Implementation depends on your specific needs
  return { success: true };
}

export async function closeDB() {
  // Supabase handles connection management automatically
  return Promise.resolve();
}
