import { Metadata } from "next";
import SignClient from "./SignClient";

export const metadata: Metadata = {
  title: "Sign PDF — Add Your Signature",
  description: "Draw or type your signature and place it anywhere on your PDF. No upload, no account — runs entirely in your browser.",
};

export default function SignPage() {
  return <SignClient />;
}
