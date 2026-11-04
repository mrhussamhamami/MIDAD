/* مِداد | طبقة السحابة (Supabase): الحسابات، المدارس، المزامنة، الإدارة العامة */
const SB_URL='https://jrgsaydwuykgpxsanyhx.supabase.co',SB_KEY='sb_publishable_-6naFbAgx3iIfOra45s_1A_e_wrJmSO';
window.CLOUD=true;
let sb,gMe,gSnap,gQ=Promise.resolve(),gW=false;
const rowS=s=>({name:s.name,org:s.org||'',manager:s.manager||'',color:s.color,logo:s.logo||null,sig:s.sig||null,stamp:s.stamp||null});
const rowT=x=>({school_id:x.school,name:x.name,grade:x.grade||''});
const rowC=c=>({school_id:c.school,num:c.num||'',name:c.name,type:c.type||'',issued_on:c.date||today(),data:c});
const gOv=h=>{let g=$('#gate');if(!g){g=document.createElement('div');g.id='gate';document.body.append(g)}g.innerHTML='<div class="box">'+h+'</div>'};
const gCl=()=>{const g=$('#gate');g&&g.remove()};
const gErr=m=>({'Email not confirmed':'لم يتم تأكيد البريد بعد. افتح رسالة التأكيد في بريدك، أو اطلب إعادة إرسالها.','Invalid login credentials':'البريد أو كلمة المرور غير صحيحة.','User already registered':'هذا البريد مسجّل مسبقاً. استخدم تسجيل الدخول.'}[m]||m);
const gMsg=m=>{const e=$('#am');e&&(e.textContent=m)};
async function gAll(t){let o=[],f=0;for(;;){const{data,error}=await sb.from(t).select('*').order('created_at').range(f,f+999);if(error)throw error;o=o.concat(data);if(data.length<1000)return o;f+=1000}}
async function gLoad(){
 const[S,M,T,C]=await Promise.all([gAll('schools'),sb.from('school_members').select('school_id,role').eq('user_id',gMe.id),gAll('students'),gAll('certificates')]);
 if(M.error)throw M.error;
 const rl=Object.fromEntries(M.data.map(m=>[m.school_id,m.role])),th=db.theme;
 db={schools:S.map(r=>({...r,logo:r.logo||'',sig:r.sig||'',stamp:r.stamp||'',role:rl[r.id]||'teacher'})),students:T.map(r=>({id:r.id,school:r.school_id,name:r.name,grade:r.grade})),certs:C.map(r=>({...r.data,id:r.id,school:r.school_id})),active:null,theme:th};
 const a=db.schools.find(s=>s.status==='active')||db.schools[0];db.active=a?a.id:null;
 gSnap={s:{},st:{},c:{}};db.schools.forEach(s=>gSnap.s[s.id]=JSON.stringify(rowS(s)));db.students.forEach(x=>gSnap.st[x.id]=1);db.certs.forEach(x=>gSnap.c[x.id]=1)}
async function gSyn(t,list,row,sn){
 const add=list.filter(x=>!(x.id in sn));
 if(add.length){const{error}=await sb.from(t).insert(add.map(x=>({id:x.id,...row(x)})));if(error)throw error;add.forEach(x=>sn[x.id]=1)}
 const gone=Object.keys(sn).filter(id=>!list.some(x=>x.id===id));
 if(gone.length){const{error}=await sb.from(t).delete().in('id',gone);if(error)throw error;gone.forEach(id=>delete sn[id])}}
