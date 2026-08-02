import { runIngestionPipeline } from "./ingest/index";

runIngestionPipeline().catch(() => {
  process.exit(1);
});
