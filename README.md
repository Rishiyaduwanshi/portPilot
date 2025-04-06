# 🚀 PortPilot

**Pilot your ports like domains** — Map your local ports to custom domains effortlessly!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/portpilot.svg)](https://www.npmjs.com/package/portpilot)

🌐 [Website](https://portpilot.pages.dev)

---

## ✨ Features

- 🔄 Map any local port to a custom domain  
- ⚙️ Zero-config proxy setup  
- 🛡️ Auto-handles port 80 permission issues  
- 💻 Cross-platform: Windows, macOS, and Linux  

---

## 📦 Installation

```bash
# Project-level (dev dependency)
npm install -D portpilot
# or
pnpm add -D portpilot

# Global installation
npm install -g portpilot
# or
pnpm add -g portpilot
```

---

## 🚀 Quick Start

1. Create a `.pilotrc.js` file in your project root:

**ES Module**
```js
export default {
  port: 3000,
  domain: 'myapp.local',
  isHttps: false,
  isLog: true
}
```

**CommonJS**
```js
module.exports = {
  port: 3000,
  domain: 'myapp.local',
  isHttps: false,
  isLog: true
}
```

2. Start PortPilot:

```bash
npx portpilot
# or (if installed globally)
portpilot
```

3. Open in browser: `http://myapp.local`

---

## ⚙️ Config Options

| Option     | Type    | Description                     | Default |
|------------|---------|---------------------------------|---------|
| `port`     | Number  | App’s local port                | —       |
| `domain`   | String  | Custom domain (e.g. app.local)  | —       |
| `isHttps`  | Boolean | Enable HTTPS support            | false   |
| `isLog`    | Boolean | Enable logs                     | true    |

---

## 🧪 Testing

```bash
pnpm test-server
```

Runs a test server on port 3000 so you can try out PortPilot instantly.

---

## 🧠 Troubleshooting

### 🔒 Permission Denied (Port 80)

- **Windows:** Run terminal as Administrator  
- **macOS/Linux:** Use `sudo`

PortPilot detects permission issues and handles fallbacks automatically.

---

## 🛠️ Contributing

1. Fork this repo  
2. Create your feature branch: `git checkout -b feature/xyz`  
3. Commit your changes  
4. Push to GitHub  
5. Open a Pull Request 🚀

---

## 🔮 Roadmap

- ✅ Domain mapping
- ✅ Admin permission handling
- [ ] HTTPS support
- [ ] Multi-domain config
- [ ] Custom SSL certificates
- [ ] Docker integration

---

## 📋 Requirements

- Node.js 16+
- Admin/root privileges for host file updates
- `sudo` or admin terminal for port access

---

## 📄 License

MIT © [Abhinav Prakash](https://github.com/rishiyaduwanshi)

---

## 💬 Feedback & Support

- 🐞 [Open Issues](https://github.com/rishiyaduwanshi/portpilot/issues)
- 🌟 Give it a ⭐ on GitHub if you like it
- 📧 Email: [abhinav@example.com](mailto:abhinav@example.com)

---

## 🌐 Links

- 🔗 Website: [portpilot.pages.dev](https://portpilot.pages.dev)
- 📦 npm: [npmjs.com/package/portpilot](https://www.npmjs.com/package/portpilot)