function gPush(){gQ=gQ.then(async()=>{try{
 for(const s of db.schools){if(s.id==='__admin')continue;const r=rowS(s),k=JSON.stringify(r),o=gSnap.s[s.id];
  if(o===undefined){const{error}=await sb.from('schools').insert({id:s.id,...r});if(error)throw error}
  else if(o!==k){const{error}=await sb.from('schools').update(r).eq('id',s.id);if(error)throw error}
  gSnap.s[s.id]=k}
 const gs=Object.keys(gSnap.s).filter(id=>!db.schools.some(s=>s.id===id));
 if(gs.length){const{error}=await sb.from('schools').delete().in('id',gs);if(error)throw error;gs.forEach(id=>delete gSnap.s[id])}
 await gSyn('students',db.students,rowT,gSnap.st);await gSyn('certificates',db.certs,rowC,gSnap.c);
}catch(e){toast('تعذرت المزامنة: '+(e.message||e));try{await gLoad();ssel();render()}catch(x){}}})}
const gGate=()=>{const p=sch().status==='pending';return `<div class="panel"><h3>${p?'مدرستك قيد المراجعة':'هذه المدرسة موقوفة'}</h3><p style="color:var(--mut)">${p?'سنفعّل حسابك بعد مراجعة إدارة المنصة. يمكنك في الأثناء تعديل بيانات المدرسة.':'تواصل مع إدارة المنصة لإعادة التفعيل. بياناتك محفوظة.'}</p></div>`};

function gAuth(){
 gOv(`<div class="brand" style="font-size:46px;text-align:center;margin:0 0 14px">مِداد</div><div class="panel"><h3 id="at">تسجيل الدخول</h3><label>البريد الإلكتروني</label><input id="ae" type="email" autocomplete="email" dir="ltr"><label>كلمة المرور</label><input id="ap" type="password" autocomplete="current-password" dir="ltr"><div class="acts"><button class="pri" id="ab">دخول</button><button id="as">إنشاء حساب جديد</button><button id="rs" hidden>إعادة إرسال رسالة التأكيد</button></div><p id="am" role="status" style="color:var(--mut)"></p></div>`);
 let reg=false;
 $('#rs').onclick=async()=>{const{error}=await sb.auth.resend({type:'signup',email:$('#ae').value.trim(),options:{emailRedirectTo:location.origin+location.pathname}});gMsg(error?gErr(error.message):'تم إرسال رسالة التأكيد. تحقق من بريدك (وصندوق الرسائل غير المرغوبة).')};
 $('#as').onclick=()=>{reg=!reg;$('#at').textContent=reg?'إنشاء حساب':'تسجيل الدخول';$('#ab').textContent=reg?'تسجيل':'دخول';$('#as').textContent=reg?'لدي حساب':'إنشاء حساب جديد'};
 $('#ab').onclick=async()=>{const e=$('#ae').value.trim(),p=$('#ap').value;if(!e||p.length<8)return gMsg('أدخل بريداً صحيحاً وكلمة مرور من 8 أحرف على الأقل');
  gMsg('جارٍ المعالجة…');
  const r=reg?await sb.auth.signUp({email:e,password:p,options:{emailRedirectTo:location.origin+location.pathname}}):await sb.auth.signInWithPassword({email:e,password:p});
  if(r.error){$('#rs').hidden=r.error.message!=='Email not confirmed';return gMsg(gErr(r.error.message))}
  if(r.data.session)gStart(r.data.session.user);else gMsg('تم إنشاء الحساب. تحقق من بريدك لتأكيده ثم سجّل الدخول.')}}

