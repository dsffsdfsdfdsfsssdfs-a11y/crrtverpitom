import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const name = 'crr_admin_session';
const secret = () => process.env.ADMIN_SESSION_SECRET || '';
export function configured() { return Boolean(process.env.ADMIN_PASSWORD && secret()); }
function sign(value:string) { return createHmac('sha256', secret()).update(value).digest('hex'); }
export function token() { const value = 'owner'; return `${value}.${sign(value)}`; }
export async function isAdmin() { const value=(await cookies()).get(name)?.value; if(!value || !secret()) return false; const [body,signature]=value.split('.'); const expected=sign(body||''); if(!body||!signature||signature.length!==expected.length) return false; return timingSafeEqual(Buffer.from(signature),Buffer.from(expected)); }
export async function setSession() { (await cookies()).set(name, token(), {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*12}); }
export async function clearSession() { (await cookies()).set(name,'',{httpOnly:true,path:'/',maxAge:0}); }
