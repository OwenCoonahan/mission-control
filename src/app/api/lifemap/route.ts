import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'lifemap.json')

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json({ vision: null, goals: [], levers: [] })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const data = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'))

    // Toggle action done status
    if (body.actionId && typeof body.done === 'boolean') {
      for (const goal of data.goals) {
        for (const phase of goal.phases) {
          const action = phase.actions.find((a: any) => a.id === body.actionId)
          if (action) {
            action.done = body.done
            break
          }
        }
      }
    }

    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
