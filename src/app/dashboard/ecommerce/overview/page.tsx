import { redirect } from "next/navigation";

// Overview stays in the navbar but is not a standalone page — it lands on the
// product list (the e-commerce starting point).
export default function EcommerceOverview() {
  redirect("/dashboard/ecommerce/products/list");
}
