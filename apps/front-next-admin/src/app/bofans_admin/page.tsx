import Link from "next/link";

export default function BofansAdminHome() {
  return (
    <main className="p-6">
      <Link className="text-sm underline" href="/bofans_admin/review">
        进入图片审核
      </Link>
    </main>
  );
}
