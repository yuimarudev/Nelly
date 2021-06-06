import { VM } from 'vm2';
import { loopWhile } from 'deasync';

function exe(code, sandbox) {
  const ans = new VM({
    sandbox: {
      result: new VM({
        sandbox,
        timeout: 1000 // first timeout(sync)
      }).run(code),
      loopWhile
    },
    timeout: 3000 // second timeout(async)
  }).run(`
    (() => {
      let v, d, r;
      Promise.resolve(result).then(
        a => { v = a; d = true; }, 
        e => { v = e; r = d = true; }
      );
      loopWhile(_=>!d);
      const [value, rejected] = [v, r];
      if (rejected) throw value; return value;
    })();
  `);
  return ans;
}

export default exe;
