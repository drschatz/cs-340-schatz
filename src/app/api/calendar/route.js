import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Read calendar config from public folder
    const configPath = join(process.cwd(), 'public', 'data', 'calendar-config.json');
    const configData = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    const response = await fetch(config.icsUrl);
    const icsData = await response.text();
    
    return new Response(icsData, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return new Response('Error fetching calendar', { status: 500 });
  }
}
