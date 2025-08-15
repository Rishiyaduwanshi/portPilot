# 🚀 PortPilot

 Pilot your ports like domains, effortlessly map your local apps to custom domains — no admin headaches, no messy proxy setups.  
**Powered by nginx under the hood.** One config file. Multiple apps. Zero chaos.

[![npm version](https://img.shields.io/npm/v/portpilot.svg)](https://www.npmjs.com/package/portpilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

🌐 [portpilot.js.org](https://portpilot.js.org)

---

## ✨ Why PortPilot?

- ⚡ Instantly map `myapp.local` to your running apps
- 🧠 No more editing the `hosts` file — handled automatically
- 🖥️ Nginx-powered proxy setup (auto-installed if missing)
- 🛠️ Supports per-app custom nginx configs
- 🧹 Smart cleanup on stop: hosts, configs, rules
- 📦 Lightweight, fast, and made for developers

---

## 📦 Installation

```bash
# As a dev dependency
pnpm add -D portpilot

# Or install globally
pnpm add -g portpilot
```

Compatible with `npm`, `yarn`, or `pnpm`.

---

## ⚙️ Configuration — `.pilotrc.json`

Create a `.pilotrc.json` in your project root:

```json
{
  "apps": [
    {
      "domain": "test1.local",
      "port": 1010,
      "https": false,
      "customAppConfig": {
        "enabled": true,
        "path": "./conf/conf.nginx"
      }
    },
    {
      "domain": "test2.local",
      "port": 2020,
      "https": false
    },
    {
      "domain": "test3.local",
      "port": 3030,
      "https": false
    }
  ],
  "on": {
    "stop": {
      "cleanNginx": true,
      "cleanHosts": true,
      "cleanConfigs": true
    }
  }
}
```

💡 Add as many apps as you want — no limits.

---

## 🚀 Get Started

```bash
# Start mapping domains
npx portpilot start

# Or if installed globally
portpilot start
```

🛑 To stop and clean everything up:

```bash
portpilot stop
```

---

## 🔧 Advanced Usage: Custom Nginx Configs

Need full control?  
You can provide your own nginx block per app via the `customAppConfig.path` key.  
When enabled, your config will override the default generated one.

---

## 🛣️ Roadmap

- ✅ Host file automation  
- ✅ Nginx-based reverse proxy  
- ✅ Multi-app support  
- ✅ Per-app custom nginx configs  
- ⏳ HTTPS + auto-cert generation  
- ⏳ Global nginx config support  
- ⏳ Live reload on config change  

---

## 📋 Requirements

- Node.js 20+
- Admin access (`sudo` on macOS/Linux, auto prompt on Windows)
- Some experience with local development

---

## 📄 License

MIT © [Abhinav Prakash](https://github.com/rishiyaduwanshi)

---

## 🙌 Support & Feedback

- 🐛 [Report issues](https://github.com/rishiyaduwanshi/portpilot/issues)
- 🌟 Star this repo if it helped you!
- 💌 [contact@rishiyaduwanshi.me](mailto:contact@rishiyaduwanshi.me)
