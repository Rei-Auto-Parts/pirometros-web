import { buildWebEntry } from './infra/init/ioc.init';

const container = document.getElementById('root');
if (container === null) {
  throw new Error("elemento '#root' nao encontrado em index.html");
}
buildWebEntry().run(container);