async function gOnb(){
 const{data:rq}=await sb.from('join_requests').select('id').eq('user_id',gMe.id).eq('status','pending');
 gOv(`<h2 style="font-size:32px;margin-bottom:12px">مرحباً بك</h2>${rq&&rq.length?'<div class="panel"><p>طلب انضمامك قيد المراجعة من مدير المدرسة. حدّث الصفحة لاحقاً.</p></div>':''}
<div class="panel"><h3>تسجيل مدرسة جديدة</h3><p style="color:var(--mut)">بعد التسجيل تراجع إدارة المنصة مدرستك ثم تُفعَّل.</p><label>اسم المدرسة</label><input id="on"><label>الجهة التعليمية</label><input id="oo"><label>اسم المدير</label><input id="om"><div class="acts"><button class="pri" id="ocr">تسجيل المدرسة</button></div></div>
<div class="panel" style="margin-top:14px"><h3>الانضمام كمعلم</h3><label>اسمك</label><input id="jn"><label>رمز المدرسة</label><input id="jc" dir="ltr"><div class="acts"><button id="jb">إرسال طلب الانضمام</button></div></div>
<div class="acts"><button id="lo2">تسجيل الخروج</button></div><p id="am" role="status" style="color:var(--mut)"></p>`);
 $('#ocr').onclick=async()=>{const n=$('#on').value.trim();if(!n)return gMsg('أدخل اسم المدرسة');gMsg('جارٍ التسجيل…');
  const{error}=await sb.from('schools').insert({id:crypto.randomUUID(),name:n,org:$('#oo').value.trim(),manager:$('#om').value.trim()});
  if(error)return gMsg(error.message);gStart(gMe)};
 $('#jb').onclick=async()=>{const c=$('#jc').value.trim(),n=$('#jn').value.trim();if(!c||!n)return gMsg('أدخل اسمك ورمز المدرسة');
  const{data,error}=await sb.rpc('request_join',{p_code:c,p_name:n});gMsg(error?error.message:data)};
 $('#lo2').onclick=async()=>{await sb.auth.signOut();location.reload()}}

