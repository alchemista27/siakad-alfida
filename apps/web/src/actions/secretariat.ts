"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value
    || cookieStore.get("__Secure-better-auth.session_token")?.value;

  const headers = new Headers(options.headers);
  if (sessionToken) {
    headers.set("Authorization", `Bearer ${sessionToken}`);
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getCorrespondences() {
  return fetchWithAuth('/secretariat/correspondences');
}

export async function getMyDispositions() {
  return fetchWithAuth('/secretariat/correspondences/my-dispositions');
}

export async function createCorrespondence(data: any) {
  const result = await fetchWithAuth('/secretariat/correspondences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  revalidatePath('/execution/correspondence');
  return result;
}

export async function addDisposition(id: string, data: any) {
  const result = await fetchWithAuth(`/secretariat/correspondences/${id}/dispositions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  revalidatePath('/execution/correspondence');
  return result;
}

export async function completeDisposition(id: string) {
  const result = await fetchWithAuth(`/secretariat/correspondences/dispositions/${id}/complete`, {
    method: 'PATCH',
  });
  revalidatePath('/execution/correspondence');
  return result;
}

export async function getRooms() {
  return fetchWithAuth('/secretariat/rooms');
}

export async function getRoomBookings(start: string, end: string) {
  return fetchWithAuth(`/secretariat/rooms/bookings?startDate=${start}&endDate=${end}`);
}

export async function bookRoom(data: any) {
  const result = await fetchWithAuth('/secretariat/rooms/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  revalidatePath('/execution/rooms');
  return result;
}
