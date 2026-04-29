import { Metadata } from "next";
import PageNumbersClient from "./PageNumbersClient";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF",
  description: "Automatically add page numbers to your PDF in any position, font size, and starting number. All in your browser.",
};

export default function PageNumbersPage() {
  return <PageNumbersClient />;
}
