type JsonLdScriptProps = {
  data: unknown;
};

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}
