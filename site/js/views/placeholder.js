import { h, mount } from "../dom.js";

export function renderPlaceholder(title) {
  return (root) => mount(root, h("h1", {}, title), h("p", { class: "muted" }, "準備中。"), h("a", { class: "btn", href: "#/" }, "ホームに戻る"));
}
