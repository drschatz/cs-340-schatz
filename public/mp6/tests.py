from subprocess import run
from pathlib import Path
import re

score_line = re.compile(r'SCORE: (\d+) / (\d+)$')

score = 0
valgrind_fails = 0
multiplier = [1, 0.9, 0.8, 0.75, 0.75, 0.75, 0.75]

def test(name, weight, halt_if_fail=False):
    global score, valgrind_fails
    def done():
        if halt_if_fail:
            print(f"🔒 later tests don't make sense when {name} failes")
            print(f'SCORE: {score} / 100')
            print(f'SCORE MULTIPLIER: {multiplier[valgrind_fails]}')
            quit()
            
    run(['make','tests/'+name], capture_output=True)
    if not Path('tests/'+name).exists():
        print(f'❌ failed to build {name}; test skipped')
        return done()
    
    res = run(['tests/'+name], capture_output=True)
    if res.returncode:
        print(f'❌ {name} crashed with exit code {res.returncode}')
        return done()
    last_line = res.stdout.decode('utf-8').strip().split('\n')[-1]
    m = score_line.search(last_line)
    if not m:
        print(f'❌ {name} crashed before showing a score ({last_line})')
        return done()
    earned = float(m.group(1)) / float(m.group(2))
    if earned < 1:
        print(f'❌ {name} did not fully pass (run individually to see details)')
        #score += int(weight * earned)
        return done()
    score += weight
    print(f'✅ {name} passed')
    if name == 'test_5_crowds':
        print("🧵 too many threads in",name,"for valgrind to test (this is expected)")
    elif not valgrind('tests/'+name, 1, name):
        valgrind_fails += 1


def valgrind(command, points, msg, msg2=None, timeout=None):
    """Uses valgrind on one command-line invocation"""
    leaks = Path('.leaks')
    if leaks.exists(): leaks.unlink()
    res = run(f'valgrind --trace-children=yes --leak-check=full -q --log-file=.leaks {command}', shell=True, capture_output=True, timeout=timeout)
    if leaks.exists() and leaks.stat().st_size > 2:
        print('❌ valgrind',msg2 if msg2 else msg)
        # print(open(leaks).read())
        leaks.unlink()
        return 0
    else:
        print('✅ valgrind',msg)
        if leaks.exists(): leaks.unlink()
        return points
        


test('test_0_map', 0, True)
test('test_1_rwlock', 40, True)
test('test_2_pingpong', 15)
test('test_3_frenzy', 15)
test('test_4_ring', 15)
test('test_5_crowds', 15)
print(f"SCORE: {score} / 100")
print(f"SCORE MULTIPLIER: {multiplier[valgrind_fails]}")


