export function Gallery({
  items,
}: {
  items: Array<{ src: string; alt: string }>;
}) {
  return (
    <ul className="grid gap-sm px-md py-md md:grid-cols-3">
      {items.map((item) => (
        <li key={item.src}>
          <div className="aspect-4/3 overflow-hidden rounded-md border border-border bg-surface">
            {/* biome-ignore lint/performance/noImgElement: token shell uses native img */}
            <img
              alt={item.alt}
              className="h-full w-full object-cover"
              src={item.src}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
