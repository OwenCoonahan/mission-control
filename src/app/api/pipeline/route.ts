import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const PIPELINE_FILE = path.join(process.cwd(), 'data/pipeline.json')

async function readPipeline() {
  try {
    const data = await fs.readFile(PIPELINE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { leads: [] }
  }
}

export async function GET() {
  try {
    const data = await readPipeline()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to read pipeline' }, { status: 500 })
  }
}
