import { Router } from '../src/router';
import "../src/styles.css";

export function GlobalProvider({ children, page = '/' }: { children: React.ReactNode; page?: '/' | '/about' }) {
  return <Router location={page} type='static'>{children}</Router>;
}
