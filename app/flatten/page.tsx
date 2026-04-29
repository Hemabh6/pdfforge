import { Metadata } from "next";
import FlattenClient from "./FlattenClient";
export const metadata: Metadata = {
  title: "Flatten PDF — Make Forms Non-Editable",
  description: "Convert interactive PDF form fields into static, non-editable content. All in your browser.",
};
export default function FlattenPage() { return <FlattenClient />; }
