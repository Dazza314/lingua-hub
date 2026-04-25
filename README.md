# Lingua Hub

A language learning hub that integrates with Anki to leverage your existing vocabulary for LLM-powered conversations.

## Tech Stack

- **Frontend + API:** Next.js (React, TypeScript, Tailwind CSS)
- **Hosting:** Vercel
- **Auth + Database:** Supabase
- **LLM:** Anthropic API (Claude)
- **Android:** Capacitor
- **Anki bridge:** Custom Capacitor plugin (Kotlin)
- **Monorepo:** Turborepo + pnpm workspaces

---

## Web Development

### Prerequisites

- Node.js 24 (via nvm: `nvm install 24 && nvm use 24`)
- pnpm 10+ (`npm install -g pnpm`)

### Setup (first time)

```bash
pnpm install
```

### Running

```bash
pnpm dev
```

---

## Android Development

The Android SDK lives on the Windows side (the emulator requires Windows GPU access).

### First-time setup

#### 1. Install the command line tools (Windows)

Download "Command line tools only" for Windows from [developer.android.com/studio](https://developer.android.com/studio).

The zip contains a `cmdline-tools` folder — **don't** extract it directly into `C:\Android\`. Instead, create the directory `C:\Android\cmdline-tools\latest\` and extract the contents of the zip into that folder. You should end up with:

```
C:\Android\
  cmdline-tools\
    latest\
      bin\
        sdkmanager.bat
        avdmanager.bat
      lib\
      ...
```

#### 2. Install Java (Windows)

The Android build tools require Java 17+. Install the Microsoft Build of OpenJDK from [aka.ms/download-jdk](https://aka.ms/download-jdk) — pick the **Windows x64 MSI** for JDK 21. Run the installer; it will set `JAVA_HOME` and update `PATH` automatically.

Verify with:

```powershell
java -version
```

#### 3. Set environment variables (Windows)

Run in PowerShell as Administrator:

```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android", "Machine")
$current = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
[System.Environment]::SetEnvironmentVariable("Path", "$current;C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools;C:\Android\emulator", "Machine")
```

Restart your terminal after running this.

#### 4. Install SDK components (Windows)

```powershell
$env:SKIP_JDK_VERSION_CHECK = "1"
sdkmanager "platform-tools"
sdkmanager "platforms;android-35"
sdkmanager "build-tools;35.0.0"
sdkmanager "emulator"
sdkmanager "system-images;android-35;google_apis;x86_64"
```

> **Note:** `SKIP_JDK_VERSION_CHECK` works around a bug in `sdkmanager` where it rejects newer JDK versions despite them being compatible.

#### 5. Install Java (WSL2)

Gradle runs inside WSL2 and needs its own JDK. Java 24 isn't in Ubuntu's default repositories yet, so install 21 — any version 11+ works for Gradle:

```bash
sudo apt install openjdk-21-jdk
```

#### 6. Expose the SDK to WSL2

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=/mnt/c/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
```

#### 7. Create a virtual device (Windows)

Run from Windows PowerShell so the AVD is created in your Windows user profile:

```powershell
avdmanager create avd -n pixel -k "system-images;android-35;google_apis;x86_64" -d pixel_7
```

#### 8. Add the Android platform (WSL2)

```bash
cd apps/android
pnpm cap add android
```

---

### Running on Android

#### 1. Connect a device

**Emulator** — start the emulator from Windows PowerShell and wait for it to fully boot:

```powershell
.\scripts\start-emulator.ps1
```

**Real device** — enable USB debugging (Settings > Developer Options > USB Debugging), then connect via USB and accept the prompt on the device.

#### 2. Start the dev server (WSL2)

```bash
pnpm dev
```

#### 3. Build, install and forward the port (WSL2)

```bash
pnpm -F android run:device
```

This builds the APK, installs it on the device, and forwards the port in one step. Then launch the app.

> **Note:** Only needed when native code changes. For web-only changes, saving files will hot-reload via the dev server.
