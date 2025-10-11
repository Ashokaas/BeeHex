'use client';

import { useRouter } from "next/navigation";

 
export default function() {
  const router = useRouter();
  router.push('/new/home.html');
}