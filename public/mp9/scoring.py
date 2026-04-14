from subprocess import run
import re, os, glob

env = os.environ.copy()
env['COLUMNS'] = '200'
env['LINES'] = '40'

res = run(['python3','-m', 'pytest', '-q','-r','A'], capture_output=True, env=env)
k = res.stdout.decode('utf-8')
k = k[k.rfind('short test summary info'):]
k = k[k.find('\n'):]

weights = {
    'test_root':0,
    'test_results':0,
}

score = 0
for [f,t] in re.findall(r'\nPASSED ([^\n]*).py::([a-zA-Z0-9_]+)', k):
  default = 6.25
  if 'demoserver' in t: default = 3
  score += weights.get(t,default)

print(k)
print('SCORE:',score,'/',100)
