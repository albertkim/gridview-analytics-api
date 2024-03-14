import path from 'path'

// The relative database path is different in a local development environment vs a production environment. This function checks the NODE_ENV variables and helps repositories point to the correct file
export function getDatabasePath(fileName: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? path.resolve(__dirname, '../database') : path.resolve(__dirname, '../src/database');
  return path.join(basePath, fileName);
}
