import { VM } from 'vm2';
import { loopWhile } from 'deasync';

const exe = (code, sandbox) => {
	const result = new VM({
		sandbox,
		timeout: 1000
	}).run(code);
	return new VM({
		sandbox: { result, loopWhile },
		timeout: 8000
	}).run(`(_ => {
      let v, d, r;
      if (typeof result.then !== "function") return result;
      result.then(
        a => { v = a; d = true; }, 
        e => { v = e; r = d = true; }
      );
      loopWhile(_ => !d);
      const [value, rejected] = [v, r];
      if (rejected) throw value; return value;
    })()`);
};

export default function(...a) {
  return new Promise((r, e) => {
    process.nextTick(() => {
      try {
        r(exe(...a));
      } catch(ex) {
        e(ex);
      }
    });
  })
}
