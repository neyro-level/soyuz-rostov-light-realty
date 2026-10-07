type JsonLdScriptProps = {
  data: unknown;
  nonce?: string;
};

export function JsonLdScript({ data, nonce }: JsonLdScriptProps) {
  return (
    <script nonce={nonce} type="application/ld+json">
      {JSON.stringify(data)}
    </script>
  );
}
