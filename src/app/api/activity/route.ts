import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const SESSIONS_DIR = '/Users/castle-owencoonahan/.openclaw/agents/cron-runner/sessions';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'message' | 'tool_call' | 'tool_result' | 'session_start' | 'thinking';
  summary: string;
  sessionId: string;
  details?: string;
}

function parseJsonlFile(filePath: string, sessionId: string): ActivityItem[] {
  const items: ActivityItem[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        
        // Session start
        if (entry.type === 'session') {
          items.push({
            id: `${sessionId}-session`,
            timestamp: entry.timestamp,
            type: 'session_start',
            summary: 'Session started',
            sessionId,
            details: entry.cwd,
          });
        }
        
        // User messages (cron triggers)
        if (entry.type === 'message' && entry.message?.role === 'user') {
          const text = entry.message.content?.[0]?.text || '';
          // Extract cron job name from message
          const cronMatch = text.match(/\[cron:[^\]]+\s+([^\]]+)\]/);
          const summary = cronMatch 
            ? `Cron: ${cronMatch[1]}`
            : text.slice(0, 80) + (text.length > 80 ? '...' : '');
          
          items.push({
            id: entry.id,
            timestamp: entry.timestamp,
            type: 'message',
            summary,
            sessionId,
            details: text.slice(0, 200),
          });
        }
        
        // Assistant messages
        if (entry.type === 'message' && entry.message?.role === 'assistant') {
          const content = entry.message.content || [];
          for (const part of content) {
            if (part.type === 'tool_use') {
              items.push({
                id: `${entry.id}-${part.id}`,
                timestamp: entry.timestamp,
                type: 'tool_call',
                summary: `Tool: ${part.name}`,
                sessionId,
                details: JSON.stringify(part.input || {}).slice(0, 150),
              });
            } else if (part.type === 'text' && part.text && part.text.length > 10) {
              items.push({
                id: `${entry.id}-text`,
                timestamp: entry.timestamp,
                type: 'message',
                summary: part.text.slice(0, 80) + (part.text.length > 80 ? '...' : ''),
                sessionId,
              });
            }
          }
        }
        
        // Tool results
        if (entry.type === 'message' && entry.message?.role === 'user' && entry.message.content) {
          for (const part of entry.message.content) {
            if (part.type === 'tool_result') {
              const resultText = typeof part.content === 'string' 
                ? part.content 
                : JSON.stringify(part.content || '');
              items.push({
                id: `${entry.id}-result`,
                timestamp: entry.timestamp,
                type: 'tool_result',
                summary: `Tool result: ${resultText.slice(0, 60)}...`,
                sessionId,
              });
            }
          }
        }
      } catch {
        // Skip malformed lines
      }
    }
  } catch {
    // File read error
  }
  
  return items;
}

export async function GET() {
  try {
    const allItems: ActivityItem[] = [];
    
    // Get all jsonl files (not lock files)
    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'))
      .map(f => ({
        name: f,
        path: path.join(SESSIONS_DIR, f),
        mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
      .slice(0, 10); // Only look at the 10 most recent sessions
    
    for (const file of files) {
      const sessionId = file.name.replace('.jsonl', '');
      const items = parseJsonlFile(file.path, sessionId);
      allItems.push(...items);
    }
    
    // Sort by timestamp descending and take the last 50
    const sorted = allItems
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
    
    return NextResponse.json({ items: sorted });
  } catch (error) {
    console.error('Error reading activity:', error);
    return NextResponse.json({ items: [], error: 'Failed to read activity' }, { status: 500 });
  }
}
