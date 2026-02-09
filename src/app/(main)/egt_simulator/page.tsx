import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Elemental Gauge Theory Simulator",
  description:
    "A mostly-accurate elemental gauge theory simulation tool for learning and experimentation.",
};

export default function EGTSimulatorPage() {
  redirect("/gi_egt_simulator.html");
}
