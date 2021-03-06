import path from "path";
/**
 * Workaround for aggressive static string replacement (vite)
 * https://vitejs.dev/guide/env-and-mode.html#production-replacement
 */
const import_meta_hot = ["import", "meta", "hot"].join(".");

/**
 * Triggers a page reload when a matching CSS filename is changed
 * @param {Function} ext an extension to hot reload if its matching css changes
 */
export default function CssHmr(ext) {
  const matchFn = (id) => path.basename(id)?.indexOf(ext) > -1;

  return {
    name: "css-hmr",
    handleHotUpdate({ file, modules, server }) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      if (ext === ".css") {
        server.ws.send({ type: "custom", event: name, data: {} });
      }
    },
    transform(src, id) {
      if (!matchFn(id)) return;

      const ext = path.extname(id);
      const name = path.basename(id, ext);
      return {
        code: `${src}\n\n
// -----
//  HMR
// -----
if(${import_meta_hot}) {
  ${import_meta_hot}.on('${name}', () => {
    ${import_meta_hot}.invalidate();
  })
}`,
        map: null,
        enforce: "post",
      };
    },
  };
}
