export const dynamic = 'force-dynamic';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function GET(request) {
  try {
    // Check if URL parameter was provided
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get('url');
    
    let calendarUrl;
    
    if (urlParam) {
      // Use the URL from the parameter
      calendarUrl = urlParam;
    } else {
      // Fallback to reading from config
      const configPath = join(process.cwd(), 'public', 'data', 'calendar-config.json');
      const configData = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      calendarUrl = config.icsUrl;
    }
    
    // Add cache-busting timestamp
    const separator = calendarUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${calendarUrl}${separator}nocache=${Date.now()}`);
    let icsData = await response.text();
    
    // Convert all UTC times to CST (UTC-6)
    icsData = convertICSToLocalTime(icsData, 'America/Chicago');
    
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

function convertICSToLocalTime(icsText, timezone) {
  const lines = icsText.split('\n');
  const convertedLines = lines.map(line => {
    // Match DTSTART or DTEND with UTC time
    const match = line.match(/(DTSTART|DTEND):(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
    if (match) {
      const [_, field, year, month, day, hour, minute, second] = match;
      
      // Create UTC date
      const utcDate = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      ));
      
      // Convert to local timezone
      const localDate = new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
      
      // Format back to ICS format (without Z since it's now local)
      const pad = (n) => String(n).padStart(2, '0');
      const newDateTime = `${localDate.getFullYear()}${pad(localDate.getMonth() + 1)}${pad(localDate.getDate())}T${pad(localDate.getHours())}${pad(localDate.getMinutes())}${pad(localDate.getSeconds())}`;
      
      return `${field}:${newDateTime}`;
    }
    return line;
  });
  
  return convertedLines.join('\n');
}