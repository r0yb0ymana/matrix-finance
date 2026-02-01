/**
 * Matrix Equipment Finance - Application Entry
 * Redirect to Login/OTP screen
 */

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login screen
  redirect('/login');
}
