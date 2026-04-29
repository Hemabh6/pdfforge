import { Metadata } from "next";
import HeaderFooterClient from "./HeaderFooterClient";
export const metadata: Metadata = {
  title: "Add Header & Footer to PDF",
  description: "Add custom text headers and footers to every page of your PDF. Fully configurable, browser-based.",
};
export default function HeaderFooterPage() { return <HeaderFooterClient />; }
