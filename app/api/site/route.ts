import { NextResponse } from 'next/server';
import { readContent } from '@/lib/local-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(){
  try{
    const response=NextResponse.json(await readContent());
    response.headers.set('Cache-Control','no-store, max-age=0');
    return response;
  }catch{
    return NextResponse.json({error:'Ошибка загрузки данных сайта'},{status:500});
  }
}
