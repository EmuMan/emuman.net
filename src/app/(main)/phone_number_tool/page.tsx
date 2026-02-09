import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Phone Number Entry Tool",
  description: "A state-of-the-art phone number entry tool for your convenience.",
};

export default function PhoneNumberToolPage() {
  redirect("/phone_number_tool.html");
}
