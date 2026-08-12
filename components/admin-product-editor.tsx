import { saveProductAction, deleteProductAction } from "@/app/admin/products/actions";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

const statusOptions = ["Draft", "Active", "Out of Stock", "Preorder", "Archived"] as const;

function ProductForm({
  product,
  heading,
}: {
  product?: Product;
  heading: string;
}) {
  return (
    <form action={saveProductAction} className="grid gap-4 border border-white/10 bg-zinc-950/80 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-lime-300">{heading}</p>
        <h3 className="mt-2 text-2xl font-black uppercase tracking-[0.12em] text-white">
          {product ? product.title : "Create Product"}
        </h3>
      </div>
      <input type="hidden" name="id" defaultValue={product?.id ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-zinc-300">
          Title
          <input name="title" required defaultValue={product?.title ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Slug
          <input name="slug" required defaultValue={product?.slug ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Brand Slug
          <input name="brandSlug" required defaultValue={product?.brandSlug ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Category Slug
          <input name="categorySlug" required defaultValue={product?.categorySlug ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Price
          <input name="price" type="number" step="0.01" required defaultValue={product?.price ?? 0} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Compare At Price
          <input name="compareAtPrice" type="number" step="0.01" defaultValue={product?.compareAtPrice ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Status
          <select name="status" defaultValue={product?.status ?? "Draft"} className="h-11 border border-white/10 bg-black/30 px-3 text-white">
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Compatibility Summary
          <input name="compatibilitySummary" defaultValue={product?.compatibilitySummary ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Processing Window
          <input name="processingWindow" defaultValue={product?.shippingWindow.processingBusinessDays ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
        <label className="grid gap-2 text-sm text-zinc-300">
          Delivery Window
          <input name="deliveryWindow" defaultValue={product?.shippingWindow.deliveryBusinessDays ?? ""} className="h-11 border border-white/10 bg-black/30 px-3 text-white" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-zinc-300">
        Short Description
        <textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} className="min-h-24 border border-white/10 bg-black/30 px-3 py-3 text-white" />
      </label>
      <label className="grid gap-2 text-sm text-zinc-300">
        Description
        <textarea name="description" defaultValue={product?.description ?? ""} className="min-h-32 border border-white/10 bg-black/30 px-3 py-3 text-white" />
      </label>
      <label className="grid gap-2 text-sm text-zinc-300">
        Gallery URLs (one per line)
        <textarea name="galleryUrls" defaultValue={product?.gallery.join("\n") ?? ""} className="min-h-32 border border-white/10 bg-black/30 px-3 py-3 font-mono text-sm text-white" />
      </label>
      <label className="grid gap-2 text-sm text-zinc-300">
        Variants JSON
        <textarea name="variantsJson" defaultValue={JSON.stringify(product?.variants ?? [], null, 2)} className="min-h-48 border border-white/10 bg-black/30 px-3 py-3 font-mono text-sm text-white" />
      </label>
      <label className="grid gap-2 text-sm text-zinc-300">
        Fitments JSON
        <textarea name="fitmentsJson" defaultValue={JSON.stringify(product?.fitments ?? [], null, 2)} className="min-h-48 border border-white/10 bg-black/30 px-3 py-3 font-mono text-sm text-white" />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{product ? "Save Changes" : "Create Product"}</Button>
        {product ? (
          <Button formAction={deleteProductAction} variant="secondary">
            Delete Product
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function AdminProductEditor({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6">
      <ProductForm heading="Create" />
      {products.map((product) => (
        <details key={product.slug} className="border border-white/10 bg-zinc-950/80">
          <summary className="cursor-pointer px-6 py-5 text-left">
            <div className="text-lg font-semibold text-white">{product.title}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-zinc-500">
              {product.brandName} · {product.status} · {product.slug}
            </div>
          </summary>
          <div className="border-t border-white/10 p-6 pt-0">
            <ProductForm product={product} heading="Edit" />
          </div>
        </details>
      ))}
    </div>
  );
}
