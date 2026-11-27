import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {createHash} from "node:crypto";
export async function approvedComponents(root){
 const html=await readFile(join(root,"tools/art/approved_components_v1/approved_review.html"));
 const sha=createHash("sha256").update(html).digest("hex");
 if(sha!=="9d41d52e73985f3fbfcef68c8a02f8c17cabcb0c4e7432e09ed1c877e73c10df")throw Error("approved HTML SHA mismatch");
 const urls=JSON.parse(html.toString("utf8").match(/const sources=(\{[^\n]*?\});/)[1]);
 const zip=await readFile(join(root,"assets/source/environment/approved_components_v1/components.zip"));
 const end=zip.length-22;
 if(zip.readUInt32LE(end)!==0x06054b50||zip.readUInt16LE(end+20)!==0)throw Error("invalid archive end");
 const count=zip.readUInt16LE(end+10),central=zip.readUInt32LE(end+16);
 if(count!==163||Object.keys(urls).length!==count||central+zip.readUInt32LE(end+12)!==end)throw Error("archive count or length mismatch");
 const result={};let p=central;
 for(let i=0;i<count;i++){
  if(zip.readUInt32LE(p)!==0x02014b50||zip.readUInt16LE(p+10)!==0)throw Error("expected stored ZIP entry");
  const len=zip.readUInt32LE(p+24),n=zip.readUInt16LE(p+28),extra=zip.readUInt16LE(p+30),comment=zip.readUInt16LE(p+32),local=zip.readUInt32LE(p+42);
  const name=zip.toString("ascii",p+46,p+46+n),id=name.replace(/\.png$/,"");
  if(!/^[a-z0-9_]+\.png$/.test(name)||!Object.hasOwn(urls,id)||Object.hasOwn(result,id))throw Error("invalid asset "+name);
  if(zip.readUInt32LE(local)!==0x04034b50||zip.readUInt16LE(local+8)!==0||zip.readUInt32LE(local+22)!==len)throw Error("local header mismatch "+name);
  const nameLen=zip.readUInt16LE(local+26),offset=local+30+nameLen+zip.readUInt16LE(local+28);
  if(zip.toString("ascii",local+30,local+30+nameLen)!==name||offset+len>central)throw Error("local name or size mismatch "+name);
  const bytes=zip.subarray(offset,offset+len);
  if(!bytes.equals(Buffer.from(urls[id].split(",")[1],"base64")))throw Error("approved PNG differs "+id);
  result[id]=bytes;p+=46+n+extra+comment;
 }
 if(p!==end)throw Error("archive central directory mismatch");
 return {sha,images:result};
}
