export async function api(path,method='GET',data){
 const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:method==='GET'?{}:{'Content-Type':'application/json','X-CV-Request':'1'},...(data===undefined?{}:{body:JSON.stringify(data)})});
 const result=await response.json();if(!response.ok){if(response.status===401&&path!=='/api/login')window.dispatchEvent(new Event('cv-expired'));throw new Error(result.error||'Request failed.');}return result;
}
export const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
