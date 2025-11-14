
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect any traffic from the root path '/' to the '/login' page.
  // This is a server-side redirect.
  redirect('/login');
}
