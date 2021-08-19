import { join } from 'path';
import { loadDocumentSync } from 'swagger2';

export const swaggerDocument = loadDocumentSync(
  join(__dirname, '..', '..', 'api.yaml'),
);

export default {};
