import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function OpenSourcePage() {
  redirect(routes.openSource);
}