function gWire(){if(gW)return;gW=true;
 save=()=>{try{localStorage.setItem('midad_theme',db.theme||'')}catch(e){}gPush()};
 if(names.schools&&db.schools.some(s=>s.role==='admin')){const sc=names.schools;delete names.schools;names.team='الفريق';names.schools=sc}
 Object.assign(ico,{team:'<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2M19 8v6M16 11h6"/>',admin:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'});
 Object.assign(desc,{team:'رمز انضمام المعلمين، وطلباتهم، وأعضاء مدرستك.',admin:'كل المدارس المسجّلة في المنصة وحالة تفعيلها.'});
 ['studio','students','archive','stats'].forEach(k=>{const v=V[k],b=B[k];if(!v)return;V[k]=()=>sch().status==='active'?v():gGate();B[k]=()=>sch().status==='active'&&b()});
 if(B.schools){const ob=B.schools;B.schools=()=>{ob();const x=$('#ib');x&&x.remove()}}
 V.team=()=>sch().role!=='admin'?'<div class="panel"><p>هذه الصفحة لمدير المدرسة فقط.</p></div>':`<div class="grid two"><div class="panel"><h3>رمز الانضمام</h3><p style="color:var(--mut)">أعطِ هذا الرمز لمعلمي مدرستك ليطلبوا الانضمام، وأنت توافق عليهم.</p><div style="font:700 30px monospace;letter-spacing:5px;direction:ltr;text-align:center;padding:14px">${esc(sch().join_code||'')}</div><div class="acts"><button id="cp">نسخ</button><button id="rg">تجديد الرمز</button></div></div><div class="panel"><h3>الطلبات والأعضاء</h3><div id="tl"><div class="empty">جارٍ التحميل…</div></div></div></div>`;
 B.team=async()=>{const s=sch();if(s.role!=='admin')return;
  $('#cp').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(s.join_code);toast('تم نسخ الرمز')};
  $('#rg').onclick=async()=>{if(!confirm('سيتوقف الرمز القديم عن العمل. متابعة؟'))return;const{data,error}=await sb.rpc('regen_join_code',{p_school:s.id});if(error)return toast(error.message);s.join_code=data;render()};
  const[R,M]=await Promise.all([sb.from('join_requests').select('*').eq('school_id',s.id).eq('status','pending'),sb.from('school_members').select('*').eq('school_id',s.id)]);
  if(!$('#tl'))return;
  $('#tl').innerHTML=(R.data&&R.data.length?'<h4>طلبات الانضمام</h4><ul class="list">'+R.data.map(r=>`<li><span>${esc(r.full_name)}<small>${esc(r.email)}</small></span><button class="pri" data-a="${r.id}">قبول</button><button class="dng" data-r="${r.id}">رفض</button></li>`).join('')+'</ul>':'<div class="empty">لا توجد طلبات جديدة.</div>')+'<h4 style="margin-top:18px">أعضاء المدرسة</h4><ul class="list">'+(M.data||[]).map(m=>`<li><span>${esc(m.full_name||m.email)}<small>${m.role==='admin'?'مدير':'معلم'} · ${esc(m.email)}</small></span>${m.user_id===gMe.id?'':`<button class="dng" data-x="${m.user_id}">إزالة</button>`}</li>`).join('')+'</ul>';
  const rv=async(id,ok)=>{const{error}=await sb.rpc('review_join',{p_id:id,p_accept:ok});if(error)return toast(error.message);toast(ok?'تم قبول المعلم':'تم رفض الطلب');B.team()};
  $$('[data-a]').forEach(b=>b.onclick=()=>rv(b.dataset.a,true));$$('[data-r]').forEach(b=>b.onclick=()=>rv(b.dataset.r,false));
  $$('[data-x]').forEach(b=>b.onclick=async()=>{if(!confirm('إزالة هذا العضو؟'))return;const{error}=await sb.from('school_members').delete().match({school_id:s.id,user_id:b.dataset.x});if(error)return toast(error.message);B.team()})};
 V.admin=()=>'<div class="panel"><h3>كل المدارس</h3><div id="al2"><div class="empty">جارٍ التحميل…</div></div></div>';
 B.admin=async()=>{const{data,error}=await sb.rpc('admin_overview'),e=$('#al2');if(!e)return;if(error){e.innerHTML='<div class="empty">'+esc(error.message)+'</div>';return}
  const L={pending:'قيد المراجعة',active:'مفعّلة',suspended:'موقوفة'};
  e.innerHTML=data.length?'<ul class="list">'+data.map(r=>`<li style="flex-wrap:wrap"><span>${esc(r.sname)}<small>${esc(r.owner_email||'')} · ${r.teachers} عضو · ${r.students} طالب · ${r.certs} شهادة</small></span><b class="chip">${L[r.sstatus]}</b>${r.sstatus!=='active'?`<button class="pri" data-s="${r.sid}" data-v="active">تفعيل</button>`:''}${r.sstatus!=='suspended'?`<button class="dng" data-s="${r.sid}" data-v="suspended">إيقاف</button>`:''}</li>`).join('')+'</ul>':'<div class="empty">لا توجد مدارس مسجّلة بعد.</div>';
  $$('[data-s]').forEach(b=>b.onclick=async()=>{const{error}=await sb.rpc('admin_set_status',{p_school:b.dataset.s,p_status:b.dataset.v});if(error)return toast(error.message);toast('تم تحديث الحالة');B.admin()})};
 const lo=document.createElement('button');lo.textContent='خروج';lo.onclick=async()=>{await sb.auth.signOut();location.reload()};$('#th').before(lo)}

async function gStart(u){gMe=u;gOv('<div class="empty">جارٍ التحميل…</div>');
 try{const t=localStorage.getItem('midad_theme');if(t){db.theme=t;theme(t)}
  await gLoad();const{data:ad}=await sb.rpc('am_i_platform_admin');
  if(!db.schools.length){
   if(ad){db.schools.push({id:'__admin',name:'الإدارة العامة',org:'',manager:'',color:'#a87c32',logo:'',sig:'',stamp:'',status:'active',role:'admin'});db.active='__admin';Object.keys(names).forEach(k=>k!=='admin'&&delete names[k]);tab='admin'}
   else return gOnb()}
  if(ad)names.admin='الإدارة العامة';
  gWire();gCl();ssel();render();enter()}
 catch(e){gOv('<div class="panel"><h3>تعذر الاتصال</h3><p>'+esc(e.message||e)+'</p><div class="acts"><button class="pri" onclick="location.reload()">إعادة المحاولة</button></div></div>')}}

async function boot(){
 if(!window.supabase){gOv('<div class="panel"><p>تعذر تحميل مكتبة الاتصال. تحقق من الإنترنت ثم أعد المحاولة.</p></div>');return}
 sb=supabase.createClient(SB_URL,SB_KEY);
 const{data:{session}}=await sb.auth.getSession();
 session?gStart(session.user):gAuth()}
