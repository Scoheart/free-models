/* free — /provider and /agent keep a platform in the hash (#groq). /vps is separate. */
(function (root) {
  "use strict";

  var SOURCE_HOSTS = {
    "x.com": 1,
    "twitter.com": 1,
    "mobile.twitter.com": 1,
    "v2ex.com": 1,
    "linux.do": 1,
    "reddit.com": 1,
    "old.reddit.com": 1,
    "news.ycombinator.com": 1,
    "t.me": 1,
    "weibo.com": 1,
    "mp.weixin.qq.com": 1,
  };

  var HOST_LABELS = {
    "openrouter.ai": "OpenRouter",
    "groq.com": "Groq",
    "console.groq.com": "Groq",
    "api.groq.com": "Groq",
    "cohere.com": "Cohere",
    "cohere.ai": "Cohere",
    "dashboard.cohere.com": "Cohere",
    "docs.cohere.com": "Cohere",
    "aistudio.google.com": "Google AI Studio",
    "ai.google.dev": "Google AI Studio",
    "makersuite.google.com": "Google AI Studio",
    "chatgpt.com": "OpenAI",
    "openai.com": "OpenAI",
    "platform.openai.com": "OpenAI",
    "developers.openai.com": "OpenAI",
    "help.openai.com": "OpenAI",
    "claude.com": "Anthropic",
    "claude.ai": "Anthropic",
    "clau.de": "Anthropic",
    "console.anthropic.com": "Anthropic",
    "anthropic.com": "Anthropic",
    "support.claude.com": "Anthropic",
    "docs.anthropic.com": "Anthropic",
    "huggingface.co": "Hugging Face",
    "hf.co": "Hugging Face",
    "chat.hf.co": "Hugging Face",
    "github.com": "GitHub",
    "github.io": "GitHub",
    "opencode.ai": "OpenCode",
    "vercel.com": "Vercel",
    "build.nvidia.com": "NVIDIA NIM",
    "developer.nvidia.com": "NVIDIA",
    "api.nvidia.com": "NVIDIA NIM",
    "bailian.console.aliyun.com": "阿里云百炼",
    "modelstudio.console.alibabacloud.com": "阿里云百炼",
    "help.aliyun.com": "阿里云",
    "alibabacloud.com": "阿里云",
    "platform.deepseek.com": "DeepSeek",
    "api-docs.deepseek.com": "DeepSeek",
    "deepseek.com": "DeepSeek",
    "platform.stepfun.com": "阶跃星辰",
    "platform.minimax.io": "MiniMax",
    "agent.minimax.io": "MiniMax",
    "minimax.io": "MiniMax",
    "platform.sensenova.cn": "商汤日日新",
    "sensetime.com": "商汤",
    "cloud.tencent.com": "腾讯云",
    "orcaterm.cloud.tencent.com": "腾讯云",
    "console.volcengine.com": "火山方舟",
    "volcengine.com": "火山方舟",
    "zenmux.ai": "ZenMux",
    "platform.flock.io": "FLock",
    "docs.flock.io": "FLock",
    "flock.io": "FLock",
    "fish.audio": "Fish Audio",
    "docs.fish.audio": "Fish Audio",
    "x.ai": "xAI",
    "console.x.ai": "xAI",
    "grok.com": "xAI",
    "aws.amazon.com": "Amazon Web Services",
    "console.aws.amazon.com": "Amazon Web Services",
    "kiro.dev": "Kiro",
    "app.kiro.dev": "Kiro",
    "kiroween.devpost.com": "Kiro",
    "cline.bot": "Cline",
    "app.cline.bot": "Cline",
    "docs.cline.bot": "Cline",
    "portal.nousresearch.com": "Nous Portal",
    "nousresearch.com": "Nous",
    "hermes-agent.nousresearch.com": "Nous",
    "platform.iteracompute.com": "IteraCompute",
    "iteracompute.com": "IteraCompute",
    "apinex.bond": "APInex",
    "platform.experientiallabs.ai": "Experiential Labs",
    "experientiallabs.ai": "Experiential Labs",
    "commandcode.ai": "Command Code",
    "you.com": "You.com",
    "platform.ifm.ai": "IFM",
    "docs.ifm.ai": "IFM",
    "api.ifm.ai": "IFM",
    "ifm.ai": "IFM",
    "docs.bigmodel.cn": "智谱",
    "open.bigmodel.cn": "智谱",
    "bigmodel.cn": "智谱",
    "autoclaw.zhipuai.cn": "智谱",
    "zhipuai.cn": "智谱",
    "cloud.siliconflow.cn": "硅基流动",
    "siliconflow.cn": "硅基流动",
    "docs.siliconflow.cn": "硅基流动",
    "mimo.mi.com": "小米 MiMo",
    "portal.qiniu.com": "七牛云",
    "qiniu.com": "七牛云",
    "platform.agentscope.io": "AgentScope",
    "agentscope.io": "AgentScope",
    "platform.yeta.ai": "Yeta",
    "yeta.ai": "Yeta",
    "platform.mosi.cn": "Mosi",
    "mosi.cn": "Mosi",
    "workbuddy.cn": "WorkBuddy",
    "workbuddy.ai": "WorkBuddy",
    "gmicloud.ai": "GMI Cloud",
    "console.gmicloud.ai": "GMI Cloud",
    "platform.inworld.ai": "Inworld",
    "inworld.ai": "Inworld",
    "platform.inceptionlabs.ai": "Inception Labs",
    "inceptionlabs.ai": "Inception Labs",
    "chat.inceptionlabs.ai": "Inception Labs",
    "heygen.com": "HeyGen",
    "developers.heygen.com": "HeyGen",
    "docs.heygen.com": "HeyGen",
    "app.heygen.com": "HeyGen",
    "bolt.new": "Bolt",
    "docker.com": "Docker",
    "runware.ai": "Runware",
    "my.runware.ai": "Runware",
    "liquid.ai": "Liquid AI",
    "console.liquid.ai": "Liquid AI",
    "docs.liquid.ai": "Liquid AI",
    "discovery.intern-ai.org.cn": "书生 Intern",
    "intern-ai.org.cn": "书生 Intern",
    "runanywhere.ai": "RunAnywhere",
    "console.runanywhere.ai": "RunAnywhere",
    "docs.runanywhere.ai": "RunAnywhere",
    "prismml.com": "PrismML",
    "docs.prismml.com": "PrismML",
    "mangoboost.io": "MangoBoost",
    "inference.mangoboost.io": "MangoBoost",
    "ollama.com": "Ollama",
    "perchai.app": "Perch AI",
    "orcarouter.ai": "OrcaRouter",
    "antigravity.google": "Google Antigravity",
    "gemini.google.com": "Gemini",
    "gemini.google": "Gemini",
    "ai.google": "Google",
    "one.google.com": "Google",
    "blog.google": "Google",
    "research.google": "Google",
    "developers.google.com": "Google",
    "me.developers.google.com": "Google",
    "developers.googleblog.com": "Google",
    "developers.cloudflare.com": "Cloudflare Workers AI",
    "blog.cloudflare.com": "Cloudflare",
    "cloudflare.com": "Cloudflare",
    "cloud.cerebras.ai": "Cerebras",
    "cerebras.ai": "Cerebras",
    "together.ai": "Together AI",
    "api.together.ai": "Together AI",
    "fireworks.ai": "Fireworks",
    "app.fireworks.ai": "Fireworks",
    "replicate.com": "Replicate",
    "fal.ai": "fal",
    "mistral.ai": "Mistral",
    "docs.mistral.ai": "Mistral",
    "console.mistral.ai": "Mistral",
    "studio.ai21.com": "AI21 Studio",
    "ai21.com": "AI21",
    "elevenlabs.io": "ElevenLabs",
    "join.elevenlabs.io": "ElevenLabs",
    "deepgram.com": "Deepgram",
    "console.deepgram.com": "Deepgram",
    "developers.deepgram.com": "Deepgram",
    "modelscope.cn": "ModelScope",
    "modelscope.ai": "ModelScope",
    "zcode.z.ai": "ZCode",
    "qoder.com": "Qoder",
    "docs.qoder.com": "Qoder",
    "docs.qoder.cn": "Qoder",
    "qoder.cn": "Qoder",
    "freebuff.com": "Freebuff",
    "freepi.ai": "free-pi",
    "kimi.com": "Kimi",
    "moonshot.cn": "Kimi",
    "marketplace.visualstudio.com": "VS Code",
    "cursor.com": "Cursor",
    "zed.dev": "Zed",
    "devin.ai": "Devin",
    "docs.devin.ai": "Devin",
    "exa.ai": "Exa",
    "dashboard.exa.ai": "Exa",
    "tavily.com": "Tavily",
    "app.tavily.com": "Tavily",
    "docs.tavily.com": "Tavily",
    "firecrawl.dev": "Firecrawl",
    "docs.firecrawl.dev": "Firecrawl",
    "jina.ai": "Jina",
    "voyageai.com": "Voyage AI",
    "dashboard.voyageai.com": "Voyage AI",
    "docs.voyageai.com": "Voyage AI",
    "modal.com": "Modal",
    "nebius.com": "Nebius",
    "tokenfactory.nebius.com": "Nebius",
    "dev.nebius.com": "Nebius",
    "sambanova.ai": "SambaNova",
    "cloud.sambanova.ai": "SambaNova",
    "docs.sambanova.ai": "SambaNova",
    "novita.ai": "Novita",
    "baseten.co": "Baseten",
    "app.baseten.co": "Baseten",
    "digitalocean.com": "DigitalOcean",
    "scaleway.com": "Scaleway",
    "console.scaleway.com": "Scaleway",
    "ovhcloud.com": "OVHcloud",
    "endpoints.ai.cloud.ovh.net": "OVHcloud",
    "cloud.google.com": "Google Cloud",
    "console.cloud.google.com": "Google Cloud",
    "colab.research.google.com": "Google Colab",
    "aistudio.baidu.com": "百度 AI Studio",
    "cloud.baidu.cn": "百度智能云",
    "ai.baidu.com": "百度 AI",
    "baidu.com": "百度",
    "xfyun.cn": "讯飞",
    "console.xfyun.cn": "讯飞",
    "maas.xfyun.cn": "讯飞",
    "xinghuo.xfyun.cn": "讯飞星火",
    "cloud.tencent.com.cn": "腾讯云",
    "antigravity.google.com": "Google Antigravity",
    "canva.com": "Canva",
    "community.canva.dev": "Canva",
    "perplexity.ai": "Perplexity",
    "x.com": "X",
    "twitter.com": "X",
    "v2ex.com": "V2EX",
    "linux.do": "Linux.do",
    "duckduckgo.com": "DuckDuckGo",
    "duck.ai": "DuckDuckGo",
    "npmjs.com": "npm",
    "sailresearch.com": "Sail Research",
    "app.sailresearch.com": "Sail Research",
    "docs.sailresearch.com": "Sail Research",
    "optracloud.com": "OptraCloud",
    "api.optracloud.com": "OptraCloud",
    "freeinference.org": "FreeInference",
    "doc.freeinference.org": "FreeInference",
    "velork.com": "Velork",
    "nodecode.ai": "Nodecode",
    "directionallylocal.com": "Directionally Local",
    "dl.new": "Directionally Local",
    "traycer.ai": "Traycer",
    "unorouter.com": "UnoRouter",
    "larprouter.com": "Larprouter",
    "blazerail.com": "BlazeRail",
    "tokenharbor.ai": "TokenHarbor",
    "infron.ai": "Infron",
    "beatapi.io": "BeatAPI",
    "docs.beatapi.io": "BeatAPI",
    "scnet.cn": "SCNet",
    "oxionai.com": "Oxion",
    "deepai.org": "DeepAI",
    "codecraftapi.com": "CodeCraft",
    "viorant.ai": "Viorant",
    "docs.viorant.ai": "Viorant",
    "ppq.ai": "PPQ",
    "dphn.ai": "DPHN",
    "app.dphn.ai": "DPHN",
    "trustedrouter.com": "TrustedRouter",
    "batchrate.ai": "BatchRate",
    "tuqu.ai": "TUQU",
    "assemblyai.com": "AssemblyAI",
    "requesty.ai": "Requesty",
    "maximoai.co": "Maximo",
    "todayai.cn": "TodayAI",
    "xiaohuanxiong.com": "小浣熊",
    "runinfra.ai": "RunInfra",
    "sandbase.ai": "Sandbase",
    "pojia.ai": "PoJia",
    "infini-ai.com": "无问芯穹",
    "docs.infini-ai.com": "无问芯穹",
    "cloud.infini-ai.com": "无问芯穹",
    "decuff.ai": "Decuff",
    "specstream.ai": "SpecStream",
    "simular.ai": "Simular",
    "box.simular.ai": "Simular",
    "context.dev": "Context.dev",
    "antseed.com": "Antseed",
    "inferx.net": "InferX",
    "model.inferx.net": "InferX",
    "freemilk.ai": "FreeMilk",
    "llmtr.com": "LLMTR",
    "antdigital.com": "蚂蚁数科",
    "maas.antdigital.com": "蚂蚁数科",
    "unisound.com": "云知声",
    "maas.unisound.com": "云知声",
    "ant-ling.com": "Ant Ling",
    "developer.ant-ling.com": "Ant Ling",
    "chat.ant-ling.com": "Ant Ling",
    "nomask.ai": "Nomask",
    "atomicagent.io": "Atomic Agent",
    "kilo.ai": "Kilo",
    "viggle.ai": "Viggle",
    "portal.viggle.ai": "Viggle",
    "docs.viggle.ai": "Viggle",
    "longcat.ai": "LongCat",
    "trae.cn": "TRAE",
    "docs.trae.cn": "TRAE",
    "forum.trae.cn": "TRAE",
    "kojo.sh": "Kojo",
    "edenai.co": "Eden AI",
    "app.edenai.run": "Eden AI",
    "edenai.run": "Eden AI",
    "speechmatics.com": "Speechmatics",
    "docs.speechmatics.com": "Speechmatics",
    "portal.speechmatics.com": "Speechmatics",
    "qdrant.tech": "Qdrant",
    "cloud.qdrant.io": "Qdrant",
    "coderabbit.ai": "CodeRabbit",
    "app.coderabbit.ai": "CodeRabbit",
    "docs.coderabbit.ai": "CodeRabbit",
    "nscale.com": "Nscale",
    "console.nscale.com": "Nscale",
    "docs.nscale.com": "Nscale",
    "thundercompute.com": "ThunderCompute",
    "console.thundercompute.com": "ThunderCompute",
    "giotto.ai": "Giotto",
    "cloud.giotto.ai": "Giotto",
    "articul8.ai": "Articul8",
    "app.articul8.ai": "Articul8",
    "docs.articul8.ai": "Articul8",
    "whatstoken.ai": "WhatsToken",
    "token360.ai": "Token360",
    "anyrouter.dev": "AnyRouter",
    "constellationgate.ai": "Constellation Gate",
    "app.constellationgate.ai": "Constellation Gate",
    "modulate.ai": "Modulate",
    "videogen.io": "Videogen",
    "eigent.ai": "Eigent",
    "swarms.ai": "Swarms",
    "praex.ai": "Praex",
    "sakana.ai": "Sakana",
    "chat.sakana.ai": "Sakana",
    "console.sakana.ai": "Sakana",
    "arena.ai": "Arena",
    "bfl.ai": "Black Forest Labs",
    "gradium.ai": "Gradium",
    "exaone.ai": "EXAONE",
    "docs.exaone.ai": "EXAONE",
    "upstage.ai": "Upstage",
    "console.upstage.ai": "Upstage",
    "nopaywall.io": "Nopaywall",
    "hal-x.ai": "HAL-X",
    "api.hal-x.ai": "HAL-X",
    "empero.org": "Empero",
    "free.empero.org": "Empero",
    "river.ai": "River",
    "console.river.ai": "River",
    "docs.river.ai": "River",
    "munito.ai": "Munito",
    "console.munito.ai": "Munito",
    "docs.munito.ai": "Munito",
    "sarashina.ai": "Sarashina",
    "docs.sarashina.ai": "Sarashina",
    "odyssey.systems": "Odyssey",
    "experience.odyssey.systems": "Odyssey",
    "developer.odyssey.ml": "Odyssey",
    "meta.ai": "Meta",
    "dev.meta.ai": "Meta",
    "research.meta.ai": "Meta",
    "developer.amd.com.cn": "AMD",
    "amd-aim.github.io": "AMD",
    "jetbrains.com": "JetBrains",
    "blog.jetbrains.com": "JetBrains",
    "apple.com": "Apple",
    "developer.apple.com": "Apple",
    "apps.apple.com": "App Store",
    "opera.com": "Opera",
    "next.opera.com": "Opera",
    "blogs.opera.com": "Opera",
    "databricks.com": "Databricks",
    "docs.databricks.com": "Databricks",
    "huaweicloud.com": "华为云",
    "support.huaweicloud.com": "华为云",
    "activity.huaweicloud.com": "华为云",
    "bilibili.com": "哔哩哔哩",
    "index-translate.bilibili.com": "哔哩哔哩",
    "dify.ai": "Dify",
    "akashml.com": "Akash",
    "playground.akashml.com": "Akash",
    "paddleocr.com": "PaddleOCR",
    "paddleocr.ai": "PaddleOCR",
    "indicstack.ai": "IndicStack",
    "console.indicstack.ai": "IndicStack",
    "krafton.ai": "Krafton",
    "raon-mini.krafton.ai": "Krafton",
    "raon-console.krafton.ai": "Krafton",
    "tinyfish.ai": "TinyFish",
    "agent.tinyfish.ai": "TinyFish",
    "coralbricks.ai": "Coral Bricks",
    "tabbit.ai": "Tabbit",
    "monkeycode-ai.com": "MonkeyCode",
    "scaledown.ai": "ScaleDown",
    "docs.scaledown.ai": "ScaleDown",
    "lightvela.com": "LightVela",
    "artexllm.com": "Artex",
    "subq.ai": "SubQ",
    "freellmapi.co": "FreeLLM",
    "cleanapis.com": "CleanAPIs",
    "railway.com": "Railway",
    "mlh.com": "MLH",
    "events.mlh.com": "MLH",
    "coursera.org": "Coursera",
    "arxiv.org": "arXiv",
    "forms.gle": "Google Forms",
    "chromewebstore.google.com": "Chrome 网上应用店",
    "pi.dev": "Pi",
    "jio.com": "Jio",
    "verizon.com": "Verizon",
    "codebuddy.cn": "CodeBuddy",
    "agnes-ai.com": "Agnes",
    "platform.agnes-ai.com": "Agnes",
    "wiki.agnes-ai.com": "Agnes",
    "0g.ai": "0G",
    "pc.0g.ai": "0G",
    "tether.io": "Tether",
    "qvac.tether.io": "QVAC",
    "zellige.ai": "Zellige",
    "darkbloom.dev": "Darkbloom",
    "console.darkbloom.dev": "Darkbloom",
    "nace.ai": "Nace",
    "console.nace.ai": "Nace",
    "raphael.app": "Raphael",
    "thewavecode.com": "Wave Code",
    "z.ai": "Z.ai",
    "autoclaw.z.ai": "Z.ai",
    "fikraapi.co.ke": "Fikra",
    "udgamlabs.com": "UDGAM",
    "vgenv.com": "VGen",
    "somark.ai": "Somark",
    "free-oxr.somark.ai": "Somark",
    "deepworks.cn": "DeepWorks",
    "deepexi.com": "DeepWorks",
    "deepworks.deepexi.com": "DeepWorks",
    "vllm-sr.ai": "vLLM",
    "decision.vllm-sr.ai": "vLLM",
    "omnirush.ai": "OmniRush",
    "instabox.sh": "Instabox",
    "gonkarouter.io": "GonkaRouter",
    "xgoose.org": "xGoose",
    "systalyze.com": "Systalyze",
    "console.systalyze.com": "Systalyze",
    "speedai.com": "SpeedAI",
    "codar.speedai.com": "SpeedAI",
    "hi3d.ai": "Hi3D",
    "deapi.ai": "deAPI",
    "app.deapi.ai": "deAPI",
    "cnb.cool": "CNB",
    "ccode.si": "CCode",
    "starkrelay.bond": "StarkRelay",
    "getonespace.com": "OneSpace",
    "pages.edgeone.ai": "EdgeOne",
    "edgeone.ai": "EdgeOne",
    "makers.edgeone.link": "EdgeOne",
    "llm7.io": "LLM7",
    "dash.llm7.io": "LLM7",
    "bynara.id": "Bynara",
    "router.bynara.id": "Bynara",
    "xkiro.com": "xKiro",
    "cookstudio.ai": "CookStudio",
    "app.cookstudio.ai": "CookStudio",
    "moonmath.ai": "MoonMath",
    "zro.moonmath.ai": "MoonMath",
    "alysiscode.com": "Alysis",
    "models.dev": "Models.dev",
    "sgl-project.github.io": "SGLang",
    "esa.int": "ESA",
    "eve.philab.esa.int": "ESA",
    "cudos.org": "CUDOS",
    "asicloud.cudos.org": "CUDOS",
    "singularitycompute.com": "Singularity Compute",
    "devpost.com": "Devpost",
    "fx.sh": "fx",
    "treg.to": "treg",
    "vids.new": "Google Vids",
    "cloudbase.net": "CloudBase",
    "docs.cloudbase.net": "CloudBase",
    "mac.install.guide": "mac.install.guide",
  };

  function asList(v) {
    return Array.isArray(v) ? v : [];
  }

  function escapeHtml(s) {
    var AMP = String.fromCharCode(38);
    var map = {
      "\u0026": AMP + "amp;",
      "\u003c": AMP + "lt;",
      "\u003e": AMP + "gt;",
      "\u0022": AMP + "quot;",
    };
    return String(s).replace(/[\u0026\u003c\u003e\u0022]/g, function (c) {
      return map[c];
    });
  }

  function isExpired(item, now) {
    if (item.expired === true || item.is_expired === true) return true;
    var deadline = item.deadline || item.expires_at || item.expire_at || item.expires;
    if (!deadline) return false;
    var t = Date.parse(deadline);
    return Number.isNaN(t) ? false : t < now;
  }

  function isSuperseded(item) {
    if (item.superseded === true || item.is_superseded === true) return true;
    var by = item.superseded_by != null ? item.superseded_by : item.supersededBy;
    if (by == null || by === false) return false;
    return String(by).trim() !== "";
  }

  function redactSecrets(s) {
    var out = String(s);
    out = out.replace(/\b(?:sk|pk|rk|ak|ghp|gho|github_pat)_[A-Za-z0-9_\-]{8,}/g, "[redacted]");
    out = out.replace(/\b(?:sk|pk|rk|ak)-[A-Za-z0-9_\-]{12,}/g, "[redacted]");
    out = out.replace(
      /((?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|password)\s*[:=]\s*)\S+/gi,
      "$1[redacted]"
    );
    out = out.replace(/\bBearer\s+[A-Za-z0-9._\-]{8,}/gi, "Bearer [redacted]");
    return out;
  }

  function clipText(s, max) {
    var t = String(s).replace(/\s+/g, " ").trim();
    if (t.length <= max) return t;
    return t.slice(0, max).replace(/[\s,，。；;、]+$/g, "") + "\u2026";
  }

  function norm(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim();
  }

  function cmpName(a, b) {
    var as = String(a || "");
    var bs = String(b || "");
    try {
      return as.localeCompare(bs, "zh-CN", { sensitivity: "base", numeric: true });
    } catch (e) {
      if (as < bs) return -1;
      if (as > bs) return 1;
      return 0;
    }
  }

  function titleOf(item) {
    return String(item.title || item.name || item.model || "未命名");
  }

  function deadlineOf(item) {
    return item.deadline || item.expires_at || item.expire_at || item.expires || "";
  }

  function deadlineMs(item) {
    var d = deadlineOf(item);
    if (!d) return null;
    var t = Date.parse(String(d));
    return Number.isNaN(t) ? null : t;
  }

  function autoClaimView(item) {
    var ac, status, note, at;
    ac = item && item.auto_claim;
    if (!ac || typeof ac !== "object" || Array.isArray(ac)) return null;
    status = String(ac.status == null ? "" : ac.status).trim().toLowerCase();
    note = ac.note == null ? "" : clipText(redactSecrets(String(ac.note)), 240);
    at = ac.at == null ? "" : clipText(redactSecrets(String(ac.at)), 48);
    if (status === "success") return { kind: "success", label: "已自动领取", note: note, at: at };
    if (status === "failed") return { kind: "failed", label: "自动申请失败", note: note, at: at };
    if (status === "needs_user") return { kind: "needs-user", label: "需要你本人操作", note: note, at: at };
    return null;
  }

  function summaryStatus(offers) {
    var i, view, hasUser, hasFail;
    hasUser = false;
    hasFail = false;
    for (i = 0; i < offers.length; i++) {
      view = autoClaimView(offers[i]);
      if (!view) continue;
      if (view.kind === "success") return "success";
      if (view.kind === "needs-user") hasUser = true;
      else if (view.kind === "failed") hasFail = true;
    }
    if (hasUser) return "needs-user";
    if (hasFail) return "failed";
    return "";
  }

  function statusLabel(status) {
    if (status === "success") return "有已自动领取";
    if (status === "needs-user") return "有需要本人操作";
    if (status === "failed") return "有自动申请失败";
    return "";
  }

  function hostnameOf(url) {
    var m = String(url || "").trim().match(/^https?:\/\/([^\/?#]+)/i);
    if (!m) return "";
    return m[1].replace(/:\d+$/, "").replace(/^www\./i, "").toLowerCase();
  }

  function prettifyToken(sld) {
    var special = {
      ai: "AI",
      api: "API",
      llm: "LLM",
      openai: "OpenAI",
      openrouter: "OpenRouter",
      huggingface: "Hugging Face",
      deepseek: "DeepSeek",
      chatgpt: "ChatGPT",
      github: "GitHub",
      nvidia: "NVIDIA",
      aws: "AWS",
    };
    var bits, i, w, out;
    if (!sld) return "";
    if (special[sld]) return special[sld];
    bits = String(sld).split(/[-_]+/);
    out = [];
    for (i = 0; i < bits.length; i++) {
      w = bits[i];
      if (!w) continue;
      if (special[w]) out.push(special[w]);
      else if (w.length <= 2) out.push(w.toUpperCase());
      else out.push(w.charAt(0).toUpperCase() + w.slice(1));
    }
    return out.join(" ");
  }

  function platformFromUrl(url) {
    var host, parts, i, candidate, sld, tld;
    host = hostnameOf(url);
    if (!host) return "";
    if (host === "vercel.com" && /ai-gateway/i.test(String(url))) return "Vercel AI Gateway";
    parts = host.split(".");
    for (i = 0; i < parts.length; i++) {
      candidate = parts.slice(i).join(".");
      if (HOST_LABELS[candidate]) return HOST_LABELS[candidate];
    }
    sld = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    tld = parts[parts.length - 1];
    if ((sld === "co" || sld === "com" || sld === "org" || sld === "net" || sld === "gov" || sld === "ac") && parts.length >= 3) {
      sld = parts[parts.length - 3];
    }
    if (tld && HOST_LABELS[sld + "." + tld]) return HOST_LABELS[sld + "." + tld];
    if (HOST_LABELS[sld]) return HOST_LABELS[sld];
    return prettifyToken(sld);
  }

  function collectUrls(item) {
    var urls = [];
    function pushList(list) {
      var i, e, u;
      list = asList(list);
      for (i = 0; i < list.length; i++) {
        e = list[i];
        if (!e || typeof e !== "object") continue;
        u = e.action_url || e.url;
        if (u) urls.push(String(u));
      }
    }
    pushList(item.providers);
    if (item.official_url) urls.push(String(item.official_url));
    if (item.terms_url) urls.push(String(item.terms_url));
    pushList(item.models);
    pushList(item.agents);
    if (item.docs_url) urls.push(String(item.docs_url));
    if (item.url || item.link || item.source_url) urls.push(String(item.url || item.link || item.source_url));
    return urls;
  }

  function platformOf(item) {
    var named, urls, i, host, label, fallback;
    if (!item || typeof item !== "object") return "其他";
    named = item.platform != null ? String(item.platform).replace(/\s+/g, " ").trim() : "";
    if (named) return named;
    urls = collectUrls(item);
    fallback = "";
    for (i = 0; i < urls.length; i++) {
      host = hostnameOf(urls[i]);
      label = platformFromUrl(urls[i]);
      if (!label) continue;
      if (!fallback) fallback = label;
      if (host && !SOURCE_HOSTS[host]) return label;
    }
    return fallback || "其他";
  }

  // Venue classification for the Providers / Agents tabs.
  // Optional item.category (or item.kind) of "providers" or "agents" wins.
  // Otherwise the platform, title lead, and product name are matched against
  // known agent apps and a few name patterns (IDE / CLI / * Code). Everything
  // else, including new gateways the hourly scan adds, stays in Providers.
  var AGENT_VENUES = {
    "devin": 1,
    "traycer": 1,
    "cursor": 1,
    "kiro": 1,
    "aws kiro": 1,
    "claude": 1,
    "claude code": 1,
    "minimax code": 1,
    "opencode": 1,
    "cline": 1,
    "kilo": 1,
    "kilo code": 1,
    "qoder": 1,
    "zed": 1,
    "workbuddy": 1,
    "google antigravity": 1,
    "antigravity": 1,
    "command code": 1,
    "hermes": 1,
    "hermes desktop": 1,
    "hermes agent": 1,
    "freebuff": 1,
    "free-pi": 1,
    "freepi": 1,
    "zcode": 1,
    "智谱 zcode": 1,
    "autoclaw": 1,
    "智谱 autoclaw": 1,
    "codar": 1,
    "科搭 codar": 1,
    "deepworks": 1,
    "滴普 deepworks": 1,
    "adcode": 1,
    "ccode": 1,
    "deepai code": 1,
    "eaon code": 1,
    "eigent": 1,
    "freemilk": 1,
    "omnirush": 1,
    "velork": 1,
    "wave code": 1,
    "atomic agent": 1,
    "agentscope": 1,
    "opencrabs": 1,
    "nodecode": 1,
    "alysis code": 1,
    "monkeycode": 1,
    "praex": 1,
    "windsurf": 1,
    "copilot": 1,
    "github copilot": 1,
    "codex": 1,
    "trae": 1,
    "aider": 1,
    "roo": 1,
    "roo code": 1,
    "bolt": 1,
    "replit": 1,
    "continue": 1,
    "deepseek harness": 1,
    "oc ferry": 1,
  };

  var FORCE_PROVIDER = {
    "free claude code": 1,
    "xkiro": 1,
    "omniroute": 1,
    "freellmapi": 1,
    "freeinference": 1,
  };

  var PROVIDER_VENUE_RE = /\b(api|apis|gateway|router|inference|studio|cloud|nim|endpoint|endpoints)\b|开放平台|网关|路由/;
  var AGENT_VENUE_RE = /(?:^| )(code|coder|cli|ide|desktop|agent)$|代码编辑器|编程 agent|编码 agent|coding agent|\bide\b|\bcli\b|\bdesktop\b/;

  function normalizeVenue(s) {
    var n = norm(s);
    n = n.replace(/[（(][^）)]*[）)]/g, " ");
    n = n.replace(/\b\d+(?:\.\d+)+\b/g, " ");
    n = n.replace(/[\/|、+]+/g, " ");
    n = n.replace(/\s+/g, " ").trim();
    return n;
  }

  function explicitKind(item) {
    var raw, n;
    if (!item || typeof item !== "object") return "";
    raw = item.category != null ? item.category : item.kind;
    n = norm(raw);
    if (n === "agent" || n === "agents") return "agents";
    if (n === "provider" || n === "providers") return "providers";
    return "";
  }

  function nameLooksLikeAgent(name) {
    var n, token;
    n = normalizeVenue(name);
    if (!n) return false;
    if (FORCE_PROVIDER[n]) return false;
    if (AGENT_VENUES[n]) return true;
    if (PROVIDER_VENUE_RE.test(n)) return false;
    token = n.split(" ")[0];
    if (token && AGENT_VENUES[token]) return true;
    if (AGENT_VENUE_RE.test(n)) return true;
    token = n.split(" ").pop();
    if (token && /^[a-z0-9][a-z0-9-]{1,22}code$/.test(token)) return true;
    return false;
  }

  function titleLead(title) {
    var m = String(title || "").trim().match(/^([^:：]{1,48})[:：]/);
    return m ? m[1].trim() : "";
  }

  function leadIsAgent(title) {
    return nameLooksLikeAgent(titleLead(title));
  }

  function leadIsCodingTool(title) {
    var n, token;
    n = normalizeVenue(titleLead(title));
    if (!n) return false;
    if (n.indexOf("claude code") === 0) return true;
    token = n.split(" ")[0];
    if (token === "claude") return false;
    return nameLooksLikeAgent(n);
  }

  function headIsAgent(product) {
    var head = String(product || "").split(/\s*[·•]\s*/)[0];
    return nameLooksLikeAgent(head);
  }

  function isApiCredit(item) {
    var text = norm(String(item.title || "") + " " + String(item.product || ""));
    return /api\s*额度|api credits|每月 api|api key/.test(text);
  }

  function inAppAgentHeuristic(item) {
    var blob, ag, pr;
    ag = asList(item.agents).length;
    pr = asList(item.providers).length;
    if (!ag || pr) return false;
    blob = norm(String(item.title || "") + " " + String(item.product || "") + " " + platformOf(item));
    return /代码编辑器|编程\s*agent|编码\s*agent|coding agent|终端编程|桌面编程|\bcli\b|\bide\b/.test(blob);
  }

  function categoryOf(item) {
    var explicit, platform, platformAgent, blob;
    if (!item || typeof item !== "object") return "providers";
    explicit = explicitKind(item);
    if (explicit) return explicit;
    platform = platformOf(item);
    if (FORCE_PROVIDER[normalizeVenue(platform)]) return "providers";
    platformAgent = nameLooksLikeAgent(platform);
    blob = norm(String(item.title || "") + " " + String(item.product || ""));
    // "Claude … API 额度" is the Anthropic API, not the Claude app. A title that
    // leads with a specific agent (Codex, Cursor, Cline, …) stays in Agents.
    if (isApiCredit(item) && !platformAgent && !leadIsCodingTool(item.title) && !/code review/.test(blob)) return "providers";
    if (platformAgent) return "agents";
    if (leadIsAgent(item.title) || headIsAgent(item.product)) return "agents";
    if (inAppAgentHeuristic(item)) return "agents";
    return "providers";
  }

  function groupsInKind(groups, kind) {
    var want, out, i, g, offers, j, ms, nearest;
    want = kind === "agents" ? "agents" : "providers";
    out = [];
    groups = groups || [];
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      offers = [];
      nearest = Infinity;
      for (j = 0; j < g.offers.length; j++) {
        if (categoryOf(g.offers[j]) !== want) continue;
        offers.push(g.offers[j]);
        ms = deadlineMs(g.offers[j]);
        if (ms != null && ms < nearest) nearest = ms;
      }
      if (!offers.length) continue;
      out.push({ name: g.name, slug: g.slug, offers: offers, nearest: nearest });
    }
    out.sort(function (a, b) {
      if (a.nearest !== b.nearest) return a.nearest - b.nearest;
      return cmpName(a.name, b.name);
    });
    return out;
  }

  function slugify(name) {
    var s = String(name == null ? "" : name).trim().toLowerCase();
    s = s.replace(/\s+/g, "-");
    s = s.replace(/[^a-z0-9\u3400-\u9fff-]+/g, "-");
    s = s.replace(/-+/g, "-").replace(/^-|-$/g, "");
    return s || "platform";
  }

  function claimUrl(item) {
    var i, list, e;
    list = asList(item.providers);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e && (e.action_url || e.url)) return String(e.action_url || e.url);
    }
    list = asList(item.agents);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e && (e.action_url || e.url)) return String(e.action_url || e.url);
    }
    list = asList(item.models);
    for (i = 0; i < list.length; i++) {
      e = list[i];
      if (e && (e.action_url || e.url)) return String(e.action_url || e.url);
    }
    return String(item.url || item.link || item.source_url || "");
  }

  function goUrl(item) {
    var direct, host, claim;
    direct = String(item.url || item.link || item.source_url || "");
    host = hostnameOf(direct);
    if (direct && host && !SOURCE_HOSTS[host]) return direct;
    claim = claimUrl(item);
    return claim || direct;
  }

  function safeUrl(u) {
    var s = redactSecrets(String(u || "")).trim();
    if (!/^https?:\/\//i.test(s)) return "";
    if (/[\s<>"']/.test(s)) return "";
    if (/javascript:/i.test(s)) return "";
    return s;
  }

  function guideFromValue(entry) {
    var step, detail, note, url;
    if (entry == null) return null;
    if (typeof entry === "string") {
      detail = redactSecrets(entry).replace(/\s+/g, " ").trim();
      if (!detail) return null;
      return { step: "", detail: detail, url: "", note: "" };
    }
    if (typeof entry !== "object" || Array.isArray(entry)) return null;
    step = entry.step == null ? "" : redactSecrets(String(entry.step)).replace(/\s+/g, " ").trim();
    detail = entry.detail == null ? "" : redactSecrets(String(entry.detail)).trim();
    note = entry.note == null ? "" : redactSecrets(String(entry.note)).replace(/\s+/g, " ").trim();
    url = entry.url == null ? "" : redactSecrets(String(entry.url)).trim();
    if (!step && !detail && !note && !url) return null;
    return { step: step, detail: detail, url: url, note: note };
  }

  function splitStepString(raw) {
    var text, parts, i, part, out;
    text = String(raw == null ? "" : raw).trim();
    if (!text) return [];
    parts = text.split(/\r?\n+/);
    if (parts.length === 1) parts = text.split(/[；;]+/);
    out = [];
    for (i = 0; i < parts.length; i++) {
      part = parts[i].replace(/\s+/g, " ").trim();
      part = part.replace(/^(?:如何领取[:：]\s*)/, "");
      part = part.replace(/^\d+\s*[\.、\)]\s*/, "");
      if (part) out.push(part);
    }
    return out;
  }

  function claimGuideOf(item) {
    var steps, i, step, raw, parts;
    steps = [];
    if (!item || typeof item !== "object") return steps;
    if (Array.isArray(item.claim_guide)) {
      for (i = 0; i < item.claim_guide.length; i++) {
        step = guideFromValue(item.claim_guide[i]);
        if (step) steps.push(step);
      }
      if (steps.length) return steps;
    }
    raw = item.claim_steps;
    if (Array.isArray(raw)) {
      for (i = 0; i < raw.length; i++) {
        if (raw[i] && typeof raw[i] === "object") {
          step = guideFromValue(raw[i]);
          if (step) steps.push(step);
        } else {
          parts = String(raw[i] == null ? "" : raw[i]).replace(/\s+/g, " ").trim();
          if (parts) steps.push({ step: "", detail: redactSecrets(parts), url: "", note: "" });
        }
      }
      if (steps.length) return steps;
    } else if (typeof raw === "string" && raw.trim()) {
      parts = splitStepString(raw);
      for (i = 0; i < parts.length; i++) {
        steps.push({ step: "", detail: redactSecrets(parts[i]), url: "", note: "" });
      }
      if (steps.length) return steps;
    }
    return steps;
  }

  function haystack(item) {
    var bits, guide, i, lists, n, e, list;
    bits = [
      titleOf(item),
      item.model,
      item.product,
      item.summary,
      item.free_terms,
      item.desc,
      item.description,
      item.platform,
    ];
    guide = claimGuideOf(item);
    for (i = 0; i < guide.length; i++) {
      bits.push(guide[i].step, guide[i].detail, guide[i].note);
    }
    lists = [item.providers, item.agents, item.models];
    for (n = 0; n < lists.length; n++) {
      list = asList(lists[n]);
      for (i = 0; i < list.length; i++) {
        e = list[i];
        if (e && typeof e === "object" && e.name) bits.push(e.name);
      }
    }
    return norm(redactSecrets(bits.filter(function (x) { return x != null && String(x).trim() !== ""; }).join("\n")));
  }

  function activeItems(items, now) {
    var all, out, i, it;
    all = Array.isArray(items) ? items : [];
    out = [];
    for (i = 0; i < all.length; i++) {
      it = all[i];
      if (!it || typeof it !== "object") continue;
      if (isExpired(it, now) || isSuperseded(it)) continue;
      out.push(it);
    }
    return out;
  }

  function buildGroups(items, now) {
    var active, map, order, i, it, name, g, ms, used, base, slug, n;
    active = activeItems(items, now);
    map = {};
    order = [];
    for (i = 0; i < active.length; i++) {
      it = active[i];
      name = platformOf(it);
      if (!map[name]) {
        map[name] = { name: name, offers: [], nearest: Infinity };
        order.push(map[name]);
      }
      g = map[name];
      g.offers.push(it);
      ms = deadlineMs(it);
      if (ms != null && ms < g.nearest) g.nearest = ms;
    }
    for (i = 0; i < order.length; i++) {
      order[i].offers.sort(function (a, b) {
        var da = deadlineMs(a);
        var db = deadlineMs(b);
        if (da == null && db == null) return cmpName(titleOf(a), titleOf(b));
        if (da == null) return 1;
        if (db == null) return -1;
        if (da !== db) return da - db;
        return cmpName(titleOf(a), titleOf(b));
      });
    }
    order.sort(function (a, b) {
      if (a.nearest !== b.nearest) return a.nearest - b.nearest;
      return cmpName(a.name, b.name);
    });
    used = {};
    for (i = 0; i < order.length; i++) {
      base = slugify(order[i].name);
      slug = base;
      n = 2;
      while (used[slug]) {
        slug = base + "-" + n;
        n += 1;
      }
      used[slug] = 1;
      order[i].slug = slug;
    }
    return order;
  }

  function filterGroups(groups, query) {
    var q, out, i, g, offers;
    q = norm(query);
    out = [];
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      if (!q || norm(g.name).indexOf(q) !== -1) {
        out.push({ name: g.name, slug: g.slug, offers: g.offers.slice(), nearest: g.nearest });
        continue;
      }
      offers = g.offers.filter(function (it) {
        return haystack(it).indexOf(q) !== -1;
      });
      if (offers.length) out.push({ name: g.name, slug: g.slug, offers: offers, nearest: g.nearest });
    }
    return out;
  }

  function groupBySlug(groups, slug) {
    var i;
    for (i = 0; i < groups.length; i++) {
      if (groups[i].slug === slug) return groups[i];
    }
    return null;
  }

  function fmtDeadlineBJ(iso) {
    var t, date, time;
    t = Date.parse(String(iso));
    if (Number.isNaN(t)) return "";
    try {
      date = new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(t);
      time = new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(t);
      return date + " " + time + "（北京时间）";
    } catch (e) {
      return String(iso) + "（北京时间）";
    }
  }

  function daysUntil(iso, now) {
    var t = Date.parse(String(iso));
    if (Number.isNaN(t)) return Infinity;
    return Math.ceil((t - now) / 86400000);
  }

  function renderParagraphs(text, className) {
    var blocks, i, lines, j, inner, html;
    blocks = String(text).split(/\n{2,}/);
    html = "";
    for (i = 0; i < blocks.length; i++) {
      lines = blocks[i].split(/\n/);
      inner = "";
      for (j = 0; j < lines.length; j++) {
        if (!lines[j].trim() && lines.length > 1) continue;
        if (inner) inner += "<br>";
        inner += escapeHtml(lines[j]);
      }
      if (inner.trim()) html += '<p class="' + className + '">' + inner + "</p>";
    }
    return html;
  }

  function renderDot(offers) {
    var status = summaryStatus(offers);
    if (!status) return "";
    return (
      '<span class="dot ' +
      status +
      '" title="' +
      escapeHtml(statusLabel(status)) +
      '"><span class="sr">' +
      escapeHtml(statusLabel(status)) +
      "</span></span>"
    );
  }

  function renderTabs(groups, slug) {
    var html, i, g, selected;
    html = "";
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      selected = g.slug === slug;
      html +=
        '<button type="button" class="tab" role="tab" data-slug="' +
        escapeHtml(g.slug) +
        '" aria-selected="' +
        (selected ? "true" : "false") +
        '" aria-controls="detail" tabindex="' +
        (selected ? "0" : "-1") +
        '">';
      html += '<span class="tab-name">' + escapeHtml(redactSecrets(g.name)) + "</span>";
      html += '<span class="tab-meta"><span class="tab-count">' + g.offers.length + "</span>";
      html += renderDot(g.offers);
      html += "</span></button>";
    }
    return html;
  }

  function renderOptions(groups, slug) {
    var html, i, g, status, prefix;
    html = "";
    for (i = 0; i < groups.length; i++) {
      g = groups[i];
      status = summaryStatus(g.offers);
      prefix = status === "success" ? "● " : status === "needs-user" ? "◐ " : status === "failed" ? "○ " : "";
      html +=
        '<option value="' +
        escapeHtml(g.slug) +
        '"' +
        (g.slug === slug ? " selected" : "") +
        ">" +
        escapeHtml(prefix + redactSecrets(g.name) + "（" + g.offers.length + "）") +
        "</option>";
    }
    return html;
  }

  function renderAutoClaim(item) {
    var view = autoClaimView(item);
    if (!view) return "";
    var html = '<div class="auto-claim-row">';
    html += '<span class="auto-claim ' + view.kind + '">' + escapeHtml(view.label) + "</span>";
    if (view.note || view.at) {
      html += '<p class="auto-claim-note">';
      if (view.note) html += '<span class="auto-claim-text">' + escapeHtml(view.note) + "</span>";
      if (view.at) html += '<span class="auto-claim-at">' + escapeHtml(view.at) + "</span>";
      html += "</p>";
    }
    html += "</div>";
    return html;
  }

  function linkLabel(href) {
    var host = hostnameOf(href);
    return host ? "打开 " + host : "打开链接";
  }

  function renderGuide(steps) {
    var html, i, st, href;
    if (!steps.length) return "";
    html = '<ol class="guide">';
    for (i = 0; i < steps.length; i++) {
      st = steps[i];
      html += "<li>";
      if (st.step) html += '<p class="guide-title">' + escapeHtml(st.step) + "</p>";
      if (st.detail) html += renderParagraphs(st.detail, "guide-detail");
      href = safeUrl(st.url);
      if (href) {
        html +=
          '<a class="guide-link" href="' +
          escapeHtml(href) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(linkLabel(href)) +
          "</a>";
      }
      if (st.note) {
        html += '<p class="guide-note"><span class="note-label">注意</span>' + escapeHtml(st.note) + "</p>";
      }
      html += "</li>";
    }
    html += "</ol>";
    return html;
  }

  function renderFoldable(label, inner) {
    if (!inner) return "";
    return (
      '<section class="block"><h4>' +
      escapeHtml(label) +
      '</h4><div class="fold-text">' +
      inner +
      '</div><button type="button" class="fold-toggle" hidden>展开</button></section>'
    );
  }

  function renderOffer(item, now) {
    var title, summary, terms, deadline, md, soon, href, source, guide, same, intro;
    title = redactSecrets(titleOf(item));
    summary = item.summary == null ? "" : redactSecrets(String(item.summary)).trim();
    terms = item.free_terms == null ? "" : redactSecrets(String(item.free_terms)).trim();
    deadline = deadlineOf(item);
    md = deadline ? fmtDeadlineBJ(String(deadline)) : "";
    soon = deadline && daysUntil(String(deadline), now) <= 2;
    href = safeUrl(goUrl(item));
    source = safeUrl(item.url || item.link || item.source_url || "");
    same = source && href && source === href;
    guide = claimGuideOf(item);
    var html = '<article class="offer" data-kind="' + categoryOf(item) + '">';
    html += '<div class="offer-top">';
    html += '<div class="offer-heading">';
    html += "<h3 class=\"offer-title\">" + escapeHtml(title) + "</h3>";
    if (md) {
      html += '<p class="deadline' + (soon ? " soon" : "") + '">截止 ' + escapeHtml(md) + "</p>";
    } else {
      html += '<p class="deadline quiet">未标明截止时间</p>';
    }
    html += "</div>";
    html += '<div class="offer-actions">';
    if (href) {
      html +=
        '<a class="go" href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">去领取</a>';
    }
    if (source && !same) {
      html +=
        '<a class="source" href="' +
        escapeHtml(source) +
        '" target="_blank" rel="noopener noreferrer">来源</a>';
    }
    html += "</div></div>";
    html += renderAutoClaim(item);
    intro = "";
    if (summary) intro += renderParagraphs(summary, "body");
    if (terms && norm(terms) !== norm(summary)) intro += renderParagraphs(terms, "body");
    if (intro) html += renderFoldable("详情介绍", intro);
    if (guide.length) {
      html += '<section class="block steps-block"><details class="steps" open>';
      html +=
        '<summary class="steps-summary"><span class="steps-label">领取步骤</span><span class="steps-count">' +
        guide.length +
        "</span></summary>";
      html += renderGuide(guide);
      html += "</details></section>";
    }
    html += "</article>";
    return html;
  }

  function renderDetail(group, now) {
    var html, i, label;
    if (!group) return "";
    label = statusLabel(summaryStatus(group.offers));
    html = '<div class="detail-inner">';
    html += '<header class="platform-head">';
    html += '<p class="kicker">平台</p>';
    html += "<h2>" + escapeHtml(redactSecrets(group.name)) + "</h2>";
    html += '<p class="platform-meta"><span>' + group.offers.length + " 项进行中</span>";
    if (label) html += renderDot(group.offers) + '<span class="dot-label">' + escapeHtml(label) + "</span>";
    html += "</p></header>";
    for (i = 0; i < group.offers.length; i++) html += renderOffer(group.offers[i], now);
    html += "</div>";
    return html;
  }

  function renderEmpty(query, hintHtml) {
    if (query && String(query).trim()) {
      return (
        '<div class="empty"><p>没有匹配的平台或活动。换个关键词，或清空搜索。</p>' +
        (hintHtml || "") +
        "</div>"
      );
    }
    return '<div class="empty"><p>暂时没有进行中的免费活动。</p>' + (hintHtml || "") + "</div>";
  }

  function countOffers(groups) {
    var n = 0;
    var i;
    for (i = 0; i < groups.length; i++) n += groups[i].offers.length;
    return n;
  }

  function readHash() {
    var raw;
    if (typeof location === "undefined") return "";
    raw = String(location.hash || "").replace(/^#/, "");
    if (!raw) return "";
    try {
      raw = decodeURIComponent(raw);
    } catch (e) {}
    return raw;
  }

  function parseHash(raw) {
    var slash, kind, slug;
    raw = String(raw || "");
    if (raw === "providers" || raw === "agents") return { kind: raw, slug: "" };
    slash = raw.indexOf("/");
    if (slash > 0) {
      kind = raw.slice(0, slash);
      slug = raw.slice(slash + 1);
      if (kind === "providers" || kind === "agents") return { kind: kind, slug: slug };
    }
    return { kind: "", slug: raw };
  }

  function kindLabel(kind) {
    return kind === "agents" ? "Agent" : "模型";
  }

  function currentPage() {
    var value = "";
    if (typeof document !== "undefined" && document.body && document.body.getAttribute) {
      value = document.body.getAttribute("data-page") || "";
    }
    if (value === "provider" || value === "agent" || value === "vps" || value === "home") return value;
    return "home";
  }

  // Old hashes: #providers/groq, #agents/opencode, #providers, #agents.
  // Current hashes: #groq on /provider, #opencode on /agent.
  function parseRouteHash(raw) {
    var match, key, slug, page, legacy;
    raw = String(raw || "").trim().replace(/^\/+|\/+$/g, "");
    if (!raw) return { page: "", slug: "", legacy: false };
    match = raw.match(/^(providers|agents|provider|agent|vps)(?:\/(.*))?$/);
    if (!match) return { page: "", slug: raw, legacy: false };
    key = match[1];
    slug = String(match[2] || "").replace(/^\/+|\/+$/g, "");
    page = key === "agents" || key === "agent" ? "agent" : key === "vps" ? "vps" : "provider";
    legacy = key === "providers" || key === "agents";
    return { page: page, slug: slug, legacy: legacy };
  }

  function sectionUrl(page, slug, fromPage) {
    var origin, dir, prefix, url;
    origin = fromPage || currentPage();
    dir = page === "agent" ? "agent/" : page === "vps" ? "vps/" : "provider/";
    prefix = origin === "home" ? "" : "../";
    url = prefix + dir;
    if (slug) url += "#" + encodeURIComponent(slug);
    return url;
  }

  function prepareCatalog() {
    var now, all, allGroups;
    now = Date.now();
    all = typeof ITEMS !== "undefined" && Array.isArray(ITEMS) ? ITEMS : [];
    allGroups = buildGroups(all, now);
    return {
      now: now,
      all: all,
      allGroups: allGroups,
      byKind: {
        providers: groupsInKind(allGroups, "providers"),
        agents: groupsInKind(allGroups, "agents"),
      },
    };
  }

  function resolvePageForSlug(slug, byKind) {
    if (!slug || !byKind) return "";
    if (groupBySlug(byKind.providers || [], slug)) return "provider";
    if (groupBySlug(byKind.agents || [], slug)) return "agent";
    return "";
  }

  function decideRoute(parsed, byKind) {
    var here, other, found;
    parsed = parsed || { page: "", slug: "", legacy: false };
    byKind = byKind || { providers: [], agents: [] };
    if (parsed.page === "vps") return { page: "vps", slug: "" };
    // An explicit section wins when that platform exists there. A hash that
    // names the wrong section (for example #agents/groq) follows the platform.
    // A bare slug prefers the model catalog when the name exists in both.
    if (parsed.page === "provider" || parsed.page === "agent") {
      here = parsed.page === "agent" ? "agents" : "providers";
      other = parsed.page === "agent" ? "providers" : "agents";
      if (parsed.slug && !groupBySlug(byKind[here] || [], parsed.slug) && groupBySlug(byKind[other] || [], parsed.slug)) {
        return { page: other === "agents" ? "agent" : "provider", slug: parsed.slug };
      }
      return { page: parsed.page, slug: parsed.slug || "" };
    }
    if (parsed.slug) {
      found = resolvePageForSlug(parsed.slug, byKind);
      if (found) return { page: found, slug: parsed.slug };
    }
    return { page: "", slug: parsed.slug || "" };
  }

  // Where a hash should go once the visitor is already on a catalog page.
  // A bare slug stays put when this page has that platform, so /agent/#opencode
  // does not bounce just because OpenCode also has a provider offer.
  function routeOnPage(parsed, pageName, byKind) {
    var pageKind, decided, localHit, otherKind, otherHit, slug;
    parsed = parsed || { page: "", slug: "", legacy: false };
    byKind = byKind || { providers: [], agents: [] };
    pageKind = pageName === "agent" ? "agents" : "providers";
    if (parsed.page === "vps") return { redirect: "vps", slug: "" };
    decided = decideRoute(parsed, byKind);
    localHit = !!(parsed.slug && groupBySlug(byKind[pageKind] || [], parsed.slug));
    if (parsed.page && parsed.page !== pageName) {
      otherKind = parsed.page === "agent" ? "agents" : "providers";
      otherHit = !!(parsed.slug && groupBySlug(byKind[otherKind] || [], parsed.slug));
      if (!parsed.slug || otherHit || !localHit) {
        if (decided.page && decided.page !== pageName) return { redirect: decided.page, slug: parsed.slug || "" };
      }
    } else if (parsed.page !== pageName && decided.page && decided.page !== pageName && !localHit) {
      return { redirect: decided.page, slug: decided.slug || "" };
    }
    slug = "";
    if (parsed.page === pageName || localHit) slug = parsed.slug || "";
    else if (decided.page === pageName) slug = decided.slug || "";
    if (slug && !groupBySlug(byKind[pageKind] || [], slug)) slug = "";
    return { redirect: "", slug: slug };
  }

  function redactContact(s) {
    return redactSecrets(String(s == null ? "" : s)).replace(
      /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g,
      "[redacted]"
    );
  }

  function textOf(value) {
    var t = redactContact(value == null ? "" : value).replace(/\s+/g, " ").trim();
    if (!t || t === "[redacted]") return "";
    return t;
  }

  function typeLabelOf(item) {
    var label, kind;
    label = textOf(item && item.type_label);
    if (label) return label;
    kind = norm(item && item.type);
    if (kind === "always_free" || kind === "always free") return "一直免费";
    if (kind === "trial" || kind === "trial credit") return "试用额度";
    if (kind === "student" || kind === "education") return "学生额度";
    if (kind === "paas" || kind === "non root paas") return "非 root 的 PaaS";
    label = textOf(item && item.type);
    return label || "其他";
  }

  function statusView(entry) {
    var label, kind, raw;
    entry = entry || {};
    label = textOf(entry.status_label);
    kind = textOf(entry.status_kind);
    raw = norm(entry.status).replace(/[\s-]+/g, "_");
    if (!label) {
      if (entry.orderable_now === true) label = "现在能下单";
      else if (raw.indexOf("no_black_friday") !== -1 || raw.indexOf("not_this_year") !== -1) label = "今年不办";
      else label = "预告未开卖";
    }
    if (kind !== "now" && kind !== "off" && kind !== "soon") {
      kind = label === "现在能下单" ? "now" : label === "今年不办" ? "off" : "soon";
    }
    return { label: label, kind: kind };
  }

  function stockView(stock) {
    if (stock === "in_stock") return { cls: "in", label: "有货" };
    return { cls: "out", label: "缺货" };
  }

  function renderDefList(rows, className) {
    var html, i;
    if (!rows.length) return "";
    html = '<dl class="' + className + '">';
    for (i = 0; i < rows.length; i++) {
      html += "<div><dt>" + escapeHtml(textOf(rows[i][0])) + "</dt><dd>" + escapeHtml(textOf(rows[i][1])) + "</dd></div>";
    }
    html += "</dl>";
    return html;
  }

  function conditionRows(raw) {
    var c, rows, card;
    c = raw && typeof raw === "object" ? raw : {};
    rows = [];
    card = "";
    if (c.card_required === true) card = "要绑卡";
    else if (c.card_required === false) card = "不绑卡";
    if (textOf(c.card_notes)) card = card ? card + " · " + textOf(c.card_notes) : textOf(c.card_notes);
    if (card) rows.push(["绑卡", card]);
    if (textOf(c.region_limits)) rows.push(["区域", c.region_limits]);
    if (textOf(c.idle_reclaim)) rows.push(["闲置回收", c.idle_reclaim]);
    if (textOf(c.deadline)) rows.push(["截止", c.deadline]);
    if (textOf(c.deadline_note)) rows.push(["截止说明", c.deadline_note]);
    return rows;
  }

  function postLabel(url) {
    var host = hostnameOf(url);
    if (host === "x.com" || host === "twitter.com" || host === "mobile.twitter.com") return "据 X 上的帖子";
    return "来源帖子";
  }

  function renderPosts(posts) {
    var html, i, post, href, bits;
    posts = asList(posts);
    html = "";
    for (i = 0; i < posts.length; i++) {
      post = posts[i] || {};
      href = safeUrl(post.url);
      if (!href) continue;
      bits = postLabel(href);
      if (textOf(post.time_beijing)) bits += " · " + textOf(post.time_beijing);
      if (textOf(post.author)) bits += " · " + textOf(post.author);
      html +=
        '<a href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(bits) +
        "</a>";
    }
    if (!html) return "";
    return '<div class="post-list">' + html + "</div>";
  }

  function renderOrderLinks(links) {
    var html, i, link, href, label;
    links = asList(links);
    html = "";
    for (i = 0; i < links.length; i++) {
      link = links[i] || {};
      href = safeUrl(link.url);
      if (!href) continue;
      label = textOf(link.label) || linkLabel(href);
      html +=
        '<a class="guide-link" href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(label) +
        "</a>";
    }
    if (!html) return "";
    return '<p class="plan-links">' + html + "</p>";
  }

  function renderExternal(url, label, className) {
    var href = safeUrl(url);
    if (!href) return "";
    return (
      '<a class="' +
      className +
      '" href="' +
      escapeHtml(href) +
      '" target="_blank" rel="noopener noreferrer">' +
      escapeHtml(label) +
      "</a>"
    );
  }

  function renderSpecRows(specs) {
    var rows, i, spec, label, value;
    rows = [];
    specs = asList(specs);
    for (i = 0; i < specs.length; i++) {
      spec = specs[i] || {};
      label = textOf(spec.label);
      value = textOf(spec.value);
      if (!label && !value) continue;
      rows.push([label || "说明", value]);
    }
    return renderDefList(rows, "spec-grid");
  }

  function renderFreeItem(item) {
    var html, href;
    html = '<article class="offer vps-card">';
    html += '<div class="offer-top"><div class="offer-heading">';
    html += '<span class="type-pill">' + escapeHtml(typeLabelOf(item)) + "</span>";
    html += '<h3 class="offer-title">' + escapeHtml(textOf(item.provider) || "未命名") + "</h3>";
    html += "</div><div class=\"offer-actions\">";
    href = renderExternal(item.official_url, "官网", "go");
    if (href) html += href;
    html += "</div></div>";
    html += renderSpecRows(item.specs);
    html += renderDefList(conditionRows(item.free_conditions), "cond-grid");
    html += renderPosts(item.posts);
    if (textOf(item.notes)) html += '<p class="body">' + escapeHtml(textOf(item.notes)) + "</p>";
    html += "</article>";
    return html;
  }

  function renderPlan(plan) {
    var view, html, price, links;
    view = stockView(plan.stock);
    html = '<article class="plan">';
    html += '<div class="plan-top">';
    html += '<span class="stock-pill ' + view.cls + '">' + escapeHtml(view.label) + "</span>";
    html += "<h4>" + escapeHtml(textOf(plan.display_name) || textOf(plan.key) || "套餐") + "</h4>";
    if (plan.limited === true) html += '<span class="limited-pill">限量</span>';
    html += "</div>";
    if (textOf(plan.config)) html += '<p class="plan-config">' + escapeHtml(textOf(plan.config)) + "</p>";
    else html += renderSpecRows(plan.specs);
    price = textOf(plan.price);
    links = renderOrderLinks(plan.order_urls);
    if (price) html += '<p class="plan-price">' + escapeHtml(price) + "</p>";
    if (textOf(plan.last_restock)) html += '<p class="plan-restock">最近补货 ' + escapeHtml(textOf(plan.last_restock)) + "</p>";
    html += links;
    if (!price && !links) html += '<p class="quiet-line">目录里没有对应的价格和下单链接</p>';
    html += "</article>";
    return html;
  }

  function renderSourceLine(provider) {
    var html, i, src, href, bits, label;
    html = "";
    src = asList(provider.sources);
    for (i = 0; i < src.length; i++) {
      href = safeUrl(src[i] && src[i].url);
      label = textOf(src[i] && src[i].name) || (href ? hostnameOf(href) : "");
      if (!label && !href) continue;
      if (html) html += "、";
      if (href) {
        html += '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(label || href) + "</a>";
      } else html += escapeHtml(label);
    }
    bits = textOf(provider.checked_at_beijing);
    if (!html && !bits) return "";
    return (
      '<p class="source-line">数据来源 ' +
      (html || "未标明") +
      (bits ? " · 最近检查 " + escapeHtml(bits.indexOf("北京") === -1 ? bits + "（北京时间）" : bits) : "") +
      "</p>"
    );
  }

  function renderVendor(provider) {
    var plans, html, i;
    provider = provider || {};
    plans = asList(provider.plans);
    html = '<section class="offer vendor">';
    html += '<div class="vendor-head"><h3>' + escapeHtml(textOf(provider.name) || "厂商") + "</h3>";
    html += renderExternal(provider.official_url, "官网", "source");
    html += "</div>";
    html += renderSourceLine(provider);
    if (!plans.length) html += '<p class="quiet-line">这次检查没有套餐记录。</p>';
    else {
      html += '<div class="plan-list">';
      for (i = 0; i < plans.length; i++) html += renderPlan(plans[i] || {});
      html += "</div>";
    }
    html += "</section>";
    return html;
  }

  function renderBfPlan(plan) {
    var html, href;
    plan = plan || {};
    html = '<li class="bf-plan">';
    html += "<strong>" + escapeHtml(textOf(plan.name) || "套餐") + "</strong>";
    if (textOf(plan.price)) html += "<span>" + escapeHtml(textOf(plan.price)) + "</span>";
    if (textOf(plan.specs)) html += '<span class="plan-config">' + escapeHtml(textOf(plan.specs)) + "</span>";
    href = safeUrl(plan.url);
    if (href) {
      html +=
        '<a class="guide-link" href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">下单</a>';
    }
    html += "</li>";
    return html;
  }

  function renderOfficial(entry) {
    var view, html, sources, i, href, plans, links;
    view = statusView(entry);
    html = '<article class="offer bf-card">';
    html += '<div class="offer-top"><div class="offer-heading">';
    html += '<span class="status-pill ' + view.kind + '">' + escapeHtml(view.label) + "</span>";
    html += '<h3 class="offer-title">' + escapeHtml(textOf(entry.provider) || "厂商") + "</h3>";
    html += "</div>";
    if (safeUrl(entry.sale_hub)) html += '<div class="offer-actions">' + renderExternal(entry.sale_hub, "活动页", "go") + "</div>";
    html += "</div>";
    if (textOf(entry.summary)) html += '<p class="body">' + escapeHtml(textOf(entry.summary)) + "</p>";
    sources = asList(entry.sources);
    links = "";
    for (i = 0; i < sources.length; i++) {
      href = safeUrl(sources[i] && sources[i].url);
      if (!href) continue;
      links +=
        '<a href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(textOf(sources[i].title) || "官方来源") +
        "</a>";
    }
    if (links) html += '<p class="source-links">' + links + "</p>";
    plans = asList(entry.plans);
    if (plans.length) {
      html += '<p class="kicker block">可下单套餐</p><ul class="bf-list">';
      for (i = 0; i < plans.length; i++) html += renderBfPlan(plans[i]);
      html += "</ul>";
    }
    html += "</article>";
    return html;
  }

  function renderLead(lead) {
    var html, href;
    lead = lead || {};
    html = '<article class="lead">';
    href = safeUrl(lead.url);
    if (href) {
      html +=
        '<a href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(textOf(lead.source) || "来源") +
        "</a>";
    } else if (textOf(lead.source)) html += "<strong>" + escapeHtml(textOf(lead.source)) + "</strong>";
    if (textOf(lead.note)) html += "<p>" + escapeHtml(textOf(lead.note)) + "</p>";
    html += "</article>";
    return html;
  }

  function updatedLine(data) {
    var t = "";
    if (data && data.updated_at_beijing) t = textOf(data.updated_at_beijing);
    if (!t && data && data.scanned_at_beijing && typeof data.scanned_at_beijing === "object") {
      t = textOf(data.scanned_at_beijing.black_friday || data.scanned_at_beijing.stock || data.scanned_at_beijing.free_vps);
    }
    if (!t) return "最后更新时间未知";
    if (t.indexOf("北京") === -1) t += "（北京时间）";
    return "最后更新 " + t;
  }

  function renderVps(data) {
    var html, items, stock, providers, i, bf, official, leads, notes;
    data = data && typeof data === "object" ? data : {};
    html = '<div class="detail-inner vps-inner">';
    if (data.sample === true || String(data.sample).toLowerCase() === "true") {
      html += '<p class="sample-banner" role="status">示例数据，等待首次同步</p>';
    }
    html += '<nav class="vps-jump" aria-label="本页"><a href="#free">免费方案</a><a href="#stock">补货监控</a><a href="#bf">黑五优惠</a></nav>';
    items = asList(data.free_vps);
    html += '<section class="vps-section" id="free"><header class="section-head"><p class="kicker">免费方案</p><h2>免费 VPS</h2>';
    html += "<p>一直免费、试用额度、学生额度，以及没有完整 root 的 PaaS。</p></header>";
    if (!items.length) html += '<p class="quiet-line">暂时没有免费 VPS 情报。</p>';
    for (i = 0; i < items.length; i++) html += renderFreeItem(items[i] || {});
    html += "</section>";

    stock = data.stock && typeof data.stock === "object" ? data.stock : {};
    providers = asList(stock.providers);
    html += '<section class="vps-section" id="stock"><header class="section-head"><p class="kicker">库存</p><h2>补货监控</h2>';
    html += "<p>DMIT 和搬瓦工。有货是绿色，缺货是灰色。</p></header>";
    notes = asList(stock.source_notes);
    for (i = 0; i < notes.length; i++) {
      if (textOf(notes[i])) html += '<p class="source-note">' + escapeHtml(textOf(notes[i])) + "</p>";
    }
    if (!providers.length) html += '<p class="quiet-line">暂时没有补货记录。</p>';
    for (i = 0; i < providers.length; i++) html += renderVendor(providers[i]);
    html += "</section>";

    bf = data.black_friday && typeof data.black_friday === "object" ? data.black_friday : {};
    official = asList(bf.official);
    leads = asList(bf.leads);
    html += '<section class="vps-section" id="bf"><header class="section-head"><p class="kicker">优惠</p><h2>黑五优惠</h2>';
    html += "<p>现在能下单、预告未开卖，或今年不办。可下单的套餐跟在官方来源后面。</p></header>";
    if (textOf(bf.date_note)) html += '<p class="date-note">' + escapeHtml(textOf(bf.date_note)) + "</p>";
    if (!official.length) html += '<p class="quiet-line">暂时没有官方黑五状态。</p>';
    for (i = 0; i < official.length; i++) html += renderOfficial(official[i]);
    html += '<section class="leads"><h3>第三方线索</h3><p class="disclaimer">仅线索，未经官方确认</p>';
    if (!leads.length) html += '<p class="quiet-line">这次没有单独的第三方线索。</p>';
    for (i = 0; i < leads.length; i++) html += renderLead(leads[i]);
    html += "</section></section></div>";
    return html;
  }

  function bootVps() {
    var parsed, detail, stats, data;
    parsed = parseRouteHash(readHash());
    if ((parsed.page === "provider" || parsed.page === "agent") && typeof location !== "undefined") {
      location.replace(sectionUrl(parsed.page, parsed.slug, "vps"));
      return;
    }
    detail = document.getElementById("detail");
    stats = document.getElementById("stats");
    data = typeof VPS !== "undefined" && VPS && typeof VPS === "object" ? VPS : {};
    if (detail) detail.innerHTML = renderVps(data);
    if (stats) stats.textContent = updatedLine(data);
    if (parsed.slug && document.getElementById(parsed.slug) && document.getElementById(parsed.slug).scrollIntoView) {
      document.getElementById(parsed.slug).scrollIntoView();
    }
  }

  function bootHome() {
    var prepared, decided, page, slug;
    prepared = prepareCatalog();
    decided = decideRoute(parseRouteHash(readHash()), prepared.byKind);
    page = decided.page || "provider";
    slug = page === "provider" || page === "agent" ? decided.slug || "" : "";
    if (slug && !resolvePageForSlug(slug, prepared.byKind)) slug = "";
    if (typeof location !== "undefined") location.replace(sectionUrl(page, slug, "home"));
  }

  function bootCatalog() {
    var tabsEl, detailEl, qEl, selectEl, statsEl, railEl, now, all, allGroups, byKind, state, i;
    var pageName, pageKind, route, prepared;

    if (typeof document === "undefined") return;
    tabsEl = document.getElementById("tabs");
    detailEl = document.getElementById("detail");
    qEl = document.getElementById("q");
    selectEl = document.getElementById("platform-select");
    statsEl = document.getElementById("stats");
    railEl = document.getElementById("tab-rail");
    if (!tabsEl || !detailEl) return;

    prepared = prepareCatalog();
    now = prepared.now;
    all = prepared.all;
    allGroups = prepared.allGroups;
    byKind = prepared.byKind;
    pageName = currentPage() === "agent" ? "agent" : "provider";
    pageKind = pageName === "agent" ? "agents" : "providers";
    route = routeOnPage(parseRouteHash(readHash()), pageName, byKind);
    if (route.redirect && typeof location !== "undefined") {
      location.replace(sectionUrl(route.redirect, route.slug, pageName));
      return;
    }
    state = {
      query: "",
      slug: route.slug || "",
      kind: pageKind,
      rendered: "",
    };

    function writeHash(slug, mode) {
      var url, next, current;
      if (typeof history === "undefined" || typeof location === "undefined") return;
      next = slug ? "#" + encodeURIComponent(slug) : "";
      current = location.hash || "";
      if (current === next) return;
      url = location.pathname + location.search + next;
      if (mode === "push" && history.pushState) history.pushState({ slug: slug }, "", url);
      else if (history.replaceState) history.replaceState({ slug: slug }, "", url);
    }

    function scopedGroups(kind) {
      return byKind[kind === "agents" ? "agents" : "providers"] || [];
    }

    function otherKindHint(kind, query) {
      var other, found, label, slug, href;
      if (!query) return "";
      other = kind === "agents" ? "providers" : "agents";
      found = filterGroups(scopedGroups(other), query);
      if (!found.length) return "";
      label = kindLabel(other);
      slug = found.length === 1 ? found[0].slug : "";
      href = sectionUrl(other === "agents" ? "agent" : "provider", slug, pageName);
      return (
        '<p class="empty-switch">' +
        escapeHtml(label) +
        " 里有 " +
        countOffers(found) +
        ' 项匹配。<a class="jump-kind" href="' +
        escapeHtml(href) +
        '">切换到 ' +
        escapeHtml(label) +
        "</a></p>"
      );
    }

    function setKindCounts() {
      var nodes, i, kind, groups;
      nodes = document.querySelectorAll ? document.querySelectorAll("[data-kind-count]") : [];
      for (i = 0; i < nodes.length; i++) {
        kind = nodes[i].getAttribute("data-kind-count");
        groups = scopedGroups(kind);
        nodes[i].textContent = String(countOffers(groups));
      }
    }

    function render() {
      var groups, base, slug, group, btn, buttons, i, shown, hidden, kind;
      kind = pageKind;
      state.kind = kind;
      base = scopedGroups(kind);
      groups = filterGroups(base, state.query);
      slug = "";
      if (state.slug && groupBySlug(groups, state.slug)) slug = state.slug;
      else if (groups.length) slug = groups[0].slug;
      if (!state.query) state.slug = slug;
      group = groupBySlug(groups, slug);
      tabsEl.setAttribute("aria-label", kindLabel(kind) + " 平台");
      tabsEl.innerHTML = groups.length ? renderTabs(groups, slug) : '<p class="tabs-empty">没有匹配的平台</p>';
      if (selectEl) {
        selectEl.innerHTML = renderOptions(groups, slug);
        selectEl.disabled = !groups.length;
        if (slug) selectEl.value = slug;
      }
      detailEl.innerHTML = group ? renderDetail(group, now) : renderEmpty(state.query, otherKindHint(kind, state.query));
      detailEl.setAttribute("role", "tabpanel");
      detailEl.setAttribute("aria-label", group ? group.name : "活动详情");
      if (statsEl) {
        if (state.query) {
          statsEl.textContent = "找到 " + groups.length + " 个平台 · " + countOffers(groups) + " 项";
        } else {
          statsEl.textContent = countOffers(base) + " 项进行中 · " + base.length + " 个平台";
        }
      }
      applyFolds();
      if (slug && slug !== state.rendered) {
        buttons = tabsEl.querySelectorAll ? tabsEl.querySelectorAll("[role=tab]") : [];
        for (i = 0; i < buttons.length; i++) {
          if (buttons[i].getAttribute("aria-selected") === "true") btn = buttons[i];
        }
        if (btn) scrollTabIntoView(btn);
        state.rendered = slug;
      }
      updateTabFades();
      shown = activeItems(all, now).length;
      hidden = all.length - shown;
      root.__FM_COUNTS = {
        total: all.length,
        shown: shown,
        hidden: hidden,
        platforms: allGroups.length,
        providers: countOffers(byKind.providers),
        agents: countOffers(byKind.agents),
        kind: kind,
      };
    }

    function scrollTabIntoView(btn) {
      var br, sr, horizontal;
      if (!btn || !tabsEl.getBoundingClientRect) return;
      horizontal = tabsEl.scrollWidth > tabsEl.clientWidth + 8;
      br = btn.getBoundingClientRect();
      sr = tabsEl.getBoundingClientRect();
      if (horizontal) {
        if (br.left < sr.left - 1 || br.right > sr.right + 1) {
          tabsEl.scrollLeft += br.left - sr.left - 28;
        }
      } else if (br.top < sr.top) tabsEl.scrollTop -= sr.top - br.top;
      else if (br.bottom > sr.bottom) tabsEl.scrollTop += br.bottom - sr.bottom;
      updateTabFades();
    }

    function slugFromEvent(target) {
      var node = target;
      while (node && node !== tabsEl) {
        if (node.getAttribute && node.getAttribute("data-slug")) return node.getAttribute("data-slug");
        node = node.parentNode;
      }
      return "";
    }

    function stepsAreLong(details) {
      var text, items;
      items = details.querySelectorAll ? details.querySelectorAll(".guide > li").length : 0;
      text = String(details.textContent || "").replace(/\s+/g, "");
      return items >= 3 || text.length > 180;
    }

    function isMobile() {
      return window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
    }

    function applyFolds() {
      var mobile, steps, i, texts, el, btn, overflow, full, clamped;
      if (!detailEl) return;
      mobile = isMobile();
      steps = detailEl.querySelectorAll("details.steps");
      for (i = 0; i < steps.length; i++) {
        if (!mobile) steps[i].open = true;
        else if (steps[i].getAttribute("data-touched") !== "1") steps[i].open = !stepsAreLong(steps[i]);
      }
      texts = detailEl.querySelectorAll(".fold-text");
      for (i = 0; i < texts.length; i++) {
        el = texts[i];
        btn = el.nextSibling;
        while (btn && btn.nodeType !== 1) btn = btn.nextSibling;
        if (!btn || !btn.classList || !btn.classList.contains("fold-toggle")) continue;
        if (!mobile || el.getAttribute("data-open") === "1") {
          el.removeAttribute("data-collapsed");
          btn.hidden = !mobile || el.getAttribute("data-open") !== "1" ? true : false;
          if (mobile && el.getAttribute("data-open") === "1") {
            btn.hidden = false;
            btn.textContent = "收起";
          }
          continue;
        }
        el.setAttribute("data-collapsed", "true");
        overflow = el.scrollHeight > el.clientHeight + 2;
        if (!overflow && String(el.textContent || "").replace(/\s+/g, "").length > 120) {
          el.removeAttribute("data-collapsed");
          full = el.offsetHeight;
          el.setAttribute("data-collapsed", "true");
          clamped = el.clientHeight;
          overflow = full > clamped + 2;
        }
        if (!overflow) {
          el.removeAttribute("data-collapsed");
          btn.hidden = true;
        } else {
          btn.hidden = false;
          btn.textContent = "展开";
        }
      }
    }

    function updateTabFades() {
      var max, horizontal;
      if (!railEl || !tabsEl) return;
      max = tabsEl.scrollWidth - tabsEl.clientWidth;
      horizontal = max > 8;
      if (railEl.classList) {
        railEl.classList.toggle("can-left", horizontal && tabsEl.scrollLeft > 6);
        railEl.classList.toggle("can-right", horizontal && tabsEl.scrollLeft < max - 6);
      }
    }

    tabsEl.addEventListener("click", function (e) {
      var slug = slugFromEvent(e.target);
      if (!slug) return;
      state.slug = slug;
      writeHash(slug, "push");
      state.rendered = "";
      render();
    });

    tabsEl.addEventListener("keydown", function (e) {
      var buttons, i, next, key;
      key = e.key || e.which;
      if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") return;
      buttons = [];
      var nodes = tabsEl.querySelectorAll("[role=tab]");
      for (i = 0; i < nodes.length; i++) buttons.push(nodes[i]);
      i = -1;
      for (next = 0; next < buttons.length; next++) {
        if (buttons[next] === document.activeElement) i = next;
      }
      if (i < 0) return;
      if (key === "ArrowDown" || key === "ArrowRight") i = Math.min(buttons.length - 1, i + 1);
      else if (key === "ArrowUp" || key === "ArrowLeft") i = Math.max(0, i - 1);
      else if (key === "Home") i = 0;
      else i = buttons.length - 1;
      e.preventDefault();
      buttons[i].focus();
      state.slug = buttons[i].getAttribute("data-slug");
      writeHash(state.slug, "push");
      state.rendered = "";
      render();
    });

    tabsEl.addEventListener("scroll", function () {
      updateTabFades();
    });

    if (qEl) {
      qEl.addEventListener("input", function () {
        state.query = qEl.value;
        render();
      });
    }

    if (selectEl) {
      selectEl.addEventListener("change", function () {
        state.slug = selectEl.value;
        writeHash(state.slug, "push");
        state.rendered = "";
        render();
      });
    }

    document.addEventListener("click", function (e) {
      var node, textEl;
      node = e.target;
      while (node && node !== document) {
        if (node.classList && node.classList.contains("fold-toggle")) {
          textEl = node.previousSibling;
          while (textEl && textEl.nodeType !== 1) textEl = textEl.previousSibling;
          if (!textEl) return;
          if (textEl.getAttribute("data-open") === "1") {
            textEl.removeAttribute("data-open");
            textEl.setAttribute("data-collapsed", "true");
            node.textContent = "展开";
          } else {
            textEl.setAttribute("data-open", "1");
            textEl.removeAttribute("data-collapsed");
            node.textContent = "收起";
          }
          return;
        }
        node = node.parentNode;
      }
    });

    if (detailEl.addEventListener) {
      detailEl.addEventListener("toggle", function (e) {
        var t = e.target;
        if (t && t.classList && t.classList.contains("steps")) t.setAttribute("data-touched", "1");
      }, true);
    }

    function onNavigate() {
      var parsed, decided;
      parsed = parseRouteHash(readHash());
      decided = routeOnPage(parsed, pageName, byKind);
      if (decided.redirect && typeof location !== "undefined") {
        location.replace(sectionUrl(decided.redirect, decided.slug, pageName));
        return;
      }
      state.slug = decided.slug || "";
      state.rendered = "";
      render();
      writeHash(state.slug, "replace");
    }

    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", onNavigate);
      window.addEventListener("popstate", onNavigate);
      window.addEventListener("resize", function () {
        var btn = tabsEl.querySelector('[aria-selected="true"]');
        applyFolds();
        updateTabFades();
        if (!btn) return;
        scrollTabIntoView(btn);
        if (window.requestAnimationFrame) {
          window.requestAnimationFrame(function () { scrollTabIntoView(btn); });
        }
      });
      if (window.matchMedia) {
        var mq = window.matchMedia("(max-width: 860px)");
        var onMq = function () { applyFolds(); updateTabFades(); };
        if (mq.addEventListener) mq.addEventListener("change", onMq);
        else if (mq.addListener) mq.addListener(onMq);
      }
    }

    setKindCounts();
    render();
    writeHash(state.slug, "replace");
  }

  function boot() {
    var page;
    if (typeof document === "undefined") return;
    page = currentPage();
    if (page === "vps") return bootVps();
    if (page === "home") return bootHome();
    bootCatalog();
  }

  root.__FM = {
    escapeHtml: escapeHtml,
    redactSecrets: redactSecrets,
    isExpired: isExpired,
    isSuperseded: isSuperseded,
    platformOf: platformOf,
    platformFromUrl: platformFromUrl,
    slugify: slugify,
    buildGroups: buildGroups,
    filterGroups: filterGroups,
    renderDetail: renderDetail,
    renderTabs: renderTabs,
    renderOptions: renderOptions,
    claimGuideOf: claimGuideOf,
    autoClaimView: autoClaimView,
    summaryStatus: summaryStatus,
    categoryOf: categoryOf,
    groupsInKind: groupsInKind,
    goUrl: goUrl,
    safeUrl: safeUrl,
    fmtDeadlineBJ: fmtDeadlineBJ,
    parseRouteHash: parseRouteHash,
    sectionUrl: sectionUrl,
    resolvePageForSlug: resolvePageForSlug,
    decideRoute: decideRoute,
    routeOnPage: routeOnPage,
    renderVps: renderVps,
    updatedLine: updatedLine,
  };

  boot();
})(typeof globalThis !== "undefined" ? globalThis : this);
