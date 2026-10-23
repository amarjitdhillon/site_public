// Small language tag on code blocks: reads the language-<name> class pygments adds and shows a friendly label
(function () {
  var names = { sh: "shell", shell: "shell", bash: "bash", zsh: "zsh", console: "terminal", yaml: "yaml", yml: "yaml",
    json: "json", sql: "sql", python: "python", py: "python", java: "java", js: "javascript", javascript: "javascript",
    ts: "typescript", typescript: "typescript", xml: "xml", html: "html", css: "css", go: "go", hcl: "terraform",
    terraform: "terraform", dockerfile: "dockerfile", docker: "dockerfile", powershell: "powershell", ps1: "powershell",
    ini: "ini", toml: "toml", text: "", txt: "", plaintext: "" };
  function tag(root) {
    root.querySelectorAll(".highlight[class*='language-']").forEach(function (el) {
      if (el.dataset.lang !== undefined) return;
      var m = el.className.match(/language-([\w+#-]+)/);
      var key = m ? m[1].toLowerCase() : "";
      var label = key in names ? names[key] : key;
      el.dataset.lang = label;
      if (/^(bash|shell|zsh|terminal|powershell)$/.test(label)) el.classList.add("is-term"); // shown as a terminal window
    });
  }
  if (window.document$) document$.subscribe(function () { tag(document) });
  else document.addEventListener("DOMContentLoaded", function () { tag(document) });
})();
