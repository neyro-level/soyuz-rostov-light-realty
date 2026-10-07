# fixture-representative

TEST-only generator for REALTY CORE §57:

- 5 000 listings
- 100 developments

Do not commit the generated catalog. Create it in a temp directory:

```text
pnpm exec tsx -e "import { writeRepresentativeFixtureTo } from './scripts/generate-representative-fixture.ts'; writeRepresentativeFixtureTo(process.argv[1])" <dir>
```

The dataset is marked with `TEST.json` and `descriptionText: "TEST representative"`.
