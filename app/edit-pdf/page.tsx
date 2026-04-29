import { Metadata } from "next";
import EditPdfClient from "./EditPdfClient";
export const metadata: Metadata = {
  title: "Edit PDF — Add Text, Annotations & More",
  description: "Add text, draw shapes, and annotate your PDF directly in the browser. No upload needed.",
};
export default function EditPdfPage() { return <EditPdfClient />; }
