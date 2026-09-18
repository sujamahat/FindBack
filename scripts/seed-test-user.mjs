// Creates (or resets) a confirmed dev test user in Supabase.
// Usage: npm run seed:user   (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.TEST_USER_EMAIL ?? "test@example.com";
const password = process.env.TEST_USER_PASSWORD ?? "password123";

if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local\n" +
      "(Supabase dashboard → Project Settings → API → service_role key)."
  );
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (error && !/already|registered|exists/i.test(error.message)) {
  console.error("Failed:", error.message);
  process.exit(1);
}
if (error) {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const user = data?.users.find((u) => u.email === email);
  if (!user) {
    console.error("User exists but could not be found:", error.message);
    process.exit(1);
  }
  const { error: upErr } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (upErr) {
    console.error("Failed to reset password:", upErr.message);
    process.exit(1);
  }
}
console.log(`Test user ready: ${email} / ${password}`);
