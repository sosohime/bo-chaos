#!/usr/bin/env python3
"""Validate an external Taro stage; optionally promote dependencies, then app.js last.
Only local app/dist is writable. --qa stages are synthetic and must never be uploaded.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess

REPO = Path(__file__).resolve().parents[2]
APP = REPO / 'apps/group-rank-miniapp'
parser = argparse.ArgumentParser()
parser.add_argument('stage', type=Path)
parser.add_argument('--evidence', required=True, type=Path)
parser.add_argument('--qa', action='store_true')
parser.add_argument('--promote', action='store_true')
args = parser.parse_args()
stage = args.stage.resolve()
assert stage != APP.resolve() and APP.resolve() not in stage.parents, 'Build outside the watched project'
dist = stage / 'dist'
files = sorted(p for p in dist.rglob('*') if p.is_file())
assert files and not any(p.is_symlink() for p in dist.rglob('*'))
assert 20 <= len(files) <= 120
assert sum(p.stat().st_size for p in files) < 1536 * 1024
assert json.loads((dist/'project.config.json').read_text())['appid'] == 'wxe185bc2feabae6a8'
config = json.loads((dist/'app.json').read_text())
assert config['pages'] == ['pages/index/index','pages/board/index','pages/create/index']
for name in ['app.js','app.json','app.wxss']:
    assert (dist/name).is_file() and (dist/name).stat().st_size
for page in config['pages']:
    for extension in ['js','json','wxml']:
        assert (dist/f'{page}.{extension}').is_file()
    assert '<page-meta' in (dist/f'{page}.wxml').read_text()
    assert (dist/f'{page}.wxss').is_file() or (
        (dist/'common.wxss').is_file() and 'common.wxss' in (dist/'app.wxss').read_text()
    ), f'Missing page and shared styles: {page}'
for name in ['crystal','pixel','track']:
    assert (dist/f'assets/arena/{name}.jpg').is_file()
# Required visual inputs must be packaged byte-for-byte, not just present in src.
for name in ['crystal-card-v3.jpg','track-card-v1.jpg','pixel-card-v4.jpg']:
    assert (dist/f'assets/arena/{name}').read_bytes() == (stage/f'src/assets/arena/{name}').read_bytes(), f'Missing or altered runtime material: {name}'
assert (dist/'assets/brand/boge-smile.png').read_bytes() == (APP/'design/logo/boge-smile-reference.png').read_bytes()
assert (dist/'assets/brand/boge-writing.jpg').read_bytes() == (stage/'src/assets/brand/boge-writing.jpg').read_bytes()
assert (dist/'assets/ArenaDisplay-OFL.txt').is_file()
for name in ['brand-title','catalog-star-v2','hero-ribbon-v3']:
    assert (dist/f'assets/arena/{name}.png').read_bytes() == (stage/f'src/assets/arena/{name}.png').read_bytes()
assert (dist/'assets/share-cover.jpg').read_bytes() == (stage/'src/assets/share-cover.jpg').read_bytes()
for name in ['gold','silver','bronze']:
    assert (dist/f'assets/arena/crown-{name}-v1.png').read_bytes() == (stage/f'src/assets/arena/crown-{name}-v1.png').read_bytes()
assert not any(p.suffix in ['.map','.ttf','.woff','.woff2'] for p in files)
js = '\n'.join(p.read_text() for p in files if p.suffix == '.js')
if args.qa:
    assert 'qaSetCount' in js and ('仅本地验收' in js or '仅本地验收'.encode('unicode_escape').decode() in js)
else:
    assert all(marker not in js for marker in ['qaSetCount','qa-fixtures','local-qa','仅本地验收','仅本地验收'.encode('unicode_escape').decode()])
    assert 'https://yuanbo.online/group-rank' in js
    for name in ['package.json','babel.config.js','tsconfig.json','project.config.json']:
        assert (stage/name).read_bytes() == (APP/name).read_bytes(), f'Stale root input: {name}'
    for folder in ['src','config','types']:
        for source in (APP/folder).rglob('*'):
            if source.is_file() and '.test.' not in source.name:
                assert (stage/source.relative_to(APP)).read_bytes() == source.read_bytes(), f'Stale input: {source}'
args.evidence.mkdir(parents=True,exist_ok=True)
mode = 'qa' if args.qa else 'production'
wcc = Path('/Applications/wechatwebdevtools.app/Contents/Resources/app.asar.unpacked/node_modules/wcc-exec/wcc')
assert wcc.is_file(), 'Official WXML compiler required'
compiled = subprocess.run([str(wcc),'-d','-o',str(args.evidence/f'{mode}-wcc.js')]+[p.relative_to(dist).as_posix() for p in files if p.suffix in ['.wxml','.wxs']],cwd=dist,capture_output=True,text=True)
(args.evidence/f'{mode}-wcc.log').write_text(compiled.stdout+compiled.stderr)
assert compiled.returncode == 0
manifest = {p.relative_to(dist).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
info = {'stage':str(stage),'qaOnly':args.qa,'files':len(files),'bytes':sum(p.stat().st_size for p in files),'digest':hashlib.sha256(json.dumps(manifest,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'wcc':True,'promoted':False}
(args.evidence/f'{mode}-files.json').write_text(json.dumps(manifest,indent=2)+'\n')
if args.promote:
    target = APP/'dist'
    for source in [p for p in files if p.name != 'app.js']:
        dest=target/source.relative_to(dist);dest.parent.mkdir(parents=True,exist_ok=True)
        temp=dest.with_name(dest.name+'.candidate-tmp');shutil.copy2(source,temp);temp.replace(dest)
    for dest in target.rglob('*'):
        if dest.is_file() and dest.relative_to(target).as_posix() not in manifest:dest.unlink()
    temp=target/'app.js.candidate-tmp';shutil.copy2(dist/'app.js',temp);temp.replace(target/'app.js')
    actual={p.relative_to(target).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in target.rglob('*') if p.is_file()}
    assert actual == manifest
    info.update(promoted=True,appJsLast=True)
(args.evidence/f'{mode}-candidate.json').write_text(json.dumps(info,indent=2)+'\n')
print(json.dumps(info))
