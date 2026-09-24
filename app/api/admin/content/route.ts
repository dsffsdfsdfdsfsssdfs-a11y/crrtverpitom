import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { readContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';

export async function GET(){
  if(!await isAdmin())return NextResponse.json({error:'Войдите в редактор'},{status:401});
  try{
    const response=NextResponse.json(await readContent());
    response.headers.set('Cache-Control','no-store, max-age=0');
    return response;
  }catch{
    return NextResponse.json({error:'Ошибка загрузки'},{status:500});
  }
}
