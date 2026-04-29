import { Metadata } from "next";
import RepairClient from "./RepairClient";

export const metadata: Metadata = {
  title: "Repair PDF — Fix Corrupted PDF Files",
  description: "Try to recover and rebuild damaged or corrupted PDF files. Runs entirely in your browser.",
};

export default function RepairPage() {
  return <RepairClient />;
}
