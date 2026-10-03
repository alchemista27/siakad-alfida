import { Metadata } from "next";
import GuestbookClient from "./guestbook-client";

export const metadata: Metadata = {
  title: "Buku Tamu Online - SIM Alfida",
  description: "Formulir pencatatan kunjungan tamu Yayasan Alfida",
};

export default function GuestbookPage() {
  return <GuestbookClient />;
}
