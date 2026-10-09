// 要素を作る。attrs の on* はイベント、それ以外は属性。children は文字列か要素
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key.startsWith("on")) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === "class") el.className = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  el.append(...children.flat().filter((c) => c != null && c !== false));
  return el;
}

export function mount(root, ...children) {
  root.replaceChildren(...children.flat().filter((c) => c != null && c !== false));
  window.scrollTo(0, 0);
}
