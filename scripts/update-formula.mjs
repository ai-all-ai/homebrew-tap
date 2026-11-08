import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const formulaPath=path.join(root,'Formula','aiall.rb');
const packageName='@ai.all/aiall';
const registryUrl='https://registry.npmjs.org/@ai.all/aiall/latest';

function stableVersionParts(version){
  if(typeof version!=='string') throw Error('npm registry response is missing a version string');
  if(/^\d+\.\d+\.\d+-[0-9A-Za-z.-]+(?:\+[0-9A-Za-z.-]+)?$/.test(version)) return null;
  const match=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
  if(!match) throw Error(`Invalid stable npm version: ${version}`);
  return match.slice(1).map(BigInt);
}

export function decideVersion(currentVersion, publishedVersion){
  const current=stableVersionParts(currentVersion);
  const published=stableVersionParts(publishedVersion);
  if(!published) return {status:'prerelease'};
  if(!current) throw Error(`Current formula version is not stable: ${currentVersion}`);
  for(let i=0;i<3;i++){
    if(published[i]>current[i]) return {status:'update'};
    if(published[i]<current[i]) return {status:'older'};
  }
  return {status:'unchanged'};
}

function readFormulaVersion(contents){
  const urlMatches=[...contents.matchAll(/^  url "([^"]+)"$/gm)];
  const testMatches=[...contents.matchAll(/^    assert_match "([^"]+)", shell_output\("#{bin}\/aiall --version"\)$/gm)];
  if(urlMatches.length!==1||testMatches.length!==1) {
    throw Error('Formula must contain exactly one URL and one aiall --version assertion');
  }
  const url=new URL(urlMatches[0][1]);
  const match=/^\/@ai\.all\/aiall\/-\/aiall-(\d+\.\d+\.\d+)\.tgz$/.exec(url.pathname);
  if(url.protocol!=='https:'||url.hostname!=='registry.npmjs.org'||url.port||url.search||url.hash||!match) {
    throw Error('Current formula URL is not an official AI-ALL npm tarball URL');
  }
  if(match[1]!==testMatches[0][1]) throw Error('Formula URL version and test version do not match');
  return match[1];
}

function tarEntry(buffer, target){
  const archive=gunzipSync(buffer);
  for(let offset=0;offset+512<=archive.length;){
    const header=archive.subarray(offset,offset+512);
    if(header.every(byte=>byte===0)) break;
    const text=(start,end)=>header.subarray(start,end).toString('utf8').replace(/\0.*$/s,'');
    const name=text(0,100);
    const prefix=text(345,500);
    const fullName=prefix?`${prefix}/${name}`:name;
    const sizeText=text(124,136).trim().replace(/\0/g,'');
    const size=Number.parseInt(sizeText||'0',8);
    if(!Number.isSafeInteger(size)||size<0) throw Error('Invalid npm tarball archive entry size');
    const start=offset+512;
    if(fullName===target){
      const type=header[156];
      if(type!==0&&type!==48) throw Error('npm tarball package.json is not a regular file');
      if(start+size>archive.length) throw Error('Truncated npm tarball package.json entry');
      return JSON.parse(archive.subarray(start,start+size).toString('utf8'));
    }
    offset=start+Math.ceil(size/512)*512;
  }
  throw Error('npm tarball does not contain package/package.json');
}

async function getLatestPackage(){
  const response=await fetch(registryUrl,{headers:{accept:'application/json'}});
  if(!response.ok) throw Error(`npm registry lookup failed (${response.status} ${response.statusText}) at ${registryUrl}`);
  if(new URL(response.url).origin!=='https://registry.npmjs.org') throw Error('npm registry metadata redirected outside registry.npmjs.org');
  const metadata=await response.json();
  if(metadata.name!==packageName) throw Error(`Unexpected package name from npm registry: ${metadata.name}`);
  stableVersionParts(metadata.version);
  if(!metadata.dist||typeof metadata.dist.tarball!=='string') throw Error('npm registry response is missing dist.tarball');
  const expectedUrl=`https://registry.npmjs.org/@ai.all/aiall/-/aiall-${metadata.version}.tgz`;
  const tarballUrl=new URL(metadata.dist.tarball);
  if(tarballUrl.href!==expectedUrl) throw Error(`Refusing unexpected npm tarball URL: ${metadata.dist.tarball}`);
  if(typeof metadata.dist.integrity!=='string') throw Error('npm registry response is missing dist.integrity');
  return {metadata,tarballUrl:expectedUrl};
}

