
# 🚀 PortPilot

Map your local development ports to custom domains effortlessly. Perfect for testing your applications with real domain names locally, across Windows, macOS, and Linux.

---

## ✨ Features

- 🔄 Map any local port to a custom domain  
- ⚙️ Zero-config proxy setup  
- 🛡️ Handles port 80 automatically  
- 🧠 Smart admin privileges handling  
- 💻 Works on Windows, macOS, and Linux  

---

## 📦 Installation

```bash
npm install -D portpilot
# or
pnpm add -D portpilot
```

For global usage:

```bash
npm install -g --save-dev portpilot
# or
pnpm add -g --save-dev portpilot
```

---

## 🚀 Quick Start

### 1. Create a `.pilotrc.js` file in your project root:

```javascript
export default {
  port: 3000,             // Your app's port
  domain: 'myapp.local',  // Custom local domain
  isHttps: false,         // Optional: Enable HTTPS
  isLog: true             // Optional: Enable logging
}
```

### 2. Run PortPilot

```bash
npx portpilot
# or if installed globally
portpilot
```

---

## ⚙️ Configuration Options

| Option     | Type    | Description                     | Default |
|------------|---------|---------------------------------|---------|
| `port`     | Number  | Your application's port         | —       |
| `domain`   | String  | Custom domain (e.g. app.local)  | —       |
| `isHttps`  | Boolean | Enable HTTPS support            | false   |
| `isLog`    | Boolean | Enable detailed logging         | true    |

---

## 📝 Example

1. Start your application on port 3000  
2. Create `.pilotrc.js`:

```javascript
export default {
  port: 3000,
  domain: 'myapp.local'
}
```

3. Run:

```bash
npx portpilot
```

4. Open your browser and visit: `http://myapp.local`

---

## ❗ Common Issues

### 🔒 Port 80 Permission Denied
- If port 80 is in use or admin rights are missing:
  1. PortPilot will try to fallback to another port (like 3001)
  2. Or provide instructions to fix it manually

### 👑 Admin Rights
- **Windows**: Run terminal as Administrator  
- **macOS/Linux**: Use `sudo` when needed

---

## 🛠️ Development

Want to contribute? Here’s how:

1. Fork the repo  
2. Clone your fork:

```bash
git clone https://github.com/yourusername/portpilot.git
```

3. Install dependencies:

```bash
pnpm install
```

4. Run the test server:

```bash
pnpm test-server
```

5. Start development mode:

```bash
pnpm dev
```

---

## 🧪 Testing

To verify PortPilot’s behavior with a mock server:

```bash
pnpm test-server
```

This spins up a test HTTP server on port `3000`.

---

## 🤝 Contributing

1. Fork it  
2. Create your feature branch:  
   `git checkout -b feature/amazing`
3. Commit your changes:  
   `git commit -am 'Add amazing feature'`
4. Push the branch:  
   `git push origin feature/amazing`
5. Open a Pull Request 🚀

---

## 📋 Requirements

- Node.js 16.0.0 or newer  
- Works on Windows, macOS, and Linux  
- Admin/root access needed for host file modification (first time only)

---

## 🔮 Roadmap

- ✅ Basic domain mapping  
- ✅ Admin rights handling  
- [ ] HTTPS support  
- [ ] Multiple domain mapping  
- [ ] Custom SSL certificate support  
- [ ] Docker support  

---


## 📄 License

MIT © [Abhinav Prakash](https://github.com/abhinavprakash-dev)

---

## 💬 Support

Found a bug or have an idea?

- 🐞 [Report an issue](https://github.com/yourusername/portpilot/issues)
- 💡 Request a feature  
- 📚 Dive into the docs (coming soon)

---

## 🌟 Show Your Support

If you found this useful, don't forget to **star** ⭐ the repo and share it!

---
