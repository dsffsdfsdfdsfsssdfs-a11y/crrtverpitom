import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { uploadFile } from '@/lib/local-content';

export const dynamic = 'force-dynamic';

export async function POST(req:Request){
  if(!await isAdmin()) return NextResponse.json({error:'Войдите в редактор'},{status:401});
  try{
    const type=req.headers.get('content-type')||'';
    if(type.includes('multipart/form-data')){
      const form=await req.formData();
      const file=form.get('file');
      if(!(file instanceof File)) return NextResponse.json({error:'Файл не передан'},{status:400});
      if(file.size>35*1024*1024) return NextResponse.json({error:'Файл слишком большой. Максимум 35 МБ'},{status:413});
      const buf=Buffer.from(await file.arrayBuffer());
      return NextResponse.json({url:await uploadFile(file.name,buf.toString('base64'))});
    }
    const {name,base64}=await req.json();
    return NextResponse.json({url:await uploadFile(name,base64)});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:'Ошибка загрузки'},{status:500});
  }
}