function verifyIntegrity(bytes, integrity){
  const tokens=integrity.split(/\s+/);
  const sha512=tokens.find(token=>token.startsWith('sha512-'));
  if(!sha512||!/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(sha512)) throw Error('npm dist.integrity has no valid SHA-512 entry');
  const expected=Buffer.from(sha512.slice('sha512-'.length),'base64');
  const actual=createHash('sha512').update(bytes).digest();
  if(expected.length!==actual.length||!actual.equals(expected)) throw Error('Downloaded npm tarball does not match registry dist.integrity');
}

function replaceOne(contents, pattern, replacement, description){
  const matches=contents.match(pattern)||[];
  if(matches.length!==1) throw Error(`Expected exactly one ${description} in Formula/aiall.rb, found ${matches.length}`);
  return contents.replace(pattern,replacement);
}

function writeOutput({changed,version,status,sha256=''}){
  const output=process.env.GITHUB_OUTPUT;
  if(output){
    fs.appendFileSync(output,`changed=${changed}\nversion=${version}\nstatus=${status}\nsha256=${sha256}\n`);
  }
  console.log(`Homebrew formula update status: ${status}; npm version: ${version}`);
}

export async function updateFormula(){
  const original=fs.readFileSync(formulaPath,'utf8');
  const currentVersion=readFormulaVersion(original);
  const {metadata,tarballUrl}=await getLatestPackage();
  const decision=decideVersion(currentVersion,metadata.version);
  if(decision.status!=='update'){
    writeOutput({changed:false,version:metadata.version,status:decision.status});
    return {changed:false,...decision,currentVersion,publishedVersion:metadata.version};
  }

  const response=await fetch(tarballUrl);
  if(!response.ok) throw Error(`npm tarball download failed (${response.status} ${response.statusText}): ${tarballUrl}`);
  if(new URL(response.url).origin!=='https://registry.npmjs.org') throw Error('npm tarball redirected outside registry.npmjs.org');
  const bytes=Buffer.from(await response.arrayBuffer());
  if(bytes.length===0) throw Error('Downloaded npm tarball is empty');
  verifyIntegrity(bytes,metadata.dist.integrity);
  const archivePackage=tarEntry(bytes,'package/package.json');
  if(archivePackage.name!==packageName||archivePackage.version!==metadata.version) {
    throw Error(`Tarball package identity mismatch: ${archivePackage.name}@${archivePackage.version}`);
  }
  const sha256=createHash('sha256').update(bytes).digest('hex');
  let updated=replaceOne(original,/^  url "[^"]+"$/gm,`  url "${tarballUrl}"`,'formula URL');
  updated=replaceOne(updated,/^  sha256 "[0-9a-f]{64}"$/gm,`  sha256 "${sha256}"`,'SHA-256');
  updated=replaceOne(updated,/^    assert_match "[^"]+", shell_output\("#{bin}\/aiall --version"\)$/gm,
    `    assert_match "${metadata.version}", shell_output("#{bin}/aiall --version")`,'version assertion');
  fs.writeFileSync(formulaPath,updated);
  writeOutput({changed:true,version:metadata.version,status:'updated',sha256});
  return {changed:true,status:'updated',currentVersion,publishedVersion:metadata.version,tarballUrl,sha256};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  updateFormula().catch(error=>{
    console.error(`Homebrew formula update failed: ${error.message}`);
    process.exitCode=1;
  });
}
