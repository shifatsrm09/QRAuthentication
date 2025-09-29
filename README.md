# 🔐 QR Authentication System

<div align="center">

![QR Authentication Demo](https://img.shields.io/badge/QR-Authentication-blue?style=for-the-badge&logo=qrcode&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

**Professional Cross-Device QR Authentication · No App Required · Production Ready**

[Live Demo](https://shifatsrm09.github.io/QRAuthentication/) · [Report Bug](https://github.com/shifatsrm09/QRAuthentication/issues) · [Request Feature](https://github.com/shifatsrm09/QRAuthentication/issues)

</div>

## 🚀 Overview

QR Authentication is a **secure, production-ready** authentication system that enables seamless cross-device login using QR codes. Users can authenticate on desktop devices by scanning a QR code with their already-logged-in mobile browser—no additional apps required.

### ✨ Key Features

- 🎯 **Cross-Device Authentication** - Login on desktop using mobile
- 🔐 **JWT Security** - Industry-standard token-based authentication  
- 📱 **No App Required** - Works directly in mobile browsers
- ⚡ **Real-time Sync** - Instant authentication detection
- 🛡️ **Secure Sessions** - Auto-expiring QR tokens
- 🎨 **Professional UI** - Modern, responsive design
- 🔧 **Plug & Play** - Easy integration into existing projects

## 🏗️ Architecture

```mermaid
graph TB
    A[Desktop Browser] --> B[React Frontend]
    B --> C[Node.js Backend]
    C --> D[MongoDB Atlas]
    E[Mobile Browser] --> F[QR Scanner]
    F --> C
    C --> G[JWT Authentication]
    G --> A
