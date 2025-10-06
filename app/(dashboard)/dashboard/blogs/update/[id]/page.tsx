import { getBlogById, getBlogCategories } from "@/actions/blogs";
import BlogEditForm from "@/components/dashboard/blogs/blog-edit-form";

import { auth } from "@/lib/auth";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const blog = await getBlogById(id);
  const categories = (await getBlogCategories()) || [];
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers())
  });
  const userId = session?.user.id ?? "";
  const blogCategories = categories.map((item) => {
    return {
      label: item.name,
      value: item.id,
    };
  });
  return (
    <div>
      <BlogEditForm initialData={blog} editingId={id} />
    </div>
  );
}
