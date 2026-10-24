// Glossary cards: the dotted words (abbreviations from includes/glossary.md) open a small card in the page's colour
// with the full name, a plain-English meaning and, when there's a page on it, a "Read more" link.
// Hover or keyboard focus on desktop, tap on phones. Replaces the browser's plain title tooltip.
(function () {
  var LINKS = { // term: [page, name]
    "RAG": ["AI/rag/basic-rag/", "Basic RAG"], "GenAI": ["AI/genai/", "GenAI"], "MLOps": ["AI/mlops101/", "MLOps 101"],
    "NLP": ["AI/azure/nlp/", "NLP on Azure"], "MCP": ["blog/2025/08/10/agentic-ai-patterns/", "Agentic AI Patterns"],
    "VPC": ["aws/vpc/", "VPC"], "VNet": ["azure/vnet/", "Azure VNet"], "IAM": ["aws/iam/", "IAM"], "KMS": ["aws/kms/", "KMS"],
    "WAF": ["aws/waf/", "WAF"], "ELB": ["aws/lb/", "Load Balancers"], "ASG": ["aws/autoScaling/", "Auto Scaling"],
    "EC2": ["aws/ec2/", "EC2"], "EBS": ["aws/ebs/", "EBS"], "EFS": ["aws/efs/", "EFS"], "S3": ["aws/s3/", "S3"],
    "RDS": ["aws/rds/", "RDS"], "SQS": ["aws/sqs/", "SQS"], "SNS": ["aws/sns/", "SNS"], "ECS": ["aws/ecs/", "ECS"],
    "EKS": ["aws/eks/", "EKS"], "AKS": ["azure/aks/", "AKS"], "ECR": ["aws/ecr/", "ECR"], "ACR": ["azure/acr/", "ACR"],
    "ACL": ["aws/acl/", "ACLs"], "NACL": ["aws/acl/", "ACLs"], "NAT": ["aws/natgw/", "NAT Gateway"],
    "JWT": ["sys_design/concepts/jwt/", "JWT"], "CDN": ["sys_design/designPatterns/cdn/", "CDN pattern"],
    "CKA": ["k8s/cka-exam-commands/", "CKA exam commands"], "TOGAF": ["togaf/tog-basics/", "TOGAF Concepts"],
    "ADM": ["togaf/adm-phases/", "ADM Phases"], "CQRS": ["sys_design/designPatterns/cqrs/", "CQRS"],
    "BFF": ["sys_design/designPatterns/bff/", "Backend for Frontend"], "RPA": ["rpa/rpa-basics/", "RPA Basics"],
    "SQL": ["technical_stuff/sql_and_nosql/", "SQL and NoSQL"], "NoSQL": ["technical_stuff/sql_and_nosql/", "SQL and NoSQL"]
  };
  var card, openFor = null, hideTimer, showTimer;
  var touch = window.matchMedia("(hover: none)").matches;

  function base() {
    try { return new URL(JSON.parse(document.getElementById("__config").textContent).base, location.href).href; }
    catch (e) { return location.origin + "/"; }
  }
  function build() {
    card = document.createElement("div");
    card.className = "gloss";
    card.setAttribute("role", "tooltip");
    card.id = "gloss-card";
    card.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
    card.addEventListener("mouseleave", hideSoon);
    document.body.appendChild(card);
  }
  function show(el) {
    if (!card || !card.isConnected) build();
    clearTimeout(hideTimer);
    var term = el.textContent.trim(), text = el.dataset.gloss || "";
    var i = text.indexOf(": "), full = i > 0 ? text.slice(0, i) : "", meaning = i > 0 ? text.slice(i + 2) : text;
    card.innerHTML = '<span class="gloss__term"></span><b class="gloss__full"></b><span class="gloss__meaning"></span>';
    card.querySelector(".gloss__term").textContent = term;
    card.querySelector(".gloss__full").textContent = full;
    card.querySelector(".gloss__meaning").textContent = meaning;
    var link = LINKS[term];
    if (link) {
      var href = new URL(link[0], base()).href;
      if (href.split("#")[0] !== location.href.split("#")[0]) { // no "read more" to the page you're already on
        var a = document.createElement("a");
        a.className = "gloss__more"; a.href = href; a.textContent = "Read more: " + link[1] + " →";
        card.appendChild(a);
      }
    }
    card.classList.remove("is-on", "is-up");
    card.style.left = "0px"; card.style.top = "0px";
    var r = el.getBoundingClientRect(), w = card.offsetWidth, h = card.offsetHeight;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
    var below = r.bottom + 10 + h < innerHeight;
    card.style.left = left + scrollX + "px";
    card.style.top = (below ? r.bottom + 10 : r.top - h - 10) + scrollY + "px";
    card.style.setProperty("--arrow", (r.left + r.width / 2 - left) + "px");
    if (!below) card.classList.add("is-up");
    openFor = el;
    el.setAttribute("aria-describedby", "gloss-card");
    requestAnimationFrame(function () { card.classList.add("is-on"); });
  }
  function hide() {
    if (!card) return;
    card.classList.remove("is-on");
    if (openFor) openFor.removeAttribute("aria-describedby");
    openFor = null;
  }
  function hideSoon() { clearTimeout(showTimer); clearTimeout(hideTimer); hideTimer = setTimeout(hide, 220); }

  document$.subscribe(function () {
    hide();
    document.querySelectorAll(".md-content abbr[title]").forEach(function (el) {
      if (el.closest(".admonition-title, summary")) return; // e.g. the "DR" in TL;DR titles stays plain
      el.dataset.gloss = el.title;
      el.removeAttribute("title"); // no plain browser tooltip on top of the card
      el.classList.add("gloss-word");
      el.tabIndex = 0;
      if (touch) {
        el.addEventListener("click", function (e) { e.preventDefault(); openFor === el ? hide() : show(el); });
      } else {
        el.addEventListener("mouseenter", function () { clearTimeout(hideTimer); clearTimeout(showTimer); showTimer = setTimeout(function () { show(el); }, 120); });
        el.addEventListener("mouseleave", hideSoon);
      }
      el.addEventListener("focus", function () { show(el); });
      el.addEventListener("blur", hideSoon);
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
  document.addEventListener("click", function (e) {
    if (openFor && !e.target.closest(".gloss, .gloss-word")) hide();
  });
  window.addEventListener("scroll", function () { if (touch) hide(); }, { passive: true });
})();
