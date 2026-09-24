import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';
import { saveContent } from '@/lib/local-content';

export const dynamic = 'force-dynamic';

export async function POST(req:Request){
  if(!await isAdmin())return NextResponse.json({error:'Войдите в редактор'},{status:401});
  try{
    await saveContent(await req.json());
    revalidatePath('/');
    const response=NextResponse.json({ok:true,updatedAt:Date.now()});
    response.headers.set('Cache-Control','no-store, max-age=0');
    return response;
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Ошибка сохранения'},{status:500});
  }
}
