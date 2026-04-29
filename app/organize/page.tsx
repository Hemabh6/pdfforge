import { Metadata } from "next";
import OrganizeClient from "./OrganizeClient";

export const metadata: Metadata = {
  title: "Organize PDF — Reorder, Delete, and Rotate Pages",
  description: "Drag and drop to reorder pages, remove unwanted pages, or rotate individual pages. All in your browser.",
};

export default function OrganizePage() {
  return <OrganizeClient />;
}
