/* free-models client — Provider / Agent / Model views + action links */
(function () {
  "use strict";

  const PROVIDER_PRIORITY = ["OpenRouter", "GMI", "百炼", "TokenHub"];
  const AGENT_PRIORITY = ["Cline", "OpenCode", "Copilot", "WorkBuddy"];

  const SCENE_LABELS = {
    coding: "写代码",
    chat: "聊天",
    image: "生图",
    video: "视频",
    api: "挂 API",
  };
