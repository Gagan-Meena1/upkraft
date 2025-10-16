"use client";
import dynamic from "next/dynamic";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
// import '@/styles/index.css';
// import '@/styles/style.css';

const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
  return <App />;
}
