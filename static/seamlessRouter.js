var w = Object.defineProperty;
var g = (t, e, o) => e in t ? w(t, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : t[e] = o;
var f = (t, e, o) => (g(t, typeof e != "symbol" ? e + "" : e, o), o);
const y = {
  prefetch: void 0,
  ignoreSameUrl: !0
};
class E {
  constructor(e) {
    f(this, "enabled", !0);
    this.opts = e, this.opts = { ...y, ...e != null ? e : {} }, window != null && window.history ? (document.addEventListener("click", (o) => this.onCustomClick(o)), window.addEventListener("popstate", (o) => this.onCustomPop(o)), window.onload = () => {
      (e == null ? void 0 : e.prefetch) === "visible" ? m() : e == null || e.prefetch;
    }) : (console.warn("seamless router is not supported in this browser"), this.enabled = !1);
  }
  async onCustomClick(e) {
    var a, s, r;
    const o = e.target;
    if ((o == null ? void 0 : o.nodeName) === "A") {
      const { pathname: c, host: n } = o;
      if (window.location.host === n) {
        if (e.preventDefault(), window.location.pathname === c && ((a = this.opts) == null ? void 0 : a.ignoreSameUrl)) {
          console.log(
            `=> ${c} don\`t go, because of ignoring same path`
          );
          return;
        }
        console.log(`=> ${c}`);
        const l = await N(c);
        let d = new DOMParser().parseFromString(l, "text/html");
        const u = d.getElementsByTagName("head")[0], h = d.getElementsByTagName("body")[0], p = document.getElementsByTagName("head")[0];
        window.history.pushState({}, "", c), document.body.replaceWith(h), C(h), v(p, u), ((s = this.opts) == null ? void 0 : s.prefetch) === "visible" ? m() : (r = this.opts) == null || r.prefetch;
      } else
        confirm("a you shure go to external site?") || e.preventDefault();
    }
  }
  async onCustomPop(e) {
    console.log("onCustomPop EVENT", e);
  }
}
const b = (t, e) => {
  const o = t.children, a = e.children, s = [], r = [], c = [];
  for (let n = 0; n < o.length; n++) {
    let l = o[n], i = !1;
    for (let d = 0; d < a.length; d++) {
      let u = a[d];
      l.isEqualNode(u) && (i = !0);
    }
    i ? c.push(l) : s.push(l);
  }
  for (let n = 0; n < a.length; n++) {
    let l = a[n], i = !1;
    for (let d = 0; d < o.length; d++) {
      let u = o[d];
      l.isEqualNode(u) && (i = !0);
    }
    i || r.push(l);
  }
  return [s, r, c];
}, N = async (t) => {
  const e = await fetch(t);
  return e.ok ? await e.text() : (console.warn("Error fetching new page: " + e.status, e.text), "");
}, v = (t, e) => {
  const [o, a, s] = b(t, e);
  o.forEach((r) => {
    "dataset" in r && r.dataset.router !== "prefetch" && r.remove();
  }), s.forEach((r) => {
    if (r.nodeName === "SCRIPT" && r.dataset.router === "reload") {
      r.remove();
      const c = document.createElement(r.nodeName);
      Array.prototype.forEach.call(r.attributes, (n) => {
        const { name: l, value: i } = n;
        c.setAttribute(l, i);
      }), t.appendChild(c), console.log(`rerun ${r.src}`);
    }
  }), a.forEach((r) => {
    const c = document.createElement(r.nodeName);
    Array.prototype.forEach.call(r.attributes, (n) => {
      const { name: l, value: i } = n;
      c.setAttribute(l, i);
    }), t.appendChild(c);
  });
};
function C(t) {
  document.body.querySelectorAll(
    "[seamless-router-preserve]"
  ).forEach((a) => {
    let s = t.querySelector(
      '[seamless-router-preserve][id="' + a.id + '"]'
    );
    if (s) {
      const r = a.cloneNode(!0);
      s.replaceWith(r);
    }
  }), document.body.replaceWith(t), document.body.querySelectorAll("script").forEach((a) => {
    S(a);
  });
}
const m = () => {
  let t = {
    root: null,
    rootMargin: "0px",
    threshold: 1
  };
  const e = (s) => {
    s.forEach((r) => {
      if (r.isIntersecting) {
        let c = r.target;
        const n = document.createElement("link");
        n.rel = "prefetch", n.href = c.href, n.dataset.router = "prefetch";
        let l = !1;
        Array.from(
          document.querySelectorAll(
            `head link[data-router="prefetch"][href="${c.href}"]`
          )
        ).forEach((i) => {
          i.isEqualNode(n) && (l = !0);
        }), l || (document.head.append(n), console.log("prefetch: " + n.href));
      }
    });
  };
  let o = new IntersectionObserver(e, t);
  Array.from(document.querySelectorAll("body a")).forEach((s) => {
    A(s.href) ? o.observe(s) : console.log("NOT prefetch: " + s.href);
  });
}, A = (t) => {
  if (!t.includes("//") && !t.includes("http"))
    return !0;
  let e = new URL(t);
  return window.location.host === e.host;
}, S = (t) => {
  const e = document.createElement("script"), o = Array.from(t.attributes);
  for (const { name: a, value: s } of o)
    e[a] = s;
  e.append(t.textContent), t.replaceWith(e);
}, k = (t) => {
  const e = new E(t);
  if (console.log("\u{1F525} seamlessRouter engaged"), window) {
    const o = window;
    o.seamlessRouter = e;
  }
  return e;
};
export {
  k as default
};
